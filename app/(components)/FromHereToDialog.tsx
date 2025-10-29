'use client';

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Car, Footprints, Train } from "lucide-react";
import type { Destination } from "./types";
import type { TravelMode } from "../../lib/geo";
import { estimateTravelTimes } from "../../lib/geo";

export type DestinationEstimate = Destination & {
  distanceKm: number;
  durations?: Record<TravelMode, number>;
  viaService: boolean;
};

type FromHereToDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  origin: { lat: number; lng: number };
  presets: DestinationEstimate[];
};

const icons: Record<TravelMode, JSX.Element> = {
  car: <Car className="size-4" />,
  transit: <Train className="size-4" />,
  walk: <Footprints className="size-4" />,
};

const FromHereToDialog = ({ open, onOpenChange, origin, presets }: FromHereToDialogProps) => {
  const t = useTranslations("fromHereTo");
  const [mode, setMode] = useState<TravelMode>("car");
  const [customQuery, setCustomQuery] = useState("");
  const [customResults, setCustomResults] = useState<DestinationEstimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!customQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/distances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: customQuery.trim(),
          origin,
          mode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to locate destination");
      }

      const data = await response.json();
      const baseDistance = data.distanceKm as number;
      const estimated = estimateTravelTimes(baseDistance);

      setCustomResults((prev) => {
        const existing = prev.filter((item) => item.name !== data.destination.name);
        return [
          {
            id: data.destination.name,
            name: data.destination.name,
            lat: data.destination.lat,
            lng: data.destination.lng,
            distanceKm: baseDistance,
            durations: {
              car: estimated.car.minutes,
              transit: estimated.transit.minutes,
              walk: estimated.walk.minutes,
            },
            viaService: data.viaService ?? false,
          },
          ...existing,
        ];
      });
      setCustomQuery("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const allDestinations = [...presets, ...customResults];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            {t("title")}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={mode} onValueChange={(value) => setMode(value as TravelMode)} className="mt-4">
          <TabsList className="flex gap-2 rounded-full bg-slate-100 p-1">
            {([
              { value: "car", label: t("transport.car") },
              { value: "transit", label: t("transport.transit") },
              { value: "walk", label: t("transport.walk") },
            ] as const).map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {icons[option.value]}
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-4">
          {allDestinations.map((destination) => (
            <div
              key={`${destination.id}-${mode}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {destination.name}
                </p>
                <p className="text-xs text-slate-500">
                  {t("distance", { km: destination.distanceKm.toFixed(1) })}
                </p>
              </div>
              <div className="text-right text-sm font-semibold text-primary">
                {t("duration", {
                  minutes: destination.durations[mode],
                })}
              </div>
            </div>
          ))}
        </div>

        <form className="mt-6 flex flex-col gap-3 rounded-2xl bg-slate-100 p-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-slate-600" htmlFor="custom-destination">
            {t("customLabel")}
          </label>
          <Input
            id="custom-destination"
            placeholder={t("placeholder")}
            value={customQuery}
            onChange={(event) => setCustomQuery(event.target.value)}
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button
            type="submit"
            className="self-start rounded-full bg-primary px-6 text-sm text-primary-foreground shadow"
            disabled={loading}
          >
            {t("cta")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FromHereToDialog;
