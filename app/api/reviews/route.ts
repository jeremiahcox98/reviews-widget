import { getRefreshToken } from "@/lib/refresh-token-store";
import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_MGMT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const MYBUSINESS_BASE = "https://mybusiness.googleapis.com/v4";

const STAR_RATING_TO_NUMBER: Record<string, number> = {
  STAR_RATING_UNSPECIFIED: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

async function getAccessTokenFromRefresh(refreshToken: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("OAuth not configured");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }).toString(),
  });
  const data = await res.json();
  if (data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || "Token refresh failed");
  }
  return data.access_token;
}

async function fetchWithToken(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<unknown> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API ${res.status}: ${text}`);
  }
  return res.json();
}

async function listAccounts(token: string): Promise<{ name: string }[]> {
  const data = (await fetchWithToken(
    `${ACCOUNT_MGMT_BASE}/accounts`,
    token
  )) as { accounts?: { name: string }[] };
  return data.accounts ?? [];
}

async function listLocations(
  token: string,
  accountName: string
): Promise<{ name?: string }[]> {
  const url = `${BUSINESS_INFO_BASE}/${accountName}/locations?pageSize=100&readMask=name`;
  const data = (await fetchWithToken(url, token)) as { locations?: { name?: string }[] };
  return data.locations ?? [];
}

async function batchGetReviews(
  token: string,
  accountName: string,
  locationNames: string[],
  pageToken: string | null = null
): Promise<{
  locationReviews?: { review?: { reviewer?: { displayName?: string; profilePhotoUrl?: string }; starRating?: string; comment?: string; createTime?: string } }[];
  nextPageToken?: string | null;
}> {
  const url = `${MYBUSINESS_BASE}/${accountName}/locations:batchGetReviews`;
  const body = {
    locationNames,
    pageSize: 50,
    orderBy: "updateTime desc",
    ...(pageToken && { pageToken }),
  };
  return fetchWithToken(url, token, {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<{
    locationReviews?: { review?: { reviewer?: { displayName?: string; profilePhotoUrl?: string }; starRating?: string; comment?: string; createTime?: string } }[];
    nextPageToken?: string | null;
  }>;
}

function normalizeReview(locationReview: {
  review?: {
    reviewer?: { displayName?: string; profilePhotoUrl?: string };
    starRating?: string;
    comment?: string;
    createTime?: string;
  };
}): { authorName: string; authorHandle?: string; profilePhotoUrl?: string; starRating: number; comment: string; createTime?: string; relativeTimeDescription?: string } | null {
  const r = locationReview.review;
  if (!r) return null;
  const reviewer = r.reviewer ?? {};
  const starRating = STAR_RATING_TO_NUMBER[r.starRating ?? ""] ?? 0;
  return {
    authorName: reviewer.displayName ?? "Anonymous",
    authorHandle: undefined,
    profilePhotoUrl: reviewer.profilePhotoUrl,
    starRating,
    comment: r.comment ?? "",
    createTime: r.createTime,
    relativeTimeDescription: undefined,
  };
}

async function fetchReviewsFromGoogle(accessToken: string): Promise<{ reviews: unknown[] }> {
  const accounts = await listAccounts(accessToken);
  if (!accounts.length) {
    return { reviews: [] };
  }

  const allReviews: unknown[] = [];
  for (const account of accounts) {
    const accountName = account.name;
    const locations = await listLocations(accessToken, accountName);
    const locationNames = (locations ?? [])
      .map((loc) => {
        const name = loc.name;
        if (!name) return null;
        if (name.startsWith("accounts/")) return name;
        return `${accountName}/${name}`;
      })
      .filter(Boolean) as string[];
    if (!locationNames.length) continue;

    let pageToken: string | null = null;
    do {
      const batch = await batchGetReviews(accessToken, accountName, locationNames, pageToken);
      const locationReviews = batch.locationReviews ?? [];
      for (const lr of locationReviews) {
        const normalized = normalizeReview(lr);
        if (normalized) allReviews.push(normalized);
      }
      pageToken = batch.nextPageToken ?? null;
    } while (pageToken);
  }

  return { reviews: allReviews };
}

export async function GET(request: NextRequest) {
  let accessToken: string | null = null;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    accessToken = auth.slice(7);
  } else {
    const refreshToken = await getRefreshToken(request);
    if (refreshToken) {
      try {
        accessToken = await getAccessTokenFromRefresh(refreshToken);
      } catch (err) {
        console.error(err);
        return NextResponse.json(
          { error: "Session expired. Please connect with Google again." },
          { status: 401 }
        );
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: "Not signed in. Connect with Google or provide Authorization: Bearer <token>." },
      { status: 401 }
    );
  }

  try {
    const data = await fetchReviewsFromGoogle(accessToken);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Reviews fetch failed:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch reviews";
    const status = message.includes("401") ? 401 : 502;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
