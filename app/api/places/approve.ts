import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    placeId?: string;
    imageUrl?: string | null;
    lat?: number | null;
    lng?: number | null;
    googlePlaceId?: string | null;
    driftMeters?: number | null;
    streetViewPanoId?: string | null;
    streetViewDate?: string | null;
    candidateImageUrls?: string[];
    verifyImage?: boolean;
    verifyLocation?: boolean;
  };

  if (!body.placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    imageUrl: body.imageUrl ?? undefined,
    googlePlaceId: body.googlePlaceId ?? undefined,
    locationDriftMeters: body.driftMeters ?? undefined,
    candidateImageUrls: body.candidateImageUrls ?? undefined,
    streetViewPanoId: body.streetViewPanoId ?? undefined,
    streetViewDate: body.streetViewDate ?? undefined,
  };

  if (body.verifyImage !== undefined) {
    updates.imageVerified = body.verifyImage;
    if (body.verifyImage) {
      updates.imageVerifiedAt = new Date();
    }
  }

  if (body.verifyLocation !== undefined) {
    updates.locationVerified = body.verifyLocation;
    if (body.verifyLocation) {
      updates.locationVerifiedAt = new Date();
    }
  }

  if (body.lat != null && body.lng != null) {
    updates.lat = body.lat;
    updates.lng = body.lng;
  }

  try {
    const updated = await prisma.place.update({
      where: { id: body.placeId },
      data: updates,
    });
    return NextResponse.json({ place: updated });
  } catch (error) {
    console.error("Failed to approve place verification", error);
    return NextResponse.json(
      { error: "Failed to update place verification" },
      { status: 500 }
    );
  }
}
