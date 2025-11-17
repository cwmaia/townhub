import axios from "axios";
import type {
  ImageSearchOptions,
  ImageSearchResult,
  ImageSource,
} from "../types";

const GOOGLE_ENDPOINT = "https://www.googleapis.com/customsearch/v1";

/**
 * Google Custom Search API (Programmable Search) setup:
 * 1. Create an API key in Google Cloud (APIs & Services → Credentials).
 * 2. Enable the "Custom Search API" for the project.
 * 3. Create a Programmable Search Engine that searches the entire web and enable Image Search.
 * 4. Record the Search Engine ID (cx) and supply both values via
 *    GOOGLE_CUSTOM_SEARCH_API_KEY and GOOGLE_CUSTOM_SEARCH_ENGINE_ID.
 */

type GoogleImage = {
  link: string;
  image?: {
    width?: number;
    height?: number;
    thumbnailLink?: string;
    contextLink?: string;
  };
  title?: string;
  displayLink?: string;
};

export class GoogleImageSource implements ImageSource {
  readonly name = "google" as const;

  private get apiKey() {
    return process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  }

  private get engineId() {
    return process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
  }

  isEnabled() {
    return Boolean(this.apiKey && this.engineId);
  }

  async search(
    query: string,
    options: ImageSearchOptions = {}
  ): Promise<ImageSearchResult[]> {
    if (!this.isEnabled()) return [];

    const limit = Math.min(Math.max(options.limit ?? 6, 1), 10);
    try {
      const { data } = await axios.get(GOOGLE_ENDPOINT, {
        params: {
          key: this.apiKey,
          cx: this.engineId,
          q: query,
          searchType: "image",
          safe: options.safeSearch === false ? "off" : "active",
          num: limit,
          imgType: "photo",
          imgSize: "large",
          fileType: "jpg",
        },
      });

      const items: GoogleImage[] = data?.items ?? [];
      return items
        .filter((item) => Boolean(item?.link))
        .map((item) => ({
          url: item.link,
          width: item.image?.width,
          height: item.image?.height,
          source: this.name,
          description: item.title,
          attributions: {
            contextLink: item.image?.contextLink,
            displayLink: item.displayLink,
          },
        }));
    } catch (error) {
      console.error("[GoogleImageSource] search error:", {
        query,
        error,
      });
      return [];
    }
  }
}
