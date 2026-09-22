"use client";

import { useCallback, useEffect, useState } from "react";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { dummyReviews } from "@/lib/dummy-reviews";
import type { Review } from "@/lib/reviews";

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(dummyReviews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(() => {
    setError(null);
    setLoading(true);
    fetch("/api/reviews/cached")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data.reviews) ? data.reviews : [];

        // Cache-first: if we have reviews, always show them — never surface
        // background sync / OAuth errors to visitors.
        if (list.length > 0) {
          setReviews(list);
          setError(null);
          return;
        }

        if (!res.ok) {
          setError(data.error || `Request failed (${res.status})`);
          setReviews(dummyReviews);
          return;
        }

        setError("No reviews yet for this account.");
        setReviews(dummyReviews);
      })
      .catch(() => {
        setError("Could not load reviews. Try again in a moment.");
        setReviews(dummyReviews);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading && reviews === dummyReviews) {
    return (
      <div className="embed-loading flex min-h-[200px] items-center justify-center text-white/60">
        Loading reviews…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="mx-auto max-w-xl rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200">
          {error}
          <p className="mt-2">
            <button
              type="button"
              onClick={() => fetchReviews()}
              className="rounded bg-amber-500/30 px-3 py-1.5 text-xs font-medium hover:bg-amber-500/50"
            >
              Retry
            </button>
          </p>
        </div>
      )}
      <ReviewsMarquee
        reviews={reviews}
        reviewsPageUrl={process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL}
      />
    </div>
  );
}
