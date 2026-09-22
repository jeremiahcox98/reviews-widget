import { getCachedReviewsWithRefresh } from "@/lib/sync-reviews";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const { payload, stale, refreshed } = await getCachedReviewsWithRefresh(request);

    return NextResponse.json(
      {
        reviews: payload.reviews,
        averageRating: payload.averageRating,
        totalCount: payload.totalCount,
        lastUpdated: payload.lastUpdated,
        stale,
        refreshed,
      },
      {
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": stale
            ? "public, max-age=300, stale-while-revalidate=3600"
            : "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("Cached reviews fetch failed:", err);
    const message = err instanceof Error ? err.message : "Failed to load reviews";
    const status = message.includes("refresh token") || message.includes("OAuth") ? 401 : 502;
    return NextResponse.json(
      { error: message, reviews: [] },
      { status, headers: CORS_HEADERS }
    );
  }
}
