'use client';

import Image from "next/image";
import { useState } from "react";
import { Maximize2 } from "lucide-react";

type MapWidgetProps = {
  mapUrl: string;
  townName: string;
  onOpenFullMap: () => void;
};

const MapWidget = ({ mapUrl, townName, onOpenFullMap }: MapWidgetProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    console.log('MapWidget clicked - opening full map modal');
    onOpenFullMap();
  };

  return (
    <div
      className="group relative w-full cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg ring-1 ring-primary/10 transition-all hover:shadow-xl"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '262px', height: '150px' }}
    >
      <div className="relative w-full h-full">
        <Image
          src={mapUrl}
          alt={`${townName} map`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="262px"
          priority
        />
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-primary/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Expand icon */}
        <div className={`absolute bottom-3 right-3 rounded-full bg-white p-2 shadow-lg transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <Maximize2 className="size-4 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default MapWidget;
