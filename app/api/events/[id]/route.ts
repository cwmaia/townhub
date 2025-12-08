import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { id: string };

export async function GET(_: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
      })
    : null;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          subscription: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          favorites: true,
          rsvps: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const isFavorite =
    profile &&
    (await prisma.eventFavorite.findUnique({
      where: {
        eventId_profileId: {
          eventId: id,
          profileId: profile.id,
        },
      },
    }));

  const isRSVP =
    profile &&
    (await prisma.eventRSVP.findUnique({
      where: {
        eventId_profileId: {
          eventId: id,
          profileId: profile.id,
        },
      },
    }));

  const { _count, ...rest } = event;

  return NextResponse.json({
    data: {
      ...rest,
      favoriteCount: _count.favorites,
      rsvpCount: _count.rsvps,
      isFavorite: Boolean(isFavorite),
      isRSVP: Boolean(isRSVP),
    },
  });
}
