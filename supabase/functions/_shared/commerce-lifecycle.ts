export const COMMERCE_SCHEMA_VERSION = 1 as const;

export const BASE_LAYER_SHOP_DOMAIN = "kpfzdg-kw.myshopify.com";
export const SINGLE_BOTTLE_VARIANT_ID = "42940461023303";
export const TWO_BOTTLE_VARIANT_ID = "42940461056071";
export const SUBSCRIPTION_SELLING_PLAN_ID = "2934145095";

export interface CommerceStoreConfig {
  shopDomain: string;
  singleBottleVariantId: string;
  twoBottleVariantId: string;
  subscriptionSellingPlanIds: readonly string[];
}

export const DEFAULT_COMMERCE_STORE_CONFIG: CommerceStoreConfig = {
  shopDomain: BASE_LAYER_SHOP_DOMAIN,
  singleBottleVariantId: SINGLE_BOTTLE_VARIANT_ID,
  twoBottleVariantId: TWO_BOTTLE_VARIANT_ID,
  subscriptionSellingPlanIds: [SUBSCRIPTION_SELLING_PLAN_ID],
};

export const SHOPIFY_TOPICS = [
  "orders/paid",
  "orders/cancelled",
  "refunds/create",
  "customers/update",
  "fulfillments/create",
  "fulfillments/update",
  "fulfillment_events/create",
] as const;

export type ShopifyTopic = (typeof SHOPIFY_TOPICS)[number];

export const COMMERCE_EVENT_TYPES = [
  "order_paid",
  "order_cancelled",
  "refund_created",
  "order_fulfilled",
  "order_delivered",
  "subscription_projection_observed",
] as const;

export type CommerceEventType = (typeof COMMERCE_EVENT_TYPES)[number];
export type MarketingConsentState = "subscribed" | "unsubscribed" | "not_subscribed" | "pending" | "unknown";
export type SubscriptionProjection =
  | "active"
  | "paused"
  | "cancelled"
  | "expired"
  | "failed"
  | "unknown"
  | "unknown_conflict";

export interface CanonicalCommerceSignal {
  schema_version: typeof COMMERCE_SCHEMA_VERSION;
  source: "shopify_webhook";
  source_event_id: string;
  topic: ShopifyTopic;
  event_type: CommerceEventType;
  shop_domain: string;
  api_version: string | null;
  occurred_at: string;
  customer_id: string | null;
  email: string | null;
  marketing_consent_state: MarketingConsentState;
  order_id: string | null;
  fulfillment_id: string | null;
  purchased_bottles: number | null;
  refunded_bottles_delta: number | null;
  has_product_line_refund: boolean | null;
  is_full_order_refund: boolean | null;
  is_subscription_order: boolean | null;
  subscription_plan_id: string | null;
  subscription_projection: SubscriptionProjection | null;
  subscription_tag_count: number | null;
  payload_sha256: string;
}

export interface ShopifyWebhookContext {
  sourceEventId: string;
  shopDomain: string;
  apiVersion?: string | null;
  triggeredAt?: string | null;
  payloadSha256: string;
  orderEnrichment?: ShopifyOrderEnrichment | null;
}

export interface ShopifyOrderEnrichment {
  customerId?: string | null;
  email?: string | null;
  marketingConsentState?: unknown;
  isFullyRefunded?: boolean | null;
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function integerValue(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/u.test(value)) return Number(value);
  return 0;
}

function canonicalId(value: unknown): string | null {
  const candidate = stringValue(value);
  if (!candidate) return null;
  const gidPart = candidate.match(/\/([^/]+)$/u)?.[1];
  return (gidPart ?? candidate).slice(0, 128);
}

function canonicalEmail(value: unknown): string | null {
  const candidate = stringValue(value)?.toLowerCase() ?? null;
  if (!candidate || candidate.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(candidate)) return null;
  return candidate;
}

