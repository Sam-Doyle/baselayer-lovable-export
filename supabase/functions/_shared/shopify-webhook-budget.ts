export const SHOPIFY_TOKEN_TIMEOUT_MS = 1_250;
export const SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS = 1_250;

// Leave at least half of Shopify's five-second acknowledgement window for
// validation, persistence, cold-start overhead, and the HTTP response.
export const SHOPIFY_MAX_SYNCHRONOUS_UPSTREAM_MS =
  SHOPIFY_TOKEN_TIMEOUT_MS + SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS;
