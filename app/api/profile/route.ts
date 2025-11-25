import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const DEFAULT_NOTIFICATION_PREFERENCES = {
  events: true,
  promos: true,
  townAlerts: true,
  weatherAlerts: true,
  businessAlerts: true,
};

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  const notificationPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(profile?.notificationPreferences as Record<string, unknown>),
  };

  const favorites = await prisma.businessFavorite.findMany({
    where: { profileId: profile?.id ?? undefined },
    include: {
      business: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({
    data: {
      firstName:
        profile?.firstName ??
        (user.user_metadata?.first_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "TownApp",
      avatarUrl:
        profile?.avatarUrl ??
        (user.user_metadata?.avatar_url as string | undefined) ??
        null,
      email: user.email,
      notificationPreferences,
      favoriteBusinessIds: favorites.map((favorite) => favorite.businessId),
      favorites: favorites.map((favorite) => ({
        id: favorite.businessId,
        name: favorite.business?.name ?? null,
      })),
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const { firstName, avatarUrl, email, notificationPreferences } = payload;

  const updateData: {
    email?: string;
    data?: Record<string, string>;
  } = {};

  if (email) {
    updateData.email = email;
  }

  const metadataUpdate: Record<string, string> = {};
  if (firstName) {
    metadataUpdate.first_name = firstName;
  }
  if (avatarUrl) {
    metadataUpdate.avatar_url = avatarUrl;
  }
  if (Object.keys(metadataUpdate).length) {
    updateData.data = metadataUpdate;
  }

  if (Object.keys(updateData).length) {
    await supabase.auth.updateUser(updateData);
  }

  const mergedPreferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...(notificationPreferences ?? {}),
  };

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      firstName: firstName ?? undefined,
      avatarUrl: avatarUrl ?? undefined,
      email: email ?? undefined,
      notificationPreferences: mergedPreferences,
    },
    create: {
      userId: user.id,
      firstName:
        firstName ??
        (user.user_metadata?.first_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "TownApp",
      avatarUrl: avatarUrl ?? (user.user_metadata?.avatar_url as string | undefined) ?? null,
      email: email ?? user.email ?? null,
      notificationPreferences: mergedPreferences,
    },
  });

  return NextResponse.json({
    data: {
      firstName: profile.firstName,
      avatarUrl: profile.avatarUrl,
      email: profile.email,
      notificationPreferences: mergedPreferences,
    },
  });
}
