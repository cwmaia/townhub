import "server-only";

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { InvoiceStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { locales, type AppLocale } from "@/lib/i18n";
import { requireRole } from "@/lib/auth/guards";
import { resolveAdminTownContext } from "../helpers";
import { sendPushNotifications, updateDeliveryStatus } from "@/lib/notifications/expo-push";
import SendNotificationForm from "@/components/admin/SendNotificationForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEGMENT_OPTIONS = [
  { value: "all", label: "All residents" },
  { value: "business_owners", label: "Business owners" },
  { value: "admins", label: "Town admins" },
] as const;

const AVAILABLE_ALERT_FILTERS = [
  { value: "town", label: "Town news & civic alerts" },
  { value: "weather", label: "Weather & road alerts" },
  { value: "aurora", label: "Aurora activity" },
  { value: "business", label: "Business promotions" },
] as const;

const getSegmentLabel = (value?: string) =>
  SEGMENT_OPTIONS.find((option) => option.value === value)?.label ?? SEGMENT_OPTIONS[0].label;

type NotificationsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const createNotificationDraftAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const title = formData.get("title")?.toString().trim() || "Untitled notification";

  const { auth, townId } = await resolveAdminTownContext(formData);

  await prisma.notification.create({
    data: {
      title,
      body: "",
      type: "TOWN_BROADCAST",
      senderId: auth.profile.id,
      townId,
      status: "draft",
      targetFilter: { segment: "all" },
    },
  });

  revalidatePath(`/${locale}/admin/notifications`);
};

const updateNotificationAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  const title = formData.get("title")?.toString().trim() || "Untitled notification";
  const body = formData.get("body")?.toString() ?? "";
  const language = formData.get("language")?.toString() || "en";
  const targetType = formData.get("targetType")?.toString() || "TOWN";
  const businessId =
    targetType === "BUSINESS" ? formData.get("businessId")?.toString() || null : null;
  const segment = formData.get("segment")?.toString() || "all";
  const deeplink = formData.get("deeplink")?.toString().trim() || "";
  const scheduledAtValue = formData.get("scheduledFor")?.toString();
  const scheduledFor =
    scheduledAtValue && scheduledAtValue.length
      ? new Date(scheduledAtValue)
      : null;

  const { townId } = await resolveAdminTownContext(formData);

  if (businessId) {
    const business = await prisma.business.findFirst({
      where: { id: businessId, townId },
      select: { id: true },
    });
    if (!business) {
      throw new Error("Selected business does not belong to this town.");
    }
  }

  const existing = await prisma.notification.findUnique({
    where: { id },
    select: { townId: true, status: true, data: true, targetFilter: true },
  });

  if (!existing || existing.townId !== townId) {
    throw new Error("Notification not found for this town.");
  }

  if (existing.status !== "draft") {
    throw new Error("Only drafts can be edited.");
  }

  const existingData =
    typeof existing.data === "object" && existing.data !== null ? { ...existing.data } : {};
  if (deeplink) {
    existingData.deeplink = deeplink;
  } else {
    delete existingData.deeplink;
  }
  const dataPayload = Object.keys(existingData).length ? existingData : null;
  const existingFilter =
    typeof existing.targetFilter === "object" && existing.targetFilter !== null
      ? { ...existing.targetFilter }
      : {};
  const targetFilter =
    targetType === "TOWN" ? { ...existingFilter, segment } : null;

  await prisma.notification.update({
    where: { id },
    data: {
      title,
      body,
      language,
      targetType,
      businessId,
      scheduledFor,
      data: dataPayload,
      targetFilter,
    },
  });

  revalidatePath(`/${locale}/admin/notifications`);
};

type SendNotificationActionResult =
  | { success: true; delivered: number; failed: number; notificationId: string }
  | { error: string; notificationId: string };

