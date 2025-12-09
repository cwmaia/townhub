import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

// GET - List all user subscriptions
export async function GET(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [businessSubscriptions, placeSubscriptions] = await Promise.all([
    prisma.businessNotificationSubscription.findMany({
      where: {
        userId: profile.id,
        isActive: true,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            place: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                tags: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.placeNotificationSubscription.findMany({
      where: {
        userId: profile.id,
        isActive: true,
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            tags: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    businesses: businessSubscriptions.map((sub) => ({
      subscriptionId: sub.id,
      businessId: sub.businessId,
      businessName: sub.business.name,
      placeId: sub.business.place?.id,
      placeName: sub.business.place?.name,
      imageUrl: sub.business.place?.imageUrl,
      tags: sub.business.place?.tags ?? [],
      subscribedAt: sub.createdAt,
    })),
    places: placeSubscriptions.map((sub) => ({
      subscriptionId: sub.id,
      placeId: sub.placeId,
      placeName: sub.place.name,
      imageUrl: sub.place.imageUrl,
      tags: sub.place.tags ?? [],
      subscribedAt: sub.createdAt,
    })),
  });
}
