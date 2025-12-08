'use client';

import { useTranslations } from "next-intl";
import type { WeatherForecast } from "../../lib/weather";
import AuroraWidget from "./AuroraWidget";
import RoadConditionsWidget from "./RoadConditionsWidget";

const weatherEmoji: Record<string, string> = {
  sun: "☀️",
  "cloud-sun": "⛅",
  cloud: "☁️",
  "cloud-rain": "🌧️",
  "cloud-lightning": "⛈️",
  "cloud-snow": "❄️",
  "cloud-fog": "🌫️",
  "cloud-off": "☁️",
};

const resolveEmoji = (icon: string) => weatherEmoji[icon] ?? "☁️";

const formatTemperature = (value: number | null | undefined) =>
  typeof value === "number" ? `${Math.round(value)}°` : "--";

const formatWeekday = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { weekday: 'short' });

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
  const feelsLike = weather.temperature != null && weather.windSpeed != null
    ? Math.round(weather.temperature - (weather.windSpeed * 0.7))
    : null;

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-4xl leading-none">{resolveEmoji(weather.icon)}</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t("weatherTitle")} • Stykkishólmur
              </p>
              <p className="text-sm font-semibold text-slate-700">{weather.description}</p>
              {feelsLike !== null && (
                <p className="text-[11px] font-medium text-slate-500">Feels like {feelsLike}°</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm font-bold text-blue-900">
            <p className="text-3xl">{formatTemperature(weather.temperature)}</p>
            <p className="text-[11px] text-slate-500">
              💨 {weather.windSpeed?.toFixed(1) ?? '--'} m/s • 💧 {weather.humidity ?? '--'}% • 👁️ {weather.visibility ?? '--'} km
            </p>
          </div>
        </div>

        {weather.daily && weather.daily.length > 0 && (
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto text-[10px]">
            {weather.daily.slice(0, 5).map((day) => (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-0 rounded-xl border border-slate-100 bg-slate-50/70 px-1 py-1"
              >
                <span className="text-[10px] font-semibold uppercase text-slate-500">
                  {formatWeekday(day.date)}
                </span>
                <span className="text-lg leading-tight">{resolveEmoji(day.icon ?? "cloud")}</span>
                <span className="text-[10px] font-bold text-slate-800">
                  {Math.round(day.maxTemp)}°/{Math.round(day.minTemp)}°
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 pt-1">
          <AuroraWidget auroraData={auroraData} />
          <RoadConditionsWidget townCenter={townCenter} />
        </div>
      </div>
    </section>
  );
};

export default WeatherWidget;
