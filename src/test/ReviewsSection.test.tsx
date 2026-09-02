import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReviewsSection from "@/components/ReviewsSection";
import { PRODUCT_REVIEW_URL } from "@/config/reviews";

describe("ReviewsSection review collection", () => {
  it("links customers to the product-specific Judge.me form in a new tab", () => {
    render(<ReviewsSection />);

    const link = screen.getByRole("link", {
      name: /write a product review for performance daily face cream on judge\.me/i,
    });

    expect(link).toHaveAttribute("href", PRODUCT_REVIEW_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveTextContent("Write a review");
  });
});
