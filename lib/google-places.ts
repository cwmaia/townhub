import axios from "axios";
import { haversineDistanceKm, type LatLng } from "./geo";

const GOOGLE_PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;

export type GooglePlaceCandidate = {
  placeId: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  rating?: number | null;
  photos: string[];
};

export type GooglePlaceVerificationResult = {
  place: GooglePlaceCandidate;
  driftMeters: number;
};

const BUILD_PHOTO_URL = (photoReference: string, maxWidth = 800) => {
  if (!GOOGLE_PLACES_API_KEY) return null;
  const params = new URLSearchParams({
    photoreference: photoReference,
    maxwidth: maxWidth.toString(),
    key: GOOGLE_PLACES_API_KEY,
  });
  return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`;
};

async function fetchPlaceDetails(placeId: string): Promise<GooglePlaceCandidate | null> {
  if (!GOOGLE_PLACES_API_KEY) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_PLACES_API_KEY,
    fields: "name,formatted_address,geometry,photos,rating",
  });

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
    const { data } = await axios.get(url);
    if (data.status !== "OK" || !data.result) {
      console.warn(`Place details not available: ${data.status}`);
      return null;
    }

    const location = data.result.geometry?.location;
    if (!location) {
      return null;
    }

    const photos =
      Array.isArray(data.result.photos) && data.result.photos.length > 0
        ? data.result.photos
            .map((photo: { photo_reference?: string }) =>
              photo.photo_reference ? BUILD_PHOTO_URL(photo.photo_reference) : null
            )
            .filter(Boolean) as string[]
        : [];

    return {
      placeId,
      name: data.result.name,
      address: data.result.formatted_address,
      lat: location.lat,
      lng: location.lng,
      rating: data.result.rating ?? null,
      photos,
    };
  } catch (error) {
    console.error("Place details fetch failed:", error);
    return null;
  }
}

export async function verifyPlaceLocation(
  lat: number,
  lng: number
): Promise<GooglePlaceVerificationResult | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: "150",
      key: GOOGLE_PLACES_API_KEY,
    });
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const { data } = await axios.get(url);
    if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
      console.warn("No nearby place returned.");
      return null;
    }

    const candidate = data.results[0];
    const details = await fetchPlaceDetails(candidate.place_id);
    if (!details) {
      return null;
    }

    const driftMeters = Math.round(
      haversineDistanceKm({ lat, lng }, { lat: details.lat, lng: details.lng }) * 1000
    );

    return {
      place: details,
      driftMeters,
    };
  } catch (error) {
    console.error("Google Places verification failed:", error);
    return null;
  }
}
