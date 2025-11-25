import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours >= 0 && hours <= 48;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const townId = searchParams.get('townId') || 'stykkisholmur';
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',') : [];

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

    // Fetch upcoming events (use location from related place if no direct coordinates)
    const events = await prisma.event.findMany({
      where: {
        townId,
        startsAt: { gte: new Date() },
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

    // Enrich events with computed fields and add mock coordinates for now
    const enrichedEvents = events.map((event) => {
      const rsvpCount = rsvpMap[event.id] || 0;
      return {
        id: event.id,
        name: event.title,
        type: event.isTownEvent ? 'TOWN' : event.isFeatured ? 'FEATURED' : 'COMMUNITY',
        latitude: 65.0752 + (Math.random() - 0.5) * 0.02, // Mock coordinates near town center
        longitude: -22.7339 + (Math.random() - 0.5) * 0.02,
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

    // Town center (Stykkishólmur, Iceland)
    const town = {
      name: 'Stykkishólmur',
      latitude: 65.0752,
      longitude: -22.7339,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    return Response.json({
      places: mappedPlaces,
      events: enrichedEvents,
      town,
    });
  } catch (error) {
    console.error('Map data error:', error);
    return Response.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}
