import { SubscriptionTarget, UserRole } from "@prisma/client";
import { prisma } from "../../lib/db";
import { fetchStykkisholmur } from "./fetch_stykkisholmur";

const ADMIN_EMAILS =
  (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS)?.split(",") ?? [];

const TOWN_ADMIN_EMAILS =
  (
    process.env.TOWN_ADMIN_EMAILS ??
    process.env.NEXT_PUBLIC_TOWN_ADMIN_EMAILS ??
    ""
  )
    .split(",")
    .filter(Boolean);

const BUSINESS_TIERS = [
  {
    slug: "starter",
    name: "Starter",
    price: 7500,
    notificationLimit: 2,
    eventLimit: 2,
    description: "Perfect for small businesses that need occasional visibility.",
    features: {
      highlights: ["2 pushes/month", "2 events/month", "Basic analytics"],
    },
    priority: 1,
  },
  {
    slug: "growth",
    name: "Growth",
    price: 15000,
    notificationLimit: 8,
    eventLimit: 6,
    description: "Great for growing businesses that run recurring promotions.",
    features: {
      highlights: [
        "8 pushes/month",
        "6 events/month",
        "Featured placement",
        "Engagement analytics",
      ],
    },
    priority: 2,
  },
  {
    slug: "premium",
    name: "Premium",
    price: 29000,
    notificationLimit: 20,
    eventLimit: null,
    description: "Full control with segmentation, scheduling, and priority support.",
    features: {
      highlights: [
        "20 pushes/month",
        "Unlimited events",
        "Audience segmentation",
        "Scheduling",
        "Priority support",
      ],
    },
    priority: 3,
  },
];

const DEFAULT_TOWN = {
  name: "Stykkishólmur",
  slug: "stykkisholmur",
  licenseFee: 95000,
};

async function main() {
  const { places, events, townCenter } = await fetchStykkisholmur();

  const town = await prisma.town.upsert({
    where: { slug: DEFAULT_TOWN.slug },
    update: {
      latitude: townCenter.lat,
      longitude: townCenter.lng,
    },
    create: {
      name: DEFAULT_TOWN.name,
      slug: DEFAULT_TOWN.slug,
      licenseFee: DEFAULT_TOWN.licenseFee,
      latitude: townCenter.lat,
      longitude: townCenter.lng,
      defaultLocale: "is",
    },
  });

  console.info("Resetting existing data…");
  await prisma.event.deleteMany({ where: { townId: town.id } });
  await prisma.place.deleteMany({ where: { townId: town.id } });

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
      townId: town.id,
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
      townId: town.id,
    })),
  });

  console.info("Upserting business tiers…");
  for (const tier of BUSINESS_TIERS) {
    await prisma.subscription.upsert({
      where: { slug: tier.slug },
      update: {
        name: tier.name,
        price: tier.price,
        currency: "ISK",
        billingPeriod: "monthly",
        notificationLimit: tier.notificationLimit,
        eventLimit: tier.eventLimit,
        description: tier.description,
        features: tier.features,
        target: SubscriptionTarget.BUSINESS,
        priority: tier.priority,
        isActive: true,
      },
      create: {
        slug: tier.slug,
        name: tier.name,
        price: tier.price,
        currency: "ISK",
        billingPeriod: "monthly",
        notificationLimit: tier.notificationLimit,
        eventLimit: tier.eventLimit,
        description: tier.description,
        features: tier.features,
        target: SubscriptionTarget.BUSINESS,
        priority: tier.priority,
      },
    });
  }

  if (ADMIN_EMAILS.length > 0) {
    console.info("Ensuring super admin profiles exist…");
    for (const email of ADMIN_EMAILS) {
      const supabaseUserId = email.trim();
      if (!supabaseUserId) continue;

      await prisma.profile.upsert({
        where: { userId: supabaseUserId },
        update: {
          role: UserRole.SUPER_ADMIN,
          email: email,
        },
        create: {
          userId: supabaseUserId,
          role: UserRole.SUPER_ADMIN,
          firstName: supabaseUserId.split("@")[0],
          email: email,
        },
      });
    }
  }

  if (TOWN_ADMIN_EMAILS.length > 0) {
    console.info("Ensuring town admin profiles exist…");
  for (const email of TOWN_ADMIN_EMAILS) {
      const supabaseUserId = email.trim();
      if (!supabaseUserId) continue;

      await prisma.profile.upsert({
        where: { userId: supabaseUserId },
        update: {
          role: UserRole.TOWN_ADMIN,
          email: email,
          townId: town.id,
        },
        create: {
          userId: supabaseUserId,
          role: UserRole.TOWN_ADMIN,
          firstName: supabaseUserId.split("@")[0],
          email: email,
          townId: town.id,
        },
      });
    }
  }

  console.info("Seeding notification segments…");
  const segments = [
    {
      slug: "town-alerts",
      name: "Town Alerts",
      description: "Emergency and civic notices for all residents.",
      filters: { focus: ["town"] },
    },
    {
      slug: "weather-alerts",
      name: "Weather & Road Alerts",
      description: "Bad weather, road, and aurora visibility warnings.",
      filters: { focus: ["weather", "road", "aurora"] },
    },
    {
      slug: "business-featured",
      name: "Business Featured",
      description: "Promoted business events for premium tiers.",
      filters: { focus: ["business"] },
    },
  ];

  for (const segment of segments) {
    await prisma.notificationSegment.upsert({
      where: { slug: segment.slug },
      update: {
        name: segment.name,
        description: segment.description,
        filters: segment.filters,
        townId: town.id,
      },
      create: {
        slug: segment.slug,
        name: segment.name,
        description: segment.description,
        filters: segment.filters,
        townId: town.id,
      },
    });
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
