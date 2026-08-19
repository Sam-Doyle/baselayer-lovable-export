import type { ShopifyOrderEnrichment } from "./commerce-lifecycle.ts";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(stringValue).filter((entry): entry is string => entry !== null)
    : [];
}

export const SHOPIFY_CUSTOMER_ENRICHMENT_QUERY = `query BaseLayerLifecycleCustomer($id: ID!) {
  customer(id: $id) {
    id
    email
    tags
    emailMarketingConsent {
      marketingState
      consentUpdatedAt
    }
  }
}`;

export function parseShopifyCustomerEnrichmentResponse(value: unknown): ShopifyOrderEnrichment {
  const root = record(value);
  const customer = record(record(root.data).customer);
  if (Object.keys(customer).length === 0) throw new Error("shopify_customer_enrichment_missing_customer");
  const consent = record(customer.emailMarketingConsent);
  return {
    customerId: stringValue(customer.id),
    email: stringValue(customer.email),
    marketingConsentState: stringValue(consent.marketingState),
    marketingConsentObservedAt: stringValue(consent.consentUpdatedAt),
    subscriptionTags: stringArray(customer.tags),
  };
}
