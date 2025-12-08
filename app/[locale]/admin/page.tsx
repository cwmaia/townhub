import "server-only";

import { PlaceType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { locales, type AppLocale } from "../../../lib/i18n";
import Image from "next/image";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import PlaceListClient, { EventListClient } from "./PlaceListClient";
import { StatCard } from "../../../components/dashboard/StatCard";
import { ActivityTimelineCompact } from "../../../components/dashboard/ActivityTimelineCompact";
import { QuickActionsCompact } from "../../../components/dashboard/QuickActionsCompact";
import { RevenueSales } from "../../../components/dashboard/RevenueSales";
import { TownPerformance } from "../../../components/dashboard/TownPerformance";
import { BusinessPerformance } from "../../../components/dashboard/BusinessPerformance";
import { RecentNotifications } from "../../../components/dashboard/RecentNotifications";
import { Users, MapPin, Calendar, Bell, Plus } from "lucide-react";

import { requireRole } from "../../../lib/auth/guards";
import { resolveAdminTownContext } from "./helpers";
import { PlaceToVerify, VerificationQueue } from "./VerificationQueue";

const PLACE_TYPES = Object.values(PlaceType);
const FEATURED_EVENT_TIERS = new Set(["growth", "premium"]);
const FEATURED_EVENT_LIMIT = 5;

type AdminPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const createPlaceAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale") as string;
  const name = formData.get("name")?.toString().trim();
  const type = formData.get("type")?.toString() as PlaceType | undefined;
  const description = formData.get("description")?.toString() ?? "";
  const website = formData.get("website")?.toString() || undefined;
  const address = formData.get("address")?.toString() || undefined;
  const tags = formData
    .get("tags")
    ?.toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!name || !type) return;

  const { townId } = await resolveAdminTownContext(formData);

  await prisma.place.create({
    data: {
      name,
      type,
      description,
      website,
      address,
      tags: tags ?? [],
      townId,
    },
  });

  revalidatePath(`/${locale}/admin`);
};

const updatePlaceAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  const description = formData.get("description")?.toString() ?? "";
  const tags = formData
    .get("tags")
    ?.toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await resolveAdminTownContext(formData);

  await prisma.place.update({
    where: { id },
    data: {
      description,
      tags: tags ?? [],
    },
  });

  revalidatePath(`/${locale}/admin`);
};

const deletePlaceAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  await resolveAdminTownContext(formData);

  await prisma.place.delete({
    where: { id },
  });

  revalidatePath(`/${locale}/admin`);
};

const createTownEventAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const title = formData.get("title")?.toString()?.trim();
  const description = formData.get("description")?.toString() ?? "";
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;
  const location = formData.get("location")?.toString() || undefined;
  const startsAt = formData.get("startsAt")?.toString();
  const endsAt = formData.get("endsAt")?.toString();

  if (!title || !location || !startsAt) return;

  const { townId } = await resolveAdminTownContext(formData);

  await prisma.event.create({
    data: {
      title,
      description,
      imageUrl,
      location,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      townId,
      isTownEvent: true,
      isFeatured: false,
    },
  });

  revalidatePath(`/${locale}/admin`);
};

const createFeaturedEventAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const title = formData.get("title")?.toString()?.trim();
  const description = formData.get("description")?.toString() ?? "";
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;
  const location = formData.get("location")?.toString();
  const startsAt = formData.get("startsAt")?.toString();
  const endsAt = formData.get("endsAt")?.toString();
  const businessId = formData.get("businessId")?.toString();

  if (!title || !location || !startsAt || !businessId) return;

  const { townId } = await resolveAdminTownContext(formData);

  const business = await prisma.business.findFirst({
    where: { id: businessId, townId },
    include: {
      subscription: {
        select: {
          id: true,
          slug: true,
          eventLimit: true,
          name: true,
        },
      },
    },
  });

  if (!business) {
    throw new Error("Business not found for this town.");
  }

  const subscriptionSlug = business.subscription?.slug;
  if (!subscriptionSlug || !FEATURED_EVENT_TIERS.has(subscriptionSlug)) {
    throw new Error("Featured events are only available for Pro businesses.");
  }

  const featuredCount = await prisma.event.count({
    where: {
      businessId: business.id,
      isFeatured: true,
      townId,
    },
  });

  if (featuredCount >= FEATURED_EVENT_LIMIT) {
    throw new Error(`Businesses can only showcase up to ${FEATURED_EVENT_LIMIT} featured events.`);
  }

  const eventLimit = business.subscription?.eventLimit;
  if (eventLimit !== null && eventLimit !== undefined && business.eventUsage >= eventLimit) {
    throw new Error("Business has reached its monthly event limit.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.event.create({
      data: {
        title,
        description,
        imageUrl,
        location,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        townId,
        businessId: business.id,
        isFeatured: true,
        isTownEvent: false,
      },
    });

    await tx.business.update({
      where: { id: business.id },
      data: {
        eventUsage: { increment: 1 },
      },
    });
  });

  revalidatePath(`/${locale}/admin`);
};
const updateEventAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString()?.trim();
  const location = formData.get("location")?.toString() || "";
  const description = formData.get("description")?.toString() ?? "";

  if (!id || !title) return;

  await resolveAdminTownContext(formData);

  await prisma.event.update({
    where: { id },
    data: {
      title,
      location,
      description,
    },
  });

  revalidatePath(`/${locale}/admin`);
};
const deleteEventAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  await resolveAdminTownContext(formData);

  await prisma.event.delete({ where: { id } });
  revalidatePath(`/${locale}/admin`);
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  if (auth.profile.role !== UserRole.SUPER_ADMIN && !auth.profile.townId) {
    redirect(`/${locale}`);
  }

  const managedTownId =
    auth.profile.townId ??
    (
      await prisma.town.findFirst({
        orderBy: { name: "asc" },
      })
    )?.id;

  if (!managedTownId) {
    throw new Error("Town context is required.");
  }

  const managedTown = await prisma.town.findUnique({
    where: { id: managedTownId },
  });

  if (!managedTown) {
    throw new Error("Managed town not found.");
  }

  const [
    places,
    events,
    businesses,
    verificationPlacesData,
    verificationCounts,
  ] = await Promise.all([
    prisma.place.findMany({
      where: { townId: managedTownId },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { townId: managedTownId },
      orderBy: { startsAt: { sort: "asc", nulls: "last" } },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            subscription: {
              select: {
                slug: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    }),
    prisma.business.findMany({
      where: { townId: managedTownId },
      include: {
        subscription: {
          select: {
            slug: true,
            name: true,
            eventLimit: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.place.findMany({
      where: {
        townId: managedTownId,
        OR: [{ locationVerified: false }, { imageVerified: false }],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        imageUrl: true,
        locationVerified: true,
        imageVerified: true,
      },
    }),
    prisma.$transaction([
      prisma.place.count({
        where: {
          townId: managedTownId,
          OR: [{ locationVerified: false }, { imageVerified: false }],
        },
      }),
      prisma.place.count({
        where: {
          townId: managedTownId,
          candidateImageUrls: { isEmpty: false },
          OR: [{ locationVerified: false }, { imageVerified: false }],
        },
      }),
      prisma.place.count({
        where: {
          townId: managedTownId,
          locationVerified: true,
          imageVerified: true,
        },
      }),
    ]),
  ]);

  const [unverifiedCount, pendingReviewCount, verifiedCount] = verificationCounts;
  const verificationPlaces: PlaceToVerify[] = verificationPlacesData.map((place) => ({
    id: place.id,
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    imageUrl: place.imageUrl,
    locationVerified: place.locationVerified,
    imageVerified: place.imageVerified,
  }));

  const townEvents = events.filter((event) => event.isTownEvent);
  const featuredEvents = events.filter((event) => event.isFeatured);
  const townEventHighlights = townEvents.slice(0, 3);
  const eligibleFeaturedBusinesses = businesses.filter((business) =>
    FEATURED_EVENT_TIERS.has(business.subscription?.slug ?? "")
  );
  const featuredEventCounts = featuredEvents.reduce<Record<string, number>>((acc, event) => {
    if (!event.businessId) return acc;
    acc[event.businessId] = (acc[event.businessId] ?? 0) + 1;
    return acc;
  }, {});

  const formatDateTime = (value?: Date | string | null) => {
    if (!value) return "TBD";
    return new Date(value).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate recent places (last 7 days)
  const recentPlacesCount = places.filter(
    (p) => p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Get recent activity (compact format)
  const recentActivity = [
    ...places.slice(0, 3).map((place) => ({
      id: `place-${place.id}`,
      icon: <MapPin className="w-4 h-4" />,
      title: `${place.name} added to ${place.type.toLowerCase()}`,
      timestamp: new Date(place.createdAt).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }) + ' • ' + new Date(place.createdAt).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    })),
    ...events.slice(0, 3).map((event) => ({
      id: `event-${event.id}`,
      icon: <Calendar className="w-4 h-4" />,
      title: `${event.title} • ${event._count.rsvps} RSVPs`,
      timestamp: new Date(event.createdAt).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }) + ' • ' + new Date(event.createdAt).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Dashboard Header with Quick Actions */}
      <div className="flex items-start justify-between gap-4">
        <header className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Town overview</p>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-[#003580] font-medium">
            {managedTown?.name ?? "Your town"}
          </p>
        </header>

        {/* Quick Actions - Brand Blue accent */}
        <div className="flex items-center gap-2">
          <a
            href="#create-place"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                       hover:border-[#003580]/30 hover:bg-[#003580]/5 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#003580]" />
            <span className="text-sm font-medium text-slate-700">Place</span>
          </a>
          <a
            href="#create-event"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                       hover:border-[#003580]/30 hover:bg-[#003580]/5 transition-colors"
          >
            <Plus className="w-4 h-4 text-[#003580]" />
            <span className="text-sm font-medium text-slate-700">Event</span>
          </a>
          <a
            href="/admin/notifications"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#003580] text-white
                       hover:bg-[#003580]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Alert</span>
          </a>
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          value="342"
          label="Active Users"
          trend={{ value: '+12%', direction: 'up' }}
          subtitle="+28 this week"
          variant="blue"
        />
        <StatCard
          icon={<MapPin className="w-5 h-5" />}
          value={places.length}
          label="Places Listed"
          trend={{ value: '+5%', direction: 'up' }}
          subtitle={`${recentPlacesCount} this week`}
          variant="green"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          value={events.length}
          label="Upcoming Events"
          trend={{ value: '+8%', direction: 'up' }}
          subtitle={`${townEvents.length} town`}
          variant="purple"
        />
        <StatCard
          icon={<Bell className="w-5 h-5" />}
          value="98%"
          label="Notification Reach"
          trend={{ value: '+2%', direction: 'up' }}
          subtitle="Great engagement"
          variant="slate"
        />
      </div>

      {/* Two-Column Layout: Revenue & Sales + Town Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Revenue & Sales */}
        <RevenueSales
          revenue="ISK 240K"
          notificationsPurchased={1248}
          eventsSold={342}
          subscriptionRevenue="ISK 180K"
        />

        {/* Right: Town/Business Performance based on role */}
        {auth.profile.role === UserRole.SUPER_ADMIN ? (
          <TownPerformance />
        ) : (
          <BusinessPerformance />
        )}
      </div>

      {/* Two-Column Layout: Recent Activity + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Recent Activity */}
        <ActivityTimelineCompact activities={recentActivity} />

        {/* Right: Recent Notifications */}
        <RecentNotifications />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Town events</h2>
            <p className="text-sm text-slate-500">
              Spotlight three upcoming town-organized activities with photos, location, and times.
            </p>
          </div>
          <Badge variant="secondary">{townEventHighlights.length} highlighted</Badge>
        </div>
        <div className="mt-4">
          {townEventHighlights.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {townEventHighlights.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
                >
                  <div className="relative h-36 w-full">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs uppercase tracking-wide text-slate-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{event.location ?? "Town center"}</p>
                    <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                    <p className="text-sm text-slate-500">{event.description}</p>
                    <p className="mt-2 text-xs text-slate-400">{formatDateTime(event.startsAt)} - {formatDateTime(event.endsAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No town events yet. Create one below to feature it in the app.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Create a place</h2>
        <form action={createPlaceAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="townId" value={managedTownId} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <Input id="name" name="name" required placeholder="Place name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select name="type" defaultValue={PlaceType.LODGING}>
              <SelectTrigger>
                <SelectValue placeholder="Select place type" />
              </SelectTrigger>
              <SelectContent>
                {PLACE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <Textarea id="description" name="description" placeholder="Short description" rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="website">
              Website
            </label>
            <Input id="website" name="website" placeholder="https://" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="address">
              Address
            </label>
            <Input id="address" name="address" placeholder="Address" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="tags">
              Tags (comma separated)
            </label>
            <Input id="tags" name="tags" placeholder="Hotel, Spa, $$" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="rounded-full bg-[#003580] hover:bg-[#003580]/90 px-6 text-white">
              Create place
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Existing places</h2>
            <p className="text-sm text-slate-500">Browse, search, and edit places in a compact card view.</p>
          </div>
          <Badge variant="outline">{places.length} entries</Badge>
        </div>
        <div className="mt-6">
          <PlaceListClient
            places={places.map((place) => ({
              id: place.id,
              name: place.name,
              type: place.type,
              description: place.description,
              tags: place.tags ?? [],
              rating: place.rating,
              createdAt: place.createdAt.toISOString(),
            }))}
            locale={locale}
            townId={managedTownId}
            updateAction={updatePlaceAction}
            deleteAction={deletePlaceAction}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Manage events</h2>
            <p className="text-sm text-slate-500">
              Publish town events for residents and featured business experiences with RSVP-ready reminders.
            </p>
          </div>
          <Badge variant="outline">{events.length} total events</Badge>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <form
            action={createTownEventAction}
            className="space-y-3 rounded-2xl border border-slate-100 p-4"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="townId" value={managedTownId} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Town event title</label>
              <Input name="title" placeholder="Harbor market at 12" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Location / address</label>
              <Input name="location" placeholder="Harbor square" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Image URL</label>
              <Input name="imageUrl" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea name="description" rows={3} placeholder="Share what people need to know" />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">Starts at</label>
                <Input name="startsAt" type="datetime-local" required />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">Ends at</label>
                <Input name="endsAt" type="datetime-local" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="rounded-full bg-[#003580] hover:bg-[#003580]/90 px-6 text-white">
                Publish town event
              </Button>
            </div>
          </form>

          <form
            action={createFeaturedEventAction}
            className="space-y-3 rounded-2xl border border-slate-100 p-4"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="townId" value={managedTownId} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Business</label>
              <Select name="businessId" defaultValue={eligibleFeaturedBusinesses[0]?.id ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleFeaturedBusinesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}{" "}
                      {business.subscription?.name
                        ? `• ${business.subscription.name}`
                        : "• Paid plan"}
                      {featuredEventCounts[business.id]
                        ? ` (${featuredEventCounts[business.id]}/${FEATURED_EVENT_LIMIT})`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eligibleFeaturedBusinesses.length === 0 ? (
                <p className="text-xs text-amber-500">
                  No Pro businesses available yet. Upgrade their plan to Premium to unlock featured events.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Each business can showcase up to {FEATURED_EVENT_LIMIT} featured events at a time.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input name="title" placeholder="Featured supper at Ólis" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Location</label>
              <Input name="location" placeholder="OLÍS Gas Station" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Image URL</label>
              <Input name="imageUrl" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea name="description" rows={3} placeholder="Tuesdays perfect ribs..." />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">Starts at</label>
                <Input name="startsAt" type="datetime-local" required />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">Ends at</label>
                <Input name="endsAt" type="datetime-local" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="outline"
                className="rounded-full px-6"
                disabled={eligibleFeaturedBusinesses.length === 0}
              >
                Publish featured event
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <EventListClient
            events={events.map((event) => ({
              id: event.id,
              title: event.title,
              type: event.isTownEvent ? 'TOWN' : event.isFeatured ? 'FEATURED' : 'COMMUNITY',
              location: event.location,
              description: event.description,
              startsAt: event.startsAt?.toISOString() ?? new Date().toISOString(),
              endsAt: event.endsAt?.toISOString() ?? null,
              rsvpCount: event._count?.rsvps ?? 0,
              viewCount: event.viewCount ?? 0,
              createdAt: event.createdAt.toISOString(),
            }))}
            locale={locale}
            townId={managedTownId}
            updateAction={updateEventAction}
            deleteAction={deleteEventAction}
          />
        </div>
      </section>
      <VerificationQueue places={verificationPlaces} />
    </div>
  );
}
