#!/usr/bin/env node

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const runId = `bl-sql-audit-${Date.now()}-${randomUUID().slice(0, 8)}`;
const shopDomain = "kpfzdg-kw.myshopify.com";
const receipts = [];
const emails = [];
const orders = [];

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${text.slice(0, 300)}`);
  }
  return body;
}

function signal(eventType, overrides = {}) {
  const sourceEventId = `${runId}-${receipts.length + 1}`;
  const topics = {
    order_paid: "orders/paid",
    order_cancelled: "orders/cancelled",
    refund_created: "refunds/create",
    order_fulfilled: "fulfillments/create",
    order_delivered: "fulfillment_events/create",
    subscription_projection_observed: "customers/update",
  };
  return {
    source: "shopify_webhook",
    source_event_id: sourceEventId,
    shop_domain: shopDomain,
    topic: topics[eventType],
    event_type: eventType,
    api_version: "2026-07",
    payload_sha256: "a".repeat(64),
    occurred_at: new Date(Date.now() + receipts.length * 1000).toISOString(),
    marketing_consent_state: "unknown",
    ...overrides,
  };
}

async function record(eventType, overrides = {}, publishEnabled = false) {
  const payload = signal(eventType, overrides);
  const result = await submit(payload, publishEnabled);
  assert.equal(result.length, 1);
  assert.equal(result[0].duplicate, false);
  receipts.push(result[0].receipt_id);
  if (payload.email) emails.push(payload.email);
  if (payload.order_id) orders.push(payload.order_id);
  return result[0];
}

async function submit(payload, publishEnabled = false) {
  return request("rpc/record_commerce_lifecycle_signal", {
    method: "POST",
    body: JSON.stringify({ p_signal: payload, p_publish_enabled: publishEnabled }),
  });
}

async function rows(table, filters, select = "*") {
  const query = new URLSearchParams({ select, ...filters });
  return request(`${table}?${query}`);
}

async function patch(table, filters, values) {
  const query = new URLSearchParams(filters);
  return request(`${table}?${query}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(values),
  });
}

async function remove(table, filterName, values) {
  if (!values.length) return;
  const unique = [...new Set(values)];
  const quoted = unique.map((value) => `"${String(value).replaceAll('"', '\\"')}"`).join(",");
  await request(`${table}?${new URLSearchParams({ [filterName]: `in.(${quoted})` })}`, {
    method: "DELETE",
  });
}

async function outboxFor(orderId) {
  return rows(
    "commerce_lifecycle_outbox",
    { source_order_id: `eq.${orderId}`, order: "created_at.asc" },
    "id,event_name,status,hold_reason,journey_type,payload",
  );
}

