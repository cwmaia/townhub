import fs from "node:fs";
import path from "node:path";
import {
  type LatLng,
  haversineDistanceKm,
} from "../../lib/geo";
import { getAttractions } from "../../lib/scrape/attractions";
import { getLodging } from "../../lib/scrape/lodging";
import type { ScrapedPlace } from "../../lib/scrape/places";
import { ensureImage, geocode } from "../../lib/scrape/places";
import { getRestaurants } from "../../lib/scrape/restaurants";
import { getTownServices } from "../../lib/scrape/services";

export type SeedPlace = ScrapedPlace & {
  distanceKm?: number;
  imagePath?: string;
};

export type SeedEvent = {
  title: string;
  description: string;
  imageUrl: string;
  startsAt: string;
  endsAt: string;
  location: string;
  latitude: number;
  longitude: number;
};

const downloadDir = path.resolve("public/media");

export const stykkisholmurImageManifest: Record<string, string> = {
  // Services
  "Stykkishólmur Police":
    "https://images.unsplash.com/photo-1527786356702-4b19cf256c86?auto=format&fit=crop&w=800&h=800&q=80",
  "Stykkishólmur Fire Brigade":
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&h=800&q=80",
  "Heilsugæsla Stykkishólms Health Center":
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&h=800&q=80",
  "Baldur Ferry Terminal":
    "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&w=800&h=800&q=80",
  "Icelandic Post Office - Stykkishólmur":
    "https://images.unsplash.com/photo-1605732562690-6bab718d1f04?auto=format&fit=crop&w=800&h=800&q=80",

  // Lodging
  "Hotel Stykkishólmur":
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
  "Fosshótel Stykkishólmur":
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800",
  "Our Guesthouse":
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800",
  "Hotel Egilsen":
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800",
  "Hótel Fransiskus Stykkishólmi":
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800",
  "Sjavarborg Guesthouse":
    "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=800",
  "Akkeri Guesthouse":
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800",
  "Hotel Karolina":
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800",

  // Restaurants
  "Narfeyrarstofa Bistro":
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
  "Skúli Craft Bar & Bistro":
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800",
  "Sjávarpakkhúsið":
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800",
  "Narfeyrarkaffi":
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800",
  "Stykkishólmur Bakery":
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800",
  "Skipper Restaurant":
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800",
  "Café Sjávarborg":
    "https://images.unsplash.com/photo-1559305616-3fca9a430d1e?q=80&w=800",
  "Skurinn":
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
  "Hafnarvagninn":
    "https://images.unsplash.com/photo-1580217593608-61931cefc821?q=80&w=800",

  // Attractions
  "Volcano Museum":
    "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?q=80&w=800",
  "Library of Water":
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800",
  "Icelandic Eider Center":
    "https://images.unsplash.com/photo-1568408838715-2715fb5b3419?q=80&w=800",
  "Breiðafjörður Bay Boat Tours":
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800",
  "Stykkishólmur Lighthouse":
    "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?q=80&w=800",
  "Norwegian House Regional Museum":
    "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?q=80&w=800",
  "Sundlaug Stykkishólms Thermal Pool":
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800",
  "Helgafell Sacred Hill":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
};

// Helper to create dynamic dates relative to now for testing
const hoursFromNow = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

