import { describe, expect, it } from "vitest";
import {
  parseShopifyOrderEnrichmentResponse,
  SHOPIFY_ORDER_ENRICHMENT_QUERY,
} from "../../supabase/functions/_shared/shopify-order-enrichment";

describe("Shopify order enrichment GraphQL", () => {
  it("does not require read_products to enrich order authority", () => {
    expect(SHOPIFY_ORDER_ENRICHMENT_QUERY).not.toContain("lineItems");
    expect(SHOPIFY_ORDER_ENRICHMENT_QUERY).not.toContain("variant");
    expect(SHOPIFY_ORDER_ENRICHMENT_QUERY).not.toContain("sellingPlan");
    expect(SHOPIFY_ORDER_ENRICHMENT_QUERY).not.toContain("sellingPlanAllocation");
  });

  it("parses only customer, consent, and financial status from the live-schema response", () => {
    expect(parseShopifyOrderEnrichmentResponse({
      data: {
        order: {
          email: "buyer@example.com",
          displayFinancialStatus: "PAID",
          customer: {
            id: "gid://shopify/Customer/123",
            email: "customer@example.com",
            emailMarketingConsent: { marketingState: "SUBSCRIBED" },
          },
        },
      },
    })).toEqual({
      customerId: "gid://shopify/Customer/123",
      email: "buyer@example.com",
      marketingConsentState: "SUBSCRIBED",
      isFullyRefunded: false,
    });
  });

  it("detects a fully refunded order without reading product data", () => {
    const result = parseShopifyOrderEnrichmentResponse({
      data: {
        order: {
          displayFinancialStatus: "REFUNDED",
        },
      },
    });
    expect(result.isFullyRefunded).toBe(true);
  });

  it("fails closed on GraphQL errors or a missing order", () => {
    expect(() => parseShopifyOrderEnrichmentResponse({
      errors: [{ message: "field unavailable" }],
    })).toThrow("shopify_order_enrichment_invalid");
    expect(() => parseShopifyOrderEnrichmentResponse({ data: { order: null } }))
      .toThrow("shopify_order_enrichment_invalid");
  });
});
