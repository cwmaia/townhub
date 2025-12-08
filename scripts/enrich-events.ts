import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { ensureImage } from "../lib/scrape/places";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const options = args.reduce(
  (acc, raw) => {
    if (raw === "--dry-run") {
      acc.dryRun = true;
    }
    if (raw === "--verbose" || raw === "-v") {
      acc.verbose = true;
    }
    if (raw === "--force") {
      acc.force = true;
    }
    return acc;
  },
  { dryRun: false, verbose: false, force: false }
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureDir = async (dirPath: string) => {
  await import("node:fs/promises")
    .then((fs) => fs.mkdir(dirPath, { recursive: true }))
    .catch(() => {});
};

// Curated high-quality images from Unsplash (free to use with attribution)
// These are direct download URLs that don't require API authentication
const CURATED_IMAGES: Record<string, string> = {
  // Seafood/Festival events
  "seafood": "https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=800&q=80",
  "festival": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
  // Kayak/Adventure events
  "kayak": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  // Hiking/Sunrise events
  "sunrise": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80",
  "hiking": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  // Museum/Cultural events
  "museum": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
  // Harbor/Gathering events
  "harbor": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
  "gathering": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  // Fallback
  "default": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
};

// Map event titles to appropriate image keys
const getImageKey = (event: { title: string; description: string }): string => {
  const title = event.title.toLowerCase();
  const description = event.description.toLowerCase();

  if (title.includes("seafood")) return "seafood";
  if (title.includes("festival")) return "festival";
  if (title.includes("kayak") || description.includes("kayak")) return "kayak";
  if (title.includes("sunrise")) return "sunrise";
  if (title.includes("walk") || title.includes("hike")) return "hiking";
  if (title.includes("museum") || description.includes("museum")) return "museum";
  if (title.includes("harbor") || title.includes("harbour")) return "harbor";
  if (title.includes("gathering")) return "gathering";

  return "default";
};

const downloadEventImage = async (
  imageUrl: string,
  event: { id: string; title: string },
  dryRun: boolean
): Promise<string | null> => {
  if (dryRun) {
    return `/media/events/${event.id}-curated.jpg`;
  }

  const dir = path.resolve("public/media/events");
  await ensureDir(dir);

  const fileName = `${event.id}-curated.jpg`;
  const dest = path.join(dir, fileName);

  const savedPath = await ensureImage(imageUrl, dest);
  if (savedPath) {
    return `/media/events/${fileName}`;
  }

  return null;
};

const enrichEvent = async (event: any, dryRun: boolean, verbose: boolean) => {
  const imageKey = getImageKey(event);
  const imageUrl = CURATED_IMAGES[imageKey];

  if (verbose) {
    console.log(`  Image category: "${imageKey}"`);
    console.log(`  Source URL: ${imageUrl}`);
  }

  try {
    const savedImagePath = await downloadEventImage(imageUrl, event, dryRun);
    if (!savedImagePath) {
      return { status: "download-failed" };
    }

    if (!dryRun) {
      await prisma.event.update({
        where: { id: event.id },
        data: { imageUrl: savedImagePath },
      });
    }

    return { status: "updated", imageUrl: savedImagePath };
  } catch (error) {
    return { status: "failed", error: (error as Error).message };
  }
};

const run = async () => {
  try {
    const events = await prisma.event.findMany({
      include: { town: { select: { name: true } } },
      orderBy: { title: "asc" },
    });

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    console.log(`Found ${events.length} events to process\n`);

    for (const event of events) {
      // Skip if already has a curated image unless --force
      if (
        event.imageUrl &&
        (event.imageUrl.includes("/media/events/") || event.imageUrl.includes("unsplash.com")) &&
        !options.force
      ) {
        if (options.verbose) {
          console.log(`Skipping "${event.title}": already has good image`);
        }
        skipped++;
        continue;
      }

      console.log(`Enriching "${event.title}"...`);
      const result = await enrichEvent(event, options.dryRun, options.verbose);

      if (result.status === "updated") {
        updated++;
        console.log(`  ✓ Updated with image: ${(result as any).imageUrl}`);
      } else if (result.status === "download-failed") {
        failed++;
        console.log(`  ✗ Image download failed`);
      } else if (result.status === "failed") {
        failed++;
        console.log(`  ✗ Failed: ${(result as any).error}`);
      }

      await sleep(500);
    }

    console.log("\nEnrichment summary:", {
      total: events.length,
      updated,
      skipped,
      failed,
      dryRun: options.dryRun,
    });

    if (options.dryRun) {
      console.log("\n✓ Dry run completed - no changes were made to the database");
    }
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("Enrichment script failed:", error);
  prisma.$disconnect();
  process.exit(1);
});
