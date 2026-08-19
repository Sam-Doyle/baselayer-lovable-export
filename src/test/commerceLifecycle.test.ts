import { describe, expect, it } from "vitest";
import {
  BASE_LAYER_SHOP_DOMAIN,
  commercePublishShopDomainsFromEnv,
  commerceStoreConfigFromEnv,
  commerceStoreConfigsFromEnv,
  normalizeShopifyWebhook,
  sha256Hex,
  shopifyHmac,
  subscriptionProjectionFromTags,
  validateCanonicalSignal,
  verifyShopifyHmacWithRotation,
} from "../../supabase/functions/_shared/commerce-lifecycle";

const context = {
  sourceEventId: "89bc5c5b-7b19-4e65-a717-40146a376808",
  shopDomain: BASE_LAYER_SHOP_DOMAIN,
  apiVersion: "2026-07",
  triggeredAt: "2026-08-18T16:00:00.000Z",
  payloadSha256: "a".repeat(64),
};

describe("commerce lifecycle Shopify normalization", () => {
  it("allows only Shopify's canonical installed-shop domain", () => {
    expect(BASE_LAYER_SHOP_DOMAIN).toBe("kpfzdg-kw.myshopify.com");
  });

  it("resolves an isolated development-store catalog from server-only environment values", () => {
    const values: Record<string, string> = {
      SHOPIFY_SHOP_DOMAIN: "base-layer-lifecycle-qa.myshopify.com",
      SHOPIFY_SINGLE_BOTTLE_VARIANT_ID: "9001",
      SHOPIFY_TWO_BOTTLE_VARIANT_ID: "9002",
      SHOPIFY_SUBSCRIPTION_SELLING_PLAN_IDS: " 7001, gid://shopify/SellingPlan/7002 ",
    };
    expect(commerceStoreConfigFromEnv((name) => values[name])).toEqual({
      shopDomain: "base-layer-lifecycle-qa.myshopify.com",
      singleBottleVariantId: "9001",
      twoBottleVariantId: "9002",
      subscriptionSellingPlanIds: ["7001", "7002"],
    });
  });

  it("adds a strict QA catalog without making the QA shop publishable", () => {
    const values: Record<string, string> = {
      SHOPIFY_QA_SHOP_DOMAIN: "base-layer-lifecycle-qa.myshopify.com",
      SHOPIFY_QA_SINGLE_BOTTLE_VARIANT_ID: "67548639199536",
      SHOPIFY_QA_TWO_BOTTLE_VARIANT_ID: "67548639232304",
      SHOPIFY_QA_SUBSCRIPTION_SELLING_PLAN_IDS: "",
    };
    const stores = commerceStoreConfigsFromEnv((name) => values[name]);
    expect(stores).toHaveLength(2);
    expect(stores[1]).toEqual({
      shopDomain: "base-layer-lifecycle-qa.myshopify.com",
      singleBottleVariantId: "67548639199536",
      twoBottleVariantId: "67548639232304",
      subscriptionSellingPlanIds: [],
    });
    expect([...commercePublishShopDomainsFromEnv((name) => values[name])]).toEqual([]);
    expect([...commercePublishShopDomainsFromEnv((name) => (
      name === "COMMERCE_PUBLISH_SHOP_DOMAINS" ? BASE_LAYER_SHOP_DOMAIN : values[name]
    ))]).toEqual([BASE_LAYER_SHOP_DOMAIN]);
  });

  it("fails closed when a QA domain is configured without its complete catalog", () => {
    expect(() => commerceStoreConfigsFromEnv((name) => (
      name === "SHOPIFY_QA_SHOP_DOMAIN" ? "base-layer-lifecycle-qa.myshopify.com" : undefined
    ))).toThrow("invalid_shopify_qa_single_bottle_variant_id");
  });

  it("fails closed when the publish allowlist is missing or malformed", () => {
    expect([...commercePublishShopDomainsFromEnv(() => undefined)]).toEqual([]);
    expect([...commercePublishShopDomainsFromEnv(() => "not-a-shop, also.invalid")]).toEqual([]);
  });

  it("classifies only the configured development-store variants and selling plans", () => {
    const storeConfig = {
      shopDomain: "base-layer-lifecycle-qa.myshopify.com",
      singleBottleVariantId: "9001",
      twoBottleVariantId: "9002",
      subscriptionSellingPlanIds: ["7001"],
    };
    const devContext = { ...context, shopDomain: storeConfig.shopDomain };
    const twoPack = normalizeShopifyWebhook("orders/paid", {
      id: 21,
      line_items: [{ variant_id: 9002, quantity: 1 }],
    }, devContext, storeConfig);
    expect(twoPack?.purchased_bottles).toBe(2);
    expect(twoPack && validateCanonicalSignal(twoPack, storeConfig)).toBeNull();

    const unexpectedPlan = normalizeShopifyWebhook("orders/paid", {
      id: 22,
      line_items: [{
        variant_id: 9001,
        quantity: 1,
        selling_plan_allocation: { selling_plan: { id: 9999 } },
      }],
    }, devContext, storeConfig);
    expect(unexpectedPlan && validateCanonicalSignal(unexpectedPlan, storeConfig))
      .toBe("unexpected_subscription_plan");

    const productionVariant = normalizeShopifyWebhook("orders/paid", {
      id: 23,
      line_items: [{ variant_id: 42940461023303, quantity: 1 }],
    }, devContext, storeConfig);
    expect(productionVariant && validateCanonicalSignal(productionVariant, storeConfig))
      .toBe("order_has_no_base_layer_product");
  });

  it("classifies single, two-pack, and subscription orders from signed webhook lines", () => {
    const single = normalizeShopifyWebhook("orders/paid", {
      id: 10,
      line_items: [{ variant_id: 42940461023303, quantity: 1 }],
    }, {
      ...context,
      orderEnrichment: {
        email: "BUYER@EXAMPLE.COM",
        marketingConsentState: "SUBSCRIBED",
      },
    });
    expect(single).toMatchObject({
      event_type: "order_paid",
      email: "buyer@example.com",
      purchased_bottles: 1,
      is_subscription_order: false,
      marketing_consent_state: "subscribed",
    });
    expect(single && validateCanonicalSignal(single)).toBeNull();

    const twoPack = normalizeShopifyWebhook("orders/paid", {
      id: 11,
      line_items: [{ variant_id: 42940461056071, quantity: 1 }],
    }, {
      ...context,
      sourceEventId: "two-pack",
      orderEnrichment: { email: "buyer@example.com" },
    });
    expect(twoPack?.purchased_bottles).toBe(2);

    const subscription = normalizeShopifyWebhook("orders/paid", {
      id: 12,
      line_items: [{
        variant_id: 42940461023303,
        quantity: 1,
        selling_plan_allocation: {
          selling_plan: { id: 2934145095 },
        },
      }],
    }, {
      ...context,
      sourceEventId: "subscription",
      orderEnrichment: { email: "buyer@example.com" },
    });
    expect(subscription).toMatchObject({
      is_subscription_order: true,
      subscription_plan_id: "2934145095",
    });
  });

  it("distinguishes product-line refunds from shipping-only adjustments", () => {
    const partial = normalizeShopifyWebhook("refunds/create", {
      id: 20,
      order_id: 10,
      refund_line_items: [{
        quantity: 1,
        line_item: { variant_id: 42940461056071 },
      }],
    }, { ...context, sourceEventId: "refund-1", orderEnrichment: { isFullyRefunded: false } });
    expect(partial).toMatchObject({
      event_type: "refund_created",
      refunded_bottles_delta: 2,
      has_product_line_refund: true,
      is_full_order_refund: false,
    });

    const shipping = normalizeShopifyWebhook("refunds/create", {
      id: 21,
      order_id: 10,
      refund_line_items: [],
      order_adjustments: [{ amount: "7.12" }],
    }, { ...context, sourceEventId: "refund-2", orderEnrichment: { isFullyRefunded: false } });
    expect(shipping).toMatchObject({
      refunded_bottles_delta: 0,
      has_product_line_refund: false,
    });
  });

  it("uses authoritative customer consent enrichment and its observation time", () => {
    const customer = normalizeShopifyWebhook("customers/update", {
      id: 123,
      email: "buyer@example.com",
      tags: "bl_sub_active",
      updated_at: "2026-08-19T14:42:02Z",
    }, {
      ...context,
      sourceEventId: "customer-consent",
      triggeredAt: "2026-08-19T14:42:03Z",
      orderEnrichment: {
        customerId: "gid://shopify/Customer/123",
        email: "buyer@example.com",
        marketingConsentState: "SUBSCRIBED",
        marketingConsentObservedAt: "2026-08-19T14:41:07Z",
        subscriptionTags: ["bl_sub_paused", "VIP"],
      },
    });

    expect(customer).toMatchObject({
      event_type: "subscription_projection_observed",
      customer_id: "123",
      marketing_consent_state: "subscribed",
      marketing_consent_observed_at: "2026-08-19T14:41:07.000Z",
      occurred_at: "2026-08-19T14:42:03.000Z",
      subscription_projection: "paused",
      subscription_tag_count: 1,
    });
  });

  it("accepts only actual DELIVERED fulfillment events", () => {
    expect(normalizeShopifyWebhook("fulfillment_events/create", {
      id: 30,
      order_id: 10,
      fulfillment_id: 5,
      status: "in_transit",
    }, context)).toBeNull();
    expect(normalizeShopifyWebhook("fulfillment_events/create", {
      id: 31,
      order_id: 10,
      fulfillment_id: 5,
      status: "delivered",
      happened_at: "2026-08-22T12:00:00Z",
    }, context)).toMatchObject({
      event_type: "order_delivered",
      occurred_at: "2026-08-22T12:00:00.000Z",
    });
  });

  it("preserves zero-tag observations for SQL and quarantines conflicting subscription tags", () => {
    expect(subscriptionProjectionFromTags("vip, newsletter")).toEqual({ projection: null, tagCount: 0 });
    expect(subscriptionProjectionFromTags("bl_sub_active, vip")).toEqual({ projection: "active", tagCount: 1 });
    expect(subscriptionProjectionFromTags("bl_sub_active, bl_sub_paused")).toEqual({
      projection: "unknown_conflict",
      tagCount: 2,
    });
  });

  it("uses a stable raw-body fingerprint and Shopify-compatible HMAC", async () => {
    await expect(sha256Hex("{}"))
      .resolves.toBe("44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a");
    await expect(shopifyHmac("{}", "secret"))
      .resolves.toBe("dzJZAsrKgS3CWXM6rNBGtzgXNyx3e42VtAJkdHRRbhM=");
    const oldSignature = await shopifyHmac("{}", "old-secret");
    const newSignature = await shopifyHmac("{}", "new-secret");
    await expect(verifyShopifyHmacWithRotation("{}", oldSignature, ["old-secret", "new-secret"]))
      .resolves.toBe(true);
    await expect(verifyShopifyHmacWithRotation("{}", newSignature, ["old-secret", "new-secret"]))
      .resolves.toBe(true);
    await expect(verifyShopifyHmacWithRotation("{}", newSignature, ["old-secret", "old-secret"]))
      .resolves.toBe(false);
  });
});
