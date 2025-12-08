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
// Each image is carefully selected to match the specific place type in Iceland
const CURATED_IMAGES: Record<string, string> = {
  // Iconic Icelandic lighthouse (orange/red)
  "lighthouse": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",

  // Library of Water / Art installation
  "library-art": "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",

  // Boat tours / Bay tours
  "boat-tour": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",

  // Thermal pool / Swimming pool
  "thermal-pool": "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&q=80",

  // Hotels - modern/boutique
  "hotel-modern": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",

  // Hotels - traditional/cozy
  "hotel-traditional": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",

  // Guesthouse - intimate/cozy
  "guesthouse": "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80",

  // Franciscan hotel / historic building
  "hotel-historic": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",

  // Bakery / cafe
  "bakery": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",

  // Cafe / coffee shop
  "cafe": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",

  // General fallback images
  "iceland-landscape": "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&q=80",
  "iceland-town": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80",
};

// Specific place name mappings for exact matches
const PLACE_SPECIFIC_IMAGES: Record<string, string> = {
  // Lodging
  "Hotel Stykkishólmur": CURATED_IMAGES["hotel-modern"],
  "Hotel Egilsen": CURATED_IMAGES["hotel-traditional"],
  "Hótel Fransiskus Stykkishólmi": CURATED_IMAGES["hotel-historic"],
  "Our Guesthouse": CURATED_IMAGES["guesthouse"],
  "Sjavarborg Guesthouse": CURATED_IMAGES["guesthouse"],

  // Restaurants
  "Stykkishólmur Bakery": CURATED_IMAGES["bakery"],
  "Café Sjávarborg": CURATED_IMAGES["cafe"],

  // Attractions
  "Library of Water": CURATED_IMAGES["library-art"],
  "Stykkishólmur Lighthouse": CURATED_IMAGES["lighthouse"],
  "Breiðafjörður Bay Boat Tours": CURATED_IMAGES["boat-tour"],
  "Sundlaug Stykkishólms Thermal Pool": CURATED_IMAGES["thermal-pool"],
};

// Category-based matching for places not in specific list
const getCategoryImage = (place: { name: string; type: string }): string => {
  const name = place.name.toLowerCase();

  // Check for specific matches first
  if (PLACE_SPECIFIC_IMAGES[place.name]) {
    return PLACE_SPECIFIC_IMAGES[place.name];
  }

  // Type-based matching
  if (place.type === "LODGING") {
    if (name.includes("guesthouse") || name.includes("guest house")) {
      return CURATED_IMAGES["guesthouse"];
    }
    if (name.includes("fransiskus") || name.includes("historic")) {
      return CURATED_IMAGES["hotel-historic"];
    }
    if (name.includes("egilsen") || name.includes("traditional")) {
      return CURATED_IMAGES["hotel-traditional"];
    }
    return CURATED_IMAGES["hotel-modern"];
  }

  if (place.type === "RESTAURANT") {
    if (name.includes("bakery") || name.includes("bakar")) {
      return CURATED_IMAGES["bakery"];
    }
    if (name.includes("café") || name.includes("cafe") || name.includes("coffee")) {
      return CURATED_IMAGES["cafe"];
    }
    return CURATED_IMAGES["cafe"];
  }

  if (place.type === "ATTRACTION") {
    if (name.includes("lighthouse") || name.includes("viti")) {
      return CURATED_IMAGES["lighthouse"];
    }
    if (name.includes("library") || name.includes("water") || name.includes("vatn")) {
      return CURATED_IMAGES["library-art"];
    }
    if (name.includes("boat") || name.includes("tour") || name.includes("bay")) {
      return CURATED_IMAGES["boat-tour"];
    }
    if (name.includes("pool") || name.includes("thermal") || name.includes("sundlaug")) {
      return CURATED_IMAGES["thermal-pool"];
    }
    return CURATED_IMAGES["iceland-landscape"];
  }

  return CURATED_IMAGES["iceland-town"];
};

const downloadPlaceImage = async (
  imageUrl: string,
  place: { id: string; name: string },
  dryRun: boolean
): Promise<string | null> => {
  if (dryRun) {
    return `/media/enriched/${place.id}-enriched-0.jpg`;
  }

  const dir = path.resolve("public/media/enriched");
  await ensureDir(dir);

  const fileName = `${place.id}-enriched-0.jpg`;
  const dest = path.join(dir, fileName);

  const savedPath = await ensureImage(imageUrl, dest);
  if (savedPath) {
    return `/media/enriched/${fileName}`;
  }

  return null;
};

const needsEnrichment = (place: { imageUrl: string | null }): boolean => {
  if (!place.imageUrl) return true;

  // Already has a good image
  if (
    place.imageUrl.includes("/media/enriched/") ||
    place.imageUrl.includes("/media/services/") ||
    place.imageUrl.includes("/media/events/") ||
    place.imageUrl.includes("unsplash.com") ||
    place.imageUrl.includes("maps.googleapis.com")
  ) {
    return false;
  }

  // Has placeholder or generic stock image
  return true;
};

const enrichPlace = async (place: any, dryRun: boolean, verbose: boolean) => {
  const imageUrl = getCategoryImage(place);

  if (verbose) {
    console.log(`  Selected image URL: ${imageUrl}`);
    console.log(`  Current image: ${place.imageUrl || "null"}`);
  }

  try {
    const savedImagePath = await downloadPlaceImage(imageUrl, place, dryRun);
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
    // Get all places
    const allPlaces = await prisma.place.findMany({
      include: { town: { select: { name: true, slug: true } } },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    // Filter to only places that need enrichment
    const placesToEnrich = allPlaces.filter(
      (place) => options.force || needsEnrichment(place)
    );

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    console.log(`Found ${placesToEnrich.length} places to enrich (out of ${allPlaces.length} total)\n`);

    if (placesToEnrich.length === 0) {
      console.log("All places already have good images! Use --force to re-enrich.");
      return;
    }

    for (const place of placesToEnrich) {
      const townInfo = place.town ? ` (${place.town.name})` : "";
      console.log(`Enriching [${place.type}] "${place.name}"${townInfo}...`);

      const result = await enrichPlace(place, options.dryRun, options.verbose);

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
      total: allPlaces.length,
      processed: placesToEnrich.length,
      updated,
      skipped,
      failed,
      dryRun: options.dryRun,
    });

    if (options.dryRun) {
      console.log("\n✓ Dry run completed - no changes were made to the database");
    } else if (updated > 0) {
      console.log(`\n✓ Successfully enriched ${updated} places with curated images`);
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
