import { createClient } from "npm:@supabase/supabase-js@2.97.0";
import {
  commercePublishShopDomainsFromEnv,
  commerceStoreConfigsFromEnv,
  isShopifyTopic,
  normalizeShopifyWebhook,
  sha256Hex,
  validateCanonicalSignal,
  verifyShopifyHmacWithRotation,
  type ShopifyOrderEnrichment,
  type ShopifyTopic,
} from "../_shared/commerce-lifecycle.ts";
import {
  shopifyAdminTokenProvider,
  type ShopifyClientCredentials,
} from "../_shared/shopify-admin-auth.ts";
import {
  parseShopifyOrderEnrichmentResponse,
  SHOPIFY_ORDER_ENRICHMENT_QUERY,
  shopifyTopicRequiresOrderEnrichment,
} from "../_shared/shopify-order-enrichment.ts";
import {
  parseShopifyCustomerEnrichmentResponse,
  SHOPIFY_CUSTOMER_ENRICHMENT_QUERY,
} from "../_shared/shopify-customer-enrichment.ts";
import { SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS } from "../_shared/shopify-webhook-budget.ts";

const MAX_BODY_BYTES = 256 * 1024;
const SHOPIFY_GRAPHQL_VERSION = "2026-07";

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function header(req: Request, name: string): string {
  return req.headers.get(name)?.trim() ?? "";
}

function validDeliveryId(value: string): boolean {
  return /^[A-Za-z0-9._:-]{1,255}$/u.test(value);
}

function orderGid(value: unknown): string | null {
  if (typeof value === "string" && value.startsWith("gid://shopify/Order/")) return value;
  if ((typeof value === "string" || typeof value === "number") && /^\d+$/u.test(String(value))) {
    return `gid://shopify/Order/${value}`;
  }
  return null;
}

function customerGid(value: unknown): string | null {
  if (typeof value === "string" && value.startsWith("gid://shopify/Customer/")) return value;
  if ((typeof value === "string" || typeof value === "number") && /^\d+$/u.test(String(value))) {
    return `gid://shopify/Customer/${value}`;
  }
  return null;
}

async function fetchOrderEnrichment(
  shopDomain: string,
  orderId: string,
  adminToken: string,
  fetcher: typeof fetch = fetch,
): Promise<ShopifyOrderEnrichment> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetcher(`https://${shopDomain}/admin/api/${SHOPIFY_GRAPHQL_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query: SHOPIFY_ORDER_ENRICHMENT_QUERY,
        variables: { id: orderId },
      }),
      signal: controller.signal,
    });
  } catch {
    throw new Error("shopify_order_enrichment_unavailable");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error(`shopify_order_enrichment_http_${response.status}`);
  return parseShopifyOrderEnrichmentResponse(await response.json());
}

async function fetchOrderEnrichmentWithClientCredentials(
  shopDomain: string,
  orderId: string,
  credentials: ShopifyClientCredentials,
): Promise<ShopifyOrderEnrichment> {
  const adminToken = await shopifyAdminTokenProvider.getAccessToken(credentials);
  try {
    return await fetchOrderEnrichment(shopDomain, orderId, adminToken);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "shopify_order_enrichment_http_401") throw error;
    // Do not spend Shopify's five-second webhook acknowledgement budget on a
    // second upstream round trip. Invalidate the token and let Shopify's retry
    // receive a freshly minted credential.
    shopifyAdminTokenProvider.invalidate(shopDomain, credentials.clientId);
    throw error;
  }
}

async function fetchCustomerEnrichment(
  shopDomain: string,
  customerId: string,
  adminToken: string,
  fetcher: typeof fetch = fetch,
): Promise<ShopifyOrderEnrichment> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHOPIFY_ORDER_ENRICHMENT_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetcher(`https://${shopDomain}/admin/api/${SHOPIFY_GRAPHQL_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shopify-access-token": adminToken,
      },
      body: JSON.stringify({ query: SHOPIFY_CUSTOMER_ENRICHMENT_QUERY, variables: { id: customerId } }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error(`shopify_customer_enrichment_http_${response.status}`);
  return parseShopifyCustomerEnrichmentResponse(await response.json());
}

async function fetchCustomerEnrichmentWithClientCredentials(
  shopDomain: string,
  customerId: string,
  credentials: ShopifyClientCredentials,
): Promise<ShopifyOrderEnrichment> {
  const adminToken = await shopifyAdminTokenProvider.getAccessToken(credentials);
  try {
    return await fetchCustomerEnrichment(shopDomain, customerId, adminToken);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "shopify_customer_enrichment_http_401") throw error;
    shopifyAdminTokenProvider.invalidate(shopDomain, credentials.clientId);
    throw error;
  }
}

