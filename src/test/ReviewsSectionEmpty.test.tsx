import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/reviews", () => ({
  reviews: [],
  reviewAggregate: { rating: 0, count: 0 },
  hasReviews: false,
  histogram: null,
}));

import ReviewsSection from "@/components/ReviewsSection";

describe("ReviewsSection without published reviews", () => {
  it("keeps the section and product-specific review CTA available", () => {
    render(<ReviewsSection />);

    expect(document.getElementById("reviews")).toBeInTheDocument();
    expect(screen.getByText(/be the first to share your experience/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /write a product review/i })).toBeInTheDocument();
    expect(screen.queryByText(/based on/i)).not.toBeInTheDocument();
  });
});
