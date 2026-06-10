import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Review } from "@/lib/reviews";

const CACHE_KEY = "reviews_cache";
const STALE_MS = 6 * 60 * 60 * 1000; // 6 hours

export type ReviewsCachePayload = {
  lastUpdated: string;
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  syncError?: string;
};

type KvStore = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

async function getKv(): Promise<KvStore | null> {
  try {
    const { env } = getCloudflareContext();
    const kv = (env as { REFRESH_TOKEN_KV?: KvStore }).REFRESH_TOKEN_KV;
    return kv ?? null;
  } catch {
    return null;
  }
}

export function isCacheStale(lastUpdated: string): boolean {
  const updatedAt = Date.parse(lastUpdated);
  if (Number.isNaN(updatedAt)) return true;
  return Date.now() - updatedAt > STALE_MS;
}

export async function getReviewsCache(): Promise<ReviewsCachePayload | null> {
  const kv = await getKv();
  if (!kv) return null;

  const raw = await kv.get(CACHE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ReviewsCachePayload;
  } catch {
    return null;
  }
}

export async function setReviewsCache(payload: ReviewsCachePayload): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.put(CACHE_KEY, JSON.stringify(payload));
}

export function buildCachePayload(reviews: Review[]): ReviewsCachePayload {
  const rated = reviews.filter((r) => r.starRating > 0);
  const averageRating = rated.length
    ? Math.round((rated.reduce((sum, r) => sum + r.starRating, 0) / rated.length) * 10) / 10
    : 0;

  return {
    lastUpdated: new Date().toISOString(),
    reviews,
    averageRating,
    totalCount: reviews.length,
  };
}
