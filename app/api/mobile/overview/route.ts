import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getStaticMapUrl } from "../../../../lib/google";
import { getWeatherForecast } from "../../../../lib/weather";
import { fetchAuroraForecast } from "../../../../lib/aurora";

const DEFAULT_CENTER = (() => {
  const coords = process.env.NEXT_PUBLIC_TOWN_CENTER_COORDS ?? "65.074,-22.730";
  const [latStr, lngStr] = coords.split(",");
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  return {
    lat: Number.isFinite(lat) ? lat : 65.074,
    lng: Number.isFinite(lng) ? lng : -22.73,
  };
})();

const ROAD_MAP_URL =
  "https://www.road.is/travel-info/road-conditions-and-weather/entire-country/island1e.html";

export const dynamic = "force-dynamic";

export async function GET() {
  const town = await prisma.town.findFirst({
    orderBy: { name: "asc" },
  });

  if (!town) {
    return NextResponse.json({ error: "No town configured" }, { status: 500 });
  }

  const [weather, aurora, places, events, placeCount, eventCount, businessCount] =
    await Promise.all([
      getWeatherForecast(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      fetchAuroraForecast(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      prisma.place.findMany({
        where: { townId: town.id },
        orderBy: [
          { rating: { sort: "desc", nulls: "last" } },
          { ratingCount: { sort: "desc", nulls: "last" } },
          { name: "asc" },
        ],
        take: 6,
      }),
      prisma.event.findMany({
        where: { townId: town.id },
        orderBy: { startsAt: { sort: "asc", nulls: "last" } },
        take: 8,
        include: {
          business: {
            select: { id: true, name: true },
          },
          _count: {
            select: { favorites: true, rsvps: true },
          },
        },
      }),
      prisma.place.count({ where: { townId: town.id } }),
      prisma.event.count({ where: { townId: town.id } }),
      prisma.business.count({ where: { townId: town.id } }),
    ]);

  // Return relative paths - mobile app's resolveImageUrl() handles conversion to absolute URLs
  const placesData = places.map((place) => ({
    ...place,
    imageUrl: place.imageUrl,
    featuredImageUrl: place.featuredImageUrl,
  }));
  const eventsData = events.map(({ _count, ...event }) => ({
    ...event,
    imageUrl: event.imageUrl,
    favoriteCount: _count.favorites,
    rsvpCount: _count.rsvps,
  }));

  const mapUrl = getStaticMapUrl({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    width: 800,
    height: 400,
    zoom: 12,
  });

  return NextResponse.json({
    data: {
      townName: town.name,
      weather,
      aurora,
      mapUrl,
      roadMapUrl: ROAD_MAP_URL,
      roadCondition: 'good',
      counts: {
        placeCount,
        eventCount,
        businessCount,
      },
      places: placesData,
      events: eventsData,
    },
  });
}
