/**
 * One-time OAuth flow: opens browser, you sign in, then calls GET /reviews
 * and prints the result. Requires the reviews-api server running (npm start).
 *
 * Add this redirect URI in Google Cloud Console (OAuth client):
 *   http://localhost:3333/callback
 */

import "dotenv/config";
import http from "http";
import { exec } from "child_process";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3333/callback";
const SCOPE = "https://www.googleapis.com/auth/business.manage";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:3333`);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing code in callback");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(
    "<!DOCTYPE html><html><body><p>Got the code. Exchanging for token and calling /reviews...</p></body></html>"
  );

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) {
      console.error("Token exchange failed:", tokens);
      process.exit(1);
    }
    const accessToken = tokens.access_token;

    const reviewsRes = await fetch("http://localhost:3001/reviews", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await reviewsRes.text();
    console.log("\n--- GET /reviews response (" + reviewsRes.status + ") ---\n");
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      console.log(body);
    }
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(3333, () => {
  console.log("Add this redirect URI in Google Cloud if you haven't: http://localhost:3333/callback\n");
  console.log("Opening browser to sign in with Google...");
  console.log("Or open this URL yourself:\n", authUrl, "\n");
  const start =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${start} "${authUrl}"`);
});
