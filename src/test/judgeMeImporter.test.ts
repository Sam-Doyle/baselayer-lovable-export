import { describe, expect, it, vi } from "vitest";
import {
  JudgeMeDataValidationError,
  assertSafeSnapshotReplacement,
  buildReviewSnapshot,
  fetchAllReviews,
  parseJudgeMePage,
} from "../../scripts/lib/judgeme-reviews.mjs";

const productReview = (overrides = {}) => ({
  id: 101,
  product_external_id: 7469557612615,
  rating: 5,
  title: "Works",
  body: "Light and fast.",
  reviewer: { name: "Customer" },
  verified: "verified-purchase",
  created_at: "2026-09-02T12:00:00Z",
  pictures: [],
  ...overrides,
});

describe("Judge.me review ingestion", () => {
  it("rejects a successful response that does not contain a reviews array", () => {
    expect(() => parseJudgeMePage({}, 1)).toThrow(JudgeMeDataValidationError);
    expect(() => parseJudgeMePage({ reviews: null }, 1)).toThrow(/reviews array/i);
  });

  it("rejects non-numeric and out-of-range ratings instead of corrupting the average", () => {
    expect(() => buildReviewSnapshot([productReview({ rating: "5" })])).toThrow(/rating/i);
    expect(() => buildReviewSnapshot([productReview({ rating: 6 })])).toThrow(/rating/i);
  });

  it("publishes visible HTTPS photos only and sizes them for the PDP", () => {
    const snapshot = buildReviewSnapshot(
      [
        productReview({
          pictures: [
            { hidden: true, urls: { huge: "https://reviews.example/hidden.jpg?width=1024" } },
            { hidden: false, urls: { huge: "https://reviews.example/visible.jpg?width=1024" } },
            { hidden: false, urls: { huge: "javascript:alert(1)" } },
          ],
        }),
      ],
      { fetchedAt: "2026-09-02" },
    );

    expect(snapshot.reviews[0].pictures).toEqual([
      "https://reviews.example/visible.jpg?width=320",
    ]);
  });

  it("refuses to replace a populated snapshot with an empty or wrong-product response", () => {
    const existing = { count: 7 };
    const empty = buildReviewSnapshot([], { fetchedAt: "2026-09-02" });
    const wrongProduct = buildReviewSnapshot(
      [productReview({ product_external_id: 999 })],
      { fetchedAt: "2026-09-02" },
    );

    expect(() => assertSafeSnapshotReplacement(existing, empty)).toThrow(/last-known-good/i);
    expect(() => assertSafeSnapshotReplacement(existing, wrongProduct)).toThrow(/last-known-good/i);
    expect(() => assertSafeSnapshotReplacement(existing, empty, true)).not.toThrow();
  });

  it("aborts a Judge.me request that exceeds its timeout", async () => {
    const fetchImpl = vi.fn((_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      }),
    );

    await expect(
      fetchAllReviews({
        shopDomain: "shop.example",
        apiToken: "secret",
        fetchImpl,
        timeoutMs: 5,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
