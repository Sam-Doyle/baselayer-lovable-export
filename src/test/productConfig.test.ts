import { describe, expect, it } from "vitest";
import { AVAILABLE_TIERS, DEFAULT_TIER, getInitialTier } from "@/config/product";

describe("homepage offer selection", () => {
  it("selects the $38 single bottle when the homepage offer query is present", () => {
    expect(getInitialTier("single")).toMatchObject({ id: 1, bottles: 1, price: 38 });
  });

  it("preserves the global PDP default for direct visits", () => {
    expect(getInitialTier(null)).toEqual(DEFAULT_TIER);
    expect(AVAILABLE_TIERS).toContain(DEFAULT_TIER);
  });
});
