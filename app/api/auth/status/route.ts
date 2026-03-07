import { NextRequest, NextResponse } from "next/server";

const REFRESH_TOKEN_COOKIE = "reviews_refresh_token";

/**
 * GET /api/auth/status
 * Returns whether the session cookie is present and if token refresh works.
 * Use this to debug "Session expired" (e.g. open in same tab as embed or curl with -v).
 */
export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({
      hasCookie: false,
      refreshOk: false,
      error: "No refresh token cookie. Connect with Google on this origin first.",
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({
      hasCookie: true,
      refreshOk: false,
      error: "Server OAuth not configured (GOOGLE_CLIENT_ID/SECRET).",
    });
  }

  try {
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
      return NextResponse.json({
        hasCookie: true,
        refreshOk: false,
        error: data.error || "Token refresh failed",
        hint:
          data.error === "invalid_grant"
            ? "Refresh token expired or revoked. Connect with Google again (and complete consent)."
            : undefined,
      });
    }

    return NextResponse.json({
      hasCookie: true,
      refreshOk: true,
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      hasCookie: true,
      refreshOk: false,
      error: message,
    });
  }
}
