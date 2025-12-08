import { notFound } from "next/navigation";
import TownHubClient from "../../(components)/TownHubClient";
import Header from "../../(components)/Header";
import type { DestinationEstimate } from "../../(components)/FromHereToDialog";
import type { ProfileSummary, TownCenter } from "../../(components)/types";
import { prisma } from "../../../lib/db";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { getWeatherForecast } from "../../../lib/weather";
import { fetchAuroraForecast } from "../../../lib/aurora";
import { getStaticMapUrl, distanceMatrix } from "../../../lib/google";
import { estimateTravelTimes } from "../../../lib/geo";
import { locales, type AppLocale } from "../../../lib/i18n";
import { UserRole } from "@prisma/client";

const TOWN_NAME = process.env.NEXT_PUBLIC_TOWN_NAME ?? "Stykkishólmur";

const DEFAULT_CENTER: TownCenter = (() => {
  const coords = process.env.NEXT_PUBLIC_TOWN_CENTER_COORDS ?? "65.074,-22.730";
  const [lat, lng] = coords.split(",").map((value) => parseFloat(value.trim()));
  return {
    lat: Number.isFinite(lat) ? lat : 65.074,
    lng: Number.isFinite(lng) ? lng : -22.73,
  };
})();

const PRESET_DESTINATIONS = [
  {
    id: "reykjavik",
    name: "Reykjavík",
    lat: 64.1466,
    lng: -21.9426,
  },
  {
    id: "kef",
    name: "KEF Airport",
    lat: 63.985,
    lng: -22.6056,
  },
  {
    id: "blue-lagoon",
    name: "Blue Lagoon",
    lat: 63.8804,
    lng: -22.4495,
  },
  {
    id: "golden-circle",
    name: "Golden Circle",
    lat: 64.255,
    lng: -20.877,
  },
];

const fetchDestinations = async (center: TownCenter): Promise<DestinationEstimate[]> => {
  const enriched = await Promise.all(
    PRESET_DESTINATIONS.map(async (destination) => {
      const result = await distanceMatrix(center, destination, "driving");
      const estimates = estimateTravelTimes(result.distanceKm);
      return {
        ...destination,
        distanceKm: result.distanceKm,
        durations: {
          car: result.durationMinutes,
          transit: estimates.transit.minutes,
          walk: estimates.walk.minutes,
        },
        viaService: result.viaService,
      } satisfies DestinationEstimate;
    })
  );

  return enriched;
};

const getProfile = async (): Promise<ProfileSummary | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const existing = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    return {
      firstName: existing.firstName,
      avatarUrl: existing.avatarUrl,
      role: existing.role,
    };
  }

  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user.email?.split("@")[0] ??
    "Guest";

  const isAdmin = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim())
    .includes(user.email ?? "");

  const created = await prisma.profile.create({
    data: {
      userId: user.id,
      firstName,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      email: user.email,
      role: isAdmin ? UserRole.SUPER_ADMIN : UserRole.USER,
    },
  });

  return {
    firstName: created.firstName,
    avatarUrl: created.avatarUrl,
    role: created.role,
  };
};

const getInitialPlaces = async () => {
  const [places, total] = await Promise.all([
    prisma.place.findMany({
      orderBy: [
        { rating: { sort: "desc", nulls: "last" } },
        { ratingCount: { sort: "desc", nulls: "last" } },
        { name: "asc" },
      ],
      take: PAGE_SIZE,
    }),
    prisma.place.count(),
  ]);

  return { places, total };
};

const collectTags = async () => {
  const tags = await prisma.place.findMany({
    select: { tags: true },
  });
  return Array.from(
    new Set(tags.flatMap((item) => item.tags ?? []))
  ).sort();
};

const getEvents = () =>
  prisma.event.findMany({
    orderBy: { startsAt: { sort: "asc", nulls: "last" } },
    take: 12,
  });

export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const [profile, { places, total }, tags, events] = await Promise.all([
    getProfile(),
    getInitialPlaces(),
    collectTags(),
    getEvents(),
  ]);

  const weather = await getWeatherForecast(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
  const auroraData = await fetchAuroraForecast(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
  const mapUrl = getStaticMapUrl({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    width: 600,
    height: 300,
    zoom: 13,
    maptype: "terrain", // Note: hybrid/satellite not available in EEA regions
  });
  const destinations = await fetchDestinations(DEFAULT_CENTER);

  return (
    <div className="min-h-screen bg-sky-50">
      <Header townName={TOWN_NAME} locale={locale} profile={profile} />
      <TownHubClient
        townName={TOWN_NAME}
        profile={profile}
        mapUrl={mapUrl}
        weather={weather}
        auroraData={auroraData}
        initialPlaces={places}
        totalPlaces={total}
        events={events}
        availableTags={tags}
        destinations={destinations}
        townCenter={DEFAULT_CENTER}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";

export const revalidate = 0;

const PAGE_SIZE = 6;
