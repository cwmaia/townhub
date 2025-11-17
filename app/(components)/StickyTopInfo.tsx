'use client';

import { useTranslations } from "next-intl";
import { Cloud, CloudLightning, CloudRain, CloudSun, Snowflake, Sun, Wind } from "lucide-react";
import type { WeatherForecast } from "../../lib/weather";
import AuroraWidget from "./AuroraWidget";
import RoadConditionsWidget from "./RoadConditionsWidget";

const iconMap: Record<string, JSX.Element> = {
  sun: <Sun className="size-4 text-yellow-400" />,
  "cloud-sun": <CloudSun className="size-4 text-slate-500" />,
  cloud: <Cloud className="size-4 text-slate-500" />,
  "cloud-rain": <CloudRain className="size-4 text-blue-500" />,
  "cloud-lightning": <CloudLightning className="size-4 text-indigo-500" />,
  "cloud-snow": <Snowflake className="size-4 text-sky-400" />,
  "cloud-fog": <Cloud className="size-4 text-slate-400" />,
  "cloud-off": <Cloud className="size-4 text-slate-300" />,
};

const resolveIcon = (icon: string) => iconMap[icon] ?? iconMap.cloud;

const formatTemperature = (value: number | null | undefined) =>
  typeof value === "number" ? `${Math.round(value)}°C` : "--";

const formatWind = (value: number | null | undefined) =>
  typeof value === "number" ? value.toFixed(1) : "--";

type WeatherWidgetProps = {
  weather: WeatherForecast;
  auroraData: {
    kpIndex: number;
    probability: number;
    description: string;
  } | null;
  townCenter: { lat: number; lng: number };
};

const WeatherWidget = ({ weather, auroraData, townCenter }: WeatherWidgetProps) => {
  const t = useTranslations("sticky");

  return (
    <section className="mt-8 rounded-3xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-[280px_1fr_280px]">
        {/* Aurora Widget on the left */}
        <AuroraWidget auroraData={auroraData} />

        {/* Road Conditions Map in the middle */}
        <RoadConditionsWidget townCenter={townCenter} />

        {/* Weather widget on the right */}
        <div className="flex flex-col rounded-2xl bg-primary/5 p-2.5 text-primary">
          {/* Current weather */}
          <div className="flex items-center gap-1.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-white shadow">
              {resolveIcon(weather.icon)}
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wide text-primary/70">
                {t("weatherTitle")}
              </p>
              <p className="text-sm font-semibold text-primary">
                {formatTemperature(weather.temperature)}
              </p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary/80">
            <Wind className="size-2.5" />
            <span>
              {t("weatherFeels", {
                wind: formatWind(weather.windSpeed),
              })}
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-tight text-primary/70">{weather.description}</p>

          {/* 3-day forecast */}
          {weather.daily && weather.daily.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-primary/10">
              <div className="grid grid-cols-3 gap-1">
                {weather.daily.map((day) => {
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('en', { weekday: 'short' });

                  return (
                    <div key={day.date} className="flex flex-col items-center text-center">
                      <p className="text-[9px] font-medium text-primary/70">{dayName}</p>
                      <div className="my-0.5 flex size-4 items-center justify-center">
                        {resolveIcon(day.icon)}
                      </div>
                      <p className="text-[10px] font-semibold text-primary">{day.maxTemp}°</p>
                      <p className="text-[9px] text-primary/60">{day.minTemp}°</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WeatherWidget;
