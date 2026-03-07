import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

const ACCOUNT_MGMT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const MYBUSINESS_BASE = "https://mybusiness.googleapis.com/v4";

const STAR_RATING_TO_NUMBER = {
  STAR_RATING_UNSPECIFIED: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

async function fetchWithToken(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google API ${res.status}: ${text}`);
  }
  return res.json();
}

async function listAccounts(token) {
  const data = await fetchWithToken(`${ACCOUNT_MGMT_BASE}/accounts`, token);
  return data.accounts || [];
}

async function listLocations(token, accountName) {
  const url = `${BUSINESS_INFO_BASE}/${accountName}/locations?pageSize=100&readMask=name`;
  const data = await fetchWithToken(url, token);
  return data.locations || [];
}

async function batchGetReviews(token, accountName, locationNames, pageToken = null) {
  const url = `${MYBUSINESS_BASE}/${accountName}/locations:batchGetReviews`;
  const body = {
    locationNames,
    pageSize: 50,
    orderBy: "updateTime desc",
    ...(pageToken && { pageToken }),
  };
  const data = await fetchWithToken(url, token, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data;
}

function normalizeReview(locationReview) {
  const r = locationReview.review;
  if (!r) return null;
  const reviewer = r.reviewer || {};
  const starRating = STAR_RATING_TO_NUMBER[r.starRating] ?? 0;
  return {
    authorName: reviewer.displayName || "Anonymous",
    authorHandle: undefined,
    profilePhotoUrl: reviewer.profilePhotoUrl || undefined,
    starRating,
    comment: r.comment || "",
    createTime: r.createTime,
    relativeTimeDescription: undefined,
  };
}

app.get("/reviews", async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth && auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization: Bearer <access_token>" });
  }

  try {
    const accounts = await listAccounts(token);
    if (!accounts.length) {
      return res.json({ reviews: [] });
    }

    const allReviews = [];
    for (const account of accounts) {
      const accountName = account.name;
      const locations = await listLocations(token, accountName);
      const locationNames = (locations || [])
        .map((loc) => {
          const name = loc.name;
          if (!name) return null;
          if (name.startsWith("accounts/")) return name;
          return `${accountName}/${name}`;
        })
        .filter(Boolean);
      if (!locationNames.length) continue;

      let pageToken = null;
      do {
        const batch = await batchGetReviews(token, accountName, locationNames, pageToken);
        const locationReviews = batch.locationReviews || [];
        for (const lr of locationReviews) {
          const normalized = normalizeReview(lr);
          if (normalized) allReviews.push(normalized);
        }
        pageToken = batch.nextPageToken || null;
      } while (pageToken);
    }

    res.json({ reviews: allReviews });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("401") ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Reviews API running at http://localhost:${PORT}`);
  console.log("  GET /health  - health check");
  console.log("  GET /reviews - requires Authorization: Bearer <access_token>");
  console.log("  Locations: Business Information API (v1)");
});
