'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { X, MapPin, Calendar, Navigation, Bookmark, Star, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
import type { TownCenter, TownHubPlace } from "./types";

// Declare window.google for TypeScript
declare global {
  interface Window {
    google?: typeof google;
  }
}

type MapPlace = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  tags?: string[];
  markerCategory: string;
  markerColor: string;
  isPremium: boolean;
};

type MapEvent = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  rsvpCount?: number | null;
  isHot?: boolean;
  isTownEvent?: boolean;
  isFeatured?: boolean;
  isToday?: boolean;
  isThisWeek?: boolean;
  isUpcoming?: boolean;
  isHappeningNow?: boolean;
  markerCategory: string;
  markerColor: string;
  isPremium: boolean;
};

type MapData = {
  places: MapPlace[];
  events: MapEvent[];
  town: {
    name: string;
    latitude: number;
    longitude: number;
  };
};

type FullMapModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  places: TownHubPlace[];
  townCenter: TownCenter;
  townName: string;
};

type SelectedItem = {
  type: 'place' | 'event';
  data: MapPlace | MapEvent;
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: '🗺️' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'LODGING', label: 'Lodging', icon: '🛏️' },
  { id: 'RESTAURANT', label: 'Restaurants', icon: '🍽️' },
  { id: 'ATTRACTION', label: 'Attractions', icon: '📷' },
  { id: 'TOWN_SERVICE', label: 'Services', icon: '🏛️' },
];

const PLACE_ICONS: Record<string, string> = {
  LODGING: '🛏️',
  RESTAURANT: '🍽️',
  ATTRACTION: '📷',
  TOWN_SERVICE: '🏛️',
};

