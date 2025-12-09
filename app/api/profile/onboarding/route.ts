import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationPreferences,
} from "@/lib/notifications/types";

// POST - Complete onboarding and save initial preferences
export async function POST(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, avatarUrl, notificationPreferences } = body;

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
