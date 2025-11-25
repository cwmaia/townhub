import { NextResponse } from "next/server";
import { z } from "zod";
import { PlaceType } from "@prisma/client";
import { prisma } from "../../../lib/db";

const querySchema = z.object({
  type: z
    .nativeEnum(PlaceType)
    .optional()
    .catch(undefined),
  rating: z
    .preprocess((value) => (value ? Number(value) : undefined), z.number().min(0).max(5).optional())
    .optional(),
  distance: z
    .enum(["0-1", "1-3", "3-10"])
    .optional()
    .catch(undefined),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined
    ),
  price: z
    .enum(["$", "$$", "$$$"])
    .optional()
    .catch(undefined),
  q: z.string().optional(),
  limit: z
    .preprocess((value) => Number(value ?? 12), z.number().int().min(1).max(48))
    .default(12),
  offset: z
    .preprocess((value) => Number(value ?? 0), z.number().int().min(0))
    .default(0),
});

const buildDistanceFilter = (range?: string) => {
  if (!range) return undefined;
  const [min, max] = range.split("-").map(Number);
  const filter: { gte?: number; lte?: number } = {};
  if (Number.isFinite(min)) filter.gte = min;
  if (Number.isFinite(max)) filter.lte = max;
  return Object.keys(filter).length ? filter : undefined;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parseResult = querySchema.safeParse(Object.fromEntries(searchParams));

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { type, rating, distance, tags, price, q, limit, offset } =
    parseResult.data;

  const andFilters: Record<string, unknown>[] = [];

  if (type) andFilters.push({ type });
  if (rating)
    andFilters.push({
      rating: {
        gte: rating,
      },
    });
  const distanceFilter = buildDistanceFilter(distance);
  if (distanceFilter) andFilters.push({ distanceKm: distanceFilter });
  if (tags && tags.length)
    andFilters.push({
      tags: {
        hasSome: tags,
      },
    });
  if (price)
    andFilters.push({
      tags: {
        has: price,
      },
    });
  if (q)
    andFilters.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    });

  const where = andFilters.length ? { AND: andFilters } : {};

  const [data, total] = await Promise.all([
    prisma.place.findMany({
      where,
      orderBy: [
        { rating: "desc" },
        { ratingCount: "desc" },
        { name: "asc" },
      ],
      take: limit,
      skip: offset,
    }),
    prisma.place.count({ where }),
  ]);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const toAbsoluteUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    const prefix = value.startsWith("/") ? "" : "/";
    return `${API_URL}${prefix}${value}`;
  };
  const dataWithAbsoluteUrls = data.map((place) => ({
    ...place,
    imageUrl: toAbsoluteUrl(place.imageUrl),
    featuredImageUrl: toAbsoluteUrl(place.featuredImageUrl),
    galleryUrls: place.galleryUrls.map((url) => toAbsoluteUrl(url) ?? url),
  }));

  return NextResponse.json({
    data: dataWithAbsoluteUrls,
    meta: {
      total,
      limit,
      offset,
    },
  });
}
