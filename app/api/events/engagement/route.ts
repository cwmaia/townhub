import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

type EngagementAction = "view" | "favorite" | "unfavorite" | "rsvp" | "unrsvp";

const ENGAGEMENT_ACTIONS: Set<EngagementAction> = new Set([
  "view",
  "favorite",
  "unfavorite",
  "rsvp",
  "unrsvp",
]);

const normalizeString = (value: unknown) => (typeof value === "string" ? value : undefined);

async function getOrCreateProfile(
  userId: string,
  metadata?: Record<string, unknown>
) {
  const firstName =
    normalizeString(metadata?.first_name) ??
    normalizeString(metadata?.firstName) ??
    normalizeString(metadata?.full_name)?.split(" ")[0] ??
    normalizeString(metadata?.name) ??
    "townapp";
  const avatarUrl = normalizeString(metadata?.avatar_url) ?? normalizeString(metadata?.avatarUrl);
  const email = normalizeString(metadata?.email);

  return prisma.profile.upsert({
    where: { userId },
    update: {
      firstName,
      avatarUrl,
    },
    create: {
      userId,
      firstName,
      avatarUrl,
      email: email ?? null,
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

  const { eventId, action } = payload;
  if (!eventId || !action || !ENGAGEMENT_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid event id or action" }, { status: 400 });
  }

  const profile = await getOrCreateProfile(user.id, user.user_metadata);

  if (action === "view") {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        viewCount: { increment: 1 },
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "favorite") {
    await prisma.eventFavorite.upsert({
      where: {
        eventId_profileId: {
          eventId,
          profileId: profile.id,
        },
      },
      update: {},
      create: {
        eventId,
        profileId: profile.id,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "unfavorite") {
    await prisma.eventFavorite.deleteMany({
      where: { eventId, profileId: profile.id },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "rsvp") {
    await prisma.eventRSVP.upsert({
      where: {
        eventId_profileId: {
          eventId,
          profileId: profile.id,
        },
      },
      update: {},
      create: {
        eventId,
        profileId: profile.id,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "unrsvp") {
    await prisma.eventRSVP.deleteMany({
      where: { eventId, profileId: profile.id },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
