import type { ShopifyOrderEnrichment, ShopifyTopic } from "./commerce-lifecycle.ts";

export function shopifyTopicRequiresOrderEnrichment(topic: ShopifyTopic): boolean {
  return topic === "refunds/create";
}

export const SHOPIFY_ORDER_ENRICHMENT_QUERY = `query BaseLayerLifecycleOrder($id: ID!) {
  order(id: $id) {
    email
    displayFinancialStatus
    customer {
      id
      email
      emailMarketingConsent { marketingState }
    }
  }
}`;

interface ShopifyOrderEnrichmentGraphqlResponse {
  data?: {
    order?: {
      email?: string | null;
      displayFinancialStatus?: string | null;
      customer?: {
        id?: string | null;
        email?: string | null;
        emailMarketingConsent?: { marketingState?: string | null } | null;
      } | null;
    } | null;
  };
  errors?: unknown;
}

export function parseShopifyOrderEnrichmentResponse(payload: unknown): ShopifyOrderEnrichment {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("shopify_order_enrichment_invalid");
  }
  const body = payload as ShopifyOrderEnrichmentGraphqlResponse;
  const order = body.data?.order;
  if (body.errors || !order) throw new Error("shopify_order_enrichment_invalid");

  return {
    customerId: order.customer?.id ?? null,
    email: order.email ?? order.customer?.email ?? null,
    marketingConsentState: order.customer?.emailMarketingConsent?.marketingState ?? null,
    isFullyRefunded: order.displayFinancialStatus?.toUpperCase() === "REFUNDED",
  };
}
