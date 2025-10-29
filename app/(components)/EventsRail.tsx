'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import type { TownHubEvent } from "./types";

type EventsRailProps = {
  events: TownHubEvent[];
};

const EventsRail = ({ events }: EventsRailProps) => {
  const t = useTranslations("events");
  const [selected, setSelected] = useState<TownHubEvent | null>(null);
  const [open, setOpen] = useState(false);

  const formattedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        startsAt: event.startsAt ? new Date(event.startsAt) : null,
        endsAt: event.endsAt ? new Date(event.endsAt) : null,
      })),
    [events]
  );

  if (!events.length) return null;

  return (
    <>
      <section className="mt-8 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("title")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {formattedEvents.map((event) => (
            <article
              key={event.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <Image
                  src={event.imageUrl ?? "/media/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between space-y-2 p-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {event.title}
                  </h3>
                  {event.location ? (
                    <p className="text-xs text-slate-500">{event.location}</p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-primary/50 text-xs text-primary"
                  onClick={() => {
                    setSelected(event);
                    setOpen(true);
                  }}
                >
                  {t("viewDetails")}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
          {selected ? (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-semibold text-slate-900">
                  {selected.title}
                </DialogTitle>
                {selected.location ? (
                  <p className="text-sm text-slate-500">{selected.location}</p>
                ) : null}
              </DialogHeader>
              {selected.imageUrl ? (
                <div className="relative mt-4 h-56 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={selected.imageUrl}
                    alt={selected.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
              <DialogDescription className="mt-4 space-y-2 text-base text-slate-600">
                <p>{selected.description}</p>
                <div className="flex flex-col gap-1 text-sm text-slate-500">
                  {selected.startsAt ? (
                    <span>
                      {t("starts")}:{" "}
                      {format(new Date(selected.startsAt), "d MMM yyyy, HH:mm")}
                    </span>
                  ) : null}
                  {selected.endsAt ? (
                    <span>
                      {t("ends")}:{" "}
                      {format(new Date(selected.endsAt), "d MMM yyyy, HH:mm")}
                    </span>
                  ) : null}
                </div>
              </DialogDescription>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventsRail;
