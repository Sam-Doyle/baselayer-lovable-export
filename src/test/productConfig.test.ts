import { describe, expect, it } from "vitest";
import {
  AVAILABLE_TIERS,
  DEFAULT_TIER,
  getInitialTier,
  tierCtaLabel,
  tierSummary,
} from "@/config/product";

describe("homepage offer selection", () => {
  it("selects the $38 single bottle when the homepage offer query is present", () => {
    expect(getInitialTier("single")).toMatchObject({ id: 1, bottles: 1, price: 38 });
  });

  it("preserves the global PDP default for direct visits", () => {
    expect(getInitialTier(null)).toEqual(DEFAULT_TIER);
    expect(AVAILABLE_TIERS).toContain(DEFAULT_TIER);
  });

  it("supports deterministic replenishment and subscription email offers", () => {
    expect(getInitialTier("two")).toMatchObject({ id: 2, bottles: 2, price: 68 });
    expect(getInitialTier("subscription")).toMatchObject({ id: 3, kind: "subscription", price: 35 });
    expect(getInitialTier("unknown")).toEqual(DEFAULT_TIER);
  });
});

describe("PDP tier labels", () => {
  it("keeps total and per-bottle pricing explicit for the default two-pack", () => {
    expect(tierSummary(DEFAULT_TIER)).toBe("$68 total · $34 each");
    expect(tierCtaLabel(DEFAULT_TIER)).toBe("ADD 2 BOTTLES · $68");
  });

  it("states the subscription charge cadence", () => {
    const subscription = AVAILABLE_TIERS.find((tier) => tier.kind === "subscription");
    expect(subscription).toBeDefined();
    expect(tierSummary(subscription!)).toBe("$35 per delivery · 1 bottle every 6 weeks");
    expect(tierCtaLabel(subscription!)).toBe("SUBSCRIBE · $35 PER DELIVERY");
  });
});
