# Embed Google Reviews Anywhere

Cached reviews are served from Cloudflare KV. Visitors always get the last good snapshot — even if Google OAuth expires.

**Public JSON (CORS enabled):**  
`https://reviews-widget.jeremiah-cox98.workers.dev/api/reviews/cached`

---

## Option A — Iframe (best for Elementor + landing pages)

Paste into an **Elementor HTML widget**, or any landing page:

```html
<iframe
  src="https://reviews-widget.jeremiah-cox98.workers.dev/embed"
  style="width:100%;min-height:560px;border:0;overflow:hidden;display:block;background:#0c1b28"
  title="Google Reviews"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

Optional auto-height (same pattern as the TPI landing page): the embed posts `{ type: "reviews-embed-height", height }` via `postMessage`.

---

## Option B — Lightweight script (HTML / Elementor)

```html
<div id="tpi-reviews"></div>
<script
  src="https://reviews-widget.jeremiah-cox98.workers.dev/embed.js"
  data-target="#tpi-reviews"
  data-theme="dark"
  data-max="12"
  async
></script>
```

| Attribute | Values | Default |
|---|---|---|
| `data-theme` | `dark` or `light` | `dark` |
| `data-max` | number of cards | `12` |
| `data-target` | CSS selector | `#tpi-reviews` |

Use `data-theme="light"` on a cream/white WordPress section.

---

## Option C — Raw JSON (custom theme)

```js
fetch("https://reviews-widget.jeremiah-cox98.workers.dev/api/reviews/cached")
  .then((r) => r.json())
  .then((data) => {
    // data.reviews, data.averageRating, data.totalCount, data.lastUpdated
  });
```

---

## Keeping the cache fresh

1. Visit `https://reviews-widget.jeremiah-cox98.workers.dev` and **Connect with Google** if auth expires.
2. Optional: call `/api/reviews/sync` with your `CRON_SECRET` every few hours.

As long as KV has reviews, public embeds keep working even when Google auth is down.
