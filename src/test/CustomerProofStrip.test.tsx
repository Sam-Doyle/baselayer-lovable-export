import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CustomerProofStrip from "@/components/CustomerProofStrip";
import { selectCustomerProofReview } from "@/lib/customerProof";
import { reviewAggregate, type Review } from "@/lib/reviews";

const review = (overrides: Partial<Review>): Review => ({
  id: 1,
  rating: 5,
  title: "",
  body: "Test review",
  reviewer: "Test Customer",
  verified: false,
  createdAt: "2026-08-13",
  pictures: [],
  ...overrides,
});

describe("CustomerProofStrip", () => {
  it("prioritizes a verified photo review without changing its truth fields", () => {
    const unverifiedPhoto = review({ id: 1, reviewer: "Photo only", pictures: ["photo.jpg"] });
    const verifiedNoPhoto = review({ id: 2, reviewer: "Verified only", verified: true });
    const verifiedPhoto = review({
      id: 3,
      reviewer: "Verified with photo",
      verified: true,
      pictures: ["verified-photo.jpg"],
      rating: 4,
    });

    expect(selectCustomerProofReview([unverifiedPhoto, verifiedNoPhoto, verifiedPhoto])).toBe(verifiedPhoto);
  });

  it("renders the build-time aggregate and real verification", () => {
    render(<CustomerProofStrip />);

    expect(screen.getByRole("complementary", { name: "Customer review highlight" })).toBeInTheDocument();
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
    expect(screen.getByRole("link", {
      name: new RegExp(`${reviewAggregate.rating.toFixed(1)} from ${reviewAggregate.count} reviews · Read all customer reviews`, "i"),
    })).toHaveAttribute(
      "href",
      "#reviews",
    );
    expect(screen.getByText("Customer reviews via Judge.me.")).toBeInTheDocument();
    expect(screen.queryByText(/Free-product tester feedback/i)).not.toBeInTheDocument();
  });
});
