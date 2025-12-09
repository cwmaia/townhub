import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/app/(components)/Header";
import SettingsClient from "./SettingsClient";
import { prisma } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { migratePreferences } from "@/lib/notifications/types";

export const metadata: Metadata = {
  title: "Settings - TownHub",
  description: "Manage your profile and notification preferences",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/stykkisholmur`);
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      businessNotificationSubscriptions: {
        where: { isActive: true },
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
      },
      placeNotificationSubscriptions: {
        where: { isActive: true },
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
      },
    },
  });

  if (!profile) {
    redirect(`/${locale}/stykkisholmur`);
  }

  const preferences = migratePreferences(
    profile.notificationPreferences as Record<string, boolean> | null
  );

  const profileData = {
    id: profile.id,
    firstName: profile.firstName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
    notificationPreferences: preferences,
    businessSubscriptions: profile.businessNotificationSubscriptions.map((sub) => ({
      id: sub.id,
      businessId: sub.businessId,
      businessName: sub.business.name,
      placeId: sub.business.place?.id,
      placeName: sub.business.place?.name,
      imageUrl: sub.business.place?.imageUrl,
      tags: sub.business.place?.tags ?? [],
    })),
    placeSubscriptions: profile.placeNotificationSubscriptions.map((sub) => ({
      id: sub.id,
      placeId: sub.placeId,
      placeName: sub.place.name,
      imageUrl: sub.place.imageUrl,
      tags: sub.place.tags ?? [],
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        townName="Stykkishólmur"
        locale={locale}
        profile={{
          firstName: profile.firstName,
          avatarUrl: profile.avatarUrl,
          role: profile.role,
        }}
      />
      <SettingsClient profile={profileData} locale={locale} />
    </div>
  );
}

export const dynamic = "force-dynamic";
