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

const SYNC_FAIL_KEY = "reviews_sync_fail";
const SYNC_BACKOFF_MS = 24 * 60 * 60 * 1000; // 24h after auth/API failure

type KvStore = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

async function getKv(): Promise<KvStore | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = getCloudflareContext();
    return (env as { REFRESH_TOKEN_KV?: KvStore }).REFRESH_TOKEN_KV ?? null;
  } catch {
    return null;
  }
}

async function getLastSyncFailAt(): Promise<number | null> {
  const kv = await getKv();
  if (!kv) return null;
  const raw = await kv.get(SYNC_FAIL_KEY);
  if (!raw) return null;
  const n = Date.parse(raw);
  return Number.isNaN(n) ? null : n;
}

async function markSyncFail(): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.put(SYNC_FAIL_KEY, new Date().toISOString());
}

async function clearSyncFail(): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.put(SYNC_FAIL_KEY, "");
}

function withoutSyncError(payload: ReviewsCachePayload): ReviewsCachePayload {
  const { syncError: _ignored, ...rest } = payload;
  return rest;
}

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
  await clearSyncFail();
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

/**
 * Public-facing path: always prefer cached reviews.
 * Background refresh is best-effort and never blocks serving cache.
 */
export async function getCachedReviewsWithRefresh(
  request: NextRequest
): Promise<{ payload: ReviewsCachePayload; stale: boolean; refreshed: boolean }> {
  const cached = await getReviewsCache();

  if (cached && !isCacheStale(cached.lastUpdated)) {
    return { payload: withoutSyncError(cached), stale: false, refreshed: false };
  }

  // If a recent sync failed (usually expired OAuth), keep serving cache
  // instead of hammering Google and surfacing errors on every page load.
  const lastFail = await getLastSyncFailAt();
  if (cached && lastFail && Date.now() - lastFail < SYNC_BACKOFF_MS) {
    return { payload: withoutSyncError(cached), stale: true, refreshed: false };
  }

  try {
    const payload = await syncReviews(request);
    return { payload, stale: false, refreshed: true };
  } catch (err) {
    await markSyncFail();
    if (cached) {
      const clean = withoutSyncError(cached);
      // Persist a clean copy so syncError never sticks in KV for the public UI
      await setReviewsCache(clean);
      return {
        payload: clean,
        stale: true,
        refreshed: false,
      };
    }
    throw err;
  }
}
