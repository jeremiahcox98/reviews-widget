"use client";

import { useState } from "react";

const TOKEN_KEY = "reviews_access_token";

export function TestWithToken() {
  const [token, setToken] = useState("");
  const [done, setDone] = useState(false);

  const handleLoad = () => {
    const t = token.trim();
    if (!t) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TOKEN_KEY, t);
      setDone(true);
      window.location.href = "/embed";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p className="mb-2 text-sm font-medium">Test with real Google reviews</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Paste a Google access token (from OAuth Playground or{" "}
        <code className="rounded bg-muted px-1">node test-with-oauth.js</code>
        ), then click to open the embed with live reviews.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          placeholder="Paste access token…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleLoad}
          disabled={!token.trim() || done}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {done ? "Opening…" : "Load real reviews"}
        </button>
      </div>
    </div>
  );
}
