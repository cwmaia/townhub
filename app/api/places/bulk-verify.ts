import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { placeIds?: string[] };
  if (!Array.isArray(body.placeIds) || body.placeIds.length === 0) {
    return NextResponse.json({ error: "placeIds array is required" }, { status: 400 });
  }

  const result = await prisma.place.updateMany({
    where: { id: { in: body.placeIds } },
    data: {
      locationVerified: false,
      imageVerified: false,
      candidateImageUrls: [],
      googlePlaceId: null,
      locationDriftMeters: null,
    },
  });

  return NextResponse.json({ updated: result.count });
}
