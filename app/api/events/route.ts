import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: { sort: "asc", nulls: "last" } },
    take: 12,
  });

  return NextResponse.json({ data: events });
}
