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
// Each URL verified from unsplash.com search results
const CURATED_IMAGES: Record<string, string> = {
  // Police - white police car with lights (from unsplash.com/photos/police-car-at-street-7mqsZsE6FaU)
  "police": "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800&q=80",
  // Fire brigade - red fire truck in fire station (from unsplash.com/photos/red-fire-truck-parked-inside-a-station-9PFGI1v03g4)
  "fire": "https://images.unsplash.com/photo-1758506972145-fdcac3daba97?w=800&q=80",
  // Health center/clinic - medical/hospital building
  "health": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
  // Ferry terminal/port - ferry boat
  "ferry": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  // Post office - mailbox/letters
  "post": "https://images.unsplash.com/photo-1579532536935-619928decd08?w=800&q=80",
  // Library - books/library interior
  "library": "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
  // School - school building/classroom
  "school": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  // Town hall/government - government building
  "townhall": "https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800&q=80",
  // Fallback - generic building
  "default": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
};

// Map service names to appropriate image keys
const getImageKey = (place: { name: string }): string => {
  const name = place.name.toLowerCase();

  if (name.includes("police") || name.includes("lögregla")) return "police";
  if (name.includes("fire") || name.includes("slökkviliðs") || name.includes("brigade")) return "fire";
  if (name.includes("health") || name.includes("heilsu") || name.includes("clinic") || name.includes("hospital")) return "health";
  if (name.includes("ferry") || name.includes("terminal") || name.includes("port")) return "ferry";
  if (name.includes("post") || name.includes("póstur")) return "post";
  if (name.includes("library") || name.includes("bókasafn")) return "library";
  if (name.includes("school") || name.includes("skóli")) return "school";
  if (name.includes("town hall") || name.includes("ráðhús") || name.includes("municipal")) return "townhall";

  return "default";
};

const downloadServiceImage = async (
  imageUrl: string,
  place: { id: string; name: string },
  dryRun: boolean
): Promise<string | null> => {
  if (dryRun) {
    return `/media/services/${place.id}-curated.jpg`;
  }

  const dir = path.resolve("public/media/services");
  await ensureDir(dir);

  const fileName = `${place.id}-curated.jpg`;
  const dest = path.join(dir, fileName);

  const savedPath = await ensureImage(imageUrl, dest);
  if (savedPath) {
    return `/media/services/${fileName}`;
  }

  return null;
};

const enrichService = async (place: any, dryRun: boolean, verbose: boolean) => {
  const imageKey = getImageKey(place);
  const imageUrl = CURATED_IMAGES[imageKey];

  if (verbose) {
    console.log(`  Image category: "${imageKey}"`);
    console.log(`  Source URL: ${imageUrl}`);
  }

  try {
    const savedImagePath = await downloadServiceImage(imageUrl, place, dryRun);
    if (!savedImagePath) {
      return { status: "download-failed" };
    }

    if (!dryRun) {
      await prisma.place.update({
        where: { id: place.id },
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
    // Get all places with type TOWN_SERVICE
    const services = await prisma.place.findMany({
      where: { type: "TOWN_SERVICE" },
      include: { town: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    console.log(`Found ${services.length} town services to process\n`);

    for (const service of services) {
      // Skip if already has a curated/enriched image unless --force
      if (
        service.imageUrl &&
        (service.imageUrl.includes("/media/services/") ||
         service.imageUrl.includes("/media/enriched/") ||
         service.imageUrl.includes("unsplash.com")) &&
        !options.force
      ) {
        if (options.verbose) {
          console.log(`Skipping "${service.name}": already has good image`);
        }
        skipped++;
        continue;
      }

      // Skip placeholder images
      if (service.imageUrl === "/media/placeholder.svg") {
        console.log(`Enriching "${service.name}" (has placeholder)...`);
      } else {
        console.log(`Enriching "${service.name}"...`);
      }

      const result = await enrichService(service, options.dryRun, options.verbose);

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
      total: services.length,
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