function orderIdForEnrichment(topic: ShopifyTopic, payload: Record<string, unknown>): string | null {
  // The signed paid-order payload already contains the email, consent,
  // variants, quantities, and selling plan required by the bridge. Only
  // refunds need a current financial-status lookup.
  if (shopifyTopicRequiresOrderEnrichment(topic)) return orderGid(payload.order_id);
  return null;
}

function customerIdForEnrichment(topic: ShopifyTopic, payload: Record<string, unknown>): string | null {
  return topic === "customers/update" ? customerGid(payload.id ?? payload.customer_id) : null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse(405, { success: false, error: "method_not_allowed" });

  const contentLength = Number(header(req, "content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { success: false, error: "payload_too_large" });
  }

  const rawBody = await req.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonResponse(413, { success: false, error: "payload_too_large" });
  }

  let storeConfigs;
  try {
    storeConfigs = commerceStoreConfigsFromEnv((name) => Deno.env.get(name));
  } catch {
    return jsonResponse(503, { success: false, error: "shopify_store_not_configured" });
  }

  const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET") ?? "";
  const webhookSecrets = [
    Deno.env.get("SHOPIFY_WEBHOOK_SECRET") || clientSecret,
    Deno.env.get("SHOPIFY_WEBHOOK_SECRET_NEXT") || "",
  ];
  const suppliedHmac = header(req, "x-shopify-hmac-sha256");
  if (!await verifyShopifyHmacWithRotation(rawBody, suppliedHmac, webhookSecrets)) {
    return jsonResponse(401, { success: false, error: "invalid_signature" });
  }

  const shopDomain = header(req, "x-shopify-shop-domain").toLowerCase();
  const storeConfig = storeConfigs.find((config) => config.shopDomain === shopDomain);
  if (!storeConfig) {
    return jsonResponse(403, { success: false, error: "unexpected_shop" });
  }
  const topicHeader = header(req, "x-shopify-topic").toLowerCase();
  if (!isShopifyTopic(topicHeader)) {
    return jsonResponse(422, { success: false, error: "unsupported_topic" });
  }
  const sourceEventId = header(req, "x-shopify-webhook-id");
  if (!validDeliveryId(sourceEventId)) {
    return jsonResponse(422, { success: false, error: "invalid_delivery_id" });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
    payload = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { success: false, error: "invalid_json" });
  }

  let orderEnrichment: ShopifyOrderEnrichment | null = null;
  const enrichmentOrderId = orderIdForEnrichment(topicHeader, payload);
  const enrichmentCustomerId = customerIdForEnrichment(topicHeader, payload);
  if (enrichmentOrderId || enrichmentCustomerId) {
    const clientId = Deno.env.get("SHOPIFY_CLIENT_ID") ?? "";
    if (!clientId || !clientSecret) {
      return jsonResponse(503, { success: false, error: "shopify_admin_not_configured" });
    }
    try {
      const credentials = { shopDomain, clientId, clientSecret };
      orderEnrichment = enrichmentOrderId
        ? await fetchOrderEnrichmentWithClientCredentials(shopDomain, enrichmentOrderId, credentials)
        : await fetchCustomerEnrichmentWithClientCredentials(shopDomain, enrichmentCustomerId!, credentials);
    } catch (error) {
      const code = error instanceof Error ? error.message : "shopify_order_enrichment_failed";
      console.error("shopify-lifecycle-webhook: order enrichment failed", code);
      return jsonResponse(503, { success: false, error: "shopify_order_enrichment_failed" });
    }
  }

  const signal = normalizeShopifyWebhook(topicHeader, payload, {
    sourceEventId,
    shopDomain,
    apiVersion: header(req, "x-shopify-api-version") || null,
    triggeredAt: header(req, "x-shopify-triggered-at") || null,
    payloadSha256: await sha256Hex(rawBody),
    orderEnrichment,
  }, storeConfig);
  // Non-delivered carrier events and failed/cancelled fulfillment updates are
  // acknowledged but intentionally do not enter the lifecycle projection.
  if (!signal) return jsonResponse(200, { success: true, ignored: true });
  const validationError = validateCanonicalSignal(signal, storeConfig);
  if (validationError) return jsonResponse(422, { success: false, error: validationError });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(503, { success: false, error: "service_unavailable" });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publishShopDomains = commercePublishShopDomainsFromEnv((name) => Deno.env.get(name));
  const publishEnabled = Deno.env.get("COMMERCE_LIFECYCLE_MODE") === "publish" &&
    publishShopDomains.has(shopDomain);
  const { data, error } = await supabase.rpc("record_commerce_lifecycle_signal", {
    p_signal: signal,
    p_publish_enabled: publishEnabled,
  });
  if (error) {
    console.error("shopify-lifecycle-webhook: persistence failed", error.code);
    return jsonResponse(503, { success: false, error: "persistence_failed" });
  }
  const result = Array.isArray(data) ? data[0] : data;
  return jsonResponse(200, {
    success: true,
    duplicate: result?.duplicate === true,
    mode: publishEnabled ? "publish" : "audit",
  });
});
