import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationPreferences,
  migratePreferences,
} from "@/lib/notifications/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const { profile } = await getCurrentProfile();

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
      subscribedBusinessIds: fullProfile.businessNotificationSubscriptions.map((s) => s.businessId),
      subscribedPlaceIds: fullProfile.placeNotificationSubscriptions.map((s) => s.placeId),
    },
  });
}

export async function POST(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, avatarUrl, email, notificationPreferences } = body;

  let validatedPreferences: NotificationPreferences | undefined;
  if (notificationPreferences) {
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
        notificationPreferences: validatedPreferences as unknown as Prisma.JsonObject,
      }),
    },
  });

  return NextResponse.json({
    data: {
      id: updated.id,
      firstName: updated.firstName,
      avatarUrl: updated.avatarUrl,
      email: updated.email,
      notificationPreferences: validatedPreferences ?? updated.notificationPreferences,
    },
  });
}
