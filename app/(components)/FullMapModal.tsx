'use client';

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
import type { TownCenter, TownHubPlace } from "./types";

// Declare window.google for TypeScript
declare global {
  interface Window {
    google?: typeof google;
  }
}

type FullMapModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  places: TownHubPlace[];
  townCenter: TownCenter;
  townName: string;
};

const FullMapModal = ({
  open,
  onOpenChange,
  places,
  townCenter,
  townName,
}: FullMapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('FullMapModal render - open:', open, 'mapRef.current:', !!mapRef.current, 'places count:', places.length);

  useEffect(() => {
    console.log('FullMapModal useEffect triggered - open:', open, 'mapRef.current:', !!mapRef.current);
    if (!open) {
      console.log('FullMapModal useEffect - modal not open, returning early');
      return;
    }

    const initMap = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        console.log('Google Maps API Key available:', !!apiKey);
        console.log('Initializing map...');

        if (!apiKey) {
          setError('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
          setIsLoading(false);
          return;
        }

        // Load Google Maps script dynamically
        console.log('Loading Google Maps API script...');

        // Check if Google Maps is already loaded
        if (!window.google?.maps) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
              console.log('Google Maps API loaded successfully!');
              resolve();
            };
            script.onerror = () => {
              reject(new Error('Failed to load Google Maps API'));
            };
            document.head.appendChild(script);
          });
        } else {
          console.log('Google Maps API already loaded');
        }

        // Initialize the map
        console.log('Initializing map with center:', townCenter);
        const map = new google.maps.Map(mapRef.current!, {
          center: { lat: townCenter.lat, lng: townCenter.lng },
          zoom: 14,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        console.log('Map initialized successfully!');
        googleMapRef.current = map;

        // Add town center marker
        new google.maps.Marker({
          position: { lat: townCenter.lat, lng: townCenter.lng },
          map,
          title: townName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#003580',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each place
        places.forEach((place) => {
          if (!place.lat || !place.lng) return;

          const marker = new google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: place.name,
            icon: {
              url: getMarkerIcon(place.type),
              scaledSize: new google.maps.Size(32, 32),
            },
          });

          // Create info window content
          const content = `
            <div style="padding: 12px; max-width: 280px;">
              <h3 style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1e293b;">
                ${place.name}
              </h3>
              ${place.rating ? `
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                  <span style="color: #f59e0b;">★</span>
                  <span style="font-weight: 500;">${place.rating.toFixed(1)}</span>
                  ${place.ratingCount ? `<span style="color: #64748b; font-size: 14px;">(${place.ratingCount})</span>` : ''}
                </div>
              ` : ''}
              ${place.description ? `
                <p style="color: #64748b; font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
                  ${place.description.slice(0, 120)}${place.description.length > 120 ? '...' : ''}
                </p>
              ` : ''}
              ${place.address ? `
                <p style="color: #64748b; font-size: 13px; margin-bottom: 4px;">
                  📍 ${place.address}
                </p>
              ` : ''}
              ${place.phone ? `
                <p style="color: #64748b; font-size: 13px; margin-bottom: 8px;">
                  📞 ${place.phone}
                </p>
              ` : ''}
              ${place.website ? `
                <a href="${place.website}" target="_blank" rel="noopener noreferrer"
                   style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #003580;
                          color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
                  Visit Website →
                </a>
              ` : ''}
            </div>
          `;

          marker.addListener('click', () => {
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (places.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: townCenter.lat, lng: townCenter.lng });
          places.forEach((place) => {
            if (place.lat && place.lng) {
              bounds.extend({ lat: place.lat, lng: place.lng });
            }
          });
          map.fitBounds(bounds);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map. Please check your internet connection and try again.');
        setIsLoading(false);
      }
    };

    // Wait for the ref to be available (Dialog animation might delay DOM mount)
    let checkRef: NodeJS.Timeout | null = null;

    if (!mapRef.current) {
      console.log('FullMapModal - ref not ready yet, waiting...');
      checkRef = setInterval(() => {
        if (mapRef.current) {
          console.log('FullMapModal - ref is now ready!');
          if (checkRef) clearInterval(checkRef);
          initMap();
        }
      }, 50);
    } else {
      console.log('FullMapModal - ref already available, initializing immediately');
      initMap();
    }

    // Cleanup function
    return () => {
      console.log('FullMapModal - cleanup function called');
      if (checkRef) {
        console.log('FullMapModal - cleaning up interval');
        clearInterval(checkRef);
      }
      // Cleanup markers when modal closes
      if (!open) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [open, places, townCenter, townName]);

  const getMarkerIcon = (type: string): string => {
    // Return colored marker icons based on place type
    const baseUrl = 'http://maps.google.com/mapfiles/ms/icons';
    switch (type) {
      case 'LODGING':
        return `${baseUrl}/blue-dot.png`;
      case 'RESTAURANT':
        return `${baseUrl}/red-dot.png`;
      case 'ATTRACTION':
        return `${baseUrl}/green-dot.png`;
      case 'TOWN_SERVICE':
        return `${baseUrl}/yellow-dot.png`;
      default:
        return `${baseUrl}/purple-dot.png`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>{townName} - Interactive Map</DialogTitle>
          <DialogDescription>
            Interactive map showing {places.length} places in {townName}. Click on markers to see details.
          </DialogDescription>
        </VisuallyHidden>

        <div className="relative h-full w-full">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-[1001] flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl hover:bg-slate-50 transition-colors border border-slate-200"
            aria-label="Close map"
          >
            <X className="size-5" />
            <span className="font-medium">Close</span>
          </button>

          {/* Title */}
          <div className="absolute top-4 left-4 z-[1001] rounded-2xl bg-white px-6 py-3 shadow-xl border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900" aria-hidden="true">
              {townName} - Interactive Map
            </h2>
            <p className="text-sm text-slate-600 mt-1" aria-hidden="true">
              {places.length} places shown
            </p>
          </div>

          {/* Loading indicator */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-[1002]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
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
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Map container */}
          <div ref={mapRef} className="h-full w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullMapModal;
