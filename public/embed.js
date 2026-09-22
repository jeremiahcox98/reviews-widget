/**
 * Drop-in Google reviews widget for any site (WordPress/Elementor, plain HTML, landing pages).
 *
 * Usage (Elementor HTML widget or any page):
 *
 *   <div id="tpi-reviews"></div>
 *   <script
 *     src="https://reviews-widget.jeremiah-cox98.workers.dev/embed.js"
 *     data-target="#tpi-reviews"
 *     data-theme="dark"
 *     async
 *   ></script>
 *
 * Or use the full branded section as an iframe (recommended for Elementor):
 *
 *   <iframe
 *     src="https://reviews-widget.jeremiah-cox98.workers.dev/embed"
 *     style="width:100%;min-height:560px;border:0;overflow:hidden"
 *     title="Google Reviews"
 *     loading="lazy"
 *   ></iframe>
 */
(function () {
  var script = document.currentScript;
  if (!script) return;

  var API =
    (script.getAttribute("data-api") ||
      script.src.replace(/\/embed\.js(?:\?.*)?$/, "/api/reviews/cached"));
  var targetSel = script.getAttribute("data-target") || "#tpi-reviews";
  var theme = script.getAttribute("data-theme") || "dark";
  var max = parseInt(script.getAttribute("data-max") || "12", 10);
  var target = document.querySelector(targetSel);
  if (!target) return;

  var isDark = theme !== "light";
  var css = {
    wrap:
      "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
      "max-width:100%;overflow:hidden;",
    head: "text-align:center;margin:0 0 28px;",
    title:
      "margin:0;font-size:clamp(24px,4vw,36px);font-weight:800;letter-spacing:-.02em;" +
      (isDark ? "color:#fff;" : "color:#13283a;"),
    lead:
      "margin:12px auto 0;max-width:560px;font-size:15px;line-height:1.55;" +
      (isDark ? "color:rgba(255,255,255,.72);" : "color:#5d6873;"),
    row:
      "display:flex;gap:16px;overflow-x:auto;padding:4px 2px 18px;" +
      "scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;",
    card:
      "flex:0 0 min(280px,82vw);scroll-snap-align:start;" +
      "border-radius:14px;padding:18px 18px 16px;box-sizing:border-box;" +
      (isDark
        ? "background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff;"
        : "background:#fff;border:1px solid rgba(19,40,58,.12);color:#283139;box-shadow:0 12px 30px -18px rgba(12,27,40,.35);"),
    stars: "color:#e7b53d;letter-spacing:1px;font-size:13px;margin:0 0 10px;",
    text: "margin:0 0 14px;font-size:14.5px;line-height:1.5;",
    author: "font-size:13.5px;font-weight:700;" + (isDark ? "color:rgba(255,255,255,.92);" : "color:#13283a;"),
    meta: "font-size:12px;margin-top:2px;" + (isDark ? "color:rgba(255,255,255,.5);" : "color:#9aa6b0;"),
    err:
      "text-align:center;padding:24px;font-size:14px;" +
      (isDark ? "color:rgba(255,255,255,.6);" : "color:#5d6873;"),
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function truncate(s, n) {
    s = String(s || "").trim();
    if (s.length <= n) return s;
    return s.slice(0, n).trimEnd() + "…";
  }

  function stars(n) {
    var out = "";
    for (var i = 1; i <= 5; i++) out += i <= n ? "★" : "☆";
    return out;
  }

  target.innerHTML = '<div style="' + css.err + '">Loading reviews…</div>';

  fetch(API)
    .then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      });
    })
    .then(function (result) {
      var reviews = (result.data && result.data.reviews) || [];
      reviews = reviews.filter(function (r) {
        return r && String(r.comment || "").trim().length > 0;
      });
      if (!reviews.length) {
        target.innerHTML =
          '<div style="' + css.err + '">Reviews coming soon.</div>';
        return;
      }
      if (max > 0) reviews = reviews.slice(0, max);

      var avg = result.data.averageRating || 5;
      var cards = reviews
        .map(function (r) {
          return (
            '<article style="' +
            css.card +
            '">' +
            '<div style="' +
            css.stars +
            '" aria-label="' +
            (r.starRating || 5) +
            ' out of 5 stars">' +
            stars(r.starRating || 5) +
            "</div>" +
            '<p style="' +
            css.text +
            '">' +
            esc(truncate(r.comment, 180)) +
            "</p>" +
            '<div style="' +
            css.author +
            '">' +
            esc(r.authorName || "Google reviewer") +
            "</div>" +
            '<div style="' +
            css.meta +
            '">Posted on Google</div>' +
            "</article>"
          );
        })
        .join("");

      target.innerHTML =
        '<div style="' +
        css.wrap +
        '">' +
        '<div style="' +
        css.head +
        '">' +
        '<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;' +
        (isDark ? "color:rgba(255,255,255,.88);" : "color:#13283a;") +
        '">★★★★★ Rated ' +
        esc(avg) +
        "</p>" +
        '<h2 style="' +
        css.title +
        '">Real Google Reviews</h2>' +
        '<p style="' +
        css.lead +
        '">What local patients say about care at Mason Chiropractic.</p>' +
        "</div>" +
        '<div style="' +
        css.row +
        '">' +
        cards +
        "</div>" +
        "</div>";
    })
    .catch(function () {
      target.innerHTML =
        '<div style="' + css.err + '">Could not load reviews right now.</div>';
    });
})();
