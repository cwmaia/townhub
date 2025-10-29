'use client';

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import MapWidget from "./MapWidget";
import type { FilterState } from "./types";

const ratingOptions = [4.5, 4.0, 3.5];
const distanceOptions: FilterState["distance"][] = ["0-1", "1-3", "3-10"];
const priceOptions: FilterState["price"][] = ["$", "$$", "$$$"];

type FiltersPanelProps = {
  filters: FilterState;
  availableTags: string[];
  onUpdate: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  mapUrl: string;
  townName: string;
  onOpenFullMap: () => void;
};

const FiltersPanel = ({ filters, availableTags, onUpdate, onReset, mapUrl, townName, onOpenFullMap }: FiltersPanelProps) => {
  const t = useTranslations("filters");

  const renderedTags = useMemo(() => availableTags.slice(0, 12), [availableTags]);

  const toggleTag = (tag: string) => {
    const exists = filters.tags.includes(tag);
    const nextTags = exists
      ? filters.tags.filter((item) => item !== tag)
      : [...filters.tags, tag];
    onUpdate({ tags: nextTags });
  };

  return (
    <aside className="sticky top-20 z-30 flex w-[260px] max-h-[calc(100vh-5rem)] flex-col gap-6 self-start">
      <div className="flex-shrink-0">
        <MapWidget mapUrl={mapUrl} townName={townName} onOpenFullMap={onOpenFullMap} />
      </div>
      <div className="flex w-full flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("title")}
        </h3>
        <Button variant="ghost" className="text-sm text-primary" onClick={onReset}>
          {t("reset")}
        </Button>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">{t("rating")}</h4>
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((value) => (
            <Button
              key={value}
              variant={filters.rating === value ? "default" : "outline"}
              className={`rounded-full px-4 py-2 text-sm ${
                filters.rating === value
                  ? "bg-primary text-white"
                  : "border-slate-200 text-slate-600"
              }`}
              onClick={() =>
                onUpdate({ rating: filters.rating === value ? undefined : value })
              }
            >
              {value.toFixed(1)}+
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">{t("distance")}</h4>
        <div className="flex flex-wrap gap-2">
          {distanceOptions.map((value) => (
            <Button
              key={value}
              variant={filters.distance === value ? "default" : "outline"}
              className={`rounded-full px-4 py-2 text-sm ${
                filters.distance === value
                  ? "bg-primary text-white"
                  : "border-slate-200 text-slate-600"
              }`}
              onClick={() =>
                onUpdate({ distance: filters.distance === value ? undefined : value })
              }
            >
              {(() => {
                const [from, to] = value.split("-");
                if (from === "0") return t("lessThanKm", { to });
                if (to === "10") return t("kmOption", { from, to });
                return t("kmOption", { from, to });
              })()}
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">{t("price")}</h4>
        <div className="flex flex-wrap gap-2">
          {priceOptions.map((value) => (
            <Button
              key={value}
              variant={filters.price === value ? "default" : "outline"}
              className={`rounded-full px-4 py-2 text-sm ${
                filters.price === value
                  ? "bg-primary text-white"
                  : "border-slate-200 text-slate-600"
              }`}
              onClick={() =>
                onUpdate({ price: filters.price === value ? undefined : value })
              }
            >
              {value}
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">{t("tags")}</h4>
        <div className="flex flex-wrap gap-2">
          {renderedTags.map((tag) => (
            <Button
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              className={`rounded-full px-4 py-2 text-xs ${
                filters.tags.includes(tag)
                  ? "bg-primary text-white"
                  : "border-slate-200 text-slate-600"
              }`}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </Button>
          ))}
        </div>
      </section>
      </div>
    </aside>
  );
};

export default FiltersPanel;
