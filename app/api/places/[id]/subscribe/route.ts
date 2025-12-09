import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

// GET - Check subscription status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }

  const subscription = await prisma.placeNotificationSubscription.findUnique({
    where: {
      userId_placeId: {
        userId: profile.id,
        placeId,
      },
    },
  });

  return NextResponse.json({
    subscribed: subscription?.isActive ?? false,
    subscriptionId: subscription?.id ?? null,
  });
}

// POST - Subscribe to place
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true, name: true },
  });

  if (!place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  const subscription = await prisma.placeNotificationSubscription.upsert({
    where: {
      userId_placeId: {
        userId: profile.id,
        placeId,
      },
    },
    update: {
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId: profile.id,
      placeId,
      isActive: true,
    },
  });

  return NextResponse.json({
    subscribed: true,
    subscriptionId: subscription.id,
    placeName: place.name,
  });
}

// DELETE - Unsubscribe from place
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: placeId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.placeNotificationSubscription.updateMany({
    where: {
      userId: profile.id,
      placeId,
    },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ subscribed: false });
}
