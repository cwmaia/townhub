import * as fs from 'fs';
import * as path from 'path';

/**
 * Copies enriched images to the main media folder with proper slug-based names.
 *
 * Based on the seed order from fetch_stykkisholmur.ts, we know the exact mapping
 * between old Place IDs and place names. The places are seeded in this order:
 *
 * 1. Town Services (5): Police, Fire, Health, Ferry, Post
 * 2. Lodging (8): Hotel Stykkishólmur, Fosshótel, Our Guesthouse, Hotel Egilsen,
 *                  Hótel Fransiskus, Sjavarborg, Akkeri, Hotel Karolina
 * 3. Restaurants (9): Narfeyrarstofa, Skúli, Sjávarpakkhúsið, Narfeyrarkaffi,
 *                     Bakery, Skipper, Café Sjávarborg, Skurinn, Hafnarvagninn
 * 4. Attractions (8): Volcano, Library, Eider, Boat Tours, Lighthouse,
 *                     Norwegian House, Thermal Pool, Helgafell
 *
 * Usage:
 * npx tsx scripts/copy-enriched-images.ts
 */

const ENRICHED_DIR = path.join(process.cwd(), 'public/media/enriched');
const MEDIA_DIR = path.join(process.cwd(), 'public/media');

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

// Mapping of old Place IDs to place names (in seed order)
// Based on the seed order: services, lodging, restaurants, attractions
const OLD_ID_TO_NAME: Record<string, string> = {
  // Services (0001-0005)
  'cmiq2w91u0001xxcadndwhtob': 'Stykkishólmur Police',
  'cmiq2w91u0002xxca': 'Stykkishólmur Fire Brigade',
  'cmiq2w91u0003xxca': 'Heilsugæsla Stykkishólms Health Center',
  'cmiq2w91u0004xxca': 'Baldur Ferry Terminal',
  'cmiq2w91u0005xxca': 'Icelandic Post Office - Stykkishólmur',

  // Lodging (0006-000d)
  'cmiq2w91u0006xxcaldf8cfj7': 'Hotel Stykkishólmur',
  'cmiq2w91u0007xxcaxnkg2nrs': 'Fosshótel Stykkishólmur',
  'cmiq2w91u0008xxca3wz3vry1': 'Our Guesthouse',
  'cmiq2w91u0009xxcaazgs6sg9': 'Hotel Egilsen',
  'cmiq2w91u000axxcacfapj5gx': 'Hótel Fransiskus Stykkishólmi',
  'cmiq2w91u000bxxcamb80susf': 'Sjavarborg Guesthouse',
  'cmiq2w91u000cxxcayx51fwk2': 'Akkeri Guesthouse',
  'cmiq2w91u000dxxcaihbo9k0i': 'Hotel Karolina',

  // Restaurants (000e-000m)
  'cmiq2w91u000exxcaxnl0xa1d': 'Narfeyrarstofa Bistro',
  'cmiq2w91u000fxxcavc01kw3i': 'Skúli Craft Bar & Bistro',
  'cmiq2w91u000gxxca0ypc13hx': 'Sjávarpakkhúsið',
  'cmiq2w91u000hxxcauwjzkjec': 'Narfeyrarkaffi',
  'cmiq2w91u000ixxcaokrv62i3': 'Stykkishólmur Bakery',
  'cmiq2w91v000jxxca8don7dlt': 'Skipper Restaurant',
  'cmiq2w91v000kxxcajxs68chn': 'Café Sjávarborg',
  'cmiq2w91v000lxxcaar0wgwwr': 'Skurinn',
  'cmiq2w91v000mxxcag4mmq37u': 'Hafnarvagninn',

  // Attractions (000n-000u)
  'cmiq2w91v000nxxcaq4bm6a6q': 'Volcano Museum',
  'cmiq2w91v000oxxcarhc3t63u': 'Library of Water',
  'cmiq2w91v000pxxca887xtst6': 'Icelandic Eider Center',
  'cmiq2w91v000qxxca13qd0vm6': 'Breiðafjörður Bay Boat Tours',
  'cmiq2w91v000rxxcaatbe7sn7': 'Stykkishólmur Lighthouse',
  'cmiq2w91v000sxxcae70vm6hs': 'Norwegian House Regional Museum',
  'cmiq2w91v000txxcahqfphf12': 'Sundlaug Stykkishólms Thermal Pool',
  'cmiq2w91v000uxxcauam5pzkr': 'Helgafell Sacred Hill',
};

async function main() {
  console.log('Copying enriched images to media folder...\n');

  const enrichedFiles = fs.readdirSync(ENRICHED_DIR).filter(f => f.endsWith('.jpg'));

  let copied = 0;
  let skipped = 0;

  for (const filename of enrichedFiles) {
    const match = filename.match(/^([a-z0-9]+)-enriched-\d+\.jpg$/i);
    if (!match) {
      console.log(`Skipping unrecognized file: ${filename}`);
      skipped++;
      continue;
    }

    const oldId = match[1];
    const placeName = OLD_ID_TO_NAME[oldId];

    if (!placeName) {
      console.log(`No mapping for ID: ${oldId} (${filename})`);
      skipped++;
      continue;
    }

    const newSlug = slugify(placeName);
    const newFilename = `${newSlug}.jpg`;
    const srcPath = path.join(ENRICHED_DIR, filename);
    const destPath = path.join(MEDIA_DIR, newFilename);

    // Backup existing file if different
    if (fs.existsSync(destPath)) {
      const srcStats = fs.statSync(srcPath);
      const destStats = fs.statSync(destPath);
      if (srcStats.size !== destStats.size) {
        const backupPath = path.join(MEDIA_DIR, `${newSlug}.old.jpg`);
        fs.copyFileSync(destPath, backupPath);
        console.log(`  Backed up: ${newFilename} -> ${newSlug}.old.jpg`);
      }
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${filename} -> ${newFilename}`);
    copied++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Copied: ${copied}`);
  console.log(`Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
