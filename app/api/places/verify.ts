import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";
import { getStaticMapUrl } from "@/lib/google";
import { StreetViewImageSource } from "@/lib/image-fetcher/sources/streetview";
import { verifyPlaceLocation } from "@/lib/google-places";

type CandidateImage = {
  url: string;
  source: "streetview" | "google-places";
  heading?: number;
  date?: string;
  panoId?: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { placeId } = (await request.json()) as { placeId?: string };
  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: {
      id: true,
      name: true,
      address: true,
      lat: true,
      lng: true,
      imageUrl: true,
      googlePlaceId: true,
      locationVerified: true,
      imageVerified: true,
    },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  if (place.lat == null || place.lng == null) {
    return NextResponse.json(
      { error: "Place is missing coordinates" },
      { status: 400 }
    );
  }

  const streetViewSource = new StreetViewImageSource();
  const streetViewResults = await streetViewSource.getMultiAngleViews(
    place.lat,
    place.lng
  );

  const googleVerification = await verifyPlaceLocation(place.lat, place.lng);

  const candidateImages: CandidateImage[] = [
    ...streetViewResults.map((result) => ({
      url: result.url,
      source: "streetview",
      heading: result.heading,
      date: result.date,
      panoId: result.panoId,
    })),
  ];

  if (googleVerification?.place.photos?.length) {
    candidateImages.push(
      ...googleVerification.place.photos.map((url) => ({
        url,
        source: "google-places" as const,
      }))
    );
  }

  const maps = {
    ours: getStaticMapUrl({
      lat: place.lat,
      lng: place.lng,
      markers: [{ lat: place.lat, lng: place.lng }],
    }),
    google: googleVerification
      ? getStaticMapUrl({
          lat: googleVerification.place.lat,
          lng: googleVerification.place.lng,
          markers: [{ lat: googleVerification.place.lat, lng: googleVerification.place.lng }],
        })
      : null,
  };

  return NextResponse.json({
    place,
    candidateImages,
    driftMeters: googleVerification?.driftMeters ?? null,
    googlePlace: googleVerification?.place ?? null,
    maps,
  });
}
