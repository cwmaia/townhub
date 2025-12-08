import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { Client } from "@googlemaps/google-maps-services-js";
import { ensureImage } from "../lib/scrape/places";
import { haversineDistanceKm } from "../lib/geo";

const prisma = new PrismaClient();

// Load manual place mappings (place name -> Google Place ID)
type PlaceMappings = Record<string, Record<string, string | null>>;
const mappingsPath = path.resolve(__dirname, "place-mappings.json");
const manualMappings: PlaceMappings = fs.existsSync(mappingsPath)
  ? JSON.parse(fs.readFileSync(mappingsPath, "utf-8"))
  : {};
const googleApiKey =
  process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;

if (!googleApiKey) {
  console.error("Missing GOOGLE_PLACES_API_KEY environment variable.");
  process.exit(1);
}

const args = process.argv.slice(2);
const options = args.reduce(
  (acc, raw) => {
    if (raw.startsWith("--town=")) {
      acc.townSlug = raw.replace("--town=", "");
    }
    if (raw === "--dry-run") {
      acc.dryRun = true;
    }
    if (raw === "--verbose" || raw === "-v") {
      acc.verbose = true;
    }
    if (raw === "--force") {
      acc.force = true; // Re-enrich already enriched places
    }
    return acc;
  },
  { townSlug: "" as string | undefined, dryRun: false, verbose: false, force: false }
);

const MATCH_THRESHOLD = 0.6; // Lowered from 0.7 for better coverage

const googleClient = new Client();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const nameScore = (a: string, b: string) => {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;

  let i = 0;
  let j = 0;
  let hits = 0;
  while (i < na.length && j < nb.length) {
    if (na[i] === nb[j]) {
      hits++;
      i++;
      j++;
    } else {
      j++;
    }
  }

  return (2 * hits) / (na.length + nb.length);
};

const downloadPhotos = async (urls: string[], place: { slug?: string | null; id: string }, dryRun: boolean) => {
  if (dryRun || urls.length === 0) {
    return [];
  }
  const dir = path.resolve("public/media/enriched");
  await ensureDir(dir);
  const saved: string[] = [];
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    const fileName = `${(place.slug ?? place.id).replace(/[^a-z0-9-]/gi, "")}-enriched-${index}.jpg`;
    const dest = path.join(dir, fileName);
    const savedPath = await ensureImage(url, dest);
    if (savedPath) {
      saved.push(`/media/enriched/${fileName}`);
    }
  }
  return saved;
};

const ensureDir = async (dirPath: string) => {
  await import("node:fs/promises")
    .then((fs) => fs.mkdir(dirPath, { recursive: true }))
    .catch(() => {});
};

