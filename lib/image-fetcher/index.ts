import path from "node:path";
import axios from "axios";
import type { ScrapedPlace } from "../scrape/places";
import {
  optimizeAndSave,
  getImageMetadata,
  validateImageDimensions,
  type OptimizationResult,
} from "./optimizer";
import {
  type FetchContext,
  type FetchEventResult,
  type FetchPlaceResult,
  type FetchRecord,
  type FetchReport,
  type ImageSearchResult,
  type ImageSource,
  type ImageSourceName,
  type SeedEventLike,
  type ImageSearchOptions,
} from "./types";
import { GoogleImageSource } from "./sources/google";
import { UnsplashImageSource } from "./sources/unsplash";
import { PexelsImageSource } from "./sources/pexels";

export type DownloadResult = OptimizationResult & {
  relativePath: string;
};

export type ImageFetcherOptions = {
  downloadDir?: string;
  defaultSources?: ImageSourceName[];
  dryRun?: boolean;
};

type SearchRequest = {
  query: string;
  options?: ImageSearchOptions;
};

const DEFAULT_DOWNLOAD_DIR = path.resolve("public/media");
const DEFAULT_SOURCES: ImageSourceName[] = ["google", "unsplash", "pexels"];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const typeKeywordMap: Record<string, string> = {
  TOWN_SERVICE: "service",
  LODGING: "hotel",
  RESTAURANT: "restaurant",
  ATTRACTION: "attraction",
};

export class ImageFetcher {
  private readonly downloadDir: string;
  private readonly defaultSources: ImageSourceName[];
  private readonly dryRun: boolean;
  private readonly sources: Record<ImageSourceName, ImageSource>;
  private readonly records: FetchRecord[] = [];

  constructor(options: ImageFetcherOptions = {}) {
    this.downloadDir = options.downloadDir
      ? path.resolve(options.downloadDir)
      : DEFAULT_DOWNLOAD_DIR;
    this.defaultSources = options.defaultSources ?? DEFAULT_SOURCES;
    this.dryRun = options.dryRun ?? false;

    this.sources = {
      google: new GoogleImageSource(),
      unsplash: new UnsplashImageSource(),
      pexels: new PexelsImageSource(),
    };
  }

  getDownloadDir() {
    return this.downloadDir;
  }

  getDefaultSources() {
    return this.defaultSources;
  }

  async searchImages(
    query: string,
    sourceNames: ImageSourceName[] = this.defaultSources,
    options: ImageSearchOptions = {}
  ): Promise<ImageSearchResult[]> {
    const unique: ImageSearchResult[] = [];
    const seen = new Set<string>();

    for (const sourceName of sourceNames) {
      const source = this.sources[sourceName];
      if (!source || !source.isEnabled()) continue;

      const results = await source.search(query, options);
      for (const result of results) {
        const url = result.url?.trim();
        if (!url || seen.has(url)) continue;
        seen.add(url);
        unique.push({ ...result, source: sourceName });
      }
    }

    return unique;
  }

