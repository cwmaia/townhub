'use client';

import type { PlaceType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";

type TabKey = PlaceType | "ALL";

const order: TabKey[] = [
  "ALL",
  "TOWN_SERVICE",
  "LODGING",
  "RESTAURANT",
  "ATTRACTION",
];

const iconByType: Record<TabKey, string> = {
  ALL: "🏠",
  TOWN_SERVICE: "🛟",
  LODGING: "🛏️",
  RESTAURANT: "🍽️",
  ATTRACTION: "📍",
};

const labelKey = {
  ALL: "all",
  TOWN_SERVICE: "services",
  LODGING: "lodging",
  RESTAURANT: "restaurants",
  ATTRACTION: "attractions",
} as const satisfies Record<TabKey, string>;

type TabsProps = {
  active: TabKey;
  onChange: (next: TabKey) => void;
  onOpenDistances: () => void;
};

const ResultsTabs = ({ active, onChange, onOpenDistances }: TabsProps) => {
  const t = useTranslations("tabs");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs
        value={active}
        onValueChange={(value) => onChange(value as TabKey)}
        className="w-full md:w-auto"
      >
        <TabsList className="flex w-full flex-wrap justify-start gap-2 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-slate-200 md:w-auto">
          {order.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="mr-2 text-base">{iconByType[key]}</span>
              {t(labelKey[key])}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button
        variant="outline"
        className="rounded-full border-primary/40 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary hover:text-primary-foreground"
        onClick={onOpenDistances}
      >
        {t("fromHere")}
      </Button>
    </div>
  );
};

export type { TabKey };
export default ResultsTabs;
