import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deliveries = await prisma.notificationDelivery.findMany({
    where: { userId: profile.id },
    include: {
      notification: {
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          imageUrl: true,
          data: true,
          sentAt: true,
          createdAt: true,
          business: {
            select: { id: true, name: true },
          },
          town: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const notifications = deliveries.map((delivery) => ({
    id: delivery.notification.id,
    deliveryId: delivery.id,
    title: delivery.notification.title,
    body: delivery.notification.body,
    type: delivery.notification.type,
    imageUrl: delivery.notification.imageUrl,
    data: delivery.notification.data,
    isRead: !!delivery.clickedAt,
    createdAt: delivery.notification.sentAt ?? delivery.notification.createdAt,
    business: delivery.notification.business,
    town: delivery.notification.town,
  }));

  return NextResponse.json({ notifications });
}
