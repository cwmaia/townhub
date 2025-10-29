import axios from "axios";
import { haversineDistanceKm, type LatLng, estimateTravelTimes } from "./geo";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_DISTANCE_MATRIX_API_KEY =
  process.env.GOOGLE_DISTANCE_MATRIX_API_KEY ?? GOOGLE_MAPS_API_KEY;

type DistanceMatrixResult = {
  distanceKm: number;
  durationMinutes: number;
  viaService: boolean;
};

export const getStaticMapUrl = ({
  lat,
  lng,
  width = 600,
  height = 300,
  zoom = 14,
  markers = [{ lat, lng }],
}: {
  lat: number;
  lng: number;
  width?: number;
  height?: number;
  zoom?: number;
  markers?: LatLng[];
}) => {
  if (!GOOGLE_MAPS_API_KEY) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      zoom: zoom.toString(),
      width: width.toString(),
      height: height.toString(),
    });
    return `/api/static-map?${params.toString()}`;
  }

  const markerQuery = markers
    .map((marker) => `&markers=${marker.lat},${marker.lng}`)
    .join("");

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}${markerQuery}&key=${GOOGLE_MAPS_API_KEY}`;
};

export const distanceMatrix = async (
  origin: LatLng,
  destination: LatLng,
  mode: "driving" | "transit" | "walking" = "driving"
): Promise<DistanceMatrixResult> => {
  const fallback = () => {
    const distanceKm = haversineDistanceKm(origin, destination);
    const estimate = estimateTravelTimes(distanceKm)[
      mode === "driving" ? "car" : mode === "walking" ? "walk" : "transit"
    ];
    return {
      distanceKm,
      durationMinutes: estimate.minutes,
      viaService: false,
    };
  };

  if (!GOOGLE_DISTANCE_MATRIX_API_KEY) {
    return fallback();
  }

  try {
    const params = new URLSearchParams({
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      mode,
      key: GOOGLE_DISTANCE_MATRIX_API_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const { data } = await axios.get(url);

    const element =
      data?.rows?.[0]?.elements?.[0] ?? data?.rows?.[0]?.elements?.[0];

    if (
      !element ||
      element.status !== "OK" ||
      !element.distance ||
      !element.duration
    ) {
      return fallback();
    }

    return {
      distanceKm: +(element.distance.value / 1000).toFixed(2),
      durationMinutes: Math.round(element.duration.value / 60),
      viaService: true,
    };
  } catch (error) {
    console.error("Distance matrix fallback", error);
    return fallback();
  }
};
