import { createApi, type Photos } from "unsplash-js";
import type {
  ImageSearchOptions,
  ImageSearchResult,
  ImageSource,
} from "../types";

/**
 * Unsplash API setup:
 * 1. Visit https://unsplash.com/developers and create a developer account.
 * 2. Register a new application and review the API guidelines.
 * 3. Copy the Access Key and store it in UNSPLASH_ACCESS_KEY.
 */
export class UnsplashImageSource implements ImageSource {
  readonly name = "unsplash" as const;

  private client: ReturnType<typeof createApi> | null = null;

  private get accessKey() {
    return process.env.UNSPLASH_ACCESS_KEY;
  }

  isEnabled() {
    return Boolean(this.accessKey);
  }

  private ensureClient() {
    if (!this.client && this.isEnabled()) {
      this.client = createApi({
        accessKey: this.accessKey!,
      });
    }
    return this.client;
  }

  async search(
    query: string,
    options: ImageSearchOptions = {}
  ): Promise<ImageSearchResult[]> {
    if (!this.isEnabled()) return [];
    const client = this.ensureClient();
    if (!client) return [];

    try {
      const perPage = Math.min(Math.max(options.limit ?? 6, 1), 30);
      const response = await client.search.getPhotos({
        query,
        page: 1,
        perPage,
        orientation: "landscape",
        contentFilter: options.safeSearch === false ? "low" : "high",
      });

      if (response.type !== "success") {
        console.warn("[UnsplashImageSource] non-success response", {
          query,
          errors: response.errors,
        });
        return [];
      }

      const results = (response.response?.results ?? []) as Photos["results"];
      return results.map((photo) => ({
        url: photo.urls?.regular ?? photo.urls?.full ?? "",
        width: photo.width,
        height: photo.height,
        source: this.name,
        description: photo.description ?? photo.alt_description ?? undefined,
        attributions: {
          photographer: `${photo.user?.name ?? ""}`.trim() || undefined,
          profileUrl: photo.user?.links?.html,
        },
      }));
    } catch (error) {
      console.error("[UnsplashImageSource] search error:", {
        query,
        error,
      });
      return [];
    }
  }
}
