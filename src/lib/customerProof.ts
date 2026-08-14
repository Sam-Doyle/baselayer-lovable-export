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
