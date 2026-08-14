import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SkinProfileCards from "@/components/SkinProfileCards";

describe("SkinProfileCards", () => {
  it("presents four informational profiles without fake navigation", () => {
    const { container } = render(<SkinProfileCards />);

    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText("Oily + combination")).toBeInTheDocument();
    expect(screen.getByText("Dry + dehydrated")).toBeInTheDocument();
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("keeps the useful explanation in the document for touch and assistive technology", () => {
    render(<SkinProfileCards />);

    expect(screen.getByText(/5% niacinamide/i)).toBeVisible();
    expect(screen.getByText(/patch test first/i)).toBeVisible();
    expect(screen.getByText(/two percent panthenol/i)).toBeVisible();
    expect(screen.getByText(/hyaluronic acid/i)).toBeVisible();
  });
});
