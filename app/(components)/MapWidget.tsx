'use client';

import { useState } from "react";

type MapWidgetProps = {
  mapUrl: string;
  townName: string;
  onOpenFullMap: () => void;
  placeCount?: number;
  eventCount?: number;
};

const MapWidget = ({ mapUrl, townName, onOpenFullMap, placeCount = 0, eventCount = 0 }: MapWidgetProps) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onOpenFullMap();
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg text-left"
    >
      {/* Map image */}
      <div className="relative h-[200px] w-full bg-gradient-to-br from-sky-100 to-sky-200">
        {!imageError ? (
          <img
            src={mapUrl}
            alt={`${townName} map`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl mb-2">🗺️</span>
            <span className="text-lg font-semibold text-sky-800">{townName}</span>
            <span className="text-sm text-sky-600">Click to explore</span>
          </div>
        )}
      </div>

      {/* Overlay content */}
      <div className="bg-slate-50/50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              <span className="mr-1.5">🗺️</span>
              Interactive Map
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">
              Explore {placeCount} places & {eventCount} events
            </p>
          </div>
          <span className="rounded-full bg-green-500 px-2 py-1 text-[10px] font-bold tracking-wide text-white">
            NEW
          </span>
        </div>
        <div className="mt-3 self-start rounded-xl bg-[#003580]/10 px-3 py-2 inline-block">
          <span className="text-sm font-medium text-[#003580]">Click to explore →</span>
        </div>
      </div>
    </button>
  );
};

export default MapWidget;
