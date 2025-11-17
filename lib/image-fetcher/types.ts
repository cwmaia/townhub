import type { ScrapedPlace } from "../scrape/places";

export type ImageSourceName = "google" | "unsplash" | "pexels";

export type ImageSearchResult = {
  url: string;
  width?: number;
  height?: number;
  source: ImageSourceName;
  description?: string;
  attributions?: Record<string, string | undefined>;
};

export type ImageSearchOptions = {
  limit?: number;
  safeSearch?: boolean;
};

export interface ImageSource {
  readonly name: ImageSourceName;
  isEnabled(): boolean;
  search(
    query: string,
    options?: ImageSearchOptions
  ): Promise<ImageSearchResult[]>;
}

export type FetchTargetType = "place" | "event";

export type FetchRecord = {
  targetType: FetchTargetType;
  targetName: string;
  slug: string;
  status: "success" | "skipped" | "failed";
  source?: ImageSourceName;
  imagePath?: string;
  url?: string;
  message?: string;
};

export type FetchReport = {
  successes: FetchRecord[];
  failures: FetchRecord[];
  skipped: FetchRecord[];
  totals: {
    success: number;
    failure: number;
    skipped: number;
  };
};

export type FetchContext = {
  townName: string;
  country: string;
};

export type FetchPlaceResult = {
  place: ScrapedPlace;
  slug: string;
  queriesTried: string[];
  results: ImageSearchResult[];
};

export type SeedEventLike = {
  title: string;
  description: string;
  location: string;
  imageUrl?: string | null;
};

export type FetchEventResult = {
  event: SeedEventLike;
  slug: string;
  queriesTried: string[];
  results: ImageSearchResult[];
};
