import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export type StreetViewOptions = {
  width?: number;
  height?: number;
  heading?: number;
  pitch?: number;
  fov?: number;
};

export type StreetViewResult = {
  url: string;
  width: number;
  height: number;
  heading: number;
  pitch: number;
  fov: number;
  panoId?: string;
  date?: string;
  location?: {
    lat: number;
    lng: number;
  };
  hasImagery: boolean;
};

export class StreetViewImageSource {
  isEnabled(): boolean {
    return !!GOOGLE_MAPS_API_KEY;
  }

  async getStreetViewImage(
    lat: number,
    lng: number,
    options: StreetViewOptions = {}
  ): Promise<StreetViewResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
      return null;
    }

    const {
      width = 640,
      height = 480,
      heading = 0,
      pitch = 0,
      fov = 90,
    } = options;

    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const { data } = await axios.get(metadataUrl);
      if (data.status !== "OK") {
        return null;
      }

      const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${GOOGLE_MAPS_API_KEY}`;

      return {
        url: imageUrl,
        width,
        height,
        heading,
        pitch,
        fov,
        panoId: data.pano_id,
        date: data.date,
        location: data.location,
        hasImagery: true,
      };
    } catch (error) {
      console.error("Street View metadata check failed:", error);
      return null;
    }
  }

  async getMultiAngleViews(
    lat: number,
    lng: number,
    angles: number[] = [0, 90, 180, 270]
  ): Promise<StreetViewResult[]> {
    const results: StreetViewResult[] = [];
    for (const heading of angles) {
      const result = await this.getStreetViewImage(lat, lng, { heading });
      if (result) {
        results.push(result);
      }
    }
    return results;
  }
}