  async downloadImage(url: string, savePath: string): Promise<DownloadResult> {
    const resolvedPath = path.resolve(savePath);
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      timeout: 15_000,
    });

    const buffer = Buffer.from(response.data);
    const metadata = await getImageMetadata(buffer);
    if (!validateImageDimensions(metadata.width, metadata.height)) {
      throw new Error(
        `Image too small (${metadata.width ?? "?"}x${
          metadata.height ?? "?"
        })`
      );
    }

    if (this.dryRun) {
      return {
        width: metadata.width,
        height: metadata.height,
        size: buffer.byteLength,
        destination: resolvedPath,
        relativePath: path.relative(
          path.resolve("public"),
          resolvedPath
        ),
      };
    }

    const result = await optimizeAndSave(buffer, resolvedPath, {
      maxSize: 800,
      quality: 82,
    });

    return {
      ...result,
      relativePath: path
        .relative(path.resolve("public"), result.destination)
        .replace(/\\/g, "/"),
    };
  }

  async fetchPlaceImage(
    place: ScrapedPlace,
    townName: string,
    country: string,
    sourceNames: ImageSourceName[] = this.defaultSources
  ): Promise<FetchPlaceResult> {
    const slug = slugify(place.name);
    const queries = this.buildPlaceQueries(place, { townName, country });
    const aggregated = await this.executeSearchOrder(queries, sourceNames);

    return {
      place,
      slug,
      queriesTried: aggregated.queries,
      results: aggregated.results,
    };
  }

  async fetchEventImage(
    event: SeedEventLike,
    townName: string,
    country: string,
    sourceNames: ImageSourceName[] = this.defaultSources
  ): Promise<FetchEventResult> {
    const slug = slugify(event.title);
    const queries = this.buildEventQueries(event, { townName, country });
    const aggregated = await this.executeSearchOrder(queries, sourceNames);

    return {
      event,
      slug,
      queriesTried: aggregated.queries,
      results: aggregated.results,
    };
  }

  recordResult(record: FetchRecord) {
    this.records.push(record);
  }

  generateReport(): FetchReport {
    const successes = this.records.filter((record) => record.status === "success");
    const failures = this.records.filter((record) => record.status === "failed");
    const skipped = this.records.filter((record) => record.status === "skipped");

    return {
      successes,
      failures,
      skipped,
      totals: {
        success: successes.length,
        failure: failures.length,
        skipped: skipped.length,
      },
    };
  }

  resolvePathForSlug(slug: string) {
    return path.join(this.downloadDir, `${slug}.jpg`);
  }

  private async executeSearchOrder(
    searchRequests: SearchRequest[],
    sources: ImageSourceName[]
  ) {
    const queries: string[] = [];
    const aggregated: ImageSearchResult[] = [];
    const seen = new Set<string>();

    for (const { query, options } of searchRequests) {
      queries.push(query);
      const results = await this.searchImages(query, sources, options);
      for (const result of results) {
        const url = result.url?.trim();
        if (!url || seen.has(url)) continue;
        seen.add(url);
        aggregated.push(result);
      }

      if (aggregated.length >= 12) {
        break;
      }
    }

    return { queries, results: aggregated };
  }

  private buildPlaceQueries(
    place: ScrapedPlace,
    context: FetchContext
  ): SearchRequest[] {
    const queries: SearchRequest[] = [];
    const typeKeyword =
      typeKeywordMap[place.type] ??
      place.type?.toLowerCase().replace(/_/g, " ") ??
      "place";
    const baseLocation =
      place.address ??
      `${context.townName}, ${context.country}`;

    const safeOptions: ImageSearchOptions = { safeSearch: true, limit: 6 };

    queries.push({
      query: `${place.name} ${baseLocation}`,
      options: safeOptions,
    });

    queries.push({
      query: `${place.name} ${typeKeyword} ${context.townName}`,
      options: safeOptions,
    });

    if (place.tags?.length) {
      const [tag] = place.tags;
      queries.push({
        query: `${place.name} ${tag} ${context.townName}`,
        options: safeOptions,
      });
    }

    queries.push({
      query: `${typeKeyword} ${context.townName} ${context.country}`,
      options: safeOptions,
    });

    queries.push({
      query: `${typeKeyword} ${context.country}`,
      options: safeOptions,
    });

    return queries;
  }

  private buildEventQueries(
    event: SeedEventLike,
    context: FetchContext
  ): SearchRequest[] {
    const queries: SearchRequest[] = [];
    const baseQuery = `${event.title} ${context.townName} ${context.country}`;
    const safeOptions: ImageSearchOptions = { safeSearch: true, limit: 6 };

    queries.push({
      query: baseQuery,
      options: safeOptions,
    });

    queries.push({
      query: `${event.title} event ${context.townName}`,
      options: safeOptions,
    });

    queries.push({
      query: `${event.title} ${context.country}`,
      options: safeOptions,
    });

    queries.push({
      query: `${event.location ?? context.townName} event ${context.country}`,
      options: safeOptions,
    });

    queries.push({
      query: `${event.title.split(" ")[0]} ${context.country} festival`,
      options: safeOptions,
    });

    return queries;
  }
}

export * from "./types";
