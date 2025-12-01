import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const TOWN_CENTER = {
  name: 'Stykkishólmur',
  latitude: 65.0752,
  longitude: -22.7339,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours >= 0 && hours <= 48;
}

function getEventCoordinates(event: { id: string; isTownEvent: boolean }) {
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const townIdOrSlug = searchParams.get('townId') || 'stykkisholmur';
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',') : [];

    // Look up town by slug or ID
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

    // Fetch places with coordinates
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
      },
      take: 100, // Limit for performance
    });

    // Fetch all events (UI has date filter)
    const events = await prisma.event.findMany({
      where: {
        townId,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        startsAt: true,
        location: true,
        isTownEvent: true,
        isFeatured: true,
      },
      take: 50, // Limit for performance
    });

    // Map places to expected format (lat/lng → latitude/longitude)
    const mappedPlaces = places.map((place) => ({
      ...place,
      latitude: place.lat,
      longitude: place.lng,
    }));

    // Get RSVP counts for events
    const eventIds = events.map(e => e.id);
    const rsvpCounts = eventIds.length > 0 ? await prisma.eventRSVP.groupBy({
      by: ['eventId'],
      where: { eventId: { in: eventIds } },
      _count: true,
    }) : [];

    const rsvpMap = Object.fromEntries(
      rsvpCounts.map(r => [r.eventId, r._count])
    );

    // Enrich events with computed fields and deterministic coordinates
    const enrichedEvents = events.map((event) => {
      const rsvpCount = rsvpMap[event.id] || 0;
      const coords = getEventCoordinates(event);
      return {
        id: event.id,
        name: event.title,
        type: event.isTownEvent ? 'TOWN' : event.isFeatured ? 'FEATURED' : 'COMMUNITY',
        latitude: coords.latitude,
        longitude: coords.longitude,
        imageUrl: event.imageUrl,
        startDate: event.startsAt.toISOString(),
        location: event.location,
        rsvpCount,
        isTownEvent: event.isTownEvent,
        isFeatured: event.isFeatured,
        isHot: rsvpCount >= 20,
        isHappeningSoon: isWithin48Hours(event.startsAt),
      };
    });

    // Return town data from database if available, fallback to default
    const townData = town ? {
      name: town.name,
      latitude: town.lat ?? TOWN_CENTER.latitude,
      longitude: town.lng ?? TOWN_CENTER.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    } : TOWN_CENTER;

    return Response.json({
      places: mappedPlaces,
      events: enrichedEvents,
      town: townData,
    });
  } catch (error) {
    console.error('Map data error:', error);
    return Response.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}
