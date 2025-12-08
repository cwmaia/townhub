import type { Event, Place, PlaceType, UserRole } from "@prisma/client";
import type { AppLocale } from "../../lib/i18n";

export type TownAppPlace = Place & {
  imageUrl: string | null;
};

export type TownAppEvent = Event;

// Legacy aliases for backward compatibility
export type TownHubPlace = TownAppPlace;
export type TownHubEvent = TownAppEvent;

export type FilterState = {
  type: PlaceType | "ALL";
  rating?: number;
  distance?: "0-1" | "1-3" | "3-10";
  price?: "$" | "$$" | "$$$";
  tags: string[];
};

export type TownCenter = {
  lat: number;
  lng: number;
};

export type ProfileSummary = {
  firstName?: string | null;
  avatarUrl?: string | null;
  role?: UserRole | null;
};

export type Destination = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type LocaleOption = {
  locale: AppLocale;
  label: string;
};
