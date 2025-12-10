import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: notificationId } = await params;

  const delivery = await prisma.notificationDelivery.findFirst({
    where: {
      notificationId,
      userId: profile.id,
    },
  });

  if (!delivery) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  if (!delivery.clickedAt) {
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { clickedAt: new Date() },
    });

    await prisma.notification.update({
      where: { id: notificationId },
      data: { clickCount: { increment: 1 } },
    });
  }

  return NextResponse.json({ success: true });
}
