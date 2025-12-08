import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImageUrls() {
  const oldUrl = 'http://192.168.1.21:3000';
  const newUrl = 'http://10.0.0.245:3000';

  console.log(`Updating image URLs from ${oldUrl} to ${newUrl}...`);

  // Update Place imageUrls
  const placesResult = await prisma.$executeRawUnsafe(`
    UPDATE "Place"
    SET "imageUrl" = REPLACE("imageUrl", '${oldUrl}', '${newUrl}')
    WHERE "imageUrl" LIKE '${oldUrl}%'
  `);
  console.log('Places updated:', placesResult);

  // Update Event imageUrls
  const eventsResult = await prisma.$executeRawUnsafe(`
    UPDATE "Event"
    SET "imageUrl" = REPLACE("imageUrl", '${oldUrl}', '${newUrl}')
    WHERE "imageUrl" LIKE '${oldUrl}%'
  `);
  console.log('Events updated:', eventsResult);

  await prisma.$disconnect();
  console.log('Done!');
}

updateImageUrls().catch(console.error);
