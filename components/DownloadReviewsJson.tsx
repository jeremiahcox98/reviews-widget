"use client";

import { useState } from "react";

export function DownloadReviewsJson() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      const reviews = data.reviews ?? [];
      const blob = new Blob([JSON.stringify({ reviews }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "drjerreviews.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p className="mb-2 text-sm font-medium">Export reviews</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Download all reviews as <code className="rounded bg-muted px-1">drjerreviews.json</code> using your current session.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Downloading…" : "Download drjerreviews.json"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
