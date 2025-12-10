import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import { sendPushNotifications, updateDeliveryStatus } from "@/lib/notifications/expo-push";
import {
  NOTIFICATION_TYPES,
  NotificationType,
  NOTIFICATION_TYPE_INFO,
} from "@/lib/notifications/types";
import {
  checkBusinessQuota,
  checkTownQuota,
  incrementBusinessUsage,
  incrementTownUsage,
} from "@/lib/notifications/quota";

interface SendNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  targetType: "TOWN" | "BUSINESS_SUBSCRIBERS" | "SEGMENT";
  townId?: string | null;
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

  if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
    return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
  }

  const typeInfo = NOTIFICATION_TYPE_INFO[type];
  const isSuperAdmin = profile.role === UserRole.SUPER_ADMIN;
  const isTownAdmin = profile.role === UserRole.TOWN_ADMIN;
  const isBusinessOwner = profile.role === UserRole.BUSINESS_OWNER;

  if (typeInfo.category === "business" && !isBusinessOwner && !isSuperAdmin) {
    return NextResponse.json(
      { error: "Business notification types require business owner or super admin role" },
      { status: 403 }
    );
  }

  if (typeInfo.category === "town" && !isTownAdmin && !isSuperAdmin) {
    return NextResponse.json(
      { error: "Town notification types require town admin or super admin role" },
      { status: 403 }
    );
  }

  let business: { id: string } | null = null;
  if (isBusinessOwner) {
    business = await prisma.business.findUnique({
      where: { userId: profile.id },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found for this account" }, { status: 404 });
    }

    const quotaCheck = await checkBusinessQuota(business.id, "notification");
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: "Monthly notification quota exceeded", quota: quotaCheck },
        { status: 403 }
      );
    }
  }

  let townIdToUse = body.townId || profile.townId || null;
  if ((isTownAdmin || isSuperAdmin) && townIdToUse && typeInfo.category === "town") {
    const quotaCheck = await checkTownQuota(townIdToUse, "notification");
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: "Monthly town notification quota exceeded", quota: quotaCheck },
        { status: 403 }
      );
    }
  }

  if (isSuperAdmin && !townIdToUse) {
    const firstTown = await prisma.town.findFirst();
    townIdToUse = firstTown?.id ?? null;
  }

  let deviceTokens: { token: string; userId: string }[] = [];

  if (targetType === "BUSINESS_SUBSCRIBERS" && business) {
    const subscribers = await prisma.businessNotificationSubscription.findMany({
      where: { businessId: business.id, isActive: true },
      select: { userId: true },
    });
    const userIds = subscribers.map((s) => s.userId);

    if (userIds.length) {
      deviceTokens = await prisma.deviceToken.findMany({
        where: { userId: { in: userIds }, isActive: true },
        select: { token: true, userId: true },
      });
    }
  } else if (targetType === "TOWN" && townIdToUse) {
    const profiles = await prisma.profile.findMany({
      where: { townId: townIdToUse },
      select: { id: true },
    });
    const profileIds = profiles.map((p) => p.id);

    if (profileIds.length) {
      deviceTokens = await prisma.deviceToken.findMany({
        where: { userId: { in: profileIds }, isActive: true },
        select: { token: true, userId: true },
      });
    }
  } else if (targetType === "SEGMENT" && segment) {
    if (townIdToUse) {
      const profiles = await prisma.profile.findMany({
        where: { townId: townIdToUse },
        select: { id: true },
      });
      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length) {
        deviceTokens = await prisma.deviceToken.findMany({
          where: { userId: { in: profileIds }, isActive: true },
          select: { token: true, userId: true },
        });
      }
    }
  }

  if (!deviceTokens.length) {
    return NextResponse.json({ error: "No active devices to send to", audienceCount: 0 }, { status: 400 });
  }

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

  try {
    const result = await sendPushNotifications({
      title,
      body: message,
      data: {
        notificationId: notification.id,
        type,
        deeplink: deeplink ?? undefined,
      },
      tokens: deviceTokens.map((t) => t.token),
    });

    await updateDeliveryStatus(notification.id, result.tickets);
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: "sent",
        sentAt: new Date(),
        deliveryCount: result.success,
      },
    });

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

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send notification",
        notificationId: notification.id,
      },
      { status: 500 }
    );
  }
}
