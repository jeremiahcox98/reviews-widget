/**
 * Fetches all reviews from the reviews API and writes them to ../drjerreviews.json
 *
 * Prerequisites:
 *   1. Add REVIEWS_REFRESH_TOKEN to reviews-api/.env (get it from the browser
 *      after connecting with Google: Application > Cookies > reviews_refresh_token).
 *   2. Reviews API running: npm run api
 *
 * Run from project root: node scripts/download-reviews.js
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(projectRoot, "reviews-api", ".env") });

const REVIEWS_API_URL = process.env.REVIEWS_API_URL || "http://localhost:3001";
const REFRESH_TOKEN = process.env.REVIEWS_REFRESH_TOKEN;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

async function getAccessToken() {
  if (!REFRESH_TOKEN || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Set REVIEWS_REFRESH_TOKEN, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET in reviews-api/.env"
    );
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: REFRESH_TOKEN,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }).toString(),
  });
  const data = await res.json();
  if (data.error || !data.access_token) {
    throw new Error(data.error_description || data.error || "Token refresh failed");
  }
  return data.access_token;
}

async function fetchReviews(accessToken) {
  const res = await fetch(`${REVIEWS_API_URL}/reviews`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `API ${res.status}`);
  }
  return data.reviews || [];
}

async function main() {
  console.log("Getting access token…");
  const accessToken = await getAccessToken();
  console.log("Fetching reviews…");
  const reviews = await fetchReviews(accessToken);
  const outPath = path.join(projectRoot, "..", "drjerreviews.json");
  fs.writeFileSync(outPath, JSON.stringify({ reviews }, null, 2), "utf8");
  console.log(`Wrote ${reviews.length} reviews to ${outPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
