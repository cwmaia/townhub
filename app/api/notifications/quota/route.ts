import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/guards";
import { checkBusinessQuota, checkTownQuota } from "@/lib/notifications/quota";

export async function GET(request: NextRequest) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (profile.role === UserRole.BUSINESS_OWNER) {
    const business = await prisma.business.findUnique({
      where: { userId: profile.id },
      select: { id: true, name: true },
    });

    if (!business) {
      return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const notificationQuota = await checkBusinessQuota(business.id, "notification");
    const eventQuota = await checkBusinessQuota(business.id, "event");

    return NextResponse.json({
      entityType: "business",
      entityId: business.id,
      entityName: business.name,
      notifications: notificationQuota,
      events: eventQuota,
    });
  }

  if (profile.role === UserRole.TOWN_ADMIN || profile.role === UserRole.SUPER_ADMIN) {
    const townId = profile.townId;

    if (!townId) {
      return NextResponse.json({
        entityType: "super_admin",
        notifications: { allowed: true, used: 0, limit: null, remaining: null },
        events: { allowed: true, used: 0, limit: null, remaining: null },
      });
    }

    const town = await prisma.town.findUnique({
      where: { id: townId },
      select: { id: true, name: true },
    });

    if (!town) {
      return NextResponse.json({ error: "Town not found" }, { status: 404 });
    }

    const notificationQuota = await checkTownQuota(townId, "notification");
    const eventQuota = await checkTownQuota(townId, "event");

    return NextResponse.json({
      entityType: "town",
      entityId: town.id,
      entityName: town.name,
      notifications: notificationQuota,
      events: eventQuota,
    });
  }

  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}
