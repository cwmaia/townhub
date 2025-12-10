# Complete Notification System Implementation

## Overview

This task implements a complete, production-ready notification system with proper subscription tiers, usage limits, and the ability to send push notifications from Super Admin, Town Admin, and Business Owner dashboards to mobile app users.

## Current State Analysis

### Database Schema (Already Exists)
- **Subscription** model with `notificationLimit`, `eventLimit`, `price`, `features`
- **Business** model with `monthlyNotificationLimit`, `monthlyEventLimit`, `notificationUsage`, `eventUsage`, `usageResetsAt`
- **Town** model with `licenseFee` (currently 95,000 ISK)
- **Notification** model with full structure for drafts, sending, delivery tracking
- **DeviceToken** model for Expo push tokens
- **NotificationDelivery** for tracking individual deliveries

### Existing Business Tiers (in seed.ts)
```
Free:     0 ISK,    0 notifications, 1 event/month
Starter:  7,500 ISK, 2 notifications, 2 events/month
Growth:   15,000 ISK, 8 notifications, 6 events/month
Premium:  29,000 ISK, 20 notifications, unlimited events
```

### What's Missing
1. **Town subscription tier** - towns pay 250,000 ISK/month but limits aren't defined
2. **Town notification/event limits** on the Town model itself
3. **Quota reset automation** - `usageResetsAt` exists but no reset logic
4. **Business notifications page** - only admin has notification UI
5. **Notification type labels** - TOWN_BROADCAST, BUSINESS_PROMO, etc. need proper structure
6. **Mobile notification receiving** - hook exists but no in-app notification center
7. **Test sending flow** - need to actually deliver to real devices

---

## PART 1: Schema & Database Updates

### 1.1 Update Town Model
Add notification/event limits to the Town model.

**File:** `database/schema.prisma`

Add to Town model:
```prisma
  monthlyNotificationLimit Int?      @default(50)
  monthlyEventLimit        Int?      @default(20)
  notificationUsage        Int       @default(0)
  eventUsage               Int       @default(0)
  usageResetsAt            DateTime?
```

### 1.2 Create Town Subscription Tier
Add TOWN subscription type to seed.

**File:** `database/seed/seed.ts`

Add after `BUSINESS_TIERS`:
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

Upsert it with `target: SubscriptionTarget.TOWN`.

### 1.3 Update Business Tier Pricing (Cost-Benefit Analysis)

Based on market analysis, adjust tiers for Iceland market (ISK):

| Tier | Price/month | Notifications | Events | Rationale |
|------|-------------|---------------|--------|-----------|
| Free | 0 | 0 | 1 | Listing only, no push |
| Starter | 9,900 ISK (~$70) | 4 | 3 | Small shops, 1/week push |
| Growth | 19,900 ISK (~$145) | 12 | 8 | Active businesses, 3/week |
| Premium | 39,900 ISK (~$290) | 30 | Unlimited | High-volume, daily potential |

Update `BUSINESS_TIERS` in seed.ts.

### 1.4 Migration

Create and run migration:
```bash
npx prisma migrate dev --name add_town_usage_limits
```

---

## PART 2: Notification Types & Structure

### 2.1 Define Notification Types

**File:** `lib/notifications/types.ts`

Add/update:
```typescript
export const NOTIFICATION_TYPES = {
  // Town-level notifications
  TOWN_ALERT: 'TOWN_ALERT',           // Emergency/civic alerts
  TOWN_NEWS: 'TOWN_NEWS',             // General town news
  TOWN_EVENT: 'TOWN_EVENT',           // Town event announcements
  WEATHER_ALERT: 'WEATHER_ALERT',     // Weather warnings
  AURORA_ALERT: 'AURORA_ALERT',       // Aurora visibility

  // Business notifications
  BUSINESS_PROMO: 'BUSINESS_PROMO',   // Business promotions
  BUSINESS_EVENT: 'BUSINESS_EVENT',   // Business event announcements
  BUSINESS_UPDATE: 'BUSINESS_UPDATE', // General business updates

  // System notifications
  SYSTEM_WELCOME: 'SYSTEM_WELCOME',   // Welcome new users
  SYSTEM_UPDATE: 'SYSTEM_UPDATE',     // App updates
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    deeplink?: string;
    eventId?: string;
    businessId?: string;
    placeId?: string;
    priority?: 'low' | 'normal' | 'high' | 'critical';
  };
}
```

