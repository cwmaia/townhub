import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { stdout, stdin } from "node:process";
import { createInterface } from "node:readline/promises";
import { setTimeout as delay } from "node:timers/promises";
import {
  ImageFetcher,
  type ImageSearchResult,
  type ImageSourceName,
} from "../../lib/image-fetcher";
import type { ScrapedPlace } from "../../lib/scrape/places";
import { getAttractions } from "../../lib/scrape/attractions";
import { getLodging } from "../../lib/scrape/lodging";
import { getRestaurants } from "../../lib/scrape/restaurants";
import { getTownServices } from "../../lib/scrape/services";
import {
  stykkisholmurEvents,
  type SeedEvent,
} from "./fetch_stykkisholmur";

type TargetType = "places" | "events";

type CliOptions = {
  town: string;
  auto: boolean;
  dryRun: boolean;
  limit?: number;
  types: Set<TargetType>;
  sources?: ImageSourceName[];
  force: boolean;
};

type TownDataset = {
  key: string;
  name: string;
  country: string;
  places: ScrapedPlace[];
  events: SeedEvent[];
};

const LOG_PATH = path.resolve("database/seed/image_fetch_log.json");
const VALID_SOURCES: ImageSourceName[] = ["google", "unsplash", "pexels"];

const isValidSource = (value: string): value is ImageSourceName =>
  (VALID_SOURCES as ReadonlyArray<string>).includes(value);

const parseArgs = (): CliOptions => {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    town: "stykkisholmur",
    auto: false,
    dryRun: false,
    types: new Set<TargetType>(["places", "events"]),
    force: false,
  };

  for (const raw of args) {
    const [flag, value] = raw.split("=");
    switch (flag) {
      case "--town":
        if (value) options.town = value.toLowerCase();
        break;
      case "--auto":
        options.auto = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--limit":
        if (value) options.limit = Number.parseInt(value, 10);
        break;
      case "--type":
      case "--types":
        if (value) {
          options.types.clear();
          value
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .forEach((item) => {
              if (item === "places" || item === "events") {
                options.types.add(item);
              }
            });
        }
        break;
      case "--sources":
        if (value) {
          const sources = value
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(isValidSource);
          if (sources.length > 0) {
            options.sources = sources;
          }
        }
        break;
      case "--force":
        options.force = true;
        break;
      default:
        break;
    }
  }

  return options;
};

const loadTownDataset = async (town: string): Promise<TownDataset> => {
  if (town !== "stykkisholmur") {
    throw new Error(
      `Unsupported town "${town}". Add a loader in update_images.ts to continue.`
    );
  }

  const places: ScrapedPlace[] = [
    ...getTownServices(),
    ...getLodging(),
    ...getRestaurants(),
    ...getAttractions(),
  ];

  return {
    key: town,
    name: "Stykkishólmur",
    country: "Iceland",
    places,
    events: stykkisholmurEvents,
  };
};

const formatResult = (result: ImageSearchResult, index: number) => {
  const dimensions =
    result.width && result.height
      ? `${result.width}x${result.height}`
      : "unknown size";
  return `${index + 1}. ${result.url} (${dimensions}, ${result.source})`;
};

const promptSelection = async (
  rl: ReturnType<typeof createInterface>,
  prompt: string
) => {
  const answer = await rl.question(prompt);
  return answer.trim();
};

const ensureLogDir = async () => {
  await fs.promises.mkdir(path.dirname(LOG_PATH), { recursive: true });
};

const upsertLog = async (payload: unknown) => {
  await ensureLogDir();
  await fs.promises.writeFile(LOG_PATH, JSON.stringify(payload, null, 2), "utf-8");
};

