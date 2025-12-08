import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

export async function GET() {
  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [unverified, pendingReview, verified] = await Promise.all([
    prisma.place.count({
      where: {
        OR: [
          { locationVerified: false },
          { imageVerified: false },
        ],
      },
    }),
    prisma.place.count({
      where: {
        candidateImageUrls: { not: { equals: [] } },
        OR: [{ imageVerified: false }, { locationVerified: false }],
      },
    }),
    prisma.place.count({
      where: {
        locationVerified: true,
        imageVerified: true,
      },
    }),
  ]);

  return NextResponse.json({ unverified, pendingReview, verified });
}