### 2.2 Notification Labels for Display

**File:** `lib/notifications/labels.ts`

```typescript
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, { label: string; color: string; icon: string }> = {
  TOWN_ALERT: { label: 'Town Alert', color: 'red', icon: 'alert-circle' },
  TOWN_NEWS: { label: 'Town News', color: 'blue', icon: 'newspaper' },
  TOWN_EVENT: { label: 'Town Event', color: 'purple', icon: 'calendar' },
  WEATHER_ALERT: { label: 'Weather', color: 'amber', icon: 'cloud-lightning' },
  AURORA_ALERT: { label: 'Aurora', color: 'green', icon: 'sparkles' },
  BUSINESS_PROMO: { label: 'Promotion', color: 'pink', icon: 'tag' },
  BUSINESS_EVENT: { label: 'Event', color: 'indigo', icon: 'calendar-heart' },
  BUSINESS_UPDATE: { label: 'Update', color: 'slate', icon: 'store' },
  SYSTEM_WELCOME: { label: 'Welcome', color: 'emerald', icon: 'hand-wave' },
  SYSTEM_UPDATE: { label: 'App Update', color: 'cyan', icon: 'smartphone' },
};
```

---

## PART 3: Quota Management

### 3.1 Quota Reset Logic

**File:** `lib/notifications/quota.ts`

```typescript
import { prisma } from "@/lib/db";

export async function resetMonthlyQuotas() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Reset businesses that haven't been reset this month
  await prisma.business.updateMany({
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
  await prisma.town.updateMany({
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

  return { resetAt: now };
}

export async function checkQuota(
  entityType: 'business' | 'town',
  entityId: string,
  quotaType: 'notification' | 'event'
): Promise<{ allowed: boolean; used: number; limit: number | null; remaining: number | null }> {
  if (entityType === 'business') {
    const business = await prisma.business.findUnique({
      where: { id: entityId },
      select: {
        monthlyNotificationLimit: true,
        monthlyEventLimit: true,
        notificationUsage: true,
        eventUsage: true,
      },
    });

    if (!business) return { allowed: false, used: 0, limit: 0, remaining: 0 };

    const limit = quotaType === 'notification'
      ? business.monthlyNotificationLimit
      : business.monthlyEventLimit;
    const used = quotaType === 'notification'
      ? business.notificationUsage
      : business.eventUsage;

    if (limit === null) return { allowed: true, used, limit: null, remaining: null };

    return {
      allowed: used < limit,
      used,
      limit,
      remaining: Math.max(0, limit - used),
    };
  }

  // Town quota check
  const town = await prisma.town.findUnique({
    where: { id: entityId },
    select: {
      monthlyNotificationLimit: true,
      monthlyEventLimit: true,
      notificationUsage: true,
      eventUsage: true,
    },
  });

  if (!town) return { allowed: false, used: 0, limit: 0, remaining: 0 };

  const limit = quotaType === 'notification'
    ? town.monthlyNotificationLimit
    : town.monthlyEventLimit;
  const used = quotaType === 'notification'
    ? town.notificationUsage
    : town.eventUsage;

  if (limit === null) return { allowed: true, used, limit: null, remaining: null };

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function incrementUsage(
  entityType: 'business' | 'town',
  entityId: string,
  quotaType: 'notification' | 'event'
): Promise<void> {
  const field = quotaType === 'notification' ? 'notificationUsage' : 'eventUsage';

  if (entityType === 'business') {
    await prisma.business.update({
      where: { id: entityId },
      data: { [field]: { increment: 1 } },
    });
  } else {
    await prisma.town.update({
      where: { id: entityId },
      data: { [field]: { increment: 1 } },
    });
  }
}
```

### 3.2 Cron/API Route for Quota Reset

**File:** `app/api/cron/reset-quotas/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { resetMonthlyQuotas } from "@/lib/notifications/quota";

export async function POST(request: NextRequest) {
  // Verify cron secret or admin auth
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await resetMonthlyQuotas();
  return NextResponse.json(result);
}
```

---

## PART 4: Sending Notifications API

### 4.1 Enhanced Send Notification Endpoint