const processPlaces = async (
  dataset: TownDataset,
  fetcher: ImageFetcher,
  options: CliOptions,
  rl: ReturnType<typeof createInterface> | null
) => {
  const targets = dataset.places.slice(
    0,
    options.limit ?? dataset.places.length
  );

  for (const place of targets) {
    const { slug, results, queriesTried } = await fetcher.fetchPlaceImage(
      place,
      dataset.name,
      dataset.country,
      options.sources ?? fetcher.getDefaultSources()
    );

    const resolvedPath = fetcher.resolvePathForSlug(slug);
    const fileExists = fs.existsSync(resolvedPath);

    if (fileExists && !options.force) {
      console.info(`• ${place.name} — existing image found, skipping.`);
      fetcher.recordResult({
        targetType: "place",
        targetName: place.name,
        slug,
        status: "skipped",
        message: "Existing image preserved",
      });
      continue;
    }

    if (!results.length) {
      console.warn(`⚠ No images found for ${place.name}. Queries tried:`);
      for (const query of queriesTried) {
        console.warn(`  - ${query}`);
      }
      fetcher.recordResult({
        targetType: "place",
        targetName: place.name,
        slug,
        status: "failed",
        message: "No search results",
      });
      continue;
    }

    if (options.auto) {
      const selected = results[0];
      try {
        if (!options.dryRun) {
          await fetcher.downloadImage(
            selected.url,
            fetcher.resolvePathForSlug(slug)
          );
        }
        fetcher.recordResult({
          targetType: "place",
          targetName: place.name,
          slug,
          status: "success",
          url: selected.url,
          source: selected.source,
          message: options.dryRun ? "Dry run - no download" : undefined,
          imagePath: options.dryRun
            ? undefined
            : `/media/${path.basename(fetcher.resolvePathForSlug(slug))}`,
        });
        console.info(
          `✓ ${place.name} — ${options.dryRun ? "would download" : "downloaded"} from ${selected.source}`
        );
      } catch (error) {
        console.error(`✗ ${place.name} — download failed`, error);
        fetcher.recordResult({
          targetType: "place",
          targetName: place.name,
          slug,
          status: "failed",
          url: selected.url,
          source: selected.source,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      continue;
    }

    if (!rl) continue;

    console.info(`\nFound images for: ${place.name}`);
    results.forEach((result, index) => {
      console.info(formatResult(result, index));
    });

    let done = false;
    while (!done) {
      const answer = await promptSelection(
        rl,
        "Select image (1-n), retry (r), skip (s), or quit (q): "
      );

      if (answer === "q") {
        console.info("Quitting…");
        throw new Error("USER_ABORT");
      }

      if (answer === "s") {
        fetcher.recordResult({
          targetType: "place",
          targetName: place.name,
          slug,
          status: "skipped",
          message: "User skipped",
        });
        done = true;
        break;
      }

      if (answer === "r") {
        const newQuery = await promptSelection(rl, "Enter new search query: ");
        if (!newQuery) continue;
        const newResults = await fetcher.searchImages(
          newQuery,
          options.sources ?? fetcher.getDefaultSources()
        );
        if (!newResults.length) {
          console.warn("No results for custom query.");
          continue;
        }
        console.info(`Results for "${newQuery}":`);
        newResults.forEach((result, index) => {
          console.info(formatResult(result, index));
        });
        results.splice(0, results.length, ...newResults);
        continue;
      }

      const selection = Number.parseInt(answer, 10);
      if (Number.isNaN(selection) || selection < 1 || selection > results.length) {
        console.warn("Invalid selection. Please try again.");
        continue;
      }

      const selected = results[selection - 1];
      try {
        if (!options.dryRun) {
          await fetcher.downloadImage(
            selected.url,
            fetcher.resolvePathForSlug(slug)
          );
        }

        fetcher.recordResult({
          targetType: "place",
          targetName: place.name,
          slug,
          status: "success",
          url: selected.url,
          source: selected.source,
          message: options.dryRun ? "Dry run - no download" : undefined,
          imagePath: options.dryRun
            ? undefined
            : `/media/${path.basename(fetcher.resolvePathForSlug(slug))}`,
        });
        console.info(
          `✓ ${place.name} — ${options.dryRun ? "would download" : "downloaded"} from ${selected.source}`
        );
      } catch (error) {
        console.error(`✗ ${place.name} — download failed`, error);
        fetcher.recordResult({
          targetType: "place",
          targetName: place.name,
          slug,
          status: "failed",
          url: selected.url,
          source: selected.source,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      done = true;
    }
  }
};

const processEvents = async (
  dataset: TownDataset,
  fetcher: ImageFetcher,
  options: CliOptions,
  rl: ReturnType<typeof createInterface> | null
) => {
  const targets = dataset.events.slice(
    0,
    options.limit ?? dataset.events.length
  );

  for (const event of targets) {
    const { slug, results, queriesTried } = await fetcher.fetchEventImage(
      event,
      dataset.name,
      dataset.country,
      options.sources ?? fetcher.getDefaultSources()
    );
    const resolvedPath = fetcher.resolvePathForSlug(slug);
    const fileExists = fs.existsSync(resolvedPath);

    if (fileExists && !options.force) {
      console.info(`• ${event.title} — existing image found, skipping.`);
      fetcher.recordResult({
        targetType: "event",
        targetName: event.title,
        slug,
        status: "skipped",
        message: "Existing image preserved",
      });
      continue;
    }

    if (!results.length) {
      console.warn(`⚠ No images found for ${event.title}. Queries tried:`);
      for (const query of queriesTried) {
        console.warn(`  - ${query}`);
      }
      fetcher.recordResult({
        targetType: "event",
        targetName: event.title,
        slug,
        status: "failed",
        message: "No search results",
      });
      continue;
    }

    if (options.auto) {
      const selected = results[0];
      try {
        if (!options.dryRun) {
          await fetcher.downloadImage(
            selected.url,
            fetcher.resolvePathForSlug(slug)
          );
        }
        fetcher.recordResult({
          targetType: "event",
          targetName: event.title,
          slug,
          status: "success",
          url: selected.url,
          source: selected.source,
          message: options.dryRun ? "Dry run - no download" : undefined,
          imagePath: options.dryRun
            ? undefined
            : `/media/${path.basename(fetcher.resolvePathForSlug(slug))}`,
        });
        console.info(
          `✓ ${event.title} — ${options.dryRun ? "would download" : "downloaded"} from ${selected.source}`
        );
      } catch (error) {
        console.error(`✗ ${event.title} — download failed`, error);
        fetcher.recordResult({
          targetType: "event",
          targetName: event.title,
          slug,
          status: "failed",
          url: selected.url,
          source: selected.source,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      continue;
    }

    if (!rl) continue;

    console.info(`\nFound images for: ${event.title}`);
    results.forEach((result, index) => {
      console.info(formatResult(result, index));
    });

    let done = false;
    while (!done) {
      const answer = await promptSelection(
        rl,
        "Select image (1-n), retry (r), skip (s), or quit (q): "
      );

      if (answer === "q") {
        console.info("Quitting…");
        throw new Error("USER_ABORT");
      }

      if (answer === "s") {
        fetcher.recordResult({
          targetType: "event",
          targetName: event.title,
          slug,
          status: "skipped",
          message: "User skipped",
        });
        done = true;
        break;
      }

      if (answer === "r") {
        const newQuery = await promptSelection(rl, "Enter new search query: ");
        if (!newQuery) continue;
        const newResults = await fetcher.searchImages(
          newQuery,
          options.sources ?? fetcher.getDefaultSources()
        );
        if (!newResults.length) {
          console.warn("No results for custom query.");
          continue;
        }
        console.info(`Results for "${newQuery}":`);
        newResults.forEach((result, index) => {
          console.info(formatResult(result, index));
        });
        results.splice(0, results.length, ...newResults);
        continue;
      }

      const selection = Number.parseInt(answer, 10);
      if (Number.isNaN(selection) || selection < 1 || selection > results.length) {
        console.warn("Invalid selection. Please try again.");
        continue;
      }

      const selected = results[selection - 1];
      try {
        if (!options.dryRun) {
          await fetcher.downloadImage(
            selected.url,
            fetcher.resolvePathForSlug(slug)
          );
        }

        fetcher.recordResult({
          targetType: "event",
          targetName: event.title,
          slug,
          status: "success",
          url: selected.url,
          source: selected.source,
          message: options.dryRun ? "Dry run - no download" : undefined,
          imagePath: options.dryRun
            ? undefined
            : `/media/${path.basename(fetcher.resolvePathForSlug(slug))}`,
        });
        console.info(
          `✓ ${event.title} — ${options.dryRun ? "would download" : "downloaded"} from ${selected.source}`
        );
      } catch (error) {
        console.error(`✗ ${event.title} — download failed`, error);
        fetcher.recordResult({
          targetType: "event",
          targetName: event.title,
          slug,
          status: "failed",
          url: selected.url,
          source: selected.source,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      done = true;
    }
  }
};

const main = async () => {
  const options = parseArgs();
  const dataset = await loadTownDataset(options.town);
  const fetcher = new ImageFetcher({
    dryRun: options.dryRun,
    defaultSources: options.sources,
  });
  const rl = options.auto
    ? null
    : createInterface({
        input: stdin,
        output: stdout,
      });

  console.info(
    `Processing ${options.types.has("places") ? "places" : ""}${
      options.types.has("places") && options.types.has("events") ? " and " : ""
    }${options.types.has("events") ? "events" : ""} for ${
      dataset.name
    }, ${dataset.country}`
  );

  try {
    if (options.types.has("places")) {
      console.info("\nProcessing places…");
      await processPlaces(dataset, fetcher, options, rl);
    }

    if (options.types.has("events")) {
      console.info("\nProcessing events…");
      await processEvents(dataset, fetcher, options, rl);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ABORT") {
      console.info("Session aborted by user.");
    } else {
      console.error("Unexpected error:", error);
    }
  } finally {
    if (rl) {
      rl.close();
      await delay(50);
    }
  }

  const report = fetcher.generateReport();
  const payload = {
    generatedAt: new Date().toISOString(),
    town: {
      key: dataset.key,
      name: dataset.name,
      country: dataset.country,
    },
    options,
    report,
  };

  await upsertLog(payload);

  console.info("\nSummary:");
  console.info(`- ${report.totals.success} successes`);
  console.info(`- ${report.totals.skipped} skipped`);
  console.info(`- ${report.totals.failure} failures`);
  console.info(`Log written to ${LOG_PATH}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
