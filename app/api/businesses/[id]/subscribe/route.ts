import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";

// GET - Check subscription status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }

  const subscription = await prisma.businessNotificationSubscription.findUnique({
    where: {
      userId_businessId: {
        userId: profile.id,
        businessId,
      },
    },
  });

  return NextResponse.json({
    subscribed: subscription?.isActive ?? false,
    subscriptionId: subscription?.id ?? null,
  });
}

// POST - Subscribe to business
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const subscription = await prisma.businessNotificationSubscription.upsert({
    where: {
      userId_businessId: {
        userId: profile.id,
        businessId,
      },
    },
    update: {
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId: profile.id,
      businessId,
      isActive: true,
    },
  });

  return NextResponse.json({
    subscribed: true,
    subscriptionId: subscription.id,
    businessName: business.name,
  });
}

// DELETE - Unsubscribe from business
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: businessId } = await params;
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.businessNotificationSubscription.updateMany({
    where: {
      userId: profile.id,
      businessId,
    },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ subscribed: false });
}