**File:** `app/api/notifications/send/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile, hasRole } from "@/lib/auth/guards";
import { sendPushNotifications, updateDeliveryStatus } from "@/lib/notifications/expo-push";
import { checkQuota, incrementUsage } from "@/lib/notifications/quota";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    notificationId, // If sending existing draft
    title,
    message,
    type,
    targetType, // 'TOWN', 'BUSINESS', 'SEGMENT', 'SUBSCRIBERS'
    businessId,
    segment,
    deeplink,
  } = body;

  // Determine sender context
  const isSuperAdmin = profile.role === UserRole.SUPER_ADMIN;
  const isTownAdmin = profile.role === UserRole.TOWN_ADMIN;
  const isBusinessOwner = profile.role === UserRole.BUSINESS_OWNER;

  // Get business if business owner
  let business = null;
  if (isBusinessOwner) {
    business = await prisma.business.findUnique({
      where: { userId: profile.id },
      include: { subscription: true },
    });
    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }
  }

  // Check quota
  let quotaCheck;
  if (business) {
    quotaCheck = await checkQuota('business', business.id, 'notification');
  } else if (profile.townId) {
    quotaCheck = await checkQuota('town', profile.townId, 'notification');
  }

  if (quotaCheck && !quotaCheck.allowed) {
    return NextResponse.json({
      error: "Notification quota exceeded",
      quota: quotaCheck,
    }, { status: 403 });
  }

  // Build recipient query based on targetType
  let deviceTokenQuery: any = { isActive: true };

  if (targetType === 'BUSINESS' && business) {
    // Send to business subscribers
    const subscribers = await prisma.businessNotificationSubscription.findMany({
      where: { businessId: business.id, isActive: true },
      select: { userId: true },
    });
    const userIds = subscribers.map(s => s.userId);
    deviceTokenQuery.userId = { in: userIds };
  } else if (targetType === 'TOWN' && (isSuperAdmin || isTownAdmin)) {
    // Send to all town users
    const townId = profile.townId || body.townId;
    if (townId) {
      deviceTokenQuery.user = { townId };
    }
  } else if (targetType === 'SEGMENT') {
    // Handle segment filtering
    // TODO: Implement segment-based filtering
  }

  // Get device tokens
  const tokens = await prisma.deviceToken.findMany({
    where: deviceTokenQuery,
    select: { token: true, userId: true },
  });

  if (!tokens.length) {
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
      senderId: profile.id,
      targetType,
      targetFilter: { segment, businessId },
      data: deeplink ? { deeplink } : null,
      status: 'sending',
      townId: profile.townId || null,
      businessId: business?.id || null,
      audienceCount: tokens.length,
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
        deeplink,
      },
      tokens: tokens.map(t => t.token),
    });

    // Update delivery status
    await updateDeliveryStatus(notification.id, result.tickets);

    // Update notification status
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        deliveryCount: result.success,
      },
    });

    // Increment usage
    if (business) {
      await incrementUsage('business', business.id, 'notification');
    } else if (profile.townId) {
      await incrementUsage('town', profile.townId, 'notification');
    }

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      delivered: result.success,
      failed: result.failed,
      audienceCount: tokens.length,
    });

  } catch (error) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'failed' },
    });

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to send",
      notificationId: notification.id,
    }, { status: 500 });
  }
}
```

---

## PART 5: Business Dashboard Notifications

### 5.1 Create Business Notifications Page

**File:** `app/[locale]/admin/business/notifications/page.tsx`

Create a page similar to the admin notifications page but scoped to the business owner's business. Include:

- Quota usage display (X of Y notifications used this month)
- Draft composer for business promotions
- Send to subscribers button
- Recent notifications history
- Engagement metrics (delivered, opened)

Key features:
- Only show BUSINESS_PROMO and BUSINESS_EVENT types
- Filter recipients to business subscribers only
- Show subscription tier and limits
- Warning when approaching quota limit

### 5.2 Business Notification Send Form Component

**File:** `components/admin/BusinessNotificationForm.tsx`

Simpler version of the admin form with:
- Title input
- Message textarea
- Notification type dropdown (Promotion, Event, Update)
- Optional deep link field
- Preview section
- Send button with quota warning

---

## PART 6: Mobile App Notification Center

### 6.1 Create Notification Center Screen

**File (mobile):** `app/notifications.tsx`

