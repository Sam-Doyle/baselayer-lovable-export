import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/*
 * PRODUCT REVIEWS — client side.
 *
 * Two hard rules govern this file and everything that renders off it.
 *
 * 1. Nothing here may invent data. No seed reviews, no placeholder rating, no
 *    "4.8 based on early testers". If the table is empty the site says so. An
 *    aggregateRating in JSON-LD that isn't backed by reviews a visitor can read
 *    on the page is a structured-data policy violation, and a made-up star
 *    average is a deceptive endorsement under the FTC's endorsement guides.
 *
 * 2. Reads come from public_product_reviews, never product_reviews. The view is
 *    the column filter that keeps reviewer_email and the Shopify order id out
 *    of the browser — the base table isn't readable with the anon key at all,
 *    and shouldn't become readable.
 *
 * Writes never touch the database from here. They go to the submit-review edge
 * function, which is the only thing that can establish "verified purchaser".
 */

/** Storefront handle for the face cream. Must match a key in PRODUCT_GIDS in
 *  supabase/functions/submit-review/index.ts, or submissions get rejected. */
export const FACE_CREAM_HANDLE = "face-cream";

/** Anchor the post-purchase email links to. Also what the "write a review"
 *  button scrolls to, so both paths land in the same place. */
export const WRITE_REVIEW_ANCHOR = "write-review";

export interface PublicReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  display_name: string;
  created_at: string;
}

export interface ReviewAggregate {
  /** Mean rating to one decimal. 0 when there are no reviews. */
  rating: number;
  count: number;
}

export interface ReviewSubmission {
  rating: number;
  title: string;
  body: string;
  displayName: string;
  email: string;
  orderName: string;
}

export function aggregateOf(reviews: PublicReview[]): ReviewAggregate {
  if (reviews.length === 0) return { rating: 0, count: 0 };
  const sum = reviews.reduce((total, r) => total + r.rating, 0);
  return {
    rating: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

/**
 * Approved reviews for one product, newest first.
 *
 * Errors resolve to an empty list rather than throwing. A review section that
 * fails to load should look like a product with no reviews yet, not break the
 * page a shopper is trying to buy from.
 */
export function useProductReviews(productHandle: string) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("public_product_reviews")
      .select("id, rating, title, body, display_name, created_at")
      .eq("product_handle", productHandle)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load reviews:", error.message);
      setReviews([]);
    } else {
      setReviews((data ?? []) as PublicReview[]);
    }
    setLoading(false);
  }, [productHandle]);

  useEffect(() => { load(); }, [load]);

  return { reviews, loading, aggregate: aggregateOf(reviews), refetch: load };
}

/*
 * Flat result rather than a discriminated union, matching cartStore's
 * SubmitResult shape and for the same reason it documents: this project builds
 * with strict: false, which does not reliably narrow a union on a boolean
 * literal `success` field, so `if (!result.success) result.error` would fail to
 * typecheck at every call site.
 */
export interface SubmitReviewResult {
  success: boolean;
  error?: string;
}

/**
 * Send a review to the edge function for purchase verification.
 *
 * Resolves rather than throws so the form can render the server's own message —
 * "that order hasn't shipped yet" is far more useful to a shopper than a
 * generic failure, and the function is careful about which distinctions it's
 * willing to make.
 */
export async function submitReview(
  productHandle: string,
  submission: ReviewSubmission,
): Promise<SubmitReviewResult> {
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        product_handle: productHandle,
        rating: submission.rating,
        title: submission.title,
        body: submission.body,
        display_name: submission.displayName,
        email: submission.email,
        order_name: submission.orderName,
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: payload.error || "We couldn't save your review. Try again in a minute." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "We couldn't reach our server. Check your connection and try again." };
  }
}

/**
 * schema.org nodes for real reviews only.
 *
 * Returns null at zero reviews, and the caller must spread nothing in that
 * case — an aggregateRating with no reviews behind it gets a manual action, not
 * a rich result.
 */
export function buildReviewSchema(reviews: PublicReview[]) {
  const { rating, count } = aggregateOf(reviews);
  if (count === 0) return null;

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      reviewCount: count,
      bestRating: "5",
      worstRating: "1",
    },
    // Capped at the most recent 20. Every one of these is also rendered on the
    // page — structured data has to match what a visitor can actually see.
    review: reviews.slice(0, 20).map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
      author: { "@type": "Person", name: r.display_name },
      datePublished: r.created_at.slice(0, 10),
      name: r.title,
      reviewBody: r.body,
    })),
  };
}
