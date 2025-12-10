import "server-only";

import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { locales, type AppLocale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { getCurrentProfile, requireRole } from "@/lib/auth/guards";
import { StatCard } from "@/components/dashboard/StatCard";
import { BusinessQuickActions } from "@/components/BusinessQuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Users } from "lucide-react";
import { BusinessNotificationCard } from "@/components/admin/BusinessNotificationCard";
import { NotificationHistory } from "@/components/admin/NotificationHistory";

type BusinessPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const formatDate = (value: Date | null | undefined, locale: string) => {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(value);
};

export default async function BusinessDashboardPage({ params }: BusinessPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const auth = await requireRole([UserRole.BUSINESS_OWNER]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  const business = await prisma.business.findFirst({
    where: { userId: auth.profile.id },
    include: {
      subscription: true,
      town: { select: { name: true } },
    },
  });

  if (!business) {
    redirect(`/${locale}`);
  }

  const [eventsCount, followersCount, upcomingEvents, recentNotifications] = await Promise.all([
    prisma.event.count({ where: { businessId: business.id } }),
    prisma.businessFavorite.count({ where: { businessId: business.id } }),
    prisma.event.findMany({
      where: { businessId: business.id },
      orderBy: { startsAt: { sort: "asc", nulls: "last" } },
      take: 3,
      select: { id: true, title: true, startsAt: true, location: true },
    }),
    prisma.notification.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        status: true,
        sentAt: true,
        audienceCount: true,
        deliveryCount: true,
      },
    }),
  ]);

  const notificationLimit = business.monthlyNotificationLimit ?? 0;
  const notificationsRemaining = Math.max(
    notificationLimit - (business.notificationUsage ?? 0),
    0
  );

  const eventsLimit = business.monthlyEventLimit;
  const eventsRemaining =
    eventsLimit !== null && eventsLimit !== undefined
      ? Math.max(eventsLimit - (business.eventUsage ?? 0), 0)
      : null;

  const tierName = business.subscription?.name ?? "Free";
  const isPremiumTier = (business.subscription?.priority ?? 0) >= 3;

  const notificationQuota = {
    allowed: notificationLimit === null ? true : (business.notificationUsage ?? 0) < notificationLimit,
    used: business.notificationUsage ?? 0,
    limit: notificationLimit === 0 ? 0 : notificationLimit === undefined ? null : notificationLimit,
    remaining:
      notificationLimit === null
        ? null
        : Math.max(0, (notificationLimit ?? 0) - (business.notificationUsage ?? 0)),
  };

  const sendBusinessNotificationAction = async (data: {
    title: string;
    body: string;
    type: string;
  }) => {
    "use server";

    const auth = await getCurrentProfile();
    if (!auth.profile) {
      throw new Error("Not authenticated");
    }

    const cookie = headers().get("cookie") ?? "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "";
    const url = baseUrl ? `${baseUrl}/api/notifications/send` : "/api/notifications/send";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie,
      },
      body: JSON.stringify({
        title: data.title,
        body: data.body,
        type: data.type,
        targetType: "BUSINESS_SUBSCRIBERS",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error ?? "Failed to send notification");
    }

    revalidatePath(`/${locale}/admin/business`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">Business owner</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-semibold text-slate-900">{business.name}</p>
                <p className="text-sm text-slate-500">
                  Sending updates on behalf of {business.town?.name ?? "Stykkishólmur"}.
                </p>
              </div>
              <Badge variant="secondary">{tierName}</Badge>
            </div>
            <p className="text-sm text-slate-600">{business.shortDescription}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Business stats</h2>
            <p className="text-sm text-slate-500">
              Track quota, events, and followers for your listings.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<Bell className="size-4" />}
              value={`${notificationsRemaining}/${notificationLimit}`}
              label="Notifications remaining"
              variant="yellow"
              subtitle="Resets monthly"
            />
            <StatCard
              icon={<Calendar className="size-4" />}
              value={eventsCount}
              label="Events published"
              variant="green"
              subtitle={
                eventsRemaining !== null
                  ? `${eventsRemaining} slots left`
                  : "Unlimited events"
              }
            />
            <StatCard
              icon={<Users className="size-4" />}
              value={followersCount}
              label="Followers"
              variant="blue"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Quick actions</h3>
              <p className="text-sm text-slate-500">
                Jump-start notifications or publish a new event right from this dashboard.
              </p>
            </div>
            <Badge variant="outline">Demo</Badge>
          </div>
          <BusinessQuickActions />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
              <p className="text-sm text-slate-500">
                Send updates to your subscribers and track delivery performance.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <BusinessNotificationCard
              businessId={business.id}
              businessName={business.name}
              quota={notificationQuota}
              onSend={sendBusinessNotificationAction}
            />
            <NotificationHistory notifications={recentNotifications} />
          </div>
        </section>

        {!isPremiumTier && (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Upgrade to Premium
                </p>
                <p className="text-sm text-slate-500">
                  Unlock higher quotas, featured placement, and priority support.
                </p>
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href="mailto:partners@townhub.demo">Email sales</Link>
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming events</h3>
            {upcomingEvents.length === 0 ? (
              <span className="text-xs text-slate-500">No events yet</span>
            ) : null}
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-500">{formatDate(event.startsAt, locale)}</p>
                {event.location ? (
                  <p className="text-xs text-slate-400">{event.location}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
