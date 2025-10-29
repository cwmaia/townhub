'use client';

import { useTranslations } from "next-intl";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import type { TownHubPlace } from "./types";
import PlaceCard from "./PlaceCard";

type ResultsGridProps = {
  places: TownHubPlace[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
};

const ResultsGrid = ({ places, loading, hasMore, onLoadMore }: ResultsGridProps) => {
  const t = useTranslations("results");

  if (!places.length && !loading) {
    return (
      <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-center text-sm text-slate-500">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={`skeleton-${index}`}
                className="h-[274px] w-full rounded-3xl"
              />
            ))
          : null}
      </div>
      {hasMore ? (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-full bg-primary px-6 text-sm text-primary-foreground shadow hover:bg-primary/90"
          >
            {t("loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ResultsGrid;
