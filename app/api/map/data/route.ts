import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const TOWN_CENTER = {
  name: 'Stykkishólmur',
  latitude: 65.0752,
  longitude: -22.7339,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const PLACE_MARKER_COLORS: Record<string, string> = {
  TOWN_SERVICE: '#2563eb',
  BUSINESS_FREE: '#86efac',
  BUSINESS_STARTER: '#22c55e',
  BUSINESS_GROWTH: '#14b8a6',
  BUSINESS_PREMIUM: '#D4AF37',
};

const EVENT_MARKER_COLORS: Record<string, string> = {
  EVENT_TOWN: '#dc2626',
  EVENT_COMMUNITY: '#22c55e',
  EVENT_FEATURED: '#fbbf24',
  EVENT_PREMIUM: '#FFD700',
};

type BusinessSummary = {
  id: string;
  name: string;
  slug: string | null;
  subscriptionTier: string | null;
  subscriptionSlug: string | null;
  subscriptionPriority: number | null;
};

type EventTimeFlags = {
  isToday: boolean;
  isThisWeek: boolean;
  isUpcoming: boolean;
  isHappeningNow: boolean;
};

type MarkerMeta = {
  markerCategory: string;
  markerColor: string;
  isPremium: boolean;
  shouldAnimate: boolean;
};

const getEventTimeFlags = (startsAt: Date | null, endsAt: Date | null): EventTimeFlags => {
  if (!startsAt) {
    return {
      isToday: false,
      isThisWeek: false,
      isUpcoming: false,
      isHappeningNow: false,
    };
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const weekEnd = new Date(startOfToday);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const start = startsAt;
  const defaultEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const end = endsAt ?? defaultEnd;

  const isToday = start >= startOfToday && start < startOfTomorrow;
  const isThisWeek = start >= startOfToday && start < weekEnd;
  const isUpcoming = start.getTime() > now.getTime();
  const isHappeningNow = start <= now && end >= now;

  return {
    isToday,
    isThisWeek,
    isUpcoming,
    isHappeningNow,
  };
};

const summarizeBusiness = (business: any): BusinessSummary | null => {
  if (!business) return null;
  return {
    id: business.id,
    name: business.name,
    slug: business.slug ?? null,
    subscriptionTier: business.subscription?.name ?? null,
    subscriptionSlug: business.subscription?.slug ?? null,
    subscriptionPriority: business.subscription?.priority ?? null,
  };
};

const getPlaceMarkerMetadata = (place: {
  type: string;
  business: { subscription?: { priority: number | null } | null } | null;
}): MarkerMeta => {
  if (place.type === 'TOWN_SERVICE') {
    return {
      markerCategory: 'TOWN_SERVICE',
      markerColor: PLACE_MARKER_COLORS.TOWN_SERVICE,
      isPremium: false,
      shouldAnimate: false,
    };
  }

  const priority = place.business?.subscription?.priority ?? 0;
  if (priority >= 3) {
    return {
      markerCategory: 'BUSINESS_PREMIUM',
      markerColor: PLACE_MARKER_COLORS.BUSINESS_PREMIUM,
      isPremium: true,
      shouldAnimate: false,
    };
  }

  if (priority >= 2) {
    return {
      markerCategory: 'BUSINESS_GROWTH',
      markerColor: PLACE_MARKER_COLORS.BUSINESS_GROWTH,
      isPremium: false,
      shouldAnimate: false,
    };
  }

  if (priority >= 1) {
    return {
      markerCategory: 'BUSINESS_STARTER',
      markerColor: PLACE_MARKER_COLORS.BUSINESS_STARTER,
      isPremium: false,
      shouldAnimate: false,
    };
  }

  return {
    markerCategory: 'BUSINESS_FREE',
    markerColor: PLACE_MARKER_COLORS.BUSINESS_FREE,
    isPremium: false,
    shouldAnimate: false,
  };
};

const getEventMarkerMetadata = (
  event: {
    isTownEvent: boolean;
    isFeatured: boolean;
    business: { subscription?: { priority: number | null } | null } | null;
  },
  timeFlags: EventTimeFlags
): MarkerMeta => {
  const priority = event.business?.subscription?.priority ?? 0;
  if (priority >= 3) {
    return {
      markerCategory: 'EVENT_PREMIUM',
      markerColor: EVENT_MARKER_COLORS.EVENT_PREMIUM,
      isPremium: true,
      shouldAnimate: timeFlags.isUpcoming,
    };
  }

  if (event.isTownEvent) {
    return {
      markerCategory: 'EVENT_TOWN',
      markerColor: EVENT_MARKER_COLORS.EVENT_TOWN,
      isPremium: false,
      shouldAnimate: timeFlags.isUpcoming,
    };
  }

  if (event.isFeatured) {
    return {
      markerCategory: 'EVENT_FEATURED',
      markerColor: EVENT_MARKER_COLORS.EVENT_FEATURED,
      isPremium: false,
      shouldAnimate: timeFlags.isUpcoming,
    };
  }

  return {
    markerCategory: 'EVENT_COMMUNITY',
    markerColor: EVENT_MARKER_COLORS.EVENT_COMMUNITY,
    isPremium: false,
    shouldAnimate: timeFlags.isUpcoming,
  };
};

const getEventCoordinates = (event: {
  latitude: number | null;
  longitude: number | null;
  id: string;
  isTownEvent: boolean;
}) => {
  if (event.latitude !== null && event.longitude !== null) {
    return {
      latitude: event.latitude,
      longitude: event.longitude,
    };
  }

  if (event.isTownEvent) {
    return {
      latitude: TOWN_CENTER.latitude,
      longitude: TOWN_CENTER.longitude,
    };
  }

  const hash = event.id
    .slice(0, 5)
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const angle = ((hash % 360) * Math.PI) / 180;
  const distance = 0.005 + (hash % 10) * 0.001;
  return {
    latitude: TOWN_CENTER.latitude + Math.cos(angle) * distance,
    longitude: TOWN_CENTER.longitude + Math.sin(angle) * distance,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const townIdOrSlug = searchParams.get('townId') || 'stykkisholmur';
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',') : [];

    const town = await prisma.town.findFirst({
      where: {
        OR: [
          { id: townIdOrSlug },
          { slug: townIdOrSlug },
          { name: { contains: townIdOrSlug, mode: 'insensitive' } },
        ],
      },
    });

    const townId = town?.id;

    if (!townId) {
      return Response.json({
        places: [],
        events: [],
        town: TOWN_CENTER,
      });
    }

    const places = await prisma.place.findMany({
      where: {
        townId,
        lat: { not: null },
        lng: { not: null },
        ...(categories.length > 0 && { type: { in: categories } }),
      },
      select: {
        id: true,
        name: true,
        type: true,
        lat: true,
        lng: true,
        imageUrl: true,
        rating: true,
        ratingCount: true,
        tags: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscription: {
              select: {
                id: true,
                name: true,
                slug: true,
                priority: true,
              },
            },
          },
        },
      },
      take: 100,
    });

    const events = await prisma.event.findMany({
      where: {
        townId,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        startsAt: true,
        endsAt: true,
        location: true,
        isTownEvent: true,
        isFeatured: true,
        latitude: true,
        longitude: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscription: {
              select: {
                id: true,
                name: true,
                slug: true,
                priority: true,
              },
            },
          },
        },
      },
      take: 50,
    });

    const eventIds = events.map((event) => event.id);
    const rsvpCounts =
      eventIds.length > 0
        ? await prisma.eventRSVP.groupBy({
            by: ['eventId'],
            where: { eventId: { in: eventIds } },
            _count: true,
          })
        : [];

    const rsvpMap = Object.fromEntries(rsvpCounts.map((group) => [group.eventId, group._count]));

    const mappedPlaces = places.map((place) => {
      const business = summarizeBusiness(place.business);
      const meta = getPlaceMarkerMetadata(place);
      return {
        id: place.id,
        name: place.name,
        type: place.type,
        latitude: place.lat,
        longitude: place.lng,
        imageUrl: place.imageUrl,
        rating: place.rating,
        ratingCount: place.ratingCount,
        tags: place.tags,
        business,
        subscriptionTier: business?.subscriptionTier ?? null,
        subscriptionPriority: business?.subscriptionPriority ?? null,
        markerCategory: meta.markerCategory,
        markerColor: meta.markerColor,
        isPremium: meta.isPremium,
        shouldAnimate: meta.shouldAnimate,
      };
    });

    const enrichedEvents = events.map((event) => {
      const rsvpCount = rsvpMap[event.id] ?? 0;
      const coords = getEventCoordinates(event);
      const timeFlags = getEventTimeFlags(event.startsAt ?? null, event.endsAt ?? null);
      const meta = getEventMarkerMetadata(event, timeFlags);
      const business = summarizeBusiness(event.business);
      return {
        id: event.id,
        name: event.title,
        type: event.isTownEvent ? 'TOWN' : event.isFeatured ? 'FEATURED' : 'COMMUNITY',
        latitude: coords.latitude,
        longitude: coords.longitude,
        imageUrl: event.imageUrl,
        startDate: event.startsAt?.toISOString() ?? null,
        endDate: event.endsAt?.toISOString() ?? null,
        location: event.location,
        rsvpCount,
        isTownEvent: event.isTownEvent,
        isFeatured: event.isFeatured,
        isHot: rsvpCount >= 20,
        ...timeFlags,
        markerCategory: meta.markerCategory,
        markerColor: meta.markerColor,
        isPremium: meta.isPremium,
        shouldAnimate: meta.shouldAnimate,
        business,
        subscriptionTier: business?.subscriptionTier ?? null,
        subscriptionPriority: business?.subscriptionPriority ?? null,
      };
    });

    const townData = town
      ? {
          name: town.name,
          latitude: town.latitude ?? TOWN_CENTER.latitude,
          longitude: town.longitude ?? TOWN_CENTER.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : TOWN_CENTER;

    return Response.json({
      places: mappedPlaces,
      events: enrichedEvents,
      town: townData,
    });
  } catch (error) {
    console.error('Map data error:', error);
    return Response.json({ error: 'Failed to fetch map data' }, { status: 500 });
  }
}
