import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  const favorites = await prisma.businessFavorite.findMany({
    where: { profileId: profile?.id ?? undefined },
    include: {
      business: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({
    data: favorites.map((favorite) => ({
      businessId: favorite.businessId,
      name: favorite.business?.name ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload?.businessId || !payload?.action) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { businessId, action } = payload;

  if (action === "favorite") {
    await prisma.businessFavorite.upsert({
      where: {
        businessId_profileId: {
          businessId,
          profileId: profile.id,
        },
      },
      update: {},
      create: {
        businessId,
        profileId: profile.id,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "unfavorite") {
    await prisma.businessFavorite.deleteMany({
      where: { businessId, profileId: profile.id },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
