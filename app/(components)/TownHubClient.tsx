'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { PlaceType } from "@prisma/client";
import Hero from "./Hero";
import WhatsHappening from "./WhatsHappening";
import WeatherWidget from "./StickyTopInfo";
import MapWidget from "./MapWidget";
import FiltersPanel from "./FiltersPanel";
import ResultsTabs, { type TabKey } from "./Tabs";
import ResultsGrid from "./ResultsGrid";
import FromHereToDialog, { type DestinationEstimate } from "./FromHereToDialog";
import FullMapModal from "./FullMapModal";
import type {
  FilterState,
  ProfileSummary,
  TownCenter,
  TownHubEvent,
  TownHubPlace,
} from "./types";
import type { WeatherForecast } from "../../lib/weather";
import { estimateTravelTimes } from "../../lib/geo";

const PAGE_SIZE = 6;

const createDefaultFilters = (): FilterState => ({
  type: "ALL",
  tags: [],
});

type TownHubClientProps = {
  townName: string;
  profile: ProfileSummary | null;
  mapUrl: string;
  weather: WeatherForecast;
  auroraData: {
    kpIndex: number;
    probability: number;
    description: string;
  } | null;
  initialPlaces: TownHubPlace[];
  totalPlaces: number;
  events: TownHubEvent[];
  availableTags: string[];
  destinations: DestinationEstimate[];
  townCenter: TownCenter;
};

const TownHubClient = ({
  townName,
  profile,
  mapUrl,
  weather,
  auroraData,
  initialPlaces,
  totalPlaces,
  events,
  availableTags,
  destinations,
  townCenter,
}: TownHubClientProps) => {
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters());
  const [places, setPlaces] = useState<TownHubPlace[]>(initialPlaces);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPlaces.length < totalPlaces);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const initialized = useRef(false);
  const offsetRef = useRef(initialPlaces.length);
  const totalRef = useRef(totalPlaces);

  const tags = useMemo(() => Array.from(new Set(availableTags)), [availableTags]);

  const fetchPlaces = useCallback(async (append: boolean) => {
    const nextOffset = append ? offsetRef.current : 0;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type !== "ALL") params.set("type", filters.type);
      if (filters.rating) params.set("rating", filters.rating.toString());
      if (filters.distance) params.set("distance", filters.distance);
      if (filters.price) params.set("price", filters.price);
      if (filters.tags.length) params.set("tags", filters.tags.join(","));
      params.set("limit", PAGE_SIZE.toString());
      params.set("offset", nextOffset.toString());

      const response = await fetch(`/api/places?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await response.json();
      const data = (json.data ?? []) as TownHubPlace[];
      const meta = json.meta ?? { total: data.length, limit: PAGE_SIZE, offset: nextOffset };
      totalRef.current = meta.total ?? data.length;
      offsetRef.current = nextOffset + data.length;
      setHasMore(offsetRef.current < totalRef.current);
      setPlaces((prev) => (append ? [...prev, ...data] : data));
    } catch (error) {
      console.error("Failed to fetch places", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    startTransition(() => {
      void fetchPlaces(false);
    });
  }, [fetchPlaces]);

  const handleLoadMore = () => {
    startTransition(() => {
      void fetchPlaces(true);
    });
  };

  const handleTabChange = (tab: TabKey) => {
    setFilters((current) => ({
      ...current,
      type: tab === "ALL" ? "ALL" : (tab as PlaceType),
    }));
  };

  const presetDestinations = useMemo(() => {
    return destinations.map((destination) => {
      const estimates = estimateTravelTimes(destination.distanceKm);
      return {
        ...destination,
        durations: {
          car: destination.durations?.car ?? estimates.car.minutes,
          transit: destination.durations?.transit ?? estimates.transit.minutes,
          walk: destination.durations?.walk ?? estimates.walk.minutes,
        },
      };
    });
  }, [destinations]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24">
      <Hero townName={townName} firstName={profile?.firstName} />
      <WhatsHappening events={events} />
      <WeatherWidget weather={weather} auroraData={auroraData} townCenter={townCenter} />

      {/* Interactive Map Card - matching mobile app design */}
      <div className="mt-6">
        <MapWidget
          mapUrl={mapUrl}
          townName={townName}
          onOpenFullMap={() => setMapModalOpen(true)}
          placeCount={totalPlaces}
          eventCount={events.length}
        />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[260px_auto]">
        <FiltersPanel
          filters={filters}
          availableTags={tags}
          onReset={() => {
            setFilters(createDefaultFilters());
          }}
          onUpdate={(partial) => {
            setFilters((current) => ({
              ...current,
              ...partial,
            }));
          }}
        />
        <div className="space-y-6">
          <div className="sticky top-20 z-20 -mx-6 bg-gradient-to-b from-slate-50 via-slate-50 to-transparent px-6 pb-4 pt-2">
            <ResultsTabs
              active={filters.type as TabKey}
              onChange={(tab) => {
                handleTabChange(tab);
              }}
              onOpenDistances={() => setDialogOpen(true)}
            />
          </div>
          <ResultsGrid
            places={places}
            loading={loading || isPending}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>

      <FromHereToDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        presets={presetDestinations}
        origin={townCenter}
      />

      <FullMapModal
        open={mapModalOpen}
        onOpenChange={setMapModalOpen}
        places={places}
        townCenter={townCenter}
        townName={townName}
      />
    </div>
  );
};

export default TownHubClient;
