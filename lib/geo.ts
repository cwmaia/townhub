export type LatLng = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const haversineDistanceKm = (from: LatLng, to: LatLng): number => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(EARTH_RADIUS_KM * c).toFixed(2);
};

export type TravelMode = "car" | "transit" | "walk";

type TravelEstimates = Record<TravelMode, { minutes: number; label: string }>;

export const estimateTravelTimes = (
  distanceKm: number
): TravelEstimates => {
  const clamp = (value: number) => Math.max(1, Math.round(value));

  const carMinutes = clamp((distanceKm / 75) * 60); // avg 75 km/h
  const walkMinutes = clamp((distanceKm / 4.8) * 60); // avg 4.8 km/h
  const transitMinutes = clamp((distanceKm / 55) * 60 + 15); // slower + wait

  return {
    car: { minutes: carMinutes, label: `${carMinutes} min` },
    transit: { minutes: transitMinutes, label: `${transitMinutes} min` },
    walk: { minutes: walkMinutes, label: `${walkMinutes} min` },
  };
};

export const formatDistance = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "–";
  }

  if (value < 1) {
    return `${Math.round(value * 1000)} m`;
  }

  return `${value.toFixed(1)} km`;
};
