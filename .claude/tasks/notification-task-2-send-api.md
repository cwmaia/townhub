# Task 2: Notification Types & Send API

## Overview
Define notification types with proper labels and create the enhanced send notification API that respects quotas and targets correct audiences.

## Part A: Notification Types

### 1. Update `lib/notifications/types.ts`

Replace/update the file with:

```typescript
import { JsonValue } from "@prisma/client/runtime/library";

export const NOTIFICATION_TYPES = {
  // Town-level notifications
  TOWN_ALERT: "TOWN_ALERT",           // Emergency/civic alerts
  TOWN_NEWS: "TOWN_NEWS",             // General town news
  TOWN_EVENT: "TOWN_EVENT",           // Town event announcements
  WEATHER_ALERT: "WEATHER_ALERT",     // Weather warnings
  AURORA_ALERT: "AURORA_ALERT",       // Aurora visibility

  // Business notifications
  BUSINESS_PROMO: "BUSINESS_PROMO",   // Business promotions
  BUSINESS_EVENT: "BUSINESS_EVENT",   // Business event announcements
  BUSINESS_UPDATE: "BUSINESS_UPDATE", // General business updates

  // System notifications
  SYSTEM_WELCOME: "SYSTEM_WELCOME",   // Welcome new users
  SYSTEM_UPDATE: "SYSTEM_UPDATE",     // App updates
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export interface NotificationTypeInfo {
  label: string;
  labelIs: string; // Icelandic
  color: string;
  bgColor: string;
  icon: string;
  category: "town" | "business" | "system";
}

export const NOTIFICATION_TYPE_INFO: Record<NotificationType, NotificationTypeInfo> = {
  TOWN_ALERT: {
    label: "Town Alert",
    labelIs: "Bæjartilkynning",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: "alert-circle",
    category: "town",
  },
  TOWN_NEWS: {
    label: "Town News",
    labelIs: "Bæjarfréttir",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: "newspaper",
    category: "town",
  },
  TOWN_EVENT: {
    label: "Town Event",
    labelIs: "Viðburður",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: "calendar",
    category: "town",
  },
  WEATHER_ALERT: {
    label: "Weather",
    labelIs: "Veður",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: "cloud-lightning",
    category: "town",
  },
  AURORA_ALERT: {
    label: "Aurora",
    labelIs: "Norðurljós",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: "sparkles",
    category: "town",
  },
  BUSINESS_PROMO: {
    label: "Promotion",
    labelIs: "Tilboð",
    color: "text-pink-700",
    bgColor: "bg-pink-100",
    icon: "tag",
    category: "business",
  },
  BUSINESS_EVENT: {
    label: "Business Event",
    labelIs: "Viðburður",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    icon: "calendar-heart",
    category: "business",
  },
  BUSINESS_UPDATE: {
    label: "Update",
    labelIs: "Uppfærsla",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    icon: "store",
    category: "business",
  },
  SYSTEM_WELCOME: {
    label: "Welcome",
    labelIs: "Velkomin",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    icon: "hand-wave",
    category: "system",
  },
  SYSTEM_UPDATE: {
    label: "App Update",
    labelIs: "Uppfærsla",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100",
    icon: "smartphone",
    category: "system",
  },
};

export const TOWN_NOTIFICATION_TYPES = Object.entries(NOTIFICATION_TYPE_INFO)
  .filter(([_, info]) => info.category === "town")
  .map(([type]) => type as NotificationType);

export const BUSINESS_NOTIFICATION_TYPES = Object.entries(NOTIFICATION_TYPE_INFO)
  .filter(([_, info]) => info.category === "business")
  .map(([type]) => type as NotificationType);

export interface NotificationPreferences {
  globalEnabled: boolean;
  categories: {
    townAlerts: boolean;
    weatherAlerts: boolean;
    events: boolean;
    emergencyAlerts: boolean;
  };
  businessTypes: {
    lodging: boolean;
    restaurant: boolean;
    attraction: boolean;
    service: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  globalEnabled: true,
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
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
};

export function migratePreferences(
  raw: Record<string, boolean> | JsonValue | null | undefined
): NotificationPreferences {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  const obj = raw as Record<string, unknown>;

  return {
    globalEnabled:
      typeof obj.globalEnabled === "boolean"
        ? obj.globalEnabled
        : DEFAULT_NOTIFICATION_PREFERENCES.globalEnabled,
    categories: {
      townAlerts:
        typeof (obj.categories as Record<string, unknown>)?.townAlerts === "boolean"
          ? (obj.categories as Record<string, boolean>).townAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.townAlerts,
      weatherAlerts:
        typeof (obj.categories as Record<string, unknown>)?.weatherAlerts === "boolean"
          ? (obj.categories as Record<string, boolean>).weatherAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.weatherAlerts,
      events:
        typeof (obj.categories as Record<string, unknown>)?.events === "boolean"
          ? (obj.categories as Record<string, boolean>).events
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.events,
      emergencyAlerts:
        typeof (obj.categories as Record<string, unknown>)?.emergencyAlerts === "boolean"
          ? (obj.categories as Record<string, boolean>).emergencyAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.categories.emergencyAlerts,
    },
    businessTypes: {
      lodging:
        typeof (obj.businessTypes as Record<string, unknown>)?.lodging === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).lodging
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.lodging,
      restaurant:
        typeof (obj.businessTypes as Record<string, unknown>)?.restaurant === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).restaurant
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.restaurant,
      attraction:
        typeof (obj.businessTypes as Record<string, unknown>)?.attraction === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).attraction
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.attraction,
      service:
        typeof (obj.businessTypes as Record<string, unknown>)?.service === "boolean"
          ? (obj.businessTypes as Record<string, boolean>).service
          : DEFAULT_NOTIFICATION_PREFERENCES.businessTypes.service,
    },
    quietHours: {
      enabled:
        typeof (obj.quietHours as Record<string, unknown>)?.enabled === "boolean"
          ? (obj.quietHours as Record<string, boolean>).enabled
          : DEFAULT_NOTIFICATION_PREFERENCES.quietHours.enabled,
      start:
        typeof (obj.quietHours as Record<string, unknown>)?.start === "string"
          ? (obj.quietHours as Record<string, string>).start
          : DEFAULT_NOTIFICATION_PREFERENCES.quietHours.start,
      end:
        typeof (obj.quietHours as Record<string, unknown>)?.end === "string"
          ? (obj.quietHours as Record<string, string>).end
          : DEFAULT_NOTIFICATION_PREFERENCES.quietHours.end,
    },
  };
}
```

