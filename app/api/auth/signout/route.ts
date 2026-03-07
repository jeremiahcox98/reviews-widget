import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "reviews_refresh_token";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
