import { describe, expect, it } from "vitest";
import {
  SHOPIFY_MAX_SYNCHRONOUS_UPSTREAM_MS,
  SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS,
  SHOPIFY_TOKEN_TIMEOUT_MS,
} from "../../supabase/functions/_shared/shopify-webhook-budget";

describe("Shopify webhook acknowledgement budget", () => {
  it("reserves at least half of Shopify's five-second deadline for persistence and response", () => {
    expect(SHOPIFY_TOKEN_TIMEOUT_MS).toBeLessThanOrEqual(1_250);
    expect(SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS).toBeLessThanOrEqual(1_250);
    expect(SHOPIFY_MAX_SYNCHRONOUS_UPSTREAM_MS).toBeLessThanOrEqual(2_500);
  });
});
