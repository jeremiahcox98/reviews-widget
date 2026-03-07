"use client";

import { useEffect, useState } from "react";
import { LogoLoop } from "@/components/LogoLoop";
import { ReviewCard } from "@/components/ReviewCard";
import type { Review } from "@/lib/reviews";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function splitIntoThirds(reviews: Review[]): [Review[], Review[], Review[]] {
  const a: Review[] = [];
  const b: Review[] = [];
  const c: Review[] = [];
  reviews.forEach((r, i) => {
    if (i % 3 === 0) a.push(r);
    else if (i % 3 === 1) b.push(r);
    else c.push(r);
  });
  return [a, b, c];
}

function ReviewRow({
  reviews,
  direction,
  reviewsPageUrl,
  speed,
  logoHeight,
}: {
  reviews: Review[];
  direction: "left" | "right";
  reviewsPageUrl?: string;
  speed: number;
  logoHeight: number;
}) {
  return (
    <LogoLoop
      logos={reviews}
      speed={speed}
      direction={direction}
      logoHeight={logoHeight}
      gap={24}
      renderItem={(item, key) => (
        <ReviewCard
          key={key}
          review={{ ...(item as Review), url: (item as Review).url ?? reviewsPageUrl }}
        />
      )}
      ariaLabel="Customer reviews"
      className="w-full"
    />
  );
}

export function ReviewsMarquee({
  reviews,
  reviewsPageUrl,
}: {
  reviews: Review[];
  reviewsPageUrl?: string;
}) {
  const withText = reviews.filter((r) => (r.comment || "").trim().length > 0);
  const [row0, row1, row2] = splitIntoThirds(withText);

  if (withText.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-white/60">
        No reviews yet.
      </div>
    );
  }

  const isMobile = useIsMobile();
  const speed = isMobile ? 40 : 80;
  const logoHeight = isMobile ? 140 : 160;

  return (
    <div className="flex w-full flex-col gap-6 overflow-hidden py-6">
      <ReviewRow
        reviews={row0}
        direction="left"
        reviewsPageUrl={reviewsPageUrl}
        speed={speed}
        logoHeight={logoHeight}
      />
      <ReviewRow
        reviews={row1}
        direction="right"
        reviewsPageUrl={reviewsPageUrl}
        speed={speed}
        logoHeight={logoHeight}
      />
      <ReviewRow
        reviews={row2}
        direction="left"
        reviewsPageUrl={reviewsPageUrl}
        speed={speed}
        logoHeight={logoHeight}
      />
    </div>
  );
}
