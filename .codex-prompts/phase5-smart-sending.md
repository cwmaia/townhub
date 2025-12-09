# Phase 5: Smart Notification Sending with Preference Filtering

## Objective
Update the notification sending logic to:
1. Filter recipients by their notification preferences
2. Respect quiet hours (except for emergencies)
3. Only send to users who have subscribed to the specific business
4. Show accurate audience estimates before sending
5. Track which preferences blocked delivery

---

## Task 5.1: Update Notification Sending Action

**File:** `app/[locale]/admin/notifications/page.tsx` (update existing)

Replace the `sendNotificationAction` function with preference-aware logic:

```typescript
import {
  NotificationPreferences,
  isInQuietHours,
  placeTagToBusinessType,
  migratePreferences,
} from "@/lib/notifications/types";

async function sendNotificationAction(notificationId: string) {
  "use server";

  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Unauthorized");

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      business: {
        include: {
          place: { select: { tags: true } },
        },
      },
    },
  });

  if (!notification) throw new Error("Notification not found");
  if (notification.status === "sent") throw new Error("Already sent");

  // Determine notification category for preference checking
  const notificationType = notification.type?.toLowerCase() ?? "town";
  const isEmergency = notificationType === "emergency" || notificationType === "emergency_alert";

  let tokens: { id: string; token: string; userId: string }[] = [];
  let businessToUpdate: { id: string } | null = null;
  let audienceBreakdown = {
    totalEligible: 0,
    blockedByGlobal: 0,
    blockedByCategory: 0,
    blockedByBusinessType: 0,
    blockedByQuietHours: 0,
    blockedByNoSubscription: 0,
    noDeviceToken: 0,
  };

  if (notification.targetType === "BUSINESS" && notification.businessId) {
    // Business-specific notification
    const business = await prisma.business.findUnique({
      where: { id: notification.businessId },
      include: {
        place: { select: { tags: true } },
        notificationSubscriptions: {
          where: { isActive: true },
          include: {
            user: {
              include: {
                deviceTokens: { where: { isActive: true } },
              },
            },
          },
        },
      },
    });

    if (!business) throw new Error("Business not found");

    // Check quota
    if (
      business.monthlyNotificationLimit !== null &&
      business.notificationUsage >= business.monthlyNotificationLimit
    ) {
      throw new Error("This business has reached its notification quota.");
    }

    businessToUpdate = { id: business.id };

    // Determine business type from place tags
    const businessType = placeTagToBusinessType(business.place?.tags ?? []);

    // Filter subscribers by preferences
    for (const sub of business.notificationSubscriptions) {
      const rawPrefs = sub.user.notificationPreferences;
      const prefs = migratePreferences(rawPrefs as Record<string, boolean> | null);

      // Check 1: Global enabled
      if (!prefs.globalEnabled) {
        audienceBreakdown.blockedByGlobal++;
        continue;
      }

      // Check 2: Business type preference (skip for emergency)
      if (!isEmergency && businessType && !prefs.businessTypes[businessType]) {
        audienceBreakdown.blockedByBusinessType++;
        continue;
      }

      // Check 3: Quiet hours (skip for emergency)
      if (!isEmergency && isInQuietHours(prefs.quietHours)) {
        audienceBreakdown.blockedByQuietHours++;
        continue;
      }

      // Check 4: Has device token
      if (sub.user.deviceTokens.length === 0) {
        audienceBreakdown.noDeviceToken++;
        continue;
      }

      // User passes all checks - add their tokens
      for (const deviceToken of sub.user.deviceTokens) {
        tokens.push({
          id: deviceToken.id,
          token: deviceToken.token,
          userId: sub.user.id,
        });
      }
      audienceBreakdown.totalEligible++;
    }
  } else {
    // Town-wide notification
    const townId = notification.townId ?? profile.townId;
    const segment = (notification.targetFilter as { segment?: string })?.segment ?? "all";

    // Determine which category this notification falls under
    let categoryKey: keyof NotificationPreferences["categories"] = "townAlerts";
    if (segment === "weather" || notificationType === "weather") {
      categoryKey = "weatherAlerts";
    } else if (segment === "events" || notificationType === "event") {
      categoryKey = "events";
    } else if (isEmergency) {
      categoryKey = "emergencyAlerts";
    }

    // Get all profiles in the town
    const profiles = await prisma.profile.findMany({
      where: {
        townId,
        // Filter by role if segment specifies
        ...(segment === "business_owners" && { role: "BUSINESS_OWNER" }),
        ...(segment === "admins" && {
          role: { in: ["SUPER_ADMIN", "TOWN_ADMIN"] },
        }),
      },
      include: {
        deviceTokens: { where: { isActive: true } },
      },
    });

    // Filter by preferences
    for (const p of profiles) {
      const rawPrefs = p.notificationPreferences;
      const prefs = migratePreferences(rawPrefs as Record<string, boolean> | null);

      // Check 1: Global enabled
      if (!prefs.globalEnabled) {
        audienceBreakdown.blockedByGlobal++;
        continue;
      }

      // Check 2: Category preference (skip for emergency)
      if (!isEmergency && !prefs.categories[categoryKey]) {
        audienceBreakdown.blockedByCategory++;
        continue;
      }

      // Check 3: Quiet hours (skip for emergency)
      if (!isEmergency && isInQuietHours(prefs.quietHours)) {
        audienceBreakdown.blockedByQuietHours++;
        continue;
      }

      // Check 4: Has device token
      if (p.deviceTokens.length === 0) {
        audienceBreakdown.noDeviceToken++;
        continue;
      }

      // User passes all checks
      for (const deviceToken of p.deviceTokens) {
        tokens.push({
          id: deviceToken.id,
          token: deviceToken.token,
          userId: p.id,
        });
      }
      audienceBreakdown.totalEligible++;
    }
  }

  // Check if we have any recipients
  if (tokens.length === 0) {
    throw new Error(
      `No eligible recipients. Breakdown: ${JSON.stringify(audienceBreakdown)}`
    );
  }

  // Send notifications
  const sendResult = await sendPushNotifications(
    notification.title,
    notification.body,
    notification.data as Record<string, unknown> | undefined,
    tokens.map((t) => t.token)
  );

  // Update delivery status
  await updateDeliveryStatus(
    notificationId,
    sendResult.tickets,
    tokens
  );

  // Update notification and business usage in transaction
  await prisma.$transaction(async (tx) => {
    if (businessToUpdate) {
      await tx.business.update({
        where: { id: businessToUpdate.id },
        data: {
          notificationUsage: { increment: 1 },
        },
      });
    }

    await tx.notification.update({
      where: { id: notification.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        deliveryCount: sendResult.success,
        audienceCount: tokens.length,
        // Store breakdown in data field for analytics
        data: {
          ...(notification.data as object ?? {}),
          audienceBreakdown,
        },
      },
    });
  });

  return {
    success: sendResult.success,
    failed: sendResult.failed,
    audienceBreakdown,
  };
}
```

