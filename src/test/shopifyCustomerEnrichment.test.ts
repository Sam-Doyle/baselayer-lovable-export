import { describe, expect, it } from "vitest";
import {
  parseShopifyCustomerEnrichmentResponse,
  SHOPIFY_CUSTOMER_ENRICHMENT_QUERY,
} from "../../supabase/functions/_shared/shopify-customer-enrichment";

describe("Shopify customer consent enrichment", () => {
  it("extracts authoritative consent and its observation time", () => {
    expect(parseShopifyCustomerEnrichmentResponse({
      data: {
        customer: {
          id: "gid://shopify/Customer/123",
          email: "buyer@example.com",
          tags: ["bl_sub_active", "VIP"],
          emailMarketingConsent: {
            marketingState: "SUBSCRIBED",
            consentUpdatedAt: "2026-08-19T14:41:07Z",
          },
        },
      },
    })).toEqual({
      customerId: "gid://shopify/Customer/123",
      email: "buyer@example.com",
      marketingConsentState: "SUBSCRIBED",
      marketingConsentObservedAt: "2026-08-19T14:41:07Z",
      subscriptionTags: ["bl_sub_active", "VIP"],
    });
    expect(SHOPIFY_CUSTOMER_ENRICHMENT_QUERY).toContain("emailMarketingConsent");
    expect(SHOPIFY_CUSTOMER_ENRICHMENT_QUERY).toContain("tags");
  });

  it("fails closed when Shopify omits the customer", () => {
    expect(() => parseShopifyCustomerEnrichmentResponse({ data: { customer: null } }))
      .toThrow("shopify_customer_enrichment_missing_customer");
  });
});
