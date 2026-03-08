import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest } from "next/server";

const KV_KEY = "refresh_token";
const REFRESH_TOKEN_COOKIE = "reviews_refresh_token";

/**
 * Get refresh token: from KV first (so all visitors see reviews), then from cookie.
 */
export async function getRefreshToken(request: NextRequest): Promise<string | null> {
  try {
    const { env } = getCloudflareContext();
    const kv = (env as { REFRESH_TOKEN_KV?: { get: (key: string) => Promise<string | null> } })
      .REFRESH_TOKEN_KV;
    if (kv) {
      const stored = await kv.get(KV_KEY);
      if (stored) return stored;
    }
  } catch {
    // No Cloudflare context (e.g. next dev) or KV not bound
  }
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Store refresh token in KV so every visitor can see reviews without logging in.
 */
export async function setRefreshTokenInKv(token: string): Promise<void> {
  try {
    const { env } = getCloudflareContext();
    const kv = (env as { REFRESH_TOKEN_KV?: { put: (key: string, value: string) => Promise<void> } })
      .REFRESH_TOKEN_KV;
    if (kv) await kv.put(KV_KEY, token);
  } catch {
    // No Cloudflare context or KV not bound (e.g. local dev)
  }
}
