import { SubscriptionTarget, UserRole } from "@prisma/client";
import { prisma } from "../../lib/db";
import { DEMO_USER_OPTIONS } from "../../lib/auth/demo-users";
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
    slug: "free",
    name: "Free",
    price: 0,
    notificationLimit: 0,
    eventLimit: 1,
    description: "Basic listing for businesses that aren't yet subscribed.",
    features: {
      highlights: ["Directory listing", "1 event/month"],
    },
    priority: 0,
  },
  {
    slug: "starter",
    name: "Starter",
    price: 9900,
    notificationLimit: 4,
    eventLimit: 3,
    description: "Perfect for small businesses needing weekly visibility.",
    features: {
      highlights: ["4 pushes/month", "3 events/month", "Basic analytics"],
    },
    priority: 1,
  },
  {
    slug: "growth",
    name: "Growth",
    price: 19900,
    notificationLimit: 12,
    eventLimit: 8,
    description: "Great for growing businesses running regular promotions.",
    features: {
      highlights: [
        "12 pushes/month",
        "8 events/month",
        "Featured placement",
        "Engagement analytics",
      ],
    },
    priority: 2,
  },
  {
    slug: "premium",
    name: "Premium",
    price: 39900,
    notificationLimit: 30,
    eventLimit: null,
    description: "Full control with segmentation, scheduling, and priority support.",
    features: {
      highlights: [
        "30 pushes/month",
        "Unlimited events",
        "Audience segmentation",
        "Scheduling",
        "Priority support",
      ],
    },
    priority: 3,
  },
];

const TOWN_TIER = {
  slug: "town-standard",
  name: "Town Standard",
  price: 250000,
  notificationLimit: 50,
  eventLimit: 20,
  description: "Standard town package with 50 notifications and 20 events per month.",
  features: {
    highlights: [
      "50 push notifications/month",
      "20 town events/month",
      "Weather & emergency alerts",
      "Citizen engagement analytics",
      "Multi-language support",
    ],
  },
  priority: 1,
};

const DEFAULT_TOWN = {
  name: "Stykkishólmur",
  slug: "stykkisholmur",
  licenseFee: 250000,
};

