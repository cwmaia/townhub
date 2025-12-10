import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Restores enriched images to the database by reading the enriched folder
 * and updating Place records to use the enriched image URLs.
 *
 * Usage:
 * npx tsx scripts/restore-enriched-images.ts
 */

const prisma = new PrismaClient();

const ENRICHED_DIR = path.join(process.cwd(), 'public/media/enriched');

async function restoreEnrichedImages() {
  console.log('Scanning enriched images directory:', ENRICHED_DIR);

  if (!fs.existsSync(ENRICHED_DIR)) {
    throw new Error(`Enriched directory not found: ${ENRICHED_DIR}`);
  }

  const files = fs.readdirSync(ENRICHED_DIR);
  console.log(`Found ${files.length} files in enriched directory`);

  // Build a map of placeId -> enriched image filename
  const placeImageMap = new Map<string, string>();

  for (const file of files) {
    // Skip non-jpg files and hidden files
    if (!file.endsWith('.jpg') && !file.endsWith('.jpeg') && !file.endsWith('.png')) {
      continue;
    }

    // Extract place ID from filename like "cmiq2w91u0001xxcadndwhtob-enriched-0.jpg"
    const match = file.match(/^([a-z0-9]+)-enriched-\d+\.(jpg|jpeg|png)$/i);
    if (match) {
      const placeId = match[1];
      // Only keep the first (main) enriched image for each place
      if (!placeImageMap.has(placeId)) {
        placeImageMap.set(placeId, file);
      }
    }
  }

  console.log(`Found ${placeImageMap.size} unique place IDs with enriched images`);

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const [placeId, filename] of placeImageMap) {
    const newImageUrl = `/media/enriched/${filename}`;

    const result = await prisma.place.updateMany({
      where: { id: placeId },
      data: { imageUrl: newImageUrl },
    });

    if (result.count > 0) {
      updatedCount++;
      console.log(`Updated ${placeId} -> ${newImageUrl}`);
    } else {
      notFoundCount++;
      console.log(`Place not found: ${placeId}`);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total enriched images: ${placeImageMap.size}`);
  console.log(`Places updated: ${updatedCount}`);
  console.log(`Places not found: ${notFoundCount}`);

  await prisma.$disconnect();
}

restoreEnrichedImages().catch((err) => {
  console.error('Error:', err);
  prisma.$disconnect();
  process.exit(1);
});
