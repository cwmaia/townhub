import { NextRequest, NextResponse } from "next/server";
import { resetMonthlyQuotas } from "@/lib/notifications/quota";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await resetMonthlyQuotas();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to reset quotas:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset quotas" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