---

## Task 5.2: Update Audience Estimate API

**File:** `app/api/notifications/audience-estimate/route.ts` (update existing)

Provide detailed breakdown in estimate:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile, requireRole } from "@/lib/auth/guards";
import {
  NotificationPreferences,
  placeTagToBusinessType,
  isInQuietHours,
  migratePreferences,
} from "@/lib/notifications/types";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasPermission = await requireRole(profile, [
    UserRole.SUPER_ADMIN,
    UserRole.TOWN_ADMIN,
    UserRole.BUSINESS_OWNER,
  ]);

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { targetType, businessId, segment, townId, notificationType } = body;

  const isEmergency = notificationType === "emergency";

  let breakdown = {
    totalProfiles: 0,
    eligibleUsers: 0,
    blockedByGlobal: 0,
    blockedByCategory: 0,
    blockedByBusinessType: 0,
    blockedByQuietHours: 0,
    blockedByNoSubscription: 0,
    noDeviceToken: 0,
  };

  if (targetType === "BUSINESS" && businessId) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        place: { select: { tags: true } },
        notificationSubscriptions: {
          where: { isActive: true },
          include: {
            user: {
              include: {
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
    breakdown.totalProfiles = business.notificationSubscriptions.length;

    for (const sub of business.notificationSubscriptions) {
      const prefs = migratePreferences(
        sub.user.notificationPreferences as Record<string, boolean> | null
      );

      if (!prefs.globalEnabled) {
        breakdown.blockedByGlobal++;
        continue;
      }

      if (!isEmergency && businessType && !prefs.businessTypes[businessType]) {
        breakdown.blockedByBusinessType++;
        continue;
      }

      if (!isEmergency && isInQuietHours(prefs.quietHours)) {
        breakdown.blockedByQuietHours++;
        continue;
      }

      if (sub.user.deviceTokens.length === 0) {
        breakdown.noDeviceToken++;
        continue;
      }

      breakdown.eligibleUsers++;
    }

    // Add quota info
    const quotaInfo = {
      used: business.notificationUsage,
      limit: business.monthlyNotificationLimit,
      remaining: business.monthlyNotificationLimit !== null
        ? Math.max(0, business.monthlyNotificationLimit - business.notificationUsage)
        : null,
    };

    return NextResponse.json({
      estimatedAudience: breakdown.eligibleUsers,
      breakdown,
      quota: quotaInfo,
      businessType,
    });
  } else {
    // Town notification
    const effectiveTownId = townId ?? profile.townId;

    let categoryKey: keyof NotificationPreferences["categories"] = "townAlerts";
    if (segment === "weather") categoryKey = "weatherAlerts";
    else if (segment === "events") categoryKey = "events";
    else if (segment === "emergency") categoryKey = "emergencyAlerts";

    const profiles = await prisma.profile.findMany({
      where: {
        townId: effectiveTownId,
        ...(segment === "business_owners" && { role: "BUSINESS_OWNER" }),
        ...(segment === "admins" && {
          role: { in: ["SUPER_ADMIN", "TOWN_ADMIN"] },
        }),
      },
      include: {
        deviceTokens: { where: { isActive: true } },
      },
    });

    breakdown.totalProfiles = profiles.length;

    for (const p of profiles) {
      const prefs = migratePreferences(
        p.notificationPreferences as Record<string, boolean> | null
      );

      if (!prefs.globalEnabled) {
        breakdown.blockedByGlobal++;
        continue;
      }

      if (!isEmergency && !prefs.categories[categoryKey]) {
        breakdown.blockedByCategory++;
        continue;
      }

      if (!isEmergency && isInQuietHours(prefs.quietHours)) {
        breakdown.blockedByQuietHours++;
        continue;
      }

      if (p.deviceTokens.length === 0) {
        breakdown.noDeviceToken++;
        continue;
      }

      breakdown.eligibleUsers++;
    }

    return NextResponse.json({
      estimatedAudience: breakdown.eligibleUsers,
      breakdown,
      category: categoryKey,
    });
  }
}
```

---

## Task 5.3: Create Audience Estimate UI Component

**File:** `components/admin/AudienceEstimate.tsx` (new file)

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Bell, BellOff, Moon, AlertTriangle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AudienceEstimateProps {
  targetType: "TOWN" | "BUSINESS";
  businessId?: string;
  segment?: string;
  notificationType?: string;
  townId?: string;
}

interface EstimateResponse {
  estimatedAudience: number;
  breakdown: {
    totalProfiles: number;
    eligibleUsers: number;
    blockedByGlobal: number;
    blockedByCategory: number;
    blockedByBusinessType: number;
    blockedByQuietHours: number;
    blockedByNoSubscription: number;
    noDeviceToken: number;
  };
  quota?: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  category?: string;
  businessType?: string;
}

export default function AudienceEstimate({
  targetType,
  businessId,
  segment,
  notificationType,
  townId,
}: AudienceEstimateProps) {
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/notifications/audience-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetType,
            businessId,
            segment,
            notificationType,
            townId,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch estimate");

        const data = await response.json();
        setEstimate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch
    const timeout = setTimeout(fetchEstimate, 300);
    return () => clearTimeout(timeout);
  }, [targetType, businessId, segment, notificationType, townId]);

  if (isLoading) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Calculating audience...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="py-4">
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!estimate) return null;

  const { breakdown, quota } = estimate;
  const totalBlocked =
    breakdown.blockedByGlobal +
    breakdown.blockedByCategory +
    breakdown.blockedByBusinessType +
    breakdown.blockedByQuietHours +
    breakdown.noDeviceToken;

  return (
    <Card className="bg-slate-50">
      <CardContent className="py-4">
        {/* Main estimate */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <span className="text-slate-600">Estimated audience</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {estimate.estimatedAudience}
            </span>
            <span className="text-slate-500">/ {breakdown.totalProfiles}</span>
          </div>
        </div>

        {/* Breakdown badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {breakdown.blockedByGlobal > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="gap-1">
                    <BellOff className="h-3 w-3" />
                    {breakdown.blockedByGlobal} notifications off
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Users who have disabled all notifications
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {breakdown.blockedByCategory > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="gap-1">
                    <Bell className="h-3 w-3" />
                    {breakdown.blockedByCategory} category off
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Users who have disabled this notification category
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {breakdown.blockedByBusinessType > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="gap-1">
                    <Bell className="h-3 w-3" />
                    {breakdown.blockedByBusinessType} type off
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Users who have disabled notifications for this business type
                  {estimate.businessType && ` (${estimate.businessType})`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {breakdown.blockedByQuietHours > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="gap-1">
                    <Moon className="h-3 w-3" />
                    {breakdown.blockedByQuietHours} in quiet hours
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Users currently in quiet hours (will not receive unless emergency)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {breakdown.noDeviceToken > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="gap-1 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {breakdown.noDeviceToken} no device
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Users without registered push notification devices
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Quota warning for business notifications */}
        {quota && quota.limit !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">
              Quota: {quota.used} / {quota.limit} used
              {quota.remaining !== null && quota.remaining <= 2 && (
                <span className="text-amber-600 font-medium ml-1">
                  ({quota.remaining} remaining)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Warning if no recipients */}
        {estimate.estimatedAudience === 0 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
            No users will receive this notification. Consider:
            <ul className="list-disc ml-4 mt-1">
              {breakdown.totalProfiles === 0 && (
                <li>No subscribers to this business yet</li>
              )}
              {breakdown.blockedByCategory > 0 && (
                <li>Most users have this category disabled</li>
              )}
              {breakdown.noDeviceToken > 0 && (
                <li>Users haven't enabled push notifications on their devices</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Task 5.4: Integrate Audience Estimate in Admin UI

**File:** `app/[locale]/admin/notifications/page.tsx` (update existing)

Add the estimate component to the send notification form:

```typescript
// Add import
import AudienceEstimate from "@/components/admin/AudienceEstimate";

// In the notification form/modal, add:
{selectedNotification && (
  <div className="mb-4">
    <AudienceEstimate
      targetType={selectedNotification.targetType as "TOWN" | "BUSINESS"}
      businessId={selectedNotification.businessId ?? undefined}
      segment={(selectedNotification.targetFilter as any)?.segment}
      notificationType={selectedNotification.type}
      townId={selectedNotification.townId ?? undefined}
    />
  </div>
)}
```

---

## Task 5.5: Add Emergency Override Option

**File:** `app/[locale]/admin/notifications/page.tsx` (update)

Add ability to mark notification as emergency (bypasses quiet hours and some preferences):

```typescript
// In the notification form
<div className="flex items-center gap-2">
  <Checkbox
    id="isEmergency"
    checked={isEmergency}
    onCheckedChange={setIsEmergency}
  />
  <Label htmlFor="isEmergency" className="text-sm">
    Emergency notification (bypasses quiet hours and some preferences)
  </Label>
</div>

// When creating/updating notification
const notificationType = isEmergency ? "emergency" : selectedSegment;
```

---

## Task 5.6: Track Delivery Analytics

**File:** `lib/notifications/analytics.ts` (new file)

```typescript
import { prisma } from "@/lib/db";

export interface DeliveryAnalytics {
  notificationId: string;
  totalSent: number;
  delivered: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  clickRate: number;
  audienceBreakdown?: {
    blockedByGlobal: number;
    blockedByCategory: number;
    blockedByBusinessType: number;
    blockedByQuietHours: number;
    noDeviceToken: number;
  };
}

export async function getNotificationAnalytics(
  notificationId: string
): Promise<DeliveryAnalytics | null> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      deliveries: true,
    },
  });

  if (!notification) return null;

  const deliveries = notification.deliveries;
  const delivered = deliveries.filter((d) => d.status === "ok" || d.deliveredAt).length;
  const clicked = deliveries.filter((d) => d.clickedAt).length;
  const failed = deliveries.filter((d) => d.status === "error").length;

  return {
    notificationId,
    totalSent: deliveries.length,
    delivered,
    clicked,
    failed,
    deliveryRate: deliveries.length > 0 ? (delivered / deliveries.length) * 100 : 0,
    clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
    audienceBreakdown: (notification.data as any)?.audienceBreakdown,
  };
}

