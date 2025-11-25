import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: { sort: "asc", nulls: "last" } },
    take: 12,
    include: {
      business: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          favorites: true,
          rsvps: true,
        },
      },
    },
  });

  const payload = events.map(({ _count, ...event }) => ({
    ...event,
    favoriteCount: _count.favorites,
    rsvpCount: _count.rsvps,
  }));

  return NextResponse.json({ data: payload });
}