## Part B: Enhanced Send Notification API

### 1. Create `app/api/notifications/send/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import { sendPushNotifications, updateDeliveryStatus } from "@/lib/notifications/expo-push";
import { checkBusinessQuota, checkTownQuota, incrementBusinessUsage, incrementTownUsage } from "@/lib/notifications/quota";
import { NOTIFICATION_TYPES, NotificationType, NOTIFICATION_TYPE_INFO } from "@/lib/notifications/types";
import { UserRole } from "@prisma/client";

interface SendNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  targetType: "TOWN" | "BUSINESS_SUBSCRIBERS" | "SEGMENT";
  townId?: string;
  segment?: string;
  deeplink?: string;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SendNotificationRequest = await request.json();
  const { title, type, targetType, segment, deeplink, imageUrl } = body;
  const message = body.body;

  if (!title || !message || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate notification type
  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
  }

  const typeInfo = NOTIFICATION_TYPE_INFO[type];
  const isSuperAdmin = profile.role === UserRole.SUPER_ADMIN;
  const isTownAdmin = profile.role === UserRole.TOWN_ADMIN;
  const isBusinessOwner = profile.role === UserRole.BUSINESS_OWNER;

  // Validate permissions based on notification type category
  if (typeInfo.category === "business" && !isBusinessOwner && !isSuperAdmin) {
    return NextResponse.json({
      error: "Business notification types require business owner or super admin role",
    }, { status: 403 });
  }

  if (typeInfo.category === "town" && !isTownAdmin && !isSuperAdmin) {
    return NextResponse.json({
      error: "Town notification types require town admin or super admin role",
    }, { status: 403 });
  }

  // Get business if business owner
  let business = null;
  if (isBusinessOwner) {
    business = await prisma.business.findUnique({
      where: { userId: profile.id },
      include: { subscription: true },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found for this account" }, { status: 404 });
    }

    // Check business quota
    const quotaCheck = await checkBusinessQuota(business.id, "notification");
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        error: "Monthly notification quota exceeded",
        quota: quotaCheck,
      }, { status: 403 });
    }
  }

  // Check town quota for town/super admins
  let townIdToUse = body.townId || profile.townId;
  if ((isTownAdmin || isSuperAdmin) && townIdToUse && typeInfo.category === "town") {
    const quotaCheck = await checkTownQuota(townIdToUse, "notification");
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        error: "Monthly town notification quota exceeded",
        quota: quotaCheck,
      }, { status: 403 });
    }
  }

  // If super admin without assigned town, get first town
  if (isSuperAdmin && !townIdToUse) {
    const firstTown = await prisma.town.findFirst();
    townIdToUse = firstTown?.id ?? null;
  }

  // Build recipient query based on targetType
  let deviceTokens: { token: string; userId: string }[] = [];

  if (targetType === "BUSINESS_SUBSCRIBERS" && business) {
    // Get subscribers to this business
    const subscribers = await prisma.businessNotificationSubscription.findMany({
      where: { businessId: business.id, isActive: true },
      select: { userId: true },
    });

    const userIds = subscribers.map(s => s.userId);

    if (userIds.length > 0) {
      deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId: { in: userIds },
          isActive: true,
        },
        select: { token: true, userId: true },
      });
    }
  } else if (targetType === "TOWN" && townIdToUse) {
    // Get all users in the town
    const profiles = await prisma.profile.findMany({
      where: { townId: townIdToUse },
      select: { id: true },
    });

    const profileIds = profiles.map(p => p.id);

    if (profileIds.length > 0) {
      deviceTokens = await prisma.deviceToken.findMany({
        where: {
          userId: { in: profileIds },
          isActive: true,
        },
        select: { token: true, userId: true },
      });
    }
  } else if (targetType === "SEGMENT" && segment) {
    // Handle segment-based targeting
    // For now, fall back to town-wide if no specific segment logic
    if (townIdToUse) {
      const profiles = await prisma.profile.findMany({
        where: { townId: townIdToUse },
        select: { id: true },
      });

      const profileIds = profiles.map(p => p.id);

      if (profileIds.length > 0) {
        deviceTokens = await prisma.deviceToken.findMany({
          where: {
            userId: { in: profileIds },
            isActive: true,
          },
          select: { token: true, userId: true },
        });
      }
    }
  }

  if (!deviceTokens.length) {
    return NextResponse.json({
      error: "No active devices to send to",
      audienceCount: 0,
    }, { status: 400 });
  }

  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      title,
      body: message,
      type,
      imageUrl: imageUrl ?? null,
      senderId: profile.id,
      targetType,
      targetFilter: segment ? { segment } : null,
      data: deeplink ? { deeplink, type } : { type },
      status: "sending",
      townId: townIdToUse,
      businessId: business?.id ?? null,
      audienceCount: deviceTokens.length,
    },
  });

  // Send push notifications
  try {
    const result = await sendPushNotifications({
      title,
      body: message,
      data: {
        notificationId: notification.id,
        type,
        deeplink: deeplink ?? undefined,
      },
      tokens: deviceTokens.map(t => t.token),
    });

    // Update delivery status
    await updateDeliveryStatus(notification.id, result.tickets);

    // Update notification status
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        deliveryCount: result.success,
      },
    });

    // Increment usage
    if (business) {
      await incrementBusinessUsage(business.id, "notification");
    } else if (townIdToUse && typeInfo.category === "town") {
      await incrementTownUsage(townIdToUse, "notification");
    }

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      delivered: result.success,
      failed: result.failed,
      audienceCount: deviceTokens.length,
    });

  } catch (error) {
    console.error("Failed to send notification:", error);

    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "failed" },
    });

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to send notification",
      notificationId: notification.id,
    }, { status: 500 });
  }
}
```

### 2. Create `app/api/notifications/user/route.ts` (if not exists)

Update or create to return user's notifications:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get notifications delivered to this user
  const deliveries = await prisma.notificationDelivery.findMany({
    where: { userId: profile.id },
    include: {
      notification: {
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          imageUrl: true,
          data: true,
          sentAt: true,
          createdAt: true,
          business: {
            select: { id: true, name: true },
          },
          town: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const notifications = deliveries.map(delivery => ({
    id: delivery.notification.id,
    deliveryId: delivery.id,
    title: delivery.notification.title,
    body: delivery.notification.body,
    type: delivery.notification.type,
    imageUrl: delivery.notification.imageUrl,
    data: delivery.notification.data,
    isRead: !!delivery.clickedAt,
    createdAt: delivery.notification.sentAt ?? delivery.notification.createdAt,
    business: delivery.notification.business,
    town: delivery.notification.town,
  }));

  return NextResponse.json({ notifications });
}
```

### 3. Update `app/api/notifications/[id]/read/route.ts`

Ensure it marks the delivery as read:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: notificationId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find and update the delivery record
  const delivery = await prisma.notificationDelivery.findFirst({
    where: {
      notificationId,
      userId: profile.id,
    },
  });

  if (!delivery) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  if (!delivery.clickedAt) {
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { clickedAt: new Date() },
    });

    // Increment click count on notification
    await prisma.notification.update({
      where: { id: notificationId },
      data: { clickCount: { increment: 1 } },
    });
  }

  return NextResponse.json({ success: true });
}
```

## Verification Steps

1. Build passes: `npm run build`
2. Test send API with curl:
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Test message","type":"TOWN_NEWS","targetType":"TOWN"}'
```

## Files Created/Modified

- `lib/notifications/types.ts` - Updated with full types
- `app/api/notifications/send/route.ts` - Created
- `app/api/notifications/user/route.ts` - Updated
- `app/api/notifications/[id]/read/route.ts` - Updated
