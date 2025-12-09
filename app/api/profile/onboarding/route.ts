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
  try {
    const { user, profile } = await getCurrentProfile();

    // User must be authenticated, but profile may not exist yet
    if (!user) {
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

    // Upsert profile - create if doesn't exist, update if it does
    const updated = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        email: user.email,
        firstName: firstName ?? user.user_metadata?.firstName ?? user.email?.split("@")[0],
        avatarUrl: avatarUrl ?? null,
        notificationPreferences: finalPreferences as unknown as Prisma.JsonObject,
        onboardingCompletedAt: new Date(),
      },
      update: {
        firstName: firstName ?? profile?.firstName,
        avatarUrl: avatarUrl ?? profile?.avatarUrl,
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
  } catch (error) {
    console.error("[Onboarding API Error]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
