import { describe, it, expect } from "vitest";
import { reviewSchema, reviews, reviewAggregate } from "@/lib/reviews";

/*
 * Google Search Console reported "Missing field review (optional)" and
 * "Missing field aggregateRating (optional)" against the Product markup on
 * 2026-08-17. Both are answerable from the Judge.me snapshot, but only on a
 * page that shows the reviews — Google requires marked-up ratings and reviews
 * to be visible to the user on the page carrying them, and three landing pages
 * were shipping an aggregateRating with no star anywhere in the UI.
 *
 * These pin the half that lives in code: reviewSchema is derived from the same
 * list <ReviewsSection> renders and empties on the same gate, so a Product
 * schema can't quietly claim reviews the page doesn't display. The other half —
 * which routes are allowed to spread it in — is a judgement call recorded in
 * the comments in FaceCream.tsx and vite.config.ts.
 */

describe("Product.review objects track the visible review list", () => {
  it("emits exactly one Review per rendered review", () => {
    expect(reviewSchema).toHaveLength(reviews.length);
  });

  it("carries the fields Google needs on every entry", () => {
    expect(reviewSchema.length).toBeGreaterThan(0);
    for (const r of reviewSchema) {
      expect(r["@type"]).toBe("Review");
      expect(r.author).toMatchObject({ "@type": "Person" });
      expect((r.author as { name: string }).name).toBeTruthy();
      expect(r.reviewRating).toMatchObject({ "@type": "Rating", bestRating: 5, worstRating: 1 });
      const value = (r.reviewRating as { ratingValue: number }).ratingValue;
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(5);
      expect(r.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("omits blank titles and bodies instead of sending empty strings", () => {
    for (const r of reviewSchema) {
      if ("name" in r) expect(r.name).toBeTruthy();
      if ("reviewBody" in r) expect(r.reviewBody).toBeTruthy();
    }
  });

  it("rides the same gate as aggregateRating, so the two can never disagree", () => {
    expect(reviewSchema.length > 0).toBe(reviewAggregate.count > 0);
  });
});