export async function getBusinessNotificationStats(
  businessId: string,
  days: number = 30
): Promise<{
  totalSent: number;
  averageDeliveryRate: number;
  averageClickRate: number;
  quotaUsed: number;
  quotaLimit: number | null;
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [notifications, business] = await Promise.all([
    prisma.notification.findMany({
      where: {
        businessId,
        sentAt: { gte: since },
        status: "sent",
      },
      include: {
        deliveries: true,
      },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: {
        notificationUsage: true,
        monthlyNotificationLimit: true,
      },
    }),
  ]);

  let totalDelivered = 0;
  let totalClicked = 0;
  let totalSent = 0;

  for (const notification of notifications) {
    totalSent += notification.deliveries.length;
    totalDelivered += notification.deliveries.filter(
      (d) => d.status === "ok" || d.deliveredAt
    ).length;
    totalClicked += notification.deliveries.filter((d) => d.clickedAt).length;
  }

  return {
    totalSent: notifications.length,
    averageDeliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    averageClickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
    quotaUsed: business?.notificationUsage ?? 0,
    quotaLimit: business?.monthlyNotificationLimit ?? null,
  };
}
```

---

## Task 5.7: Add Notification Analytics Dashboard

**File:** `components/admin/NotificationAnalytics.tsx` (new file)

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, MousePointer, Send, AlertCircle } from "lucide-react";

interface NotificationAnalyticsProps {
  analytics: {
    totalSent: number;
    delivered: number;
    clicked: number;
    failed: number;
    deliveryRate: number;
    clickRate: number;
    audienceBreakdown?: {
      blockedByGlobal: number;
      blockedByCategory: number;
      blockedByBusinessType: number;
      blockedByQuietHours: number;
      noDeviceToken: number;
    };
  };
}

export default function NotificationAnalytics({ analytics }: NotificationAnalyticsProps) {
  const { audienceBreakdown } = analytics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.totalSent}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Delivered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.delivered}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={analytics.deliveryRate} className="h-1.5" />
            <span className="text-xs text-slate-500">
              {analytics.deliveryRate.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Clicked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.clicked}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={analytics.clickRate} className="h-1.5" />
            <span className="text-xs text-slate-500">
              {analytics.clickRate.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{analytics.failed}</p>
        </CardContent>
      </Card>

      {audienceBreakdown && (
        <Card className="col-span-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audience Filtering Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Notifications Off</p>
                <p className="font-medium">{audienceBreakdown.blockedByGlobal}</p>
              </div>
              <div>
                <p className="text-slate-500">Category Disabled</p>
                <p className="font-medium">{audienceBreakdown.blockedByCategory}</p>
              </div>
              <div>
                <p className="text-slate-500">Business Type Off</p>
                <p className="font-medium">{audienceBreakdown.blockedByBusinessType}</p>
              </div>
              <div>
                <p className="text-slate-500">In Quiet Hours</p>
                <p className="font-medium">{audienceBreakdown.blockedByQuietHours}</p>
              </div>
              <div>
                <p className="text-slate-500">No Device</p>
                <p className="font-medium">{audienceBreakdown.noDeviceToken}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Verification Steps

1. **Preference Filtering:**
   - Create a test notification
   - Have test users with different preference settings
   - Verify only eligible users receive the notification
   - Check audience breakdown matches actual delivery

2. **Quiet Hours:**
   - Set quiet hours on a test user (e.g., current time)
   - Send a regular notification - should be blocked
   - Send an emergency notification - should go through

3. **Business Subscriptions:**
   - User without subscription should NOT receive business notification
   - User with subscription should receive
   - User with subscription but business type OFF should NOT receive

4. **Audience Estimate:**
   - Estimate should match actual delivery count
   - Breakdown should show correct reasons for filtering

5. **Quota:**
   - Send notifications up to quota limit
   - Verify next send is blocked
   - Check quota displays correctly in UI

---

## Files Created

- `components/admin/AudienceEstimate.tsx`
- `components/admin/NotificationAnalytics.tsx`
- `lib/notifications/analytics.ts`

## Files Modified

- `app/[locale]/admin/notifications/page.tsx`
- `app/api/notifications/audience-estimate/route.ts`
