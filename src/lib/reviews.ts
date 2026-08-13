import reviewsJson from "@/data/reviews.json";

/**
 * Judge.me review data, baked in at build time by scripts/fetch-reviews.mjs.
 *
 * This is a synchronous import, not a fetch, and that is deliberate: the PDP is
 * prerendered by Puppeteer (see prerenderPlugin in vite.config.ts), so anything
 * imported this way ends up as real text in the static HTML that crawlers read.
 * A runtime fetch would ship an empty block to Google and shift layout under the
 * buy box on every load.
 *
 * The JSON is committed, so a Judge.me outage during a build degrades to the
 * last good snapshot rather than an empty page.
 */

export interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  reviewer: string;
  /** True only for Judge.me-confirmed buyers. Drives the verified badge. */
  verified: boolean;
  /** YYYY-MM-DD */
  createdAt: string;
  pictures: string[];
}

interface ReviewsFile {
  fetchedAt: string | null;
  rating: number;
  count: number;
  reviews: Review[];
}

/*
 * Minimum review count before the PDP block renders.
 *
 * This was 5, on the research that 70% of shoppers say they need at least five
 * reviews before they'll trust a business at all — the reasoning being that a
 * thin block reads as "nobody has bought this." Sam lowered it to 1 on
 * 2026-08-12 with four real reviews in hand, three of them carrying customer
 * photos: four photographed reviews beat an empty section, and the photos are
 * the asset the research actually credits (62% more likely to buy when customer
 * images are present). Revisit if the count ever drops back to one or two.
 *
 * The gate still exists for the zero case, which matters beyond taste: Google's
 * Rich Results Test errors on aggregateRating with reviewCount 0, and an
 * erroring Product schema can cost the rich result for the whole page.
 *
 * Keep in sync with REVIEW_GATE in vite.config.ts and scripts/fetch-reviews.mjs.
 */
export const REVIEW_GATE = 1;

const data = reviewsJson as ReviewsFile;

export const hasReviews = data.count >= REVIEW_GATE;

/**
 * Aggregate for <StarRating> and Product.aggregateRating. Zeroed below the gate
 * so every consumer hides on the same condition without repeating the check.
 *
 * These numbers come from the API or they don't exist. kb/wiki/customer-insights.md
 * records a "4.8/5 · 1,000+ customers" claim that was live and false; the point of
 * this module is that there is no code path where a number can be typed by hand.
 */
export const reviewAggregate = hasReviews
  ? { rating: data.rating, count: data.count }
  : { rating: 0, count: 0 };

/**
 * Display list, already sorted photo-first then newest by the fetch script.
 *
 * Deliberately not sorted or filtered by rating anywhere in the app: 82% of
 * shoppers go looking for the critical reviews, and suppressing or reordering
 * them to bury negatives is an FTC 16 CFR 465 problem on top of costing
 * conversion. If Judge.me review requests ever carry an incentive, each
 * affected review needs a visible disclosure badge beside it.
 *
 * Judge.me has transparency badges for this, but they only auto-apply to its
 * own coupon-reward flow. A review from someone who bought with a friends-and-
 * family code is an incentive Judge.me cannot see, so it has to be marked by
 * hand in the dashboard ("Mark review as incentivized"). Whether that flag
 * comes back on the API review object is unconfirmed — if it doesn't, the
 * disclosure cannot ride the snapshot in scripts/fetch-reviews.mjs and needs
 * its own path before any discounted review goes live.
 */
export const reviews: Review[] = hasReviews ? data.reviews : [];
