# Reviews API (standalone)

Standalone server that fetches Google Business Profile reviews using the official API. Use this to test the integration before wiring it into the reviews widget.

## Setup

```bash
cd reviews-api
npm install
```

## Run

```bash
npm run dev
```

Server runs at **http://localhost:3001** (or `PORT` from `.env`).

## Endpoints

| Method | Path     | Description |
|--------|----------|-------------|
| GET    | /health  | Health check. No auth. |
| GET    | /reviews | Returns all reviews for the authenticated user's Business Profile locations. **Requires** `Authorization: Bearer <access_token>`. |

## Getting an access token for testing

The API expects a Google OAuth access token with scope **`https://www.googleapis.com/auth/business.manage`**. The token must belong to a user who has a verified Google Business Profile.

### Option 1: OAuth 2.0 Playground

1. Open [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Click the gear (⚙️), check **“Use your own OAuth credentials”**, and enter your **OAuth 2.0 Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (same project where the Business Profile API is enabled).
3. In the left panel, under “Step 1”, find **Google My Business API v4** and add scope:  
   `https://www.googleapis.com/auth/business.manage`
4. Click **“Authorize APIs”** and sign in with the Google account that owns/manages the Business Profile.
5. In **“Step 2”**, click **“Exchange authorization code for tokens”**.
6. Copy the **Access token** and use it in the request below.

### Option 2: Your own OAuth app

Use your existing OAuth client (e.g. in the Next.js app later) to sign in with Google, request the `business.manage` scope, and send the access token in the `Authorization` header when calling this API.

## Test with curl

Replace `YOUR_ACCESS_TOKEN` with a valid token (see above).

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:3001/reviews
```

Example response:

```json
{
  "reviews": [
    {
      "authorName": "Jane D.",
      "profilePhotoUrl": "https://...",
      "starRating": 5,
      "comment": "Great experience!",
      "createTime": "2024-01-15T12:00:00Z"
    }
  ]
}
```

The shape matches what the reviews widget expects (same as `lib/reviews.ts` in the main app), so once this works you can point the widget at this API (or move this logic into the Next.js API route).

## Google Cloud setup

1. Create a project (or use an existing one) in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google My Business API** (or “Google Business Profile API”) for the project.
3. Create **OAuth 2.0 credentials** (e.g. “Web application”). Set authorized redirect URIs if you use a web OAuth flow.
4. The Google account you use to get the token must have a **verified Business Profile** (owner or manager) so the API returns locations and reviews.

## Joining with the widget

After testing:

- Either call this server from the Next.js app (e.g. `fetch('http://localhost:3001/reviews', { headers: { Authorization: \`Bearer ${token}\` } })` from a server route that has the user’s token), or
- Copy the logic from `server.js` into a Next.js API route (e.g. `app/api/reviews/route.ts`) and have the frontend call `/api/reviews` with the token.
