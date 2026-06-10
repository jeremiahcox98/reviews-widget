import { fetchReviewsFromGoogle, getAccessTokenFromRefresh } from "@/lib/google-reviews";
import {
  buildCachePayload,
  getReviewsCache,
  isCacheStale,
  setReviewsCache,
  type ReviewsCachePayload,
} from "@/lib/reviews-cache";
import { getRefreshToken } from "@/lib/refresh-token-store";
import type { Review } from "@/lib/reviews";
import { NextRequest } from "next/server";

export async function syncReviews(request?: NextRequest): Promise<ReviewsCachePayload> {
  const refreshToken = request
    ? await getRefreshToken(request)
    : await getRefreshTokenFromKvOnly();

  if (!refreshToken) {
    throw new Error("No refresh token stored. Connect with Google once in the admin UI.");
  }

  const accessToken = await getAccessTokenFromRefresh(refreshToken);
  const reviews = (await fetchReviewsFromGoogle(accessToken)) as Review[];
  const payload = buildCachePayload(reviews);
  await setReviewsCache(payload);
  return payload;
}

async function getRefreshTokenFromKvOnly(): Promise<string | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    const kv = (env as { REFRESH_TOKEN_KV?: { get: (key: string) => Promise<string | null> } })
      .REFRESH_TOKEN_KV;
    if (kv) {
      return kv.get("refresh_token");
    }
  } catch {
    // local dev without Cloudflare context
  }
  return null;
}

export async function getCachedReviewsWithRefresh(
  request: NextRequest
): Promise<{ payload: ReviewsCachePayload; stale: boolean; refreshed: boolean }> {
  const cached = await getReviewsCache();

  if (cached && !isCacheStale(cached.lastUpdated)) {
    return { payload: cached, stale: false, refreshed: false };
  }

  try {
    const payload = await syncReviews(request);
    return { payload, stale: false, refreshed: true };
  } catch (err) {
    if (cached) {
      return {
        payload: {
          ...cached,
          syncError: err instanceof Error ? err.message : "Sync failed",
        },
        stale: true,
        refreshed: false,
      };
    }
    throw err;
  }
}