function canonicalDate(...values: unknown[]): string {
  for (const value of values) {
    const candidate = stringValue(value);
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

export function canonicalMarketingConsent(value: unknown): MarketingConsentState {
  const candidate = stringValue(value)?.toLowerCase().replace(/-/gu, "_");
  switch (candidate) {
    case "subscribed":
      return "subscribed";
    case "unsubscribed":
      return "unsubscribed";
    case "not_subscribed":
      return "not_subscribed";
    case "pending":
    case "pending_confirmation":
      return "pending";
    default:
      return "unknown";
  }
}

function validShopDomain(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/u.test(value);
}

function requiredCanonicalId(value: string | undefined, fallback: string, name: string): string {
  const candidate = canonicalId(value ?? fallback);
  if (!candidate) throw new Error(`invalid_${name}`);
  return candidate;
}

/**
 * Resolve the one-store catalog for this deployment. Production remains on
 * the checked-in defaults, while an isolated staging project supplies its own
 * shop, variant, and selling-plan IDs through server-only environment values.
 */
export function commerceStoreConfigFromEnv(
  getEnv: (name: string) => string | undefined,
): CommerceStoreConfig {
  const shopDomain = (getEnv("SHOPIFY_SHOP_DOMAIN") ?? BASE_LAYER_SHOP_DOMAIN).trim().toLowerCase();
  if (!validShopDomain(shopDomain)) throw new Error("invalid_shopify_shop_domain");

  const rawPlanIds = getEnv("SHOPIFY_SUBSCRIPTION_SELLING_PLAN_IDS");
  const subscriptionSellingPlanIds = (rawPlanIds === undefined
    ? DEFAULT_COMMERCE_STORE_CONFIG.subscriptionSellingPlanIds
    : rawPlanIds.split(","))
    .map((value) => canonicalId(value))
    .filter((value): value is string => value !== null);

  return {
    shopDomain,
    singleBottleVariantId: requiredCanonicalId(
      getEnv("SHOPIFY_SINGLE_BOTTLE_VARIANT_ID"),
      SINGLE_BOTTLE_VARIANT_ID,
      "single_bottle_variant_id",
    ),
    twoBottleVariantId: requiredCanonicalId(
      getEnv("SHOPIFY_TWO_BOTTLE_VARIANT_ID"),
      TWO_BOTTLE_VARIANT_ID,
      "two_bottle_variant_id",
    ),
    subscriptionSellingPlanIds,
  };
}

function requiredQaId(getEnv: (name: string) => string | undefined, name: string): string {
  const candidate = canonicalId(getEnv(name));
  if (!candidate) throw new Error(`invalid_${name.toLowerCase()}`);
  return candidate;
}

/**
 * A deployment may listen to the production shop plus one explicitly
 * configured development store. The QA catalog is opt-in and strict: setting
 * its domain without both variant IDs fails the whole handler closed.
 */
export function commerceStoreConfigsFromEnv(
  getEnv: (name: string) => string | undefined,
): readonly CommerceStoreConfig[] {
  const primary = commerceStoreConfigFromEnv(getEnv);
  const rawQaDomain = getEnv("SHOPIFY_QA_SHOP_DOMAIN")?.trim().toLowerCase();
  if (!rawQaDomain) return [primary];
  if (!validShopDomain(rawQaDomain) || rawQaDomain === primary.shopDomain) {
    throw new Error("invalid_shopify_qa_shop_domain");
  }

  const rawQaPlanIds = getEnv("SHOPIFY_QA_SUBSCRIPTION_SELLING_PLAN_IDS") ?? "";
  const qaPlanIds = rawQaPlanIds.split(",")
    .map((value) => canonicalId(value))
    .filter((value): value is string => value !== null);

  return [primary, {
    shopDomain: rawQaDomain,
    singleBottleVariantId: requiredQaId(getEnv, "SHOPIFY_QA_SINGLE_BOTTLE_VARIANT_ID"),
    twoBottleVariantId: requiredQaId(getEnv, "SHOPIFY_QA_TWO_BOTTLE_VARIANT_ID"),
    subscriptionSellingPlanIds: qaPlanIds,
  }];
}

export function commercePublishShopDomainsFromEnv(
  getEnv: (name: string) => string | undefined,
): ReadonlySet<string> {
  const configured = getEnv("COMMERCE_PUBLISH_SHOP_DOMAINS");
  // Publishing is an explicit allowlist. A missing or malformed value must
  // never silently fall back to the production store.
  const domains = (configured ?? "").split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => validShopDomain(value));
  return new Set(domains);
}

function lineBottleFactor(variantId: string | null, storeConfig: CommerceStoreConfig): number {
  if (variantId === storeConfig.singleBottleVariantId) return 1;
  if (variantId === storeConfig.twoBottleVariantId) return 2;
  return 0;
}

function payloadLines(payload: UnknownRecord): Array<{ variantId: string | null; quantity: number; sellingPlanId: string | null }> {
  const rawLines = Array.isArray(payload.line_items) ? payload.line_items : [];
  return rawLines.map((rawLine) => {
    const line = record(rawLine);
    const allocation = record(line.selling_plan_allocation);
    const plan = record(allocation.selling_plan);
    return {
      variantId: canonicalId(line.variant_id ?? record(line.variant).id),
      quantity: integerValue(line.quantity),
      sellingPlanId: canonicalId(plan.id ?? allocation.selling_plan_id ?? line.selling_plan_id),
    };
  });
}

function bottleCount(lines: ReturnType<typeof payloadLines>, storeConfig: CommerceStoreConfig): number {
  return lines.reduce((total, line) => total + lineBottleFactor(line.variantId, storeConfig) * line.quantity, 0);
}

function refundBottleCount(payload: UnknownRecord, storeConfig: CommerceStoreConfig): number {
  const refundLines = Array.isArray(payload.refund_line_items) ? payload.refund_line_items : [];
  return refundLines.reduce((total, rawRefundLine) => {
    const refundLine = record(rawRefundLine);
    const lineItem = record(refundLine.line_item);
    const variantId = canonicalId(lineItem.variant_id ?? record(lineItem.variant).id);
    return total + lineBottleFactor(variantId, storeConfig) * integerValue(refundLine.quantity);
  }, 0);
}

const SUBSCRIPTION_TAGS = new Map<string, SubscriptionProjection>([
  ["bl_sub_active", "active"],
  ["bl_sub_paused", "paused"],
  ["bl_sub_cancelled", "cancelled"],
  ["bl_sub_expired", "expired"],
  ["bl_sub_failed", "failed"],
  ["bl_sub_unknown", "unknown"],
]);

export function subscriptionProjectionFromTags(rawTags: unknown): {
  projection: SubscriptionProjection | null;
  tagCount: number;
} {
  const tags = Array.isArray(rawTags)
    ? rawTags.map(stringValue).filter((tag): tag is string => tag !== null)
    : (stringValue(rawTags) ?? "").split(",").map((tag) => tag.trim()).filter(Boolean);
  const projections = [...new Set(tags.map((tag) => SUBSCRIPTION_TAGS.get(tag.toLowerCase())).filter(
    (status): status is SubscriptionProjection => status !== undefined,
  ))];
  if (projections.length === 0) return { projection: null, tagCount: 0 };
  if (projections.length > 1) return { projection: "unknown_conflict", tagCount: projections.length };
  return { projection: projections[0], tagCount: 1 };
}

export function isShopifyTopic(value: string): value is ShopifyTopic {
  return (SHOPIFY_TOPICS as readonly string[]).includes(value);
}

function baseSignal(
  topic: ShopifyTopic,
  payload: UnknownRecord,
  context: ShopifyWebhookContext,
  eventType: CommerceEventType,
): CanonicalCommerceSignal {
  const customer = record(payload.customer);
  const consent = record(payload.email_marketing_consent ?? customer.email_marketing_consent);
  const enrichment = context.orderEnrichment;
  return {
    schema_version: COMMERCE_SCHEMA_VERSION,
    source: "shopify_webhook",
    source_event_id: context.sourceEventId.slice(0, 255),
    topic,
    event_type: eventType,
    shop_domain: context.shopDomain.toLowerCase(),
    api_version: context.apiVersion?.slice(0, 32) ?? null,
    occurred_at: canonicalDate(
      context.triggeredAt,
      payload.happened_at,
      payload.processed_at,
      payload.updated_at,
      payload.created_at,
    ),
    customer_id: canonicalId(enrichment?.customerId ?? customer.id ?? payload.customer_id),
    email: canonicalEmail(enrichment?.email ?? payload.email ?? customer.email),
    marketing_consent_state: canonicalMarketingConsent(
      enrichment?.marketingConsentState ?? consent.state ?? consent.marketing_state,
    ),
    order_id: canonicalId(payload.order_id ?? payload.id),
    fulfillment_id: null,
    purchased_bottles: null,
    refunded_bottles_delta: null,
    has_product_line_refund: null,
    is_full_order_refund: null,
    is_subscription_order: null,
    subscription_plan_id: null,
    subscription_projection: null,
    subscription_tag_count: null,
    payload_sha256: context.payloadSha256,
  };
}

export function normalizeShopifyWebhook(
  topic: ShopifyTopic,
  rawPayload: unknown,
  context: ShopifyWebhookContext,
  storeConfig: CommerceStoreConfig = DEFAULT_COMMERCE_STORE_CONFIG,
): CanonicalCommerceSignal | null {
  const payload = record(rawPayload);

  if (topic === "orders/paid") {
    // Signed order webhooks contain the purchased variant, quantity, and
    // selling-plan allocation. Keep product classification on that authority;
    // querying LineItem.variant would unnecessarily require read_products.
    const lines = payloadLines(payload);
    const subscriptionLine = lines.find((line) => line.sellingPlanId !== null);
    const signal = baseSignal(topic, payload, context, "order_paid");
    signal.order_id = canonicalId(payload.id ?? payload.order_id);
    signal.purchased_bottles = bottleCount(lines, storeConfig);
    signal.is_subscription_order = subscriptionLine !== undefined;
    signal.subscription_plan_id = subscriptionLine?.sellingPlanId ?? null;
    return signal;
  }

  if (topic === "orders/cancelled") {
    const signal = baseSignal(topic, payload, context, "order_cancelled");
    signal.order_id = canonicalId(payload.id ?? payload.order_id);
    signal.occurred_at = canonicalDate(payload.cancelled_at, context.triggeredAt, payload.updated_at);
    return signal;
  }

  if (topic === "refunds/create") {
    const refundLines = Array.isArray(payload.refund_line_items) ? payload.refund_line_items : [];
    const signal = baseSignal(topic, payload, context, "refund_created");
    signal.order_id = canonicalId(payload.order_id);
    signal.refunded_bottles_delta = refundBottleCount(payload, storeConfig);
    signal.has_product_line_refund = refundLines.length > 0;
    signal.is_full_order_refund = context.orderEnrichment?.isFullyRefunded ?? null;
    return signal;
  }

  if (topic === "fulfillments/create" || topic === "fulfillments/update") {
    const status = stringValue(payload.status)?.toLowerCase();
    const shipmentStatus = stringValue(payload.shipment_status)?.toLowerCase();
    if (status === "cancelled" || status === "failure" || shipmentStatus === "failure") return null;
    const signal = baseSignal(topic, payload, context, "order_fulfilled");
    signal.order_id = canonicalId(payload.order_id);
    signal.fulfillment_id = canonicalId(payload.id);
    return signal;
  }

  if (topic === "fulfillment_events/create") {
    if (stringValue(payload.status)?.toLowerCase() !== "delivered") return null;
    const signal = baseSignal(topic, payload, context, "order_delivered");
    signal.order_id = canonicalId(payload.order_id);
    signal.fulfillment_id = canonicalId(payload.fulfillment_id);
    signal.occurred_at = canonicalDate(payload.happened_at, context.triggeredAt, payload.updated_at);
    return signal;
  }

  const projection = subscriptionProjectionFromTags(payload.tags);
  const signal = baseSignal(topic, payload, context, "subscription_projection_observed");
  signal.customer_id = canonicalId(payload.id ?? payload.customer_id);
  signal.subscription_projection = projection.projection;
  signal.subscription_tag_count = projection.tagCount;
  signal.order_id = null;
  return signal;
}

export function validateCanonicalSignal(
  signal: CanonicalCommerceSignal,
  storeConfig: CommerceStoreConfig = DEFAULT_COMMERCE_STORE_CONFIG,
): string | null {
  if (signal.schema_version !== COMMERCE_SCHEMA_VERSION) return "unsupported_schema";
  if (!isShopifyTopic(signal.topic)) return "unsupported_topic";
  if (!(COMMERCE_EVENT_TYPES as readonly string[]).includes(signal.event_type)) return "unsupported_event_type";
  if (signal.shop_domain !== storeConfig.shopDomain) return "unexpected_shop";
  if (!signal.source_event_id || signal.source_event_id.length > 255) return "invalid_event_id";
  if (!/^[a-f0-9]{64}$/u.test(signal.payload_sha256)) return "invalid_payload_fingerprint";
  if (Number.isNaN(new Date(signal.occurred_at).getTime())) return "invalid_occurred_at";
  if (signal.event_type !== "subscription_projection_observed" && !signal.order_id) return "missing_order_id";
  if (signal.event_type === "order_paid" && (signal.purchased_bottles ?? 0) < 1) return "order_has_no_base_layer_product";
  if (
    signal.event_type === "order_paid" && signal.is_subscription_order === true &&
    storeConfig.subscriptionSellingPlanIds.length > 0 &&
    !storeConfig.subscriptionSellingPlanIds.includes(signal.subscription_plan_id ?? "")
  ) return "unexpected_subscription_plan";
  return null;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function shopifyHmac(rawBody: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return bytesToBase64(new Uint8Array(signature));
}

export async function verifyShopifyHmac(rawBody: string, suppliedHmac: string, secret: string): Promise<boolean> {
  if (!suppliedHmac || !secret) return false;
  const expected = await shopifyHmac(rawBody, secret);
  if (expected.length !== suppliedHmac.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ suppliedHmac.charCodeAt(index);
  }
  return difference === 0;
}
