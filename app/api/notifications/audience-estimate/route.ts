import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile, hasRole } from "@/lib/auth/guards";
import {
  NotificationPreferences,
  isInQuietHours,
  placeTagToBusinessType,
} from "@/lib/notifications/types";

export async function POST(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !hasRole(profile, [
      UserRole.SUPER_ADMIN,
      UserRole.TOWN_ADMIN,
      UserRole.BUSINESS_OWNER,
    ])
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { targetType, businessId, segment, townId } = body;

  let estimatedCount = 0;
  let breakdown: Record<string, number> = {};

  if (targetType === "BUSINESS" && businessId) {
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

    const categoryKey =
      segment === "weather"
        ? "weatherAlerts"
        : segment === "events"
          ? "events"
          : segment === "emergency"
            ? "emergencyAlerts"
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