export const stykkisholmurEvents: SeedEvent[] = [
  {
    title: "Breiðafjörður Seafood Festival",
    description:
      "Taste freshly landed shellfish, meet local chefs, and join harborfront cooking demos celebrating the bounty of Breiðafjörður.",
    imageUrl:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800",
    startsAt: hoursFromNow(2), // Happening in 2 hours (within_24h)
    endsAt: hoursFromNow(11),
    location: "Harbor Square",
    latitude: 65.0752,
    longitude: -22.7339,
  },
  {
    title: "Midnight Sun Kayak Tour",
    description:
      "Guided paddle through basalt islands, with stories of Flatey and seabird colonies under the glow of the midnight sun.",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    startsAt: hoursFromNow(-1), // Started 1 hour ago (happening_now)
    endsAt: hoursFromNow(2),
    location: "Bæjartröð Slipway",
    latitude: 65.0745,
    longitude: -22.7285,
  },
  {
    title: "Helgafell Sunrise Walk",
    description:
      "Early morning hike to the sacred hill with a local storyteller sharing folktales and panoramic viewpoints.",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800",
    startsAt: hoursFromNow(36), // In 36 hours (within_48h)
    endsAt: hoursFromNow(39),
    location: "Helgafell Trailhead",
    latitude: 65.0631,
    longitude: -22.729,
  },
  {
    title: "Norwegian House Museum Night",
    description:
      "Evening tours of the historic 1828 timber house with candle-lit displays, traditional Icelandic stories, and live folk music.",
    imageUrl:
      "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?q=80&w=800",
    startsAt: hoursFromNow(96), // In 4 days (within_week)
    endsAt: hoursFromNow(99),
    location: "Norwegian House",
    latitude: 65.0772,
    longitude: -22.7287,
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const collectPlaces = (): ScrapedPlace[] => [
  ...getTownServices(),
  ...getLodging(),
  ...getRestaurants(),
  ...getAttractions(),
];

const getTownCenter = async () => {
  const envCoords = process.env.NEXT_PUBLIC_TOWN_CENTER_COORDS;
  if (envCoords) {
    const [lat, lng] = envCoords.split(",").map((value) => parseFloat(value));
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }
  }

  const result = await geocode("Stykkishólmur, Iceland");
  if (!result) {
    throw new Error("Unable to geocode Stykkishólmur");
  }
  return result;
};

const enrichPlace = async (
  place: ScrapedPlace,
  townCenter: LatLng
): Promise<SeedPlace> => {
  const slug = slugify(place.name);
  const targetImage = path.join(downloadDir, `${slug}.jpg`);

  let imagePath: string | null = null;
  if (fs.existsSync(targetImage)) {
    imagePath = `/media/${path.basename(targetImage)}`;
  } else {
    const remoteImage = stykkisholmurImageManifest[place.name];
    if (remoteImage) {
      imagePath = (await ensureImage(remoteImage, targetImage))
        ? `/media/${path.basename(targetImage)}`
        : null;
    }
  }

  let lat = place.lat;
  let lng = place.lng;

  if (lat == null || lng == null) {
    const match = await geocode(
      place.address ? `${place.name}, ${place.address}` : place.name
    );
    if (match) {
      lat = match.lat;
      lng = match.lng;
    }
  }

  const distanceKm =
    lat != null && lng != null
      ? haversineDistanceKm(townCenter, { lat, lng })
      : null;

  return {
    ...place,
    lat: lat ?? townCenter.lat,
    lng: lng ?? townCenter.lng,
    distanceKm: distanceKm ?? 0,
    imagePath: imagePath ?? "/media/placeholder.svg",
  };
};

const ensurePlaceholder = async () => {
  const placeholderPath = path.join(downloadDir, "placeholder.svg");
  if (fs.existsSync(placeholderPath)) return;
  await fs.promises.mkdir(downloadDir, { recursive: true });
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#003580"/><text x="50%" y="50%" font-size="48" fill="#f1f5f9" text-anchor="middle" dominant-baseline="middle">Stykkishólmur</text></svg>`;
  await fs.promises.writeFile(placeholderPath, svgPlaceholder);
};

const resolveEventImage = async (event: SeedEvent) => {
  const slug = slugify(event.title);
  const targetImage = path.join(downloadDir, `${slug}.jpg`);

  if (fs.existsSync(targetImage)) {
    return {
      ...event,
      imageUrl: `/media/${path.basename(targetImage)}`,
    };
  }

  if (event.imageUrl) {
    const ensured = await ensureImage(event.imageUrl, targetImage);
    if (ensured) {
      return {
        ...event,
        imageUrl: `/media/${path.basename(ensured)}`,
      };
    }
  }

  return {
    ...event,
    imageUrl: "/media/placeholder.svg",
  };
};

export const fetchStykkisholmur = async () => {
  await ensurePlaceholder();
  const townCenter = await getTownCenter();
  const places = collectPlaces();
  const hydrated: SeedPlace[] = [];

  for (const place of places) {
    const enriched = await enrichPlace(place, townCenter);
    hydrated.push(enriched);
  }

  const resolvedEvents = await Promise.all(
    stykkisholmurEvents.map((event) => resolveEventImage(event))
  );

  return { places: hydrated, events: resolvedEvents, townCenter };
};

export type FetchStykkisholmurResult = Awaited<
  ReturnType<typeof fetchStykkisholmur>
>;
