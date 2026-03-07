import { NextRequest, NextResponse } from "next/server";

const SCOPE = "https://www.googleapis.com/auth/business.manage";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
