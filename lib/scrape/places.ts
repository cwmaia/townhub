import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import type { PlaceType } from "@prisma/client";
import type { LatLng } from "../geo";

export type ScrapedPlace = {
  name: string;
  type: PlaceType;
  description: string;
  address?: string;
  website?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
  priceRange?: string;
};

const NOMINATIM_ENDPOINT =
  "https://nominatim.openstreetmap.org/search?format=json&limit=1";

export const geocode = async (
  query: string
): Promise<LatLng | null> => {
  try {
    const url = `${NOMINATIM_ENDPOINT}&q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "TownHub Seed Script",
      },
    });

    const [match] = response.data ?? [];
    if (!match) return null;

    return {
      lat: parseFloat(match.lat),
      lng: parseFloat(match.lon),
    };
  } catch (error) {
    console.error("Nominatim geocode error:", error);
    return null;
  }
};

export const ensureImage = async (
  imageUrl: string,
  destination: string
) => {
  try {
    const resolvedPath = path.resolve(destination);
    await fs.promises.mkdir(path.dirname(resolvedPath), { recursive: true });

    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: "arraybuffer",
    });

    await fs.promises.writeFile(
      resolvedPath,
      Buffer.from(response.data),
      "binary"
    );

    return resolvedPath;
  } catch (error) {
    console.error("Image download failed:", imageUrl, error);
    return null;
  }
};

export const withFallbackImage = (
  relativePath: string,
  fallback: string
) => (relativePath ? relativePath : fallback);
