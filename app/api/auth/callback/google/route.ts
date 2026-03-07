import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "reviews_refresh_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=config", request.url));
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokens = await tokenRes.json();
  if (tokens.error) {
    console.error("Token exchange failed:", tokens);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(tokens.error_description || tokens.error)}`, request.url)
    );
  }

  const refreshToken = tokens.refresh_token;
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/?error=no_refresh_token", request.url));
  }

  const response = NextResponse.redirect(new URL("/embed", request.url));
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
