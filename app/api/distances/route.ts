import { NextResponse } from "next/server";
import { z } from "zod";
import { distanceMatrix } from "../../../lib/google";
import { geocode } from "../../../lib/scrape/places";

const bodySchema = z.object({
  query: z.string().min(3),
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  mode: z.enum(["car", "transit", "walk"]).default("car"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { query, origin, mode } = bodySchema.parse(json);

    const match = await geocode(query);
    if (!match) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    const matrix = await distanceMatrix(origin, match, mode === "car" ? "driving" : mode === "walk" ? "walking" : "transit");

    return NextResponse.json({
      destination: {
        name: query,
        lat: match.lat,
        lng: match.lng,
      },
      distanceKm: matrix.distanceKm,
      durationMinutes: matrix.durationMinutes,
      viaService: matrix.viaService,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to compute distance" },
      { status: 500 }
    );
  }
}
