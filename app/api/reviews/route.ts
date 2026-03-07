import { NextRequest, NextResponse } from "next/server";

const REVIEWS_API_URL =
  process.env.REVIEWS_API_URL || "http://localhost:3001";
const REFRESH_TOKEN_COOKIE = "reviews_refresh_token";

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

export async function GET(request: NextRequest) {
  let accessToken: string | null = null;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    accessToken = auth.slice(7);
  } else {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
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
    const res = await fetch(`${REVIEWS_API_URL}/reviews`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json().catch(() => ({ error: "Invalid response from reviews API" }));
    if (!res.ok) {
      console.error("Reviews API error:", res.status, data);
      return NextResponse.json(
        { error: data.error || `Reviews API returned ${res.status}` },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Reviews API request failed:", err);
    return NextResponse.json(
      {
        error:
          "Could not reach reviews API. Is the server running? Run: npm run api",
      },
      { status: 502 }
    );
  }
}
