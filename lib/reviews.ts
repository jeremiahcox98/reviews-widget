export type Review = {
  authorName: string;
  /** Optional handle for display (e.g. @orcdev). Falls back to authorName if not set. */
  authorHandle?: string;
  /** Optional profile photo URL. When missing, a placeholder (e.g. initials) is used. */
  profilePhotoUrl?: string;
  starRating: number;
  comment: string;
  createTime?: string;
  relativeTimeDescription?: string;
  /** Optional URL when the card is clicked (e.g. Google Maps reviews page). */
  url?: string;
};
