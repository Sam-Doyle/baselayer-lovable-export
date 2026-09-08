import type { Review } from "@/lib/reviews";

/**
 * Prefer the strongest truthful proof already present in the Judge.me snapshot:
 * confirmed buyer + photo, confirmed buyer, photo, then the existing API order.
 * This only chooses placement; it never changes rating, verification, or copy.
 */
export const selectCustomerProofReview = (reviewList: readonly Review[]): Review | null => {
  let selected: Review | null = null;
  let selectedScore = -1;

  for (const review of reviewList) {
    const score = (review.verified ? 2 : 0) + (review.pictures.length > 0 ? 1 : 0);
    if (score > selectedScore) {
      selected = review;
      selectedScore = score;
    }
  }

  return selected;
};

/** A verbatim prefix, marked as an excerpt; the complete review stays linked. */
export function customerProofExcerpt(body: string, limit = 200): string {
  const text = body.trim();
  if (text.length <= limit) return text;
  const prefix = text.slice(0, limit);
  const sentenceEnd = Math.max(prefix.lastIndexOf(". "), prefix.lastIndexOf("! "), prefix.lastIndexOf("? "), prefix.lastIndexOf(".\n"));
  const end = sentenceEnd >= 60 ? sentenceEnd + 1 : prefix.lastIndexOf(" ");
  return `${prefix.slice(0, end > 0 ? end : limit)}…`;
}