const sendNotificationAction = async (
  formData: FormData,
): Promise<SendNotificationActionResult> => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) {
    return { error: "Missing notification ID", notificationId: "" };
  }

  const { townId } = await resolveAdminTownContext(formData);

  const notification = await prisma.notification.findUnique({
    where: { id },
    include: {
      business: true,
    },
  });

  if (!notification || notification.townId !== townId) {
    throw new Error("Notification not found for this town.");
  }

  if (notification.status !== "draft") {
    throw new Error("Only drafts can be sent.");
  }

  let tokens: { id: string; token: string; userId: string }[] = [];
  let businessToUpdate: typeof notification.business | null = null;
  const targetFilterData = notification.targetFilter as { segment?: string } | null;
  const segment = targetFilterData?.segment ?? "all";
  const getTownTokenFilter = () => {
    const base: Record<string, unknown> = { townId };
    if (segment === "business_owners") {
      return { ...base, role: UserRole.BUSINESS_OWNER };
    }
    if (segment === "admins") {
      return { ...base, role: { in: [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN] } };
    }
    return base;
  };

  if (notification.targetType === "BUSINESS" && notification.businessId) {
    const business = await prisma.business.findUnique({
      where: { id: notification.businessId },
      select: {
        id: true,
        monthlyNotificationLimit: true,
        notificationUsage: true,
        townId: true,
      },
    });

    if (!business || business.townId !== townId) {
      throw new Error("Business not found or outside of current town.");
    }

    if (
      business.monthlyNotificationLimit !== null &&
      business.notificationUsage >= business.monthlyNotificationLimit
    ) {
      throw new Error("This business has reached its notification quota.");
    }

    businessToUpdate = business;

    tokens = await prisma.deviceToken.findMany({
      where: {
        user: {
          business: { id: business.id },
        },
      },
      select: { id: true, token: true, userId: true },
    });
  } else {
    tokens = await prisma.deviceToken.findMany({
      where: {
        user: {
          ...getTownTokenFilter(),
        },
      },
      select: { id: true, token: true, userId: true },
    });
  }

  if (!tokens.length) {
    return { error: "No active devices to send to", notificationId: notification.id };
  }

  try {
    const sendResult = await sendPushNotifications({
      title: notification.title,
      body: notification.body ?? "",
      data: (notification.data as Record<string, unknown>) ?? {},
      tokens: tokens.map((token) => token.token),
    });

    await updateDeliveryStatus(notification.id, sendResult.tickets);

    await prisma.$transaction(async (tx) => {
      if (businessToUpdate) {
        await tx.business.update({
          where: { id: businessToUpdate.id },
          data: {
            notificationUsage: { increment: 1 },
          },
        });
      }

      await tx.notification.update({
        where: { id: notification.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          deliveryCount: sendResult.success,
          audienceCount: tokens.length,
        },
      });
    });

    revalidatePath(`/${locale}/admin/notifications`);

    return {
      success: true,
      delivered: sendResult.success,
      failed: sendResult.failed,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error("Failed to send notification", error);
    return {
      error: error instanceof Error ? error.message : "Failed to send notification",
      notificationId: notification.id,
    };
  }
};

const updateSegmentAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;
  const description = formData.get("description")?.toString() ?? "";
  const isActive = formData.get("isActive") === "on";
  const filters = formData
    .getAll("filters")
    .map((item) => item?.toString())
    .filter(Boolean);
  const { townId } = await resolveAdminTownContext(formData);

  await prisma.notificationSegment.update({
    where: { id },
    data: {
      description,
      isActive,
      filters,
      townId,
    },
  });

  revalidatePath(`/${locale}/admin/notifications`);
};

const createSegmentAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const name = formData.get("name")?.toString()?.trim();
  const slug = formData.get("slug")?.toString()?.trim();
  const description = formData.get("description")?.toString() ?? "";
  const filters = formData
    .getAll("filters")
    .map((item) => item?.toString())
    .filter(Boolean);
  if (!name || !slug) return;
  const { townId } = await resolveAdminTownContext(formData);

  await prisma.notificationSegment.create({
    data: {
      name,
      slug,
      description,
      filters,
      townId,
    },
  });

  revalidatePath(`/${locale}/admin/notifications`);
};

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    redirect(`/${locales[0]}`);
  }

  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  const townId =
    auth.profile.role === UserRole.SUPER_ADMIN
      ? auth.profile.townId ?? (await prisma.town.findFirst())?.id
      : auth.profile.townId;

  if (!townId) {
    redirect(`/${locale}/admin`);
  }

  const TREND_WINDOWS = [7, 30] as const;
  type TrendWindow = (typeof TREND_WINDOWS)[number];
  const maxTrendWindow = Math.max(...TREND_WINDOWS);
  const universalTrendStart = new Date();
  universalTrendStart.setHours(0, 0, 0, 0);
  universalTrendStart.setDate(universalTrendStart.getDate() - (maxTrendWindow - 1));

  const [
    notifications,
    businesses,
    town,
    placeCount,
    eventCount,
    upcomingEvents,
    segments,
  ] = await Promise.all([
    prisma.notification.findMany({
      where: { townId },
      include: {
        business: {
          select: { name: true },
        },
        sender: {
          select: { firstName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    prisma.business.findMany({
      where: { townId },
      select: {
        id: true,
        name: true,
        monthlyNotificationLimit: true,
        notificationUsage: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.town.findUnique({
      where: { id: townId },
      select: { name: true, currency: true },
    }),
    prisma.place.count({ where: { townId } }),
    prisma.event.count({ where: { townId } }),
    prisma.event.findMany({
      where: {
        townId,
        startsAt: {
          gte: new Date(),
        },
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        title: true,
        location: true,
        startsAt: true,
        description: true,
      },
      take: 4,
    }),
    prisma.notificationSegment.findMany({
      where: { townId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!town) {
    throw new Error("Town context could not be resolved.");
  }

  const invoiceSummaries = await prisma.invoice.groupBy({
    by: ["status"],
    where: { townId },
    _count: { _all: true },
    _sum: { amount: true },
  });

  const recentInvoices = await prisma.invoice.findMany({
    where: { townId },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const soonCutoff = new Date();
  soonCutoff.setHours(23, 59, 59, 999);
  soonCutoff.setDate(soonCutoff.getDate() + 14);

  const invoiceStatusTotals = invoiceSummaries.reduce(
    (acc, summary) => ({
      ...acc,
      [summary.status]: {
        count: summary._count._all,
        amount: (summary._sum.amount ?? 0) + (acc[summary.status]?.amount ?? 0),
      },
    }),
    {} as Record<
      InvoiceStatus,
      {
        count: number;
        amount: number;
      }
    >,
  );

  const outstandingStatuses = new Set([InvoiceStatus.ISSUED, InvoiceStatus.OVERDUE]);
  const totalOutstanding = invoiceSummaries.reduce(
    (sum, summary) =>
      outstandingStatuses.has(summary.status)
        ? sum + (summary._sum.amount ?? 0)
        : sum,
    0,
  );

  const upcomingInvoices = recentInvoices.filter(
    (invoice) =>
      invoice.status !== InvoiceStatus.PAID &&
      invoice.dueDate &&
      invoice.dueDate <= soonCutoff,
  );

  const totalInvoiceRecords = invoiceSummaries.reduce(
    (sum, summary) => sum + summary._count._all,
    0,
  );
  const dueSoonAmount = upcomingInvoices.reduce(
    (sum, invoice) => sum + (invoice.amount ?? 0),
    0,
  );
  const invoiceStatusEntries = Object.entries(invoiceStatusTotals);

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: town.currency ?? "ISK",
  });

  const eventHighlights = await prisma.event.findMany({
    where: { townId },
    orderBy: { viewCount: "desc" },
    take: 3,
    include: {
      business: {
        select: { name: true },
      },
      _count: {
        select: {
          favorites: true,
          rsvps: true,
        },
      },
    },
  });

  const enrichedEventHighlights = eventHighlights.map(({ _count, ...event }) => ({
    ...event,
    favoriteCount: _count.favorites,
    rsvpCount: _count.rsvps,
  }));

  const recentNotifications = await prisma.notification.findMany({
    where: {
      townId,
      createdAt: {
        gte: universalTrendStart,
      },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const deliveryStatusGroups = await prisma.notificationDelivery.groupBy({
    by: ["status"],
    where: {
      notification: {
        townId,
      },
    },
    _count: { _all: true },
  });

  const notificationStats = await prisma.notification.aggregate({
    where: {
      townId,
      status: { in: ["sent", "delivered"] },
    },
    _count: { _all: true },
    _sum: {
      audienceCount: true,
      deliveryCount: true,
    },
  });

  const drafts = notifications.filter((notification) => notification.status === "draft");
  const history = notifications.filter((notification) => notification.status !== "draft");

  const totalSent = notificationStats._count._all ?? 0;
  const totalRecipients = notificationStats._sum.audienceCount ?? 0;
  const totalDeliveries = notificationStats._sum.deliveryCount ?? 0;
  const aggregatedDeliveryRate =
    totalRecipients > 0 ? Math.round((totalDeliveries / totalRecipients) * 100) : 0;

  const deliveryStatusTotals: Record<string, number> = {};
  deliveryStatusGroups.forEach((group) => {
    deliveryStatusTotals[group.status ?? "unknown"] = group._count._all;
  });
  const deliveryRecordsTotal = Object.values(deliveryStatusTotals).reduce(
    (sum, value) => sum + value,
    0,
  );
  const deliveredRecordCount = deliveryStatusTotals.delivered ?? 0;
  const deliveryRateFromStatuses =
    deliveryRecordsTotal > 0
      ? Math.round((deliveredRecordCount / deliveryRecordsTotal) * 100)
      : null;
  const deliveryRateDisplay = deliveryRateFromStatuses ?? aggregatedDeliveryRate;

  const buildTrendBuckets = (windowDays: TrendWindow) => {
    const windowStart = new Date();
    windowStart.setHours(0, 0, 0, 0);
    windowStart.setDate(windowStart.getDate() - (windowDays - 1));
    const buckets = Array.from({ length: windowDays }).map((_, index) => {
      const bucketDate = new Date(windowStart);
      bucketDate.setDate(bucketDate.getDate() + index);
      return {
        label: new Intl.DateTimeFormat(locale, { weekday: "short" }).format(bucketDate),
        date: bucketDate,
        count: 0,
      };
    });
    const windowStartTime = windowStart.getTime();
    recentNotifications.forEach(({ createdAt }) => {
      if (createdAt < windowStart) return;
      const diff = Math.floor((createdAt.getTime() - windowStartTime) / 86_400_000);
      if (diff >= 0 && diff < windowDays) {
        buckets[diff].count += 1;
      }
    });
    return { buckets, maxCount: Math.max(...buckets.map((bucket) => bucket.count), 1) };
  };

  const trendBucketsByWindow = TREND_WINDOWS.reduce(
    (acc, windowDays) => ({
      ...acc,
      [windowDays]: buildTrendBuckets(windowDays),
    }),
    {} as Record<
      TrendWindow,
      {
        buckets: { label: string; date: Date; count: number }[];
        maxCount: number;
      }
    >,
  );

  const primaryTrendWindow = TREND_WINDOWS[0];
  const primaryTrend = trendBucketsByWindow[primaryTrendWindow];
  const trendBuckets = primaryTrend.buckets;
  const maxTrendCount = primaryTrend.maxCount;

  const trendSummaries = TREND_WINDOWS.map((windowDays) => {
    const { buckets } = trendBucketsByWindow[windowDays];
    const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
    const peak = Math.max(...buckets.map((bucket) => bucket.count));
    const label =
      windowDays === primaryTrendWindow ? "Weekly average" : `${windowDays}-day average`;
    return {
      windowDays,
      average: Math.round(total / windowDays),
      total,
      peak,
      label,
    };
  });

  const limitedBusinesses = businesses.filter(
    (business) => business.monthlyNotificationLimit !== null,
  );
  const totalQuotaLimit = limitedBusinesses.reduce(
    (sum, business) => sum + (business.monthlyNotificationLimit ?? 0),
    0,
  );
  const quotaUsed = limitedBusinesses.reduce(
    (sum, business) => sum + business.notificationUsage,
    0,
  );
  const businessesAtLimit = limitedBusinesses.filter(
    (business) =>
      business.monthlyNotificationLimit !== null &&
      business.notificationUsage >= business.monthlyNotificationLimit,
  ).length;
  const unlimitedBusinesses = businesses.filter(
    (business) => business.monthlyNotificationLimit === null,
  ).length;
  const quotaPercent =
    totalQuotaLimit > 0 ? Math.round((quotaUsed / totalQuotaLimit) * 100) : null;
  const deeplinkCount = history.filter((notification) => {
    const notificationData =
      typeof notification.data === "object" && notification.data !== null
        ? notification.data
        : null;
    return Boolean((notificationData as { deeplink?: string } | null)?.deeplink);
  }).length;
  const hasQuotaLimits = totalQuotaLimit > 0;

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">Town communications</p>
        <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">
          Draft and schedule push notifications for your residents and business subscribers.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Stykkishólmur snapshot</h2>
            <p className="text-sm text-slate-500">Seeded data keeps track of places, businesses, and town events.</p>
          </div>
          <Badge variant="secondary">{town.name}</Badge>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Places</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{placeCount}</p>
            <p className="text-xs text-slate-500">Listings available in the town directory</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Businesses</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{businesses.length}</p>
            <p className="text-xs text-slate-500">Owner accounts linked to Stykkishólmur</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Events</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{eventCount}</p>
            <p className="text-xs text-slate-500">Scheduled in the town calendar</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming events</h3>
            <p className="text-xs uppercase text-slate-400">Based on database seed data</p>
          </div>
          {upcomingEvents.length ? (
            upcomingEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-1 rounded-2xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>
                    {event.startsAt
                      ? new Date(event.startsAt).toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Date TBD"}
                  </span>
                  <span>&bull;</span>
                  <span>{event.location ?? "Town center"}</span>
                </div>
                {event.shortDescription ? (
                  <p className="text-xs text-slate-500 line-clamp-2">{event.shortDescription}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No upcoming events in the database yet.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">This month</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalSent}</p>
          <p className="text-sm text-slate-500">Notifications sent</p>
          {totalRecipients ? (
            <p className="text-xs text-slate-400">{totalRecipients} residents reached</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Quota status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {quotaPercent !== null ? `${quotaPercent}%` : "Unlimited"}
          </p>
          <p className="text-sm text-slate-500">
            {hasQuotaLimits
              ? `Used ${quotaUsed} of ${totalQuotaLimit} notifications`
              : "No per-tier limits configured yet."}
          </p>
          {hasQuotaLimits ? (
            <p className="text-xs uppercase tracking-wide text-amber-500/80">
              {businessesAtLimit} {businessesAtLimit === 1 ? "business is" : "businesses are"} at quota
            </p>
          ) : null}
          {unlimitedBusinesses ? (
            <p className="text-xs text-slate-400">{unlimitedBusinesses} unlimited plans</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Delivery rate</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {deliveryRateDisplay !== null ? `${deliveryRateDisplay}%` : "—"}
          </p>
          <p className="text-sm text-slate-500">
            {totalDeliveries} deliveries out of {totalRecipients || "—"} recipients
          </p>
          <p className="text-xs text-slate-400">{deeplinkCount} deep links triggered</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-slate-500">
            {Object.entries(deliveryStatusTotals).map(([status, count]) => (
              <span key={status} className="rounded-full border border-slate-200 px-2 py-1">
                {status} {count}
              </span>
            ))}
            {!Object.keys(deliveryStatusTotals).length ? (
              <span className="rounded-full border border-slate-200 px-2 py-1">No deliveries yet</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Alert segments</h2>
            <p className="text-sm text-slate-500">
              Configure notification segments for town alerts, weather/aurora updates, and business pushes.
            </p>
          </div>
          <Badge variant="outline">{segments.length} segments</Badge>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {segments.map((segment) => {
            const filterValues = Array.isArray(segment.filters) ? segment.filters : [];
            return (
              <form
                key={segment.id}
                action={updateSegmentAction}
                className="space-y-3 rounded-2xl border border-slate-100 p-4 shadow-sm"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="townId" value={townId} />
                <input type="hidden" name="id" value={segment.id} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{segment.name}</p>
                    <p className="text-xs text-slate-500">{segment.description ?? "Describe this segment"}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    Active
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={segment.isActive}
                      className="h-4 w-4 rounded border border-slate-300"
                    />
                  </label>
                </div>
                <Textarea
                  name="description"
                  rows={2}
                  defaultValue={segment.description ?? ""}
                  placeholder="Describe what notifications belong here"
                />
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_ALERT_FILTERS.map((filter) => (
                    <label key={filter.value} className="flex items-center gap-1 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        name="filters"
                        value={filter.value}
                        defaultChecked={filterValues.includes(filter.value)}
                      />
                      {filter.label}
                    </label>
                  ))}
                </div>
                <Button type="submit" variant="outline" className="rounded-full">
                  Save segment
                </Button>
              </form>
            );
          })}
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4">
          <form action={createSegmentAction} className="space-y-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="townId" value={townId} />
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="name" placeholder="Segment name" required />
              <Input name="slug" placeholder="segment-slug" required />
            </div>
            <Textarea
              name="description"
              rows={2}
              placeholder="Explain the notifications this segment covers"
            />
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ALERT_FILTERS.map((filter) => (
                <label key={filter.value} className="flex items-center gap-1 text-xs text-slate-500">
                  <input type="checkbox" name="filters" value={filter.value} />
                  {filter.label}
                </label>
              ))}
            </div>
            <Button type="submit" className="rounded-full">
              Add segment
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Localization controls</h2>
            <p className="text-sm text-slate-500">
              Switch locales, confirm translation readiness, and keep the composer in sync with the town’s languages.
            </p>
          </div>
          <Badge variant="outline">{locale.toUpperCase()} locale</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {locales.map((option) => (
            <Link
              key={option}
              href={`/${option}/admin/notifications`}
              className={`rounded-full border px-4 py-1 text-xs uppercase tracking-wide transition ${
                option === locale
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {option.toUpperCase()}
            </Link>
          ))}
        </div>
        <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2">
          <p>
            The composer already stores a `language` per draft, so you can keep EN + IS drafts side-by-side.
            Use the dropdown above to mirror whichever locale you want to preview.
          </p>
          <p>
            If translations are missing, the mobile app falls back to English. Add UI copy into the translation tables
            in `{locales[0]}` or `{locales[1]}` so residents see the right strings.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Event engagement</h2>
            <p className="text-sm text-slate-500">Track how citizens interact with featured/town events.</p>
          </div>
          <Badge variant="outline">{enrichedEventHighlights.length} tracked</Badge>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {enrichedEventHighlights.map((event) => (
            <article key={event.id} className="space-y-1 rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {event.isFeatured ? "Featured" : event.isTownEvent ? "Town" : "Community"}
                </p>
                <span className="text-xs text-slate-500">{event.business?.name ?? "Town event"}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
              <p className="text-xs text-slate-500">
                {event.location ?? "Location TBD"} •
                {" "}
                {event.startsAt
                  ? new Date(event.startsAt).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Date TBD"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{event.viewCount} views</span>
                <span>{event.favoriteCount} favorites</span>
                <span>{event.rsvpCount} RSVPs</span>
              </div>
            </article>
          ))}
          {!enrichedEventHighlights.length ? (
            <p className="text-sm text-slate-500">Engagement data will appear once citizens interact with events.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Billing overview</h2>
            <p className="text-sm text-slate-500">
              Town license + business invoices with upcoming due dates.
            </p>
          </div>
          <div className="text-xs uppercase text-slate-400">{totalInvoiceRecords} invoices tracked</div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Outstanding</p>
            <p className="text-3xl font-semibold text-slate-900">{currencyFormatter.format(totalOutstanding)}</p>
            <p className="text-xs text-slate-500">{dueSoonAmount ? currencyFormatter.format(dueSoonAmount) : "No amounts due soon"}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              {upcomingInvoices.length} invoice{upcomingInvoices.length === 1 ? "" : "s"} due within 14 days
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Upcoming due soon</p>
            <p className="text-3xl font-semibold text-slate-900">
              {upcomingInvoices.length ? upcomingInvoices.length : "—"}
            </p>
            <p className="text-xs text-slate-500">
              {upcomingInvoices.length
                ? `Next due ${new Date(upcomingInvoices[0].dueDate!).toLocaleDateString(locale, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "No due invoices recorded"}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              {currencyFormatter.format(dueSoonAmount)} total
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Status breakdown</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-slate-500">
              {invoiceStatusEntries.length
                ? invoiceStatusEntries.map(([status, data]) => (
                    <span key={status} className="rounded-full border border-slate-200 px-2 py-1">
                      {status} {data.count}
                    </span>
                  ))
                : "No records yet"}
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent invoices</h3>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Showing {recentInvoices.length} of {totalInvoiceRecords}
            </p>
          </div>
          {recentInvoices.length ? (
            recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {invoice.reference ?? invoice.id}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Due{" "}
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                  <Badge variant="secondary">{invoice.status}</Badge>
                  <span className="text-sm font-semibold text-slate-900">
                    {currencyFormatter.format(invoice.amount ?? 0)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No invoices have been issued yet.</p>
          )}
          {upcomingInvoices.length ? (
            <p className="text-xs text-slate-500">
              Reminder: invoices due soon are prioritized for billing outreach.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Weekly trend</h2>
            <p className="text-sm text-slate-500">
              Notifications created across the last {primaryTrendWindow} days
            </p>
          </div>
          <p className="text-xs uppercase text-slate-400">Updated live</p>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {trendBuckets.map((bucket) => {
            const heightPercent = Math.max((bucket.count / maxTrendCount) * 100, 6);
            return (
              <div key={bucket.label} className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end justify-center">
                  <div
                    className="w-1/2 rounded-full bg-primary"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-900">{bucket.count}</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {bucket.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {trendSummaries.map((summary) => (
            <div key={summary.windowDays} className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {summary.label}
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {summary.average}
                <span className="text-base text-slate-500">/day</span>
              </p>
              <p className="text-xs text-slate-500">
                Peak {summary.peak} • {summary.total} total
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create notification</h2>
            <p className="text-sm text-slate-500">
              Draft message content, choose a target, and send when you are ready.
            </p>
          </div>
          <form action={createNotificationDraftAction} className="flex gap-2">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="townId" value={townId} />
            <input type="hidden" name="title" value="Untitled notification" />
            <Button type="submit" className="rounded-full">
              Start draft
            </Button>
          </form>
        </div>

        {drafts.length ? (
          <div className="mt-6 space-y-6">
            {drafts.map((notification) => {
              const scheduledValue = notification.scheduledFor
                ? new Date(notification.scheduledFor).toISOString().slice(0, 16)
                : "";
              const targetFilterValue =
                typeof notification.targetFilter === "object" && notification.targetFilter !== null
                  ? notification.targetFilter
                  : null;
              const segmentValue = targetFilterValue?.segment ?? "all";
              const notificationData =
                typeof notification.data === "object" && notification.data !== null
                  ? notification.data
                  : null;
              const deeplinkValue =
                (notificationData as { deeplink?: string } | null)?.deeplink ?? "";
              return (
                <div
                  key={notification.id}
                  className="rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3"
                >
                  <form action={updateNotificationAction} className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="townId" value={townId} />
                    <input type="hidden" name="id" value={notification.id} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Title</label>
                      <Input name="title" defaultValue={notification.title} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Language</label>
                      <Select name="language" defaultValue={notification.language ?? "en"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="is">Icelandic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700">Body</label>
                      <Textarea
                        name="body"
                        rows={4}
                        placeholder="Message body"
                        defaultValue={notification.body ?? ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Target</label>
                      <Select
                        name="targetType"
                        defaultValue={notification.targetType ?? "TOWN"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TOWN">Town broadcast</SelectItem>
                          <SelectItem value="BUSINESS">Specific business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Business (if applicable)
                      </label>
                      <Select
                        name="businessId"
                        defaultValue={notification.businessId ?? undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Town broadcast</SelectItem>
                          {businesses.map((business) => (
                            <SelectItem key={business.id} value={business.id}>
                              {business.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Segment (town broadcast)
                      </label>
                      <Select name="segment" defaultValue={segmentValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Segment audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEGMENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-700">Deep link (optional)</label>
                      <Input
                        name="deeplink"
                        placeholder="e.g. townapp://events/123"
                        defaultValue={deeplinkValue}
                      />
                      <p className="text-xs text-slate-400">
                        Include a route so residents land directly in the right screen.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Schedule (optional)
                      </label>
                      <Input
                        type="datetime-local"
                        name="scheduledFor"
                        defaultValue={scheduledValue}
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button type="submit" variant="outline" className="rounded-full">
                        Save draft
                      </Button>
                    </div>
                  </form>
                  <div className="flex flex-col gap-2">
                    <SendNotificationForm
                      action={sendNotificationAction}
                      locale={locale}
                      townId={townId}
                      notificationId={notification.id}
                      disabled={notification.status !== "draft"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">No drafts yet.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Recent notifications</h2>
          <Badge variant="outline">{history.length} shown</Badge>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {history.map((notification) => {
            const segmentValue =
              typeof notification.targetFilter === "object" && notification.targetFilter !== null
                ? (notification.targetFilter as { segment?: string }).segment ?? "all"
                : "all";
            const segmentLabel = getSegmentLabel(segmentValue);
            const notificationData =
              typeof notification.data === "object" && notification.data !== null
                ? notification.data
                : null;
            const deeplinkValue =
              (notificationData as { deeplink?: string } | null)?.deeplink ?? "";
            return (
              <div
                key={notification.id}
                className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="text-xs text-slate-500">
                    {notification.business?.name ? (
                      <>
                        Sent by {notification.business.name}
                        {" • "}
                        {notification.sender?.firstName ?? notification.sender?.email ?? "Admin"}
                      </>
                    ) : (
                      <>
                        Town broadcast
                        {" • "}
                        {notification.sender?.firstName ?? notification.sender?.email ?? "Admin"}
                      </>
                    )}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {notification.targetType === "BUSINESS" ? "Business broadcast" : segmentLabel}
                  </p>
                  {notification.body ? (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{notification.body}</p>
                  ) : null}
                  {deeplinkValue ? (
                    <p className="mt-1 text-xs text-slate-500">{`Deeplink: ${deeplinkValue}`}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <Badge variant="secondary">{notification.status}</Badge>
                  {notification.audienceCount ? (
                    <span>{notification.audienceCount} recipients</span>
                  ) : null}
                  <span>
                    {notification.sentAt
                      ? `Sent ${notification.sentAt.toLocaleDateString()} ${notification.sentAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : `Created ${notification.createdAt.toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            );
          })}
          {!history.length ? (
            <p className="py-6 text-sm text-slate-500">
              No notifications have been sent yet. Create a draft to get started.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
