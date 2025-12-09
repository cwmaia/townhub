# Phase 1: Database Schema & API Foundation

## Objective
Add the database models and API endpoints needed for granular notification subscriptions and enhanced notification preferences.

---

## Task 1.1: Update Prisma Schema

**File:** `database/schema.prisma`

### Add BusinessNotificationSubscription model

Add after the BusinessFavorite model (around line 320):

```prisma
// User's subscription to receive notifications from a specific business
model BusinessNotificationSubscription {
  id          String   @id @default(cuid())
  userId      String
  user        Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, businessId])
  @@index([businessId])
  @@index([userId])
}
```

### Add PlaceNotificationSubscription model

Add after BusinessNotificationSubscription:

```prisma
// User's subscription to receive notifications from a specific place
model PlaceNotificationSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      Profile  @relation(fields: [userId], references: [id], onDelete: Cascade)
  placeId   String
  place     Place    @relation(fields: [placeId], references: [id], onDelete: Cascade)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, placeId])
  @@index([placeId])
  @@index([userId])
}
```

### Update Profile model relations

Add these relations to the Profile model:

```prisma
businessNotificationSubscriptions BusinessNotificationSubscription[]
placeNotificationSubscriptions    PlaceNotificationSubscription[]
onboardingCompletedAt             DateTime?
```

### Update Business model relations

Add to Business model:

```prisma
notificationSubscriptions BusinessNotificationSubscription[]
```

### Update Place model relations

Add to Place model:

```prisma
notificationSubscriptions PlaceNotificationSubscription[]
```

### Update notificationPreferences default

Change the Profile model's notificationPreferences default from:
```prisma
notificationPreferences Json? @default("{\"events\":true,\"promos\":true,\"townAlerts\":true,\"weatherAlerts\":true,\"businessAlerts\":true}")
```

To:
```prisma
notificationPreferences Json? @default("{\"categories\":{\"townAlerts\":true,\"weatherAlerts\":true,\"events\":true,\"emergencyAlerts\":true},\"businessTypes\":{\"lodging\":true,\"restaurant\":true,\"attraction\":true,\"service\":true},\"globalEnabled\":true,\"quietHours\":{\"enabled\":false,\"start\":\"22:00\",\"end\":\"08:00\"}}")
```

---

## Task 1.2: Run Database Migration

```bash
npx prisma migrate dev --name add_notification_subscriptions
npx prisma generate
```

---

## Task 1.3: Create Type Definitions

**File:** `lib/notifications/types.ts` (new file)

```typescript
export interface NotificationCategories {
  townAlerts: boolean;
  weatherAlerts: boolean;
  events: boolean;
  emergencyAlerts: boolean;
}

export interface BusinessTypePreferences {
  lodging: boolean;
  restaurant: boolean;
  attraction: boolean;
  service: boolean;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface NotificationPreferences {
  categories: NotificationCategories;
  businessTypes: BusinessTypePreferences;
  globalEnabled: boolean;
  quietHours: QuietHours;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  categories: {
    townAlerts: true,
    weatherAlerts: true,
    events: true,
    emergencyAlerts: true,
  },
  businessTypes: {
    lodging: true,
    restaurant: true,
    attraction: true,
    service: true,
  },
  globalEnabled: true,
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

// Helper to migrate old preferences to new structure
export function migratePreferences(old: Record<string, boolean> | null): NotificationPreferences {
  if (!old) return DEFAULT_NOTIFICATION_PREFERENCES;

  // Check if already in new format
  if ('categories' in old) {
    return old as unknown as NotificationPreferences;
  }

  // Migrate from old format
  return {
    categories: {
      townAlerts: old.townAlerts ?? true,
      weatherAlerts: old.weatherAlerts ?? true,
      events: old.events ?? true,
      emergencyAlerts: true, // New field, default on
    },
    businessTypes: {
      lodging: old.businessAlerts ?? true,
      restaurant: old.businessAlerts ?? true,
      attraction: old.businessAlerts ?? true,
      service: old.businessAlerts ?? true,
    },
    globalEnabled: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  };
}

// Check if user is in quiet hours
export function isInQuietHours(quietHours: QuietHours): boolean {
  if (!quietHours.enabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = quietHours.start.split(':').map(Number);
  const [endHour, endMin] = quietHours.end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// Map place category to business type key
export function placeTagToBusinessType(tags: string[]): keyof BusinessTypePreferences | null {
  const tagSet = new Set(tags.map(t => t.toLowerCase()));

  if (tagSet.has('hotel') || tagSet.has('guesthouse') || tagSet.has('lodging') || tagSet.has('accommodation')) {
    return 'lodging';
  }
  if (tagSet.has('restaurant') || tagSet.has('cafe') || tagSet.has('bar') || tagSet.has('food')) {
    return 'restaurant';
  }
  if (tagSet.has('museum') || tagSet.has('tour') || tagSet.has('attraction') || tagSet.has('activity')) {
    return 'attraction';
  }
  if (tagSet.has('shop') || tagSet.has('service') || tagSet.has('store')) {
    return 'service';
  }

  return null;
}
```

