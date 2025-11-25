require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicates() {
  console.log('Finding duplicate places...');

  const allPlaces = await prisma.place.findMany({ orderBy: { createdAt: 'asc' } });
  const placesByName = {};
  allPlaces.forEach((place) => {
    const key = place.name?.trim() ?? '';
    if (!key) return;
    placesByName[key] = placesByName[key] ?? [];
    placesByName[key].push(place);
  });

  let placesDeleted = 0;
  for (const [name, places] of Object.entries(placesByName)) {
    if (places.length > 1) {
      const toDelete = places.slice(1);
      for (const place of toDelete) {
        await prisma.place.delete({ where: { id: place.id } });
        placesDeleted++;
      }
      console.log(`Removed ${toDelete.length} duplicate(s) of "${name}"`);
    }
  }
  console.log(`\n✅ Removed ${placesDeleted} duplicate place(s)`);

  console.log('\nFinding duplicate events...');
  const allEvents = await prisma.event.findMany({ orderBy: { createdAt: 'asc' } });
  const eventsByTitle = {};
  allEvents.forEach((event) => {
    const key = event.title?.trim() ?? '';
    if (!key) return;
    eventsByTitle[key] = eventsByTitle[key] ?? [];
    eventsByTitle[key].push(event);
  });

  let eventsDeleted = 0;
  for (const [title, events] of Object.entries(eventsByTitle)) {
    if (events.length > 1) {
      const toDelete = events.slice(1);
      for (const event of toDelete) {
        await prisma.event.delete({ where: { id: event.id } });
        eventsDeleted++;
      }
      console.log(`Removed ${toDelete.length} duplicate(s) of "${title}"`);
    }
  }
  console.log(`\n✅ Removed ${eventsDeleted} duplicate event(s)`);

  const finalPlaceCount = await prisma.place.count();
  const finalEventCount = await prisma.event.count();
  console.log('\n📊 Final counts:');
  console.log(`  Places: ${finalPlaceCount} (was ${allPlaces.length})`);
  console.log(`  Events: ${finalEventCount} (was ${allEvents.length})`);
}

removeDuplicates()
  .catch((error) => {
    console.error('Failed to remove duplicates', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
