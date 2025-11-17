import { createClient, type PhotosWithTotalResults } from "pexels";
import type {
  ImageSearchOptions,
  ImageSearchResult,
  ImageSource,
} from "../types";

type PexelsClient = ReturnType<typeof createClient>;

/**
 * Pexels API setup:
 * 1. Create a free account at https://www.pexels.com/api/.
 * 2. Generate an API key from the dashboard.
 * 3. Store the key in PEXELS_API_KEY.
 */
export class PexelsImageSource implements ImageSource {
  readonly name = "pexels" as const;

  private client: PexelsClient | null = null;

  private get apiKey() {
    return process.env.PEXELS_API_KEY;
  }

  isEnabled() {
    return Boolean(this.apiKey);
  }

  private ensureClient() {
    if (!this.client && this.apiKey) {
      this.client = createClient(this.apiKey);
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
      const perPage = Math.min(Math.max(options.limit ?? 6, 1), 80);
      const response = (await client.photos.search({
        query,
        per_page: perPage,
        orientation: "landscape",
      })) as PhotosWithTotalResults;

      const photos = response.photos ?? [];
      return photos.map((photo) => ({
        url: photo.src?.large ?? photo.src?.original ?? "",
        width: photo.width,
        height: photo.height,
        source: this.name,
        description: photo.alt ?? undefined,
        attributions: {
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
        },
      }));
    } catch (error) {
      console.error("[PexelsImageSource] search error:", {
        query,
        error,
      });
      return [];
    }
  }
}