---

## Task 1.4: Create Business Subscription API

**File:** `app/api/businesses/[id]/subscribe/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

// GET - Check subscription status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }

  const subscription = await prisma.businessNotificationSubscription.findUnique({
    where: {
      userId_businessId: {
        userId: profile.id,
        businessId,
      },
    },
  });

  return NextResponse.json({
    subscribed: subscription?.isActive ?? false,
    subscriptionId: subscription?.id ?? null,
  });
}

// POST - Subscribe to business
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify business exists
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Upsert subscription
  const subscription = await prisma.businessNotificationSubscription.upsert({
    where: {
      userId_businessId: {
        userId: profile.id,
        businessId,
      },
    },
    update: {
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId: profile.id,
      businessId,
      isActive: true,
    },
  });

  return NextResponse.json({
    subscribed: true,
    subscriptionId: subscription.id,
    businessName: business.name,
  });
}

// DELETE - Unsubscribe from business
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.businessNotificationSubscription.updateMany({
    where: {
      userId: profile.id,
      businessId,
    },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ subscribed: false });
}
```

---

## Task 1.5: Create Place Subscription API

**File:** `app/api/places/[id]/subscribe/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

// GET - Check subscription status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }

  const subscription = await prisma.placeNotificationSubscription.findUnique({
    where: {
      userId_placeId: {
        userId: profile.id,
        placeId,
      },
    },
  });

  return NextResponse.json({
    subscribed: subscription?.isActive ?? false,
    subscriptionId: subscription?.id ?? null,
  });
}

// POST - Subscribe to place
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify place exists
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true, name: true },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  // Upsert subscription
  const subscription = await prisma.placeNotificationSubscription.upsert({
    where: {
      userId_placeId: {
        userId: profile.id,
        placeId,
      },
    },
    update: {
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId: profile.id,
      placeId,
      isActive: true,
    },
  });

  return NextResponse.json({
    subscribed: true,
    subscriptionId: subscription.id,
    placeName: place.name,
  });
}

// DELETE - Unsubscribe from place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.placeNotificationSubscription.updateMany({
    where: {
      userId: profile.id,
      placeId,
    },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ subscribed: false });
}
```

---

## Task 1.6: Create User Subscriptions List API

**File:** `app/api/subscriptions/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

// GET - List all user subscriptions
export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [businessSubscriptions, placeSubscriptions] = await Promise.all([
    prisma.businessNotificationSubscription.findMany({
      where: {
        userId: profile.id,
        isActive: true,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            place: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                tags: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.placeNotificationSubscription.findMany({
      where: {
        userId: profile.id,
        isActive: true,
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            tags: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    businesses: businessSubscriptions.map((sub) => ({
      subscriptionId: sub.id,
      businessId: sub.businessId,
      businessName: sub.business.name,
      placeId: sub.business.place?.id,
      placeName: sub.business.place?.name,
      imageUrl: sub.business.place?.imageUrl,
      tags: sub.business.place?.tags ?? [],
      subscribedAt: sub.createdAt,
    })),
    places: placeSubscriptions.map((sub) => ({
      subscriptionId: sub.id,
      placeId: sub.placeId,
      placeName: sub.place.name,
      imageUrl: sub.place.imageUrl,
      tags: sub.place.tags ?? [],
      subscribedAt: sub.createdAt,
    })),
  });
}
```

---

## Task 1.7: Update Profile API for Enhanced Preferences

