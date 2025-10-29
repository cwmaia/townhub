import { prisma } from "../../lib/db";
import { fetchStykkisholmur } from "./fetch_stykkisholmur";

const ADMIN_EMAILS =
  (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS)?.split(
    ","
  ) ?? [];

async function main() {
  const { places, events, townCenter } = await fetchStykkisholmur();

  console.info("Resetting existing data…");
  await prisma.event.deleteMany();
  await prisma.place.deleteMany();

  console.info(`Seeding ${places.length} places…`);
  await prisma.place.createMany({
    data: places.map((place) => ({
      name: place.name,
      type: place.type,
      description: place.description,
      address: place.address,
      website: place.website,
      phone: place.phone,
      lat: place.lat,
      lng: place.lng,
      distanceKm: place.distanceKm ?? null,
      rating: place.rating ?? null,
      ratingCount: place.ratingCount ?? null,
      imageUrl: place.imagePath ?? null,
      tags: place.tags ?? [],
      priceRange: place.priceRange ?? null,
    })),
  });

  console.info("Seeding events…");
  await prisma.event.createMany({
    data: events.map((event) => ({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      location: event.location,
    })),
  });

  if (ADMIN_EMAILS.length > 0) {
    console.info("Ensuring admin profiles exist…");
    for (const email of ADMIN_EMAILS) {
      const supabaseUserId = email.trim();
      if (!supabaseUserId) continue;

      await prisma.profile.upsert({
        where: { userId: supabaseUserId },
        update: { role: "admin" },
        create: {
          userId: supabaseUserId,
          role: "admin",
          firstName: supabaseUserId.split("@")[0],
        },
      });
    }
  }

  console.info("Seed completed.");
  console.info(
    `Town center located at lat=${townCenter.lat.toFixed(
      4
    )}, lng=${townCenter.lng.toFixed(4)}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
