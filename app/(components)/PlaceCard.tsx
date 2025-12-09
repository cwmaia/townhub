'use client';

import Image from "next/image";
import { Building2, Hotel, MapPin, Ship, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TownHubPlace } from "./types";
import { Button } from "../../components/ui/button";
import { SubscriptionBell } from "./SubscriptionBell";
import { Badge } from "../../components/ui/badge";
import { formatDistance } from "../../lib/geo";

const iconByType = {
  TOWN_SERVICE: <Building2 className="size-4" />,
  LODGING: <Hotel className="size-4" />,
  RESTAURANT: <Utensils className="size-4" />,
  ATTRACTION: <MapPin className="size-4" />,
};

type PlaceCardProps = {
  place: TownHubPlace;
};

const PlaceCard = ({ place }: PlaceCardProps) => {
  const t = useTranslations("results");

  return (
    <article className="flex h-[274px] w-full overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-full w-[240px] flex-none">
        <Image
          src={place.imageUrl ?? "/media/placeholder.svg"}
          alt={place.name}
          fill
          className="object-cover"
          sizes="240px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {place.name}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
                  <span className="mr-1 inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary">
                    {iconByType[place.type] ?? <Ship className="size-4" />}
                  </span>
                  {place.type.replace("_", " ")}
                </Badge>
                {typeof place.distanceKm === "number" ? (
                  <span>{formatDistance(place.distanceKm)}</span>
                ) : null}
                {place.rating ? (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    ⭐ {place.rating.toFixed(1)}
                    {place.ratingCount ? ` (${place.ratingCount})` : null}
                  </span>
                ) : null}
              </div>
            </div>
            <SubscriptionBell
              placeId={place.id}
              placeName={place.name}
              size="md"
            />
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {place.description}
          </p>
          {place.priceRange ? (
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {place.priceRange}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {place.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-full bg-primary px-5 text-sm text-primary-foreground shadow hover:bg-primary/90 disabled:bg-slate-200"
            disabled={!place.website}
          >
            <a href={place.website ?? "#"} target="_blank" rel="noreferrer">
              {t("visitWebsite")}
            </a>
          </Button>
          {place.phone ? (
            <span className="text-sm text-slate-500">📞 {place.phone}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default PlaceCard;