const FullMapModal = ({
  open,
  onOpenChange,
  townCenter,
  townName,
}: FullMapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Fetch map data from API
  useEffect(() => {
    if (!open) return;

    const fetchMapData = async () => {
      try {
        const response = await fetch('/api/map/data?townId=stykkisholmur');
        if (!response.ok) throw new Error('Failed to fetch map data');
        const data = await response.json();
        setMapData(data);
      } catch (err) {
        console.error('Error fetching map data:', err);
      }
    };

    fetchMapData();
  }, [open]);

  const createMarkerIcon = useCallback((
    type: 'place' | 'event',
    item: MapPlace | MapEvent,
    isSelected: boolean
  ): google.maps.Symbol | google.maps.Icon => {
    if (type === 'event') {
      const event = item as MapEvent;
      const fillColor = isSelected ? '#003580' : event.markerColor;
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: event.isPremium ? 14 : 10,
        fillColor,
        fillOpacity: 1,
        strokeColor: event.isPremium ? '#FFD700' : '#ffffff',
        strokeWeight: event.isPremium ? 3 : 2,
      };
    } else {
      const place = item as MapPlace;
      const fillColor = isSelected ? '#003580' : place.markerColor;
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: isSelected ? 2 : 1.5,
        anchor: new google.maps.Point(12, 22),
      };
    }
  }, []);

  const updateMarkers = useCallback(() => {
    if (!googleMapRef.current || !mapData) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const map = googleMapRef.current;

    // Filter and add place markers
    if (activeFilter === 'all' || (activeFilter !== 'events' && activeFilter !== 'all')) {
      const filteredPlaces = activeFilter === 'all'
        ? mapData.places
        : mapData.places.filter(p => p.type === activeFilter);

      filteredPlaces.forEach(place => {
        const isSelected = selectedItem?.type === 'place' && selectedItem.data.id === place.id;
        const marker = new google.maps.Marker({
          position: { lat: place.latitude, lng: place.longitude },
          map,
          title: place.name,
          icon: createMarkerIcon('place', place, isSelected),
          zIndex: isSelected ? 1000 : place.isPremium ? 100 : 10,
        });

        marker.addListener('click', () => {
          setSelectedItem({ type: 'place', data: place });
        });

        markersRef.current.push(marker);
      });
    }

    // Add event markers
    if (activeFilter === 'all' || activeFilter === 'events') {
      mapData.events.forEach(event => {
        const isSelected = selectedItem?.type === 'event' && selectedItem.data.id === event.id;
        const marker = new google.maps.Marker({
          position: { lat: event.latitude, lng: event.longitude },
          map,
          title: event.name,
          icon: createMarkerIcon('event', event, isSelected),
          zIndex: isSelected ? 1000 : event.isPremium ? 500 : 50,
        });

        marker.addListener('click', () => {
          setSelectedItem({ type: 'event', data: event });
        });

        markersRef.current.push(marker);
      });
    }
  }, [mapData, activeFilter, selectedItem, createMarkerIcon]);

  useEffect(() => {
    if (!open) return;

    const initMap = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          setError('Google Maps API key is not configured.');
          setIsLoading(false);
          return;
        }

        if (!window.google?.maps) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
              if (window.google?.maps) {
                resolve();
                return;
              }
              existingScript.addEventListener('load', () => resolve());
              existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
              return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps API'));
            document.head.appendChild(script);
          });
        }

        if (!mapRef.current) {
          setIsLoading(false);
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: townCenter.lat, lng: townCenter.lng },
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scrollwheel: true,
          gestureHandling: 'greedy', // Allows scroll zoom without Ctrl/Cmd key
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        });

        googleMapRef.current = map;

        // Close selection when clicking on map
        map.addListener('click', () => {
          setSelectedItem(null);
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map.');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [open, townCenter]);

  // Update markers when data, filter, or selection changes
  useEffect(() => {
    if (googleMapRef.current && mapData) {
      updateMarkers();
    }
  }, [mapData, activeFilter, selectedItem, updateMarkers]);

  const formatEventDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDirections = () => {
    if (!selectedItem) return;
    const item = selectedItem.data;
    const lat = 'latitude' in item ? item.latitude : 0;
    const lng = 'longitude' in item ? item.longitude : 0;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const totalCount = mapData ? mapData.places.length + mapData.events.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>{townName} - Interactive Map</DialogTitle>
          <DialogDescription>
            Interactive map showing places and events in {townName}.
          </DialogDescription>
        </VisuallyHidden>

        <div className="relative h-full w-full">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-[1001] bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {townName}
                </h2>
                <p className="text-sm text-slate-600">
                  {mapData ? `${mapData.places.length} places • ${mapData.events.length} events` : 'Loading...'}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 hover:bg-slate-200 transition-colors"
                aria-label="Close map"
              >
                <X className="size-5" />
                <span className="font-medium">Close</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
              {FILTER_OPTIONS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-[#003580] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[1002]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003580] border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Loading interactive map...</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[1002] p-8">
              <div className="text-center max-w-md">
                <div className="text-red-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Map</h3>
                <p className="text-slate-600 mb-4">{error}</p>
              </div>
            </div>
          )}

          {/* Map container */}
          <div ref={mapRef} className="h-full w-full pt-[120px]" />

          {/* Selected Item Preview Card */}
          {selectedItem && (
            <div className="absolute bottom-4 left-4 right-4 z-[1001] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-md mx-auto">
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  {(selectedItem.data as any).imageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        src={(selectedItem.data as any).imageUrl}
                        alt={selectedItem.data.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          {selectedItem.type === 'event' ? '📅 Event' : PLACE_ICONS[selectedItem.data.type] + ' ' + selectedItem.data.type.replace('_', ' ')}
                        </span>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {selectedItem.data.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="p-1 hover:bg-slate-100 rounded-full"
                      >
                        <X className="size-4 text-slate-400" />
                      </button>
                    </div>

                    {/* Event specific info */}
                    {selectedItem.type === 'event' && (
                      <div className="mt-1 space-y-1">
                        {(selectedItem.data as MapEvent).startDate && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Clock className="size-3.5" />
                            <span>{formatEventDate((selectedItem.data as MapEvent).startDate)}</span>
                          </div>
                        )}
                        {(selectedItem.data as MapEvent).location && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <MapPin className="size-3.5" />
                            <span className="line-clamp-1">{(selectedItem.data as MapEvent).location}</span>
                          </div>
                        )}
                        <div className="flex gap-1.5 mt-1">
                          {(selectedItem.data as MapEvent).isHappeningNow && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Happening Now
                            </span>
                          )}
                          {(selectedItem.data as MapEvent).isToday && !(selectedItem.data as MapEvent).isHappeningNow && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Today
                            </span>
                          )}
                          {(selectedItem.data as MapEvent).isPremium && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Place specific info */}
                    {selectedItem.type === 'place' && (
                      <div className="mt-1">
                        {(selectedItem.data as MapPlace).rating && (
                          <div className="flex items-center gap-1.5">
                            <Star className="size-4 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-slate-900">
                              {(selectedItem.data as MapPlace).rating?.toFixed(1)}
                            </span>
                            {(selectedItem.data as MapPlace).ratingCount && (
                              <span className="text-sm text-slate-500">
                                ({(selectedItem.data as MapPlace).ratingCount})
                              </span>
                            )}
                          </div>
                        )}
                        {(selectedItem.data as MapPlace).isPremium && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            ⭐ Premium
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleDirections}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#003580] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#002a66] transition-colors"
                  >
                    <Navigation className="size-4" />
                    <span>Directions</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                    <Bookmark className="size-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-500 mb-2">Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Town Events</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>Community Events</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span>Featured</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>Places</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullMapModal;
