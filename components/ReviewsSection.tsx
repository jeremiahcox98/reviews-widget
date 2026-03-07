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
    fetch("/api/reviews", { credentials: "include" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = data.error || `Request failed (${res.status})`;
          setError(msg);
          setReviews(dummyReviews);
          return;
        }
        if (data.reviews && Array.isArray(data.reviews)) {
          if (data.reviews.length > 0) {
            setReviews(data.reviews);
            setError(null);
          } else {
            setError("No reviews yet for this account.");
            setReviews(dummyReviews);
          }
        } else {
          setError(data.error || "Unexpected response from API.");
          setReviews(dummyReviews);
        }
      })
      .catch(() => {
        setError("Could not load reviews. Try reconnecting with Google or retry.");
        setReviews(dummyReviews);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading && reviews === dummyReviews) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-white/60">
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
