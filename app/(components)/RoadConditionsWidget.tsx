'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

type RoadConditionsWidgetProps = {
  townCenter: { lat: number; lng: number };
};

const RoadConditionsWidget = ({ townCenter }: RoadConditionsWidgetProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Roads.is (Vegagerðin) provides road condition maps
  const roadMapUrl = `https://www.road.is/travel-info/road-conditions-and-weather/entire-country/island1e.html`;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3 text-slate-600" />
          <div>
            <h3 className="text-[10px] font-semibold text-slate-900">Road Conditions</h3>
          </div>
        </div>
        <a
          href={roadMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 transition-colors"
        >
          <span>Live Map</span>
          <ExternalLink className="size-2.5" />
        </a>
      </div>

      {/* Map */}
      <div className="relative flex-1 bg-slate-100">
        {isClient ? (
          <MapContainer
            center={[townCenter.lat, townCenter.lng]}
            zoom={9}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ height: '100%', width: '100%', minHeight: '150px' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[10px] text-slate-500">Loading map...</p>
          </div>
        )}

        {/* Legend overlay */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 text-[8px] text-slate-600 shadow-sm z-10">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-0.5">
              <div className="size-1.5 rounded-full bg-green-500"></div>
              <span>Good</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="size-1.5 rounded-full bg-yellow-500"></div>
              <span>Slippery</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="size-1.5 rounded-full bg-orange-500"></div>
              <span>Icy</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="size-1.5 rounded-full bg-red-500"></div>
              <span>Closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadConditionsWidget;
