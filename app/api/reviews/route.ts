import { fetchReviewsFromGoogle, getAccessTokenFromRefresh } from "@/lib/google-reviews";
import { getRefreshToken } from "@/lib/refresh-token-store";
import { NextRequest, NextResponse } from "next/server";

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
    const reviews = await fetchReviewsFromGoogle(accessToken);
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Reviews fetch failed:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch reviews";
    const status = message.includes("401") ? 401 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
