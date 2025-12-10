# Task 1: Schema Updates & Quota Management

## Overview
Update the database schema to add town-level notification/event limits and implement quota management logic.

## Part A: Schema Updates

### 1. Update Town Model in `database/schema.prisma`

Add these fields to the Town model (after `invoices` relation):

```prisma
  monthlyNotificationLimit Int?      @default(50)
  monthlyEventLimit        Int?      @default(20)
  notificationUsage        Int       @default(0)
  eventUsage               Int       @default(0)
  usageResetsAt            DateTime?
```

### 2. Run Migration

After updating schema:
```bash
npx prisma migrate dev --name add_town_usage_limits
npx prisma generate
```

## Part B: Update Seed Data

### 1. Update `database/seed/seed.ts`

**Update BUSINESS_TIERS** with revised pricing:
```typescript
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
```

**Add TOWN_TIER** after BUSINESS_TIERS:
```typescript
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
```

**Add upsert for town tier** after business tier upserts:
```typescript
// Upsert town tier
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
```

**Update town upsert** to set the new fields:
```typescript
const town = await prisma.town.upsert({
  where: { slug: DEFAULT_TOWN.slug },
  update: {
    latitude: townCenter.lat,
    longitude: townCenter.lng,
    monthlyNotificationLimit: 50,
    monthlyEventLimit: 20,
    licenseFee: 250000, // Updated to match town tier
  },
  create: {
    name: DEFAULT_TOWN.name,
    slug: DEFAULT_TOWN.slug,
    licenseFee: 250000,
    latitude: townCenter.lat,
    longitude: townCenter.lng,
    defaultLocale: "is",
    monthlyNotificationLimit: 50,
    monthlyEventLimit: 20,
    usageResetsAt: new Date(),
  },
});
```

Also update `DEFAULT_TOWN`:
```typescript
const DEFAULT_TOWN = {
  name: "Stykkishólmur",
  slug: "stykkisholmur",
  licenseFee: 250000,
};
```

## Part C: Quota Management Library

### 1. Create `lib/notifications/quota.ts`

```typescript
import { prisma } from "@/lib/db";

export interface QuotaStatus {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

export async function resetMonthlyQuotas(): Promise<{ businessCount: number; townCount: number; resetAt: Date }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Reset businesses that haven't been reset this month
  const businessResult = await prisma.business.updateMany({
    where: {
      OR: [
        { usageResetsAt: null },
        { usageResetsAt: { lt: startOfMonth } },
      ],
    },
    data: {
      notificationUsage: 0,
      eventUsage: 0,
      usageResetsAt: now,
    },
  });

  // Reset towns
  const townResult = await prisma.town.updateMany({
    where: {
      OR: [
        { usageResetsAt: null },
        { usageResetsAt: { lt: startOfMonth } },
      ],
    },
    data: {
      notificationUsage: 0,
      eventUsage: 0,
      usageResetsAt: now,
    },
  });

  return {
    businessCount: businessResult.count,
    townCount: townResult.count,
    resetAt: now,
  };
}

export async function checkBusinessQuota(
  businessId: string,
  quotaType: "notification" | "event"
): Promise<QuotaStatus> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      monthlyNotificationLimit: true,
      monthlyEventLimit: true,
      notificationUsage: true,
      eventUsage: true,
    },
  });

  if (!business) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  const limit = quotaType === "notification"
    ? business.monthlyNotificationLimit
    : business.monthlyEventLimit;
  const used = quotaType === "notification"
    ? business.notificationUsage
    : business.eventUsage;

  if (limit === null) {
    return { allowed: true, used, limit: null, remaining: null };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function checkTownQuota(
  townId: string,
  quotaType: "notification" | "event"
): Promise<QuotaStatus> {
  const town = await prisma.town.findUnique({
    where: { id: townId },
    select: {
      monthlyNotificationLimit: true,
      monthlyEventLimit: true,
      notificationUsage: true,
      eventUsage: true,
    },
  });

  if (!town) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  const limit = quotaType === "notification"
    ? town.monthlyNotificationLimit
    : town.monthlyEventLimit;
  const used = quotaType === "notification"
    ? town.notificationUsage
    : town.eventUsage;

  if (limit === null) {
    return { allowed: true, used, limit: null, remaining: null };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function incrementBusinessUsage(
  businessId: string,
  quotaType: "notification" | "event"
): Promise<void> {
  const field = quotaType === "notification" ? "notificationUsage" : "eventUsage";

  await prisma.business.update({
    where: { id: businessId },
    data: { [field]: { increment: 1 } },
  });
}

export async function incrementTownUsage(
  townId: string,
  quotaType: "notification" | "event"
): Promise<void> {
  const field = quotaType === "notification" ? "notificationUsage" : "eventUsage";

  await prisma.town.update({
    where: { id: townId },
    data: { [field]: { increment: 1 } },
  });
}
```

### 2. Create `app/api/notifications/quota/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { checkBusinessQuota, checkTownQuota } from "@/lib/notifications/quota";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Business owner - get business quota
  if (profile.role === UserRole.BUSINESS_OWNER) {
    const business = await prisma.business.findUnique({
      where: { userId: profile.id },
      select: { id: true, name: true },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const notificationQuota = await checkBusinessQuota(business.id, "notification");
    const eventQuota = await checkBusinessQuota(business.id, "event");

    return NextResponse.json({
      entityType: "business",
      entityId: business.id,
      entityName: business.name,
      notifications: notificationQuota,
      events: eventQuota,
    });
  }

  // Town admin or super admin - get town quota
  if (profile.role === UserRole.TOWN_ADMIN || profile.role === UserRole.SUPER_ADMIN) {
    const townId = profile.townId;

    if (!townId) {
      // Super admin without assigned town
      return NextResponse.json({
        entityType: "super_admin",
        notifications: { allowed: true, used: 0, limit: null, remaining: null },
        events: { allowed: true, used: 0, limit: null, remaining: null },
      });
    }

    const town = await prisma.town.findUnique({
      where: { id: townId },
      select: { id: true, name: true },
    });

    if (!town) {
      return NextResponse.json({ error: "Town not found" }, { status: 404 });
    }

    const notificationQuota = await checkTownQuota(townId, "notification");
    const eventQuota = await checkTownQuota(townId, "event");

    return NextResponse.json({
      entityType: "town",
      entityId: town.id,
      entityName: town.name,
      notifications: notificationQuota,
      events: eventQuota,
    });
  }

  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}
```

### 3. Create `app/api/cron/reset-quotas/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { resetMonthlyQuotas } from "@/lib/notifications/quota";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await resetMonthlyQuotas();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to reset quotas:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to reset quotas",
    }, { status: 500 });
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
```

## Verification Steps

1. Run `npx prisma migrate dev --name add_town_usage_limits`
2. Run `npx prisma generate`
3. Run `npx prisma db seed` (or `npx tsx database/seed/seed.ts`)
4. Verify build passes: `npm run build`
5. Test quota endpoint: `curl http://localhost:3000/api/notifications/quota`

## Files Modified/Created

- `database/schema.prisma` - Modified
- `database/seed/seed.ts` - Modified
- `lib/notifications/quota.ts` - Created
- `app/api/notifications/quota/route.ts` - Created
- `app/api/cron/reset-quotas/route.ts` - Created
