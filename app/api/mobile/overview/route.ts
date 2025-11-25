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

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const toAbsoluteUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    const prefix = value.startsWith("/") ? "" : "/";
    return `${apiBaseUrl}${prefix}${value}`;
  };
  const placesWithAbsoluteUrls = places.map((place) => ({
    ...place,
    imageUrl: toAbsoluteUrl(place.imageUrl),
    featuredImageUrl: toAbsoluteUrl(place.featuredImageUrl),
  }));
  const eventsWithAbsoluteUrls = events.map(({ _count, ...event }) => ({
    ...event,
    imageUrl: toAbsoluteUrl(event.imageUrl),
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
      places: placesWithAbsoluteUrls,
      events: eventsWithAbsoluteUrls,
    },
  });
}