try {
  // Fulfillment before paid must be reconciled after the paid webhook supplies
  // the canonical email/customer identity.
  const fulfillmentFirstOrder = `${runId}-fulfillment-first`;
  const fulfillmentFirstEmail = `${runId}+fulfilled@example.com`;
  await record("order_fulfilled", {
    order_id: fulfillmentFirstOrder,
    occurred_at: "2026-08-01T12:00:00.000Z",
  });
  await record("order_paid", {
    order_id: fulfillmentFirstOrder,
    customer_id: `${runId}-customer-1`,
    email: fulfillmentFirstEmail,
    occurred_at: "2026-08-02T12:00:00.000Z",
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });

  let outbox = await outboxFor(fulfillmentFirstOrder);
  assert.deepEqual(
    outbox.map((row) => row.event_name).sort(),
    [
      "bl_delivery_window_elapsed_v1",
      "bl_order_fulfilled_v1",
      "bl_order_paid_v1",
      "bl_postpurchase_quickstart_v1",
      "bl_postpurchase_results_v1",
      "bl_replenishment_due_v1",
    ].sort(),
  );
  assert.ok(outbox.every((row) => row.status === "held" && row.hold_reason === "audit_mode"));
  const estimatedQuickstart = outbox.find((row) => row.event_name === "bl_postpurchase_quickstart_v1");
  const estimatedResults = outbox.find((row) => row.event_name === "bl_postpurchase_results_v1");
  assert.equal(estimatedQuickstart.payload.event_properties.delivery_basis, "estimated_delivery");
  assert.equal(estimatedResults.payload.event_properties.delivery_basis, "estimated_delivery");

  await record("order_fulfilled", {
    order_id: fulfillmentFirstOrder,
    occurred_at: "2026-08-01T12:05:00.000Z",
  });
  outbox = await outboxFor(fulfillmentFirstOrder);
  assert.equal(outbox.filter((row) => row.event_name === "bl_order_fulfilled_v1").length, 1);
  assert.equal(outbox.filter((row) => row.event_name === "bl_delivery_window_elapsed_v1").length, 1);

  // A real delivered observation before paid replaces, rather than coexists
  // with, the estimated delivery window.
  const deliveredFirstOrder = `${runId}-delivered-first`;
  const deliveredFirstEmail = `${runId}+delivered@example.com`;
  await record("order_delivered", {
    order_id: deliveredFirstOrder,
    occurred_at: "2026-08-03T12:00:00.000Z",
  });
  await record("order_paid", {
    order_id: deliveredFirstOrder,
    customer_id: `${runId}-customer-2`,
    email: deliveredFirstEmail,
    occurred_at: "2026-08-04T12:00:00.000Z",
    marketing_consent_state: "subscribed",
    purchased_bottles: 2,
    is_subscription_order: false,
  });
  outbox = await outboxFor(deliveredFirstOrder);
  assert.equal(outbox.filter((row) => row.event_name === "bl_order_delivered_v1").length, 1);
  assert.equal(outbox.filter((row) => row.event_name === "bl_delivery_window_elapsed_v1").length, 0);
  assert.equal(
    outbox.find((row) => row.event_name === "bl_postpurchase_quickstart_v1")
      .payload.event_properties.delivery_basis,
    "actual_delivery",
  );
  assert.equal(
    outbox.find((row) => row.event_name === "bl_postpurchase_results_v1")
      .payload.event_properties.delivery_basis,
    "actual_delivery",
  );

  // The two-pack owns a 77-day replenishment date; a selling-plan order must
  // never enter the ordinary replenishment journey.
  const twoPackOrder = `${runId}-two-pack`;
  const twoPackEmail = `${runId}+two-pack@example.com`;
  await record("order_paid", {
    order_id: twoPackOrder,
    customer_id: `${runId}-customer-two-pack`,
    email: twoPackEmail,
    occurred_at: "2026-08-05T12:00:00.000Z",
    marketing_consent_state: "subscribed",
    purchased_bottles: 2,
    is_subscription_order: false,
  });
  const twoPackOutbox = await outboxFor(twoPackOrder);
  const twoPackReplenishment = twoPackOutbox.find((row) => row.event_name === "bl_replenishment_due_v1");
  assert.equal(twoPackReplenishment.payload.event_properties.basis, "two_pack_day_77");
  assert.equal(twoPackReplenishment.payload.event_properties.bottle_count, 2);

  const subscriptionOrder = `${runId}-subscription-order`;
  const subscriptionEmail = `${runId}+subscription@example.com`;
  await record("order_paid", {
    order_id: subscriptionOrder,
    customer_id: `${runId}-customer-subscription`,
    email: subscriptionEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: true,
    subscription_plan_id: "2934145095",
  });
  const subscriptionOutbox = await outboxFor(subscriptionOrder);
  assert.equal(subscriptionOutbox.some((row) => row.event_name === "bl_replenishment_due_v1"), false);
  const subscriptionState = await rows(
    "commerce_customer_state",
    { email: `eq.${subscriptionEmail}` },
    "has_subscription_order,last_order_is_subscription,replenishment_blocked",
  );
  assert.deepEqual(subscriptionState[0], {
    has_subscription_order: true,
    last_order_is_subscription: true,
    replenishment_blocked: true,
  });

  // Shopify retries with the same webhook ID must remain a single receipt and
  // cannot duplicate an order authority event.
  const duplicateOrder = `${runId}-duplicate`;
  const duplicateEmail = `${runId}+duplicate@example.com`;
  const duplicatePayload = signal("order_paid", {
    source_event_id: `${runId}-duplicate-webhook-id`,
    order_id: duplicateOrder,
    customer_id: `${runId}-customer-duplicate`,
    email: duplicateEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  const firstDuplicateResult = await submit(duplicatePayload);
  assert.equal(firstDuplicateResult[0].duplicate, false);
  receipts.push(firstDuplicateResult[0].receipt_id);
  emails.push(duplicateEmail);
  orders.push(duplicateOrder);
  const secondDuplicateResult = await submit(duplicatePayload);
  assert.equal(secondDuplicateResult[0].duplicate, true);
  assert.equal(secondDuplicateResult[0].receipt_id, firstDuplicateResult[0].receipt_id);
  const duplicateOutbox = await outboxFor(duplicateOrder);
  assert.equal(duplicateOutbox.filter((row) => row.event_name === "bl_order_paid_v1").length, 1);

  // Cancellation and full refund after paid must hard-exit the contact and
  // make an already-claimed acquisition event ineligible.
  const cancelledOrder = `${runId}-cancelled`;
  const cancelledEmail = `${runId}+cancelled@example.com`;
  await record("order_paid", {
    order_id: cancelledOrder,
    customer_id: `${runId}-customer-cancelled`,
    email: cancelledEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  let cancelledOutbox = await outboxFor(cancelledOrder);
  const cancelledPaidJob = cancelledOutbox.find((row) => row.event_name === "bl_order_paid_v1");
  await patch("commerce_lifecycle_outbox", { id: `eq.${cancelledPaidJob.id}` }, { status: "processing" });
  await record("order_cancelled", {
    order_id: cancelledOrder,
    email: cancelledEmail,
    marketing_consent_state: "subscribed",
  });
  const eligibleAfterCancel = await request("rpc/commerce_lifecycle_job_is_still_eligible", {
    method: "POST",
    body: JSON.stringify({ p_outbox_id: cancelledPaidJob.id }),
  });
  assert.equal(eligibleAfterCancel, false);
  const cancelledState = await rows(
    "commerce_customer_state",
    { email: `eq.${cancelledEmail}` },
    "lifecycle_hard_exit,replenishment_blocked",
  );
  assert.equal(cancelledState[0].lifecycle_hard_exit, true);

  const fullRefundOrder = `${runId}-full-refund`;
  const fullRefundEmail = `${runId}+full-refund@example.com`;
  await record("order_paid", {
    order_id: fullRefundOrder,
    customer_id: `${runId}-customer-full-refund`,
    email: fullRefundEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  await record("refund_created", {
    order_id: fullRefundOrder,
    email: fullRefundEmail,
    marketing_consent_state: "subscribed",
    has_product_line_refund: true,
    is_full_order_refund: true,
    refunded_bottles_delta: 1,
  });
  const fullRefundState = await rows(
    "commerce_customer_state",
    { email: `eq.${fullRefundEmail}` },
    "lifecycle_hard_exit,replenishment_blocked",
  );
  assert.equal(fullRefundState[0].lifecycle_hard_exit, true);

  // Cancel/refund can arrive before paid. Once paid supplies identity, the
  // customer projection and minimized exit authority must be backfilled.
  const cancelFirstOrder = `${runId}-cancel-first`;
  const cancelFirstEmail = `${runId}+cancel-first@example.com`;
  await record("order_cancelled", {
    order_id: cancelFirstOrder,
    occurred_at: "2026-08-06T12:00:00.000Z",
  });
  await record("order_paid", {
    order_id: cancelFirstOrder,
    customer_id: `${runId}-customer-cancel-first`,
    email: cancelFirstEmail,
    occurred_at: "2026-08-05T12:00:00.000Z",
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  const cancelFirstState = await rows(
    "commerce_customer_state",
    { email: `eq.${cancelFirstEmail}` },
    "lifecycle_hard_exit,replenishment_blocked",
  );
  assert.deepEqual(cancelFirstState[0], {
    lifecycle_hard_exit: true,
    replenishment_blocked: true,
  });
  const cancelFirstOutbox = await outboxFor(cancelFirstOrder);
  assert.equal(cancelFirstOutbox.filter((row) => row.event_name === "bl_order_cancelled_v1").length, 1);

  const refundFirstOrder = `${runId}-refund-first`;
  const refundFirstEmail = `${runId}+refund-first@example.com`;
  await record("refund_created", {
    order_id: refundFirstOrder,
    occurred_at: "2026-08-07T12:00:00.000Z",
    has_product_line_refund: true,
    is_full_order_refund: true,
    refunded_bottles_delta: 1,
  });
  await record("order_paid", {
    order_id: refundFirstOrder,
    customer_id: `${runId}-customer-refund-first`,
    email: refundFirstEmail,
    occurred_at: "2026-08-06T12:00:00.000Z",
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  const refundFirstState = await rows(
    "commerce_customer_state",
    { email: `eq.${refundFirstEmail}` },
    "lifecycle_hard_exit,replenishment_blocked",
  );
  assert.deepEqual(refundFirstState[0], {
    lifecycle_hard_exit: true,
    replenishment_blocked: true,
  });
  const refundFirstOutbox = await outboxFor(refundFirstOrder);
  assert.equal(refundFirstOutbox.filter((row) => row.event_name === "bl_refund_created_v1").length, 1);

  // A consent change after claim must fail the new final eligibility RPC.
  const consentOrder = `${runId}-consent-race`;
  const consentEmail = `${runId}+consent@example.com`;
  await record("order_paid", {
    order_id: consentOrder,
    customer_id: `${runId}-customer-3`,
    email: consentEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  const consentOutbox = await outboxFor(consentOrder);
  const paidJob = consentOutbox.find((row) => row.event_name === "bl_order_paid_v1");
  assert.ok(paidJob);
  await patch("commerce_lifecycle_outbox", { id: `eq.${paidJob.id}` }, { status: "processing" });
  await record("subscription_projection_observed", {
    customer_id: `${runId}-customer-3`,
    email: consentEmail,
    marketing_consent_state: "unsubscribed",
    subscription_tag_count: 0,
  });
  const eligibleAfterUnsubscribe = await request("rpc/commerce_lifecycle_job_is_still_eligible", {
    method: "POST",
    body: JSON.stringify({ p_outbox_id: paidJob.id }),
  });
  assert.equal(eligibleAfterUnsubscribe, false);

  // Flow's transient zero-tag update preserves state; conflicting durable tags
  // fail closed.
  const projectionEmail = `${runId}+projection@example.com`;
  await record("subscription_projection_observed", {
    customer_id: `${runId}-customer-4`,
    email: projectionEmail,
    marketing_consent_state: "subscribed",
    subscription_projection: "active",
    subscription_tag_count: 1,
  });
  await record("subscription_projection_observed", {
    customer_id: `${runId}-customer-4`,
    email: projectionEmail,
    marketing_consent_state: "subscribed",
    subscription_tag_count: 0,
  });
  let projection = await rows(
    "commerce_customer_state",
    { email: `eq.${projectionEmail}` },
    "subscription_projection,subscription_tag_count,replenishment_blocked",
  );
  assert.deepEqual(projection[0], {
    subscription_projection: "active",
    subscription_tag_count: 1,
    replenishment_blocked: true,
  });
  await record("subscription_projection_observed", {
    customer_id: `${runId}-customer-4`,
    email: projectionEmail,
    marketing_consent_state: "subscribed",
    subscription_projection: "unknown_conflict",
    subscription_tag_count: 2,
  });
  projection = await rows(
    "commerce_customer_state",
    { email: `eq.${projectionEmail}` },
    "subscription_projection,subscription_tag_count,replenishment_blocked",
  );
  assert.deepEqual(projection[0], {
    subscription_projection: "unknown_conflict",
    subscription_tag_count: 2,
    replenishment_blocked: true,
  });

  const transitionEmail = `${runId}+subscription-transition@example.com`;
  const transitionCustomer = `${runId}-customer-transition`;
  for (const [subscriptionProjection, occurredAt] of [
    ["active", "2026-08-08T12:00:00.000Z"],
    ["paused", "2026-08-09T12:00:00.000Z"],
    ["active", "2026-08-10T12:00:00.000Z"],
    ["cancelled", "2026-08-11T12:00:00.000Z"],
  ]) {
    await record("subscription_projection_observed", {
      customer_id: transitionCustomer,
      email: transitionEmail,
      occurred_at: occurredAt,
      marketing_consent_state: "subscribed",
      subscription_projection: subscriptionProjection,
      subscription_tag_count: 1,
    });
  }
  // A delayed older update cannot overwrite the later cancellation.
  await record("subscription_projection_observed", {
    customer_id: transitionCustomer,
    email: transitionEmail,
    occurred_at: "2026-08-09T12:30:00.000Z",
    marketing_consent_state: "subscribed",
    subscription_projection: "paused",
    subscription_tag_count: 1,
  });
  const transitionState = await rows(
    "commerce_customer_state",
    { email: `eq.${transitionEmail}` },
    "subscription_projection,subscription_tag_count,replenishment_blocked",
  );
  assert.deepEqual(transitionState[0], {
    subscription_projection: "cancelled",
    subscription_tag_count: 1,
    replenishment_blocked: true,
  });

  // Product refunds impose a hold and invalidate a job even if it was already
  // claimed. Shipping-only adjustments cancel replenishment urgency.
  const refundOrder = `${runId}-refund`;
  const refundEmail = `${runId}+refund@example.com`;
  await record("order_paid", {
    order_id: refundOrder,
    customer_id: `${runId}-customer-5`,
    email: refundEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  let refundOutbox = await outboxFor(refundOrder);
  const refundPaidJob = refundOutbox.find((row) => row.event_name === "bl_order_paid_v1");
  await patch("commerce_lifecycle_outbox", { id: `eq.${refundPaidJob.id}` }, { status: "processing" });
  await record("refund_created", {
    order_id: refundOrder,
    email: refundEmail,
    marketing_consent_state: "subscribed",
    has_product_line_refund: true,
    is_full_order_refund: false,
    refunded_bottles_delta: 1,
  });
  const eligibleAfterRefund = await request("rpc/commerce_lifecycle_job_is_still_eligible", {
    method: "POST",
    body: JSON.stringify({ p_outbox_id: refundPaidJob.id }),
  });
  assert.equal(eligibleAfterRefund, false);
  const refundState = await rows(
    "commerce_customer_state",
    { email: `eq.${refundEmail}` },
    "lifecycle_hold_until,lifecycle_hard_exit",
  );
  assert.ok(refundState[0].lifecycle_hold_until);
  assert.equal(refundState[0].lifecycle_hard_exit, false);

  const shippingOrder = `${runId}-shipping-adjustment`;
  const shippingEmail = `${runId}+shipping@example.com`;
  await record("order_paid", {
    order_id: shippingOrder,
    customer_id: `${runId}-customer-6`,
    email: shippingEmail,
    marketing_consent_state: "subscribed",
    purchased_bottles: 1,
    is_subscription_order: false,
  });
  await record("refund_created", {
    order_id: shippingOrder,
    email: shippingEmail,
    marketing_consent_state: "subscribed",
    has_product_line_refund: false,
    is_full_order_refund: false,
    refunded_bottles_delta: 0,
  });
  const shippingOutbox = await outboxFor(shippingOrder);
  const shippingReplenishment = shippingOutbox.find((row) => row.event_name === "bl_replenishment_due_v1");
  assert.equal(shippingReplenishment.status, "cancelled");
  assert.equal(shippingReplenishment.hold_reason, "shipping_adjustment_no_urgency");

  console.log(JSON.stringify({
    success: true,
    runId,
    checks: 40,
    publishedEvents: 0,
  }));
} finally {
  // Keep the production audit tables clean. Delete only the unique identities
  // created by this run and preserve every real Shopify receipt.
  await remove("commerce_lifecycle_outbox", "email", emails).catch(() => {});
  await remove("commerce_customer_state", "email", emails).catch(() => {});
  await remove("commerce_orders", "order_id", orders).catch(() => {});
  await remove("commerce_lifecycle_receipts", "id", receipts).catch(() => {});
}
