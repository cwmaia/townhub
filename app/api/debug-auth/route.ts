import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";

export async function GET() {
  const mockAuthEnabled = process.env.MOCK_AUTH?.trim() === "true";

  try {
    const { user, profile } = await getCurrentProfile();

    return NextResponse.json({
      mockAuthEnabled,
      mockAuthEnvValue: process.env.MOCK_AUTH,
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id ?? null,
      profileId: profile?.id ?? null,
      firstName: profile?.firstName ?? null,
    });
  } catch (error) {
    return NextResponse.json({
      mockAuthEnabled,
      mockAuthEnvValue: process.env.MOCK_AUTH,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