```typescript
import { useEffect, useState } from 'react';
import { FlatList, View, Text, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api } from '../services/api';
import { NOTIFICATION_TYPE_LABELS } from '../utils/notificationLabels';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  data?: { deeplink?: string };
  createdAt: string;
  isRead: boolean;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/user');
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handlePress = (notification: AppNotification) => {
    markAsRead(notification.id);
    if (notification.data?.deeplink) {
      // Handle deep link navigation
      router.push(notification.data.deeplink as any);
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const typeInfo = NOTIFICATION_TYPE_LABELS[item.type] || {
      label: 'Notification',
      color: 'slate'
    };

    return (
      <Pressable
        style={[styles.item, !item.isRead && styles.unread]}
        onPress={() => handlePress(item)}
      >
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color }]}>
            <Text style={styles.typeText}>{typeInfo.label}</Text>
          </View>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchNotifications();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#64748b',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
});
```

### 6.2 Add Notification Bell to Header

Add a bell icon to the app header that:
- Shows unread count badge
- Navigates to notifications screen
- Pulses/animates when new notification arrives

### 6.3 Handle Incoming Notifications

**File (mobile):** `app/_layout.tsx`

Add notification listeners:
```typescript
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    // Handle foreground notification
    // Show in-app toast or update badge count
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    // Handle notification tap
    const data = response.notification.request.content.data;
    if (data?.deeplink) {
      router.push(data.deeplink);
    }
  });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}, []);
```

---

## PART 7: API Endpoints Summary

### Required API Routes

1. **POST /api/notifications/send** - Send notification (with quota check)
2. **GET /api/notifications/user** - Get user's notifications
3. **POST /api/notifications/[id]/read** - Mark notification as read
4. **GET /api/notifications/quota** - Get current quota status
5. **POST /api/cron/reset-quotas** - Reset monthly quotas (cron)
6. **GET /api/business/notifications** - Get business notification history
7. **POST /api/business/notifications/send** - Send business notification

---

## PART 8: Testing Checklist

### Demo Flow Test

1. **Super Admin sends town-wide notification:**
   - Log in as demo-super-admin
   - Go to /en/admin/notifications
   - Create draft with title "Welcome to TownHub!"
   - Body: "This is a test notification from the town."
   - Type: TOWN_NEWS
   - Send to all residents
   - Verify received on mobile app

2. **Town Admin sends weather alert:**
   - Switch to demo-town-admin
   - Create notification with type WEATHER_ALERT
   - Title: "Storm Warning"
   - Body: "Expect heavy winds tonight. Stay safe!"
   - Send to town
   - Verify badge shows on mobile

3. **Business Owner sends promotion:**
   - Switch to demo-business-owner
   - Go to /en/admin/business/notifications
   - See quota: "1 of 4 notifications used"
   - Create promotion: "20% off this weekend!"
   - Send to subscribers
   - Verify only subscribers receive it

---

## Files to Create/Modify

### New Files (Web)
- `lib/notifications/quota.ts`
- `lib/notifications/labels.ts`
- `app/api/notifications/send/route.ts`
- `app/api/notifications/quota/route.ts`
- `app/api/cron/reset-quotas/route.ts`
- `app/[locale]/admin/business/notifications/page.tsx`
- `components/admin/BusinessNotificationForm.tsx`

### Modified Files (Web)
- `database/schema.prisma` - Add Town usage fields
- `database/seed/seed.ts` - Update tiers, add town tier
- `lib/notifications/types.ts` - Add notification types
- `app/[locale]/admin/notifications/page.tsx` - Add notification type selector

### New Files (Mobile)
- `app/notifications.tsx` - Notification center screen
- `utils/notificationLabels.ts` - Type labels for display
- `components/NotificationBell.tsx` - Header bell component

### Modified Files (Mobile)
- `app/_layout.tsx` - Add notification listeners
- `components/Header.tsx` - Add notification bell

---

## Execution Order

1. **Schema & Migration** - Update schema, run migration
2. **Seed Update** - Update tiers, run seed
3. **Quota Logic** - Implement quota checking
4. **Send API** - Implement send endpoint
5. **Admin UI Updates** - Add type selector
6. **Business Notifications Page** - Create business UI
7. **Mobile Notification Center** - Build notification screen
8. **Integration Testing** - Test full flow

---

## Success Criteria

- [ ] Town has 50 notifications/month, 20 events/month limits
- [ ] Business tiers enforced correctly
- [ ] Quota resets on the 1st of each month
- [ ] Super Admin can send to all town users
- [ ] Town Admin can send to town users
- [ ] Business Owner can send to their subscribers only
- [ ] Mobile app receives and displays notifications
- [ ] Notification types properly labeled
- [ ] Deep links work when notification tapped
- [ ] Build passes on both web and mobile