async function main() {
  const { places, events, townCenter } = await fetchStykkisholmur();

  const town = await prisma.town.upsert({
    where: { slug: DEFAULT_TOWN.slug },
    update: {
      latitude: townCenter.lat,
      longitude: townCenter.lng,
      monthlyNotificationLimit: 50,
      monthlyEventLimit: 20,
      licenseFee: 250000,
    },
    create: {
      name: DEFAULT_TOWN.name,
      slug: DEFAULT_TOWN.slug,
      licenseFee: DEFAULT_TOWN.licenseFee,
      latitude: townCenter.lat,
      longitude: townCenter.lng,
      defaultLocale: "is",
      monthlyNotificationLimit: 50,
      monthlyEventLimit: 20,
      usageResetsAt: new Date(),
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
        latitude: event.latitude,
        longitude: event.longitude,
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

  console.info("Upserting town tier…");
  await prisma.subscription.upsert({
    where: { slug: TOWN_TIER.slug },
    update: {
      name: TOWN_TIER.name,
      price: TOWN_TIER.price,
      currency: "ISK",
      billingPeriod: "monthly",
      notificationLimit: TOWN_TIER.notificationLimit,
      eventLimit: TOWN_TIER.eventLimit,
      description: TOWN_TIER.description,
      features: TOWN_TIER.features,
      target: SubscriptionTarget.TOWN,
      priority: TOWN_TIER.priority,
      isActive: true,
    },
    create: {
      slug: TOWN_TIER.slug,
      name: TOWN_TIER.name,
      price: TOWN_TIER.price,
      currency: "ISK",
      billingPeriod: "monthly",
      notificationLimit: TOWN_TIER.notificationLimit,
      eventLimit: TOWN_TIER.eventLimit,
      description: TOWN_TIER.description,
      features: TOWN_TIER.features,
      target: SubscriptionTarget.TOWN,
      priority: TOWN_TIER.priority,
    },
  });

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

  await seedDemoUsers(town.id, townCenter);

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

const DEMO_BUSINESS_SLUG = "demo-business";
const DEMO_EVENT_ID = "demo-business-event";

async function seedDemoUsers(
  townId: string,
  townCenter: { lat: number; lng: number }
) {
  const starterPlan = await prisma.subscription.findUnique({
    where: { slug: "starter" },
  });

  if (!starterPlan) {
    throw new Error("Starter subscription tier is required for demo data.");
  }

  for (const user of DEMO_USER_OPTIONS) {
    await prisma.profile.upsert({
      where: { userId: user.userId },
      update: {
        firstName: user.firstName,
        email: user.email,
        role: user.role as UserRole,
        townId: user.role === "SUPER_ADMIN" ? null : townId,
      },
      create: {
        userId: user.userId,
        firstName: user.firstName,
        email: user.email,
        role: user.role as UserRole,
        townId: user.role === "SUPER_ADMIN" ? null : townId,
      },
    });
  }

  const businessOwner = DEMO_USER_OPTIONS.find((user) => user.role === "BUSINESS_OWNER");
  if (!businessOwner) {
    throw new Error("Business owner demo user is missing.");
  }

  const businessProfile = await prisma.profile.findUnique({
    where: { userId: businessOwner.userId },
  });

  if (!businessProfile) {
    throw new Error("Business owner profile was not created.");
  }

  await prisma.business.upsert({
    where: { slug: DEMO_BUSINESS_SLUG },
    update: {
      shortDescription: "A demo venue used to illustrate the business dashboard.",
      longDescription:
        "This mock partner showcases quota tracking, events, and quick actions for business owners.",
      townId,
      subscriptionId: starterPlan.id,
      notificationQuota: starterPlan.notificationLimit ?? 0,
      monthlyNotificationLimit: starterPlan.notificationLimit ?? 0,
      monthlyEventLimit: starterPlan.eventLimit ?? 0,
      notificationUsage: 1,
      eventUsage: 1,
      quotaResetAt: new Date(),
      usageResetsAt: new Date(),
      status: "active",
      heroImageUrl:
        "https://images.unsplash.com/photo-1529692236671-f1c19a2bfcd9?q=80&w=1200",
      logoUrl:
        "https://images.unsplash.com/photo-1542827638-4f8e6bf5380f?q=80&w=400",
      contactEmail: businessOwner.email,
      userId: businessProfile.id,
    },
    create: {
      name: "Demo Harbor Boutique",
      slug: DEMO_BUSINESS_SLUG,
      townId,
      subscriptionId: starterPlan.id,
      shortDescription: "A demo venue used to illustrate the business owner experience.",
      longDescription:
        "This mock partner showcases quota tracking, events, and quick actions for business owners.",
      notificationQuota: starterPlan.notificationLimit ?? 0,
      monthlyNotificationLimit: starterPlan.notificationLimit ?? 0,
      monthlyEventLimit: starterPlan.eventLimit ?? 0,
      notificationUsage: 1,
      eventUsage: 1,
      quotaResetAt: new Date(),
      usageResetsAt: new Date(),
      status: "active",
      heroImageUrl:
        "https://images.unsplash.com/photo-1529692236671-f1c19a2bfcd9?q=80&w=1200",
      logoUrl:
        "https://images.unsplash.com/photo-1542827638-4f8e6bf5380f?q=80&w=400",
      contactEmail: businessOwner.email,
      userId: businessProfile.id,
    },
  });

  const demoBusiness = await prisma.business.findUnique({
    where: { slug: DEMO_BUSINESS_SLUG },
  });

  if (!demoBusiness) {
    throw new Error("Failed to create demo business record.");
  }

  const eventStart = new Date();
  eventStart.setDate(eventStart.getDate() + 3);
  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventEnd.getHours() + 2);

  await prisma.event.upsert({
    where: { id: DEMO_EVENT_ID },
    update: {
      title: "Demo Harbor Gathering",
      description: "An invitation-only experience for the demo business audience.",
      imageUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
      startsAt: eventStart,
      endsAt: eventEnd,
      location: "Harbor Tent",
      townId,
      businessId: demoBusiness.id,
      latitude: townCenter.lat + 0.001,
      longitude: townCenter.lng - 0.001,
      isFeatured: true,
    },
    create: {
      id: DEMO_EVENT_ID,
      title: "Demo Harbor Gathering",
      description: "An invitation-only experience for the demo business audience.",
      imageUrl:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200",
      startsAt: eventStart,
      endsAt: eventEnd,
      location: "Harbor Tent",
      townId,
      businessId: demoBusiness.id,
      latitude: townCenter.lat + 0.001,
      longitude: townCenter.lng - 0.001,
      isFeatured: true,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