**File:** `app/api/profile/route.ts`

Update the existing file to handle the new preference structure:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  migratePreferences,
  NotificationPreferences
} from "@/lib/notifications/types";

export async function GET() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fullProfile = await prisma.profile.findUnique({
    where: { id: profile.id },
    include: {
      businessFavorites: {
        include: {
          business: {
            select: { id: true, name: true },
          },
        },
      },
      businessNotificationSubscriptions: {
        where: { isActive: true },
        select: { businessId: true },
      },
      placeNotificationSubscriptions: {
        where: { isActive: true },
        select: { placeId: true },
      },
    },
  });

  if (!fullProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Migrate preferences if in old format
  const preferences = migratePreferences(
    fullProfile.notificationPreferences as Record<string, boolean> | null
  );

  return NextResponse.json({
    data: {
      id: fullProfile.id,
      firstName: fullProfile.firstName,
      avatarUrl: fullProfile.avatarUrl,
      email: fullProfile.email,
      role: fullProfile.role,
      notificationPreferences: preferences,
      onboardingCompletedAt: fullProfile.onboardingCompletedAt,
      favoriteBusinessIds: fullProfile.businessFavorites.map((f) => f.businessId),
      favorites: fullProfile.businessFavorites.map((f) => ({
        id: f.business.id,
        name: f.business.name,
      })),
      subscribedBusinessIds: fullProfile.businessNotificationSubscriptions.map(
        (s) => s.businessId
      ),
      subscribedPlaceIds: fullProfile.placeNotificationSubscriptions.map(
        (s) => s.placeId
      ),
    },
  });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, avatarUrl, email, notificationPreferences } = body;

  // Validate preferences structure if provided
  let validatedPreferences: NotificationPreferences | undefined;
  if (notificationPreferences) {
    // Merge with defaults to ensure all fields exist
    validatedPreferences = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...notificationPreferences,
      categories: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
        ...(notificationPreferences.categories ?? {}),
      },
      businessTypes: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.businessTypes,
        ...(notificationPreferences.businessTypes ?? {}),
      },
      quietHours: {
        ...DEFAULT_NOTIFICATION_PREFERENCES.quietHours,
        ...(notificationPreferences.quietHours ?? {}),
      },
    };
  }

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(email !== undefined && { email }),
      ...(validatedPreferences && {
        notificationPreferences: validatedPreferences as unknown as Prisma.JsonObject
      }),
    },
  });

  return NextResponse.json({
    data: {
      id: updated.id,
      firstName: updated.firstName,
      avatarUrl: updated.avatarUrl,
      email: updated.email,
      notificationPreferences: updated.notificationPreferences,
    },
  });
}
```

---

## Task 1.8: Create Onboarding Complete API

**File:** `app/api/profile/onboarding/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationPreferences
} from "@/lib/notifications/types";

