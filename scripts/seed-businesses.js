require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const town = await prisma.town.findUnique({ where: { slug: "stykkisholmur" } });
  if (!town) {
    throw new Error("Town Stykkisholmur not found. Seed the town first.");
  }

  const [starterTier, growthTier, premiumTier] = await Promise.all([
    prisma.subscription.findUnique({ where: { slug: "starter" } }),
    prisma.subscription.findUnique({ where: { slug: "growth" } }),
    prisma.subscription.findUnique({ where: { slug: "premium" } }),
  ]);

  const places = await prisma.place.findMany({ where: { townId: town.id }, take: 4 });
  const placeIds = places.map((place) => place.id);

  const businesses = [
    {
      name: places[0]?.name ?? "Volcano Museum Business",
      slug: "volcano-museum-biz",
      placeId: placeIds[0] ?? null,
      subscriptionId: premiumTier?.id ?? null,
      shortDescription: "Educational museum showcasing Iceland's volcanic history",
      contactEmail: "info@volcanomuseum.is",
      contactPhone: "+354 438 8154",
      status: "active",
      notificationQuota: 20,
      quotaUsed: 0,
      quotaResetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    {
      name: places[1]?.name ?? "Our Guesthouse Business",
      slug: "our-guesthouse-biz",
      placeId: placeIds[1] ?? null,
      subscriptionId: growthTier?.id ?? null,
      shortDescription: "Cozy guesthouse with stunning harbor views",
      contactEmail: "booking@ourguesthouse.is",
      contactPhone: "+354 438 1234",
      status: "active",
      notificationQuota: 8,
      quotaUsed: 2,
      quotaResetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    {
      name: places[2]?.name ?? "Breiðafjörður Tours",
      slug: "breidafjordur-tours",
      placeId: placeIds[2] ?? null,
      subscriptionId: starterTier?.id ?? null,
      shortDescription: "Boat tours exploring the beautiful Breiðafjörður bay",
      contactEmail: "tours@breidafjordur.is",
      contactPhone: "+354 438 5678",
      status: "active",
      notificationQuota: 2,
      quotaUsed: 1,
      quotaResetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    {
      name: "Stykkishólmur Harbor Restaurant",
      slug: "harbor-restaurant",
      placeId: null,
      subscriptionId: growthTier?.id ?? null,
      shortDescription: "Fresh seafood with panoramic harbor views",
      contactEmail: "info@harborrestaurant.is",
      contactPhone: "+354 438 9999",
      status: "active",
      notificationQuota: 8,
      quotaUsed: 0,
      quotaResetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  ];

  console.info("Seeding sample businesses…");

  for (const biz of businesses) {
    await prisma.business.upsert({
      where: { slug: biz.slug },
      update: {
        ...biz,
        townId: town.id,
      },
      create: {
        ...biz,
        townId: town.id,
      },
    });
  }

  console.info(`✅ Seeded ${businesses.length} sample businesses`);
}

main()
  .catch((error) => {
    console.error("Unable to seed businesses", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
