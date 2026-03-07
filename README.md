This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Embedding on your site

To show the reviews widget full-width and with height matching its content:

1. **Full width**: set the iframe (or its container) to `width: 100%`.
2. **Auto height**: the embed sends its content height to the parent via `postMessage`. Add the script below so the iframe resizes to that height.

Replace `https://your-reviews-app.com` with your deployed embed URL.

```html
<iframe
  id="reviews-embed"
  src="https://your-reviews-app.com/embed"
  title="Reviews"
  style="width: 100%; border: none; display: block;"
></iframe>

<script>
  (function () {
    var iframe = document.getElementById('reviews-embed');
    if (!iframe) return;
    window.addEventListener('message', function (e) {
      if (e.data && e.data.type === 'reviews-embed-height' && typeof e.data.height === 'number') {
        iframe.style.height = e.data.height + 'px';
      }
    });
  })();
</script>
```

The iframe will grow to fit the widget content and stay full width.

### Google OAuth (real reviews)

To use "Connect with Google" and load real Business Profile reviews, add this **Authorized redirect URI** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (your OAuth 2.0 Client ID):

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.com/api/auth/callback/google`

Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into `.env.local` (or they are already in `reviews-api/.env`; the app uses `.env.local` for the Next.js API routes).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Pages

This app is set up to deploy on **Cloudflare Pages** (via the OpenNext adapter and Cloudflare Workers).

### One-time setup

1. **Log in to Cloudflare** (CLI):
   ```bash
   npx wrangler login
   ```

2. **Set environment variables** in the [Cloudflare dashboard](https://dash.cloudflare.com) → Workers & Pages → your project → Settings → Variables (or via `wrangler secret`):
   - `GOOGLE_CLIENT_ID` – from Google Cloud Console (OAuth 2.0 Client ID)
   - `GOOGLE_CLIENT_SECRET` – from Google Cloud Console
   - ~~`REVIEWS_API_URL`~~ – Not needed. The app fetches reviews from Google’s APIs directly (no separate reviews-api server in production).

   Add the same redirect URI in Google Cloud Console for your production domain:  
   `https://<your-pages-domain>/api/auth/callback/google`

### Deploy from your machine

From the project root:

```bash
npm run deploy
```

This builds the Next.js app for Cloudflare and deploys it. Your Worker URL will be shown (e.g. `https://reviews.<your-subdomain>.workers.dev`).

### Connect GitHub (auto-deploy on push)

To have Cloudflare build and deploy whenever you push to GitHub:

1. In the [Cloudflare dashboard](https://dash.cloudflare.com) go to **Workers & Pages** → **Create application**.
2. Choose **Create Worker** (not “Create Page”). This app uses OpenNext, which deploys as a Worker. You still get a normal URL (e.g. `reviews.<your-subdomain>.workers.dev`) and can add a **custom domain** in Settings, same as with Pages.
3. Select **Connect to Git** → your GitHub account → the **reviews** repo. Pick the branch to deploy (e.g. `main`).
4. **Build settings** (Settings → Build):
   - **Build command:** leave empty.
   - **Deploy command:** `npm run deploy`
5. **Environment variables** (Settings → Variables and secrets): add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - (No `REVIEWS_API_URL` – reviews are fetched from Google directly.)
6. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add this Authorized redirect URI:  
   `https://<your-worker-domain>/api/auth/callback/google`

After you save, the first build runs. Every push to that branch will trigger a new build and deploy.

### Optional: local Cloudflare preview

To run the app locally in the same runtime as production:

1. Copy `.dev.vars.example` to `.dev.vars` and set `NEXTJS_ENV=development` (and any vars you need for Next.js).
2. Run:
   ```bash
   npm run preview
   ```

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
