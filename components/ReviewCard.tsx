"use client";

import { useState } from "react";
import type { Review } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-px text-xs leading-none" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rating
              ? "text-amber-400"
              : "text-white/25"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

const MAX_COMMENT_LENGTH = 160;

function truncateComment(text: string, maxLength: number = MAX_COMMENT_LENGTH): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trimEnd() + "…";
}

const moreButtonClass =
  "inline text-[15px] font-normal text-sky-300 hover:text-sky-200 hover:underline focus:outline-none focus:underline cursor-pointer";

function getInitials(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "?";
  const letters = trimmed
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return letters || trimmed.slice(0, 2).toUpperCase() || "?";
}

export function ReviewCard({ review }: { review: Review }) {
  const comment = (review.comment || "").trim();
  const isLong = comment.length > MAX_COMMENT_LENGTH;
  const [expanded, setExpanded] = useState(false);

  const authorName = review.authorName?.trim() || "Anonymous";
  const displayName = review.authorHandle
    ? (review.authorHandle.startsWith("@") ? review.authorHandle : `@${review.authorHandle}`)
    : authorName;
  const initials = getInitials(authorName);
  const [imgLoaded, setImgLoaded] = useState(false);
  const href = review.url?.trim() || undefined;

  const className =
    "flex min-w-[240px] max-w-[260px] flex-shrink-0 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.08] p-4 text-left shadow-lg backdrop-blur-xl transition-opacity hover:opacity-90 md:min-w-[280px] md:max-w-[320px] md:gap-4 md:p-5";

  const onMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const reviewBody = (
    <>
      <p className="text-[15px] leading-relaxed text-white/95">
        {expanded ? comment : truncateComment(comment)}
        {isLong && !expanded && (
          <>
            {" "}
            <button
              type="button"
              onClick={onMoreClick}
              className={moreButtonClass}
              aria-label="Show full review"
            >
              More
            </button>
          </>
        )}
        {isLong && expanded && (
          <>
            {" "}
            <button
              type="button"
              onClick={onMoreClick}
              className={moreButtonClass}
              aria-label="Show less"
            >
              Less
            </button>
          </>
        )}
      </p>
    </>
  );

  const avatarBlock = (
    <div className="flex items-center gap-3">
      <div className="relative flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-zinc-700">
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white"
          aria-hidden
          style={{ zIndex: imgLoaded ? 0 : 1 }}
        >
          {initials}
        </span>
        {review.profilePhotoUrl && (
          <img
            src={review.profilePhotoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ zIndex: imgLoaded ? 2 : 0 }}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(false)}
          />
        )}
      </div>
      <span className="text-sm font-medium text-white/90">{displayName}</span>
    </div>
  );

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Review by ${authorName}, ${review.starRating} stars (opens in new tab)`}
    >
      <article className="contents">
        <Stars rating={review.starRating} />
        {reviewBody}
        {avatarBlock}
      </article>
    </a>
  ) : (
    <article className={className} aria-label={`Review by ${authorName}, ${review.starRating} stars`}>
      <Stars rating={review.starRating} />
      {reviewBody}
      {avatarBlock}
    </article>
  );
}