// POST - Complete onboarding and save initial preferences
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    firstName,
    avatarUrl,
    notificationPreferences
  } = body;

  // Merge preferences with defaults
  const finalPreferences: NotificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...notificationPreferences,
    categories: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
      ...(notificationPreferences?.categories ?? {}),
    },
    businessTypes: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.businessTypes,
      ...(notificationPreferences?.businessTypes ?? {}),
    },
    quietHours: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.quietHours,
      ...(notificationPreferences?.quietHours ?? {}),
    },
  };

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      firstName: firstName ?? profile.firstName,
      avatarUrl: avatarUrl ?? profile.avatarUrl,
      notificationPreferences: finalPreferences as unknown as Prisma.JsonObject,
      onboardingCompletedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      firstName: updated.firstName,
      onboardingCompletedAt: updated.onboardingCompletedAt,
      notificationPreferences: updated.notificationPreferences,
    },
  });
}
```

---

## Task 1.9: Create Audience Estimation API

**File:** `app/api/notifications/audience-estimate/route.ts` (new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile, requireRole } from "@/lib/auth/guards";
import {
  NotificationPreferences,
  placeTagToBusinessType,
  isInQuietHours
} from "@/lib/notifications/types";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and business owners can estimate audience
  const hasPermission = await requireRole(profile, [
    UserRole.SUPER_ADMIN,
    UserRole.TOWN_ADMIN,
    UserRole.BUSINESS_OWNER,
  ]);

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { targetType, businessId, segment, townId } = body;

  let estimatedCount = 0;
  let breakdown: Record<string, number> = {};

  if (targetType === "BUSINESS" && businessId) {
    // Get business with place tags
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        place: { select: { tags: true } },
        notificationSubscriptions: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                notificationPreferences: true,
                deviceTokens: { where: { isActive: true } },
              },
            },
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const businessType = placeTagToBusinessType(business.place?.tags ?? []);

    // Count users who:
    // 1. Have active subscription to this business
    // 2. Have globalEnabled: true
    // 3. Have the relevant businessType enabled
    // 4. Have at least one active device token
    // 5. Are not in quiet hours

    let eligibleUsers = 0;
    let blockedByPreferences = 0;
    let blockedByQuietHours = 0;
    let noDeviceToken = 0;

    for (const sub of business.notificationSubscriptions) {
      const prefs = sub.user.notificationPreferences as NotificationPreferences | null;

      if (!prefs?.globalEnabled) {
        blockedByPreferences++;
        continue;
      }

      if (businessType && !prefs.businessTypes[businessType]) {
        blockedByPreferences++;
        continue;
      }

      if (prefs.quietHours && isInQuietHours(prefs.quietHours)) {
        blockedByQuietHours++;
        continue;
      }

      if (sub.user.deviceTokens.length === 0) {
        noDeviceToken++;
        continue;
      }

      eligibleUsers++;
    }

    estimatedCount = eligibleUsers;
    breakdown = {
      totalSubscribers: business.notificationSubscriptions.length,
      eligibleUsers,
      blockedByPreferences,
      blockedByQuietHours,
      noDeviceToken,
    };
  } else if (targetType === "TOWN") {
    // Town-wide notification
    const profiles = await prisma.profile.findMany({
      where: {
        townId: townId ?? profile.townId,
      },
      include: {
        deviceTokens: { where: { isActive: true } },
      },
    });

    let eligibleUsers = 0;
    let blockedByPreferences = 0;
    let blockedByQuietHours = 0;
    let noDeviceToken = 0;

    const categoryKey = segment === "weather" ? "weatherAlerts"
      : segment === "events" ? "events"
      : segment === "emergency" ? "emergencyAlerts"
      : "townAlerts";

    for (const p of profiles) {
      const prefs = p.notificationPreferences as NotificationPreferences | null;

      if (!prefs?.globalEnabled) {
        blockedByPreferences++;
        continue;
      }

      if (!prefs.categories[categoryKey as keyof typeof prefs.categories]) {
        blockedByPreferences++;
        continue;
      }

      if (prefs.quietHours && isInQuietHours(prefs.quietHours)) {
        blockedByQuietHours++;
        continue;
      }

      if (p.deviceTokens.length === 0) {
        noDeviceToken++;
        continue;
      }

      eligibleUsers++;
    }

    estimatedCount = eligibleUsers;
    breakdown = {
      totalProfiles: profiles.length,
      eligibleUsers,
      blockedByPreferences,
      blockedByQuietHours,
      noDeviceToken,
    };
  }

  return NextResponse.json({
    estimatedAudience: estimatedCount,
    breakdown,
  });
}
```

---

## Verification Steps

After completing all tasks:

1. Run `npx prisma migrate dev` and verify migration succeeds
2. Run `npx prisma generate` to update Prisma client
3. Start dev server: `npm run dev`
4. Test API endpoints:
   - `GET /api/profile` - Should return new preference structure
   - `POST /api/businesses/[id]/subscribe` - Should create subscription
   - `GET /api/subscriptions` - Should list subscriptions
   - `POST /api/notifications/audience-estimate` - Should return estimates

5. Check that existing functionality still works:
   - Admin can send notifications
   - Device registration works
   - User can view notifications

---

## Files Modified/Created

**Modified:**
- `database/schema.prisma`
- `app/api/profile/route.ts`

**Created:**
- `lib/notifications/types.ts`
- `app/api/businesses/[id]/subscribe/route.ts`
- `app/api/places/[id]/subscribe/route.ts`
- `app/api/subscriptions/route.ts`
- `app/api/profile/onboarding/route.ts`
- `app/api/notifications/audience-estimate/route.ts`