// Enrich using a known Google Place ID (from manual mappings)
const enrichByPlaceId = async (place: any, placeId: string, dryRun: boolean) => {
  try {
    const response = await googleClient.placeDetails({
      params: {
        key: googleApiKey!,
        place_id: placeId,
        fields: ["name", "geometry", "photos", "place_id"],
      },
      timeout: 10_000,
    });

    const result = response.data.result;
    if (!result) {
      return { status: "failed", error: "Place not found by ID" };
    }

    const updates: Record<string, unknown> = {};

    // Update coordinates
    const location = result.geometry?.location;
    if (location) {
      updates.lat = location.lat;
      updates.lng = location.lng;
    }

    // Download photos
    const photoUrls =
      Array.isArray(result.photos) && result.photos.length > 0
        ? result.photos
            .slice(0, 3)
            .map((photo) =>
              photo.photo_reference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${googleApiKey}`
                : null
            )
            .filter(Boolean) as string[]
        : [];

    const savedPhotos = await downloadPhotos(photoUrls, place, dryRun);
    if (savedPhotos.length > 0) {
      updates.imageUrl = savedPhotos[0];
    }

    updates.googlePlaceId = placeId;

    if (!dryRun && Object.keys(updates).length > 0) {
      await prisma.place.update({
        where: { id: place.id },
        data: updates,
      });
    }

    return { status: "updated", score: 1.0, source: "manual-mapping" };
  } catch (error) {
    return { status: "failed", error: (error as Error).message };
  }
};

const enrichPlace = async (place: any, townName: string, townSlug: string, dryRun: boolean) => {
  // Check for manual mapping first
  const townMappings = manualMappings[townSlug] ?? {};
  const manualPlaceId = townMappings[place.name];

  if (manualPlaceId) {
    return enrichByPlaceId(place, manualPlaceId, dryRun);
  }

  if (manualPlaceId === null) {
    // Explicitly marked as "no Google equivalent"
    return { status: "no-mapping", score: 0 };
  }

  // Fall back to text search
  const query = `${place.name} ${townName} Iceland`;
  try {
    const response = await googleClient.textSearch({
      params: {
        key: googleApiKey!,
        query,
        language: "en",
      },
      timeout: 10_000,
    });

    const candidates = response.data.results ?? [];
    if (candidates.length === 0) {
      return { status: "no-match" };
    }

    let bestCandidate: any = null;
    let bestScore = 0;
    for (const candidate of candidates) {
      const score = nameScore(place.name, candidate.name ?? "");
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (!bestCandidate || bestScore < MATCH_THRESHOLD) {
      return {
        status: "low-score",
        score: bestScore,
        bestMatch: bestCandidate?.name,
        candidates: candidates.slice(0, 3).map((c: any) => c.name)
      };
    }

    const updates: Record<string, unknown> = {
      imageUrl: place.imageUrl,
    };

    const location = bestCandidate.geometry?.location;
    if (location) {
      const originalLat = place.lat ?? location.lat;
      const originalLng = place.lng ?? location.lng;
      const driftKm = haversineDistanceKm(
        { lat: originalLat, lng: originalLng },
        { lat: location.lat, lng: location.lng }
      );
      if (driftKm <= 1) {
        updates.lat = location.lat;
        updates.lng = location.lng;
      }
    }

    const photoUrls =
      Array.isArray(bestCandidate.photos) && bestCandidate.photos.length > 0
        ? bestCandidate.photos
            .slice(0, 3)
            .map(
              (photo: { photo_reference?: string }) =>
                photo.photo_reference
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${googleApiKey}`
                  : null
            )
            .filter(Boolean) as string[]
        : [];

    const savedPhotos = await downloadPhotos(photoUrls, place, dryRun);
    if (savedPhotos.length > 0) {
      updates.imageUrl = savedPhotos[0];
    }

    updates["googlePlaceId"] = bestCandidate.place_id;

    if (!dryRun) {
      await prisma.place.update({
        where: { id: place.id },
        data: updates,
      });
    }

    return { status: "updated", score: bestScore, driftKm: updates.lat ? bestCandidate.geometry?.location ? haversineDistanceKm({ lat: place.lat ?? 0, lng: place.lng ?? 0 }, { lat: bestCandidate.geometry.location.lat, lng: bestCandidate.geometry.location.lng }) : null : null };
  } catch (error) {
    console.error(`Enrichment failed for ${place.name}:`, error);
    return { status: "failed", error: (error as Error).message };
  }
};

const run = async () => {
  try {
    const places = await prisma.place.findMany({
      include: { town: { select: { slug: true, name: true } } },
      ...(options.townSlug
        ? { where: { town: { slug: options.townSlug } } }
        : {}),
      orderBy: { name: "asc" },
    });

    let matched = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const place of places) {
      if (!place.town) {
        console.warn(`Skipping ${place.name}: missing town`);
        skipped++;
        continue;
      }

      // Skip already enriched places unless --force is used
      if (place.googlePlaceId && !options.force) {
        if (options.verbose) {
          console.log(`Skipping ${place.name}: already enriched`);
        }
        skipped++;
        continue;
      }

      console.log(`Enriching ${place.name} (${place.town.name})...`);
      const result = await enrichPlace(place, place.town.name, place.town.slug, options.dryRun);

      if (result.status === "updated") {
        matched++;
        updated++;
        const source = (result as any).source === "manual-mapping" ? " [manual]" : "";
        console.log(`→ updated (score ${result.score?.toFixed(2)})${source}`);
      } else if (result.status === "no-mapping") {
        skipped++;
        console.log(`→ skipped (no Google equivalent)`);
      } else if (result.status === "low-score" || result.status === "no-match") {
        skipped++;
        console.log(`→ skipped (${result.status}, score: ${result.score?.toFixed(2) ?? 'N/A'})`);
        if (options.verbose && result.candidates) {
          console.log(`  Best match: "${result.bestMatch}" (score: ${result.score?.toFixed(2)})`);
          console.log(`  Google candidates: ${result.candidates.join(', ')}`);
        }
      } else if (result.status === "failed") {
        failed++;
        console.log(`→ failed: ${(result as any).error}`);
      } else {
        skipped++;
      }

      await sleep(1000);
    }

    console.log("Enrichment summary:", { matched, updated, skipped, failed });
  } finally {
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error("Enrichment script failed:", error);
  prisma.$disconnect();
  process.exit(1);
});
