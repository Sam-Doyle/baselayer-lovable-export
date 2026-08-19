# Shopify → Brevo lifecycle bridge

This is the production contract for Base Layer's authoritative commerce
signals. It is intentionally sized for one skincare SKU, with one production
store and one explicitly configured development store: no generic event bus,
no order polling, and no billing/shipping-address payloads.

## Ownership and rollout state

- **Shopify** owns orders, refunds, fulfillment, delivery scans, email-marketing
  consent, subscription contracts, renewals, and dunning.
- **Supabase** stores a minimized delivery receipt, current order/customer
  projection, scheduled lifecycle eligibility, and retryable Brevo outbox.
- **Brevo** owns marketing email suppression and sends. The worker checks the
  current Brevo `emailBlacklisted` value immediately before every event publish.
- **PushOwl/Brevo's Shopify connector** remains a fail-safe exit source for the
  existing welcome/cart flows. Its duplicate `order_created` rows and excessive
  billing metadata must never be used as retention authority.

The integration is fail-closed and defaults to
`COMMERCE_LIFECYCLE_MODE=audit`. Audit mode stores receipts/state and creates
only held outbox records. Production was deliberately moved to `publish` on
2026-08-18 after the activation checks below. Switching the webhook or worker
independently is insufficient: both require the exact value `publish`, and
historical held jobs are never bulk-released automatically.

`COMMERCE_PUBLISH_SHOP_DOMAINS` is a second, independent send gate. It defaults
to only the production domain. The development store must never be added to
that allowlist; its orders are for audit/state-machine QA, not Brevo delivery.

## Development-store test harness

The isolated Shopify Basic development store is:

```text
Base Layer Lifecycle QA
base-layer-lifecycle-qa.myshopify.com
```

It uses Shopify's generated test data/Bogus Gateway and contains one Base
Layer test product with the same offer structure as production:

| Offer | Development variant ID | Price | Weight |
|---|---:|---:|---:|
| 1 bottle | `67548639199536` | $38 | 88 g |
| 2 bottles | `67548639232304` | $68 | 176 g |

Shopify Subscriptions is installed with one plan on only the one-bottle
variant: $35 every six weeks. During bootstrap, leave the development
selling-plan allowlist empty so the first real subscription test order can
capture Shopify's authoritative `selling_plan_id`; pin that ID immediately
after the test. An empty QA allowlist means “accept any selling plan on the
configured Base Layer variant,” not “treat a one-time line as subscription.”

The existing read-only lifecycle app is installed on the dev store. Shopify
Flow is installed separately there so contract-state workflows can be tested
without changing the production drafts. Production and QA records are safely
partitioned by `shop_domain` in every receipt, order, customer, and outbox key.

Server-only QA configuration:

```text
SHOPIFY_QA_SHOP_DOMAIN=base-layer-lifecycle-qa.myshopify.com
SHOPIFY_QA_SINGLE_BOTTLE_VARIANT_ID=67548639199536
SHOPIFY_QA_TWO_BOTTLE_VARIANT_ID=67548639232304
SHOPIFY_QA_SUBSCRIPTION_SELLING_PLAN_IDS=
COMMERCE_PUBLISH_SHOP_DOMAINS=kpfzdg-kw.myshopify.com
```

Setting `SHOPIFY_QA_SHOP_DOMAIN` without both QA variant IDs fails the webhook
closed. The production catalog remains the checked-in default and is covered
by regression tests.

## Dedicated Shopify custom app

Create a new custom app named **Base Layer Lifecycle Bridge**. Do not widen the
permissions of the storefront/Astro app. It requires only these read scopes:

| Scope | Why |
|---|---|
| `read_orders` | paid/cancel/refund webhooks plus GraphQL consent/full-refund enrichment |
| `read_customers` | customer update webhook, email consent, exclusive subscription projection tags |
| `read_fulfillments` | fulfillment create/update and true carrier delivery events |

Do not grant write scopes or `read_all_orders`. Installation will present new
Orders, Customers, and Fulfillment access. Stop at that permission screen for
the merchant's explicit approval.

Register these HTTPS topics using API version `2026-07`:

- `orders/paid`
- `orders/cancelled`
- `refunds/create`
- `customers/update`
- `fulfillments/create`
- `fulfillments/update`
- `fulfillment_events/create`

Callback:

```text
https://rymidvhuyxqvvyjpodqn.supabase.co/functions/v1/shopify-lifecycle-webhook
```

The canonical installed-shop domain is `kpfzdg-kw.myshopify.com`. Shopify sends
that original handle in `X-Shopify-Shop-Domain`; the branded
`base-layer-skin.myshopify.com` alias must not be used for the webhook allowlist
or Admin OAuth token exchange.

Shopify signs the raw request body with the app client secret in
`X-Shopify-Hmac-SHA256`. The handler also requires the exact shop domain and
deduplicates `(source, shop, topic, X-Shopify-Webhook-Id)`. The raw payload is
fingerprinted but never stored.

## Shopify Flow subscription projection

Shopify Basic cannot use Flow's HTTP action, and a separate custom app cannot
read contracts owned by the first-party Shopify Subscriptions app. Flow is used
only to project contract status into exclusive customer tags; `customers/update`
then carries those tags through the signed custom-app webhook.

Create two inactive workflows with identical branches:

1. Trigger: **Subscription contract created**
2. Trigger: **Subscription contract updated**

For each exact contract status, remove all six tags and then add exactly one:

| Contract status | Customer tag |
|---|---|
| `ACTIVE` | `bl_sub_active` |
| `PAUSED` | `bl_sub_paused` |
| `CANCELLED` | `bl_sub_cancelled` |
| `EXPIRED` | `bl_sub_expired` |
| `FAILED` | `bl_sub_failed` |
| unexpected/null | `bl_sub_unknown` |

Never set `bl_sub_failed` from a billing-attempt failure. Shopify owns renewal
and dunning. The bridge preserves the prior projection during Flow's temporary
zero-tag update. More than one BL status tag becomes `unknown_conflict` and
suppresses replenishment. Out-of-order customer updates cannot overwrite a
newer observation.

Because Base Layer is single-SKU, the projection assumes at most one relevant
contract per customer. Revisit the design before supporting simultaneous
contracts.

## Canonical event contract

All Brevo names are isolated from PushOwl by the `bl_*_v1` namespace:

| Event | Role |
|---|---|
| `bl_order_paid_v1` | Canonical purchase/exit state; never starts education and does not replace current cart exits |
| `bl_order_cancelled_v1` | Hard exit until a later positively consented purchase |
| `bl_refund_created_v1` | Refund exit/hold signal |
| `bl_order_fulfilled_v1` | Shipment authority; does not claim delivery |
| `bl_order_delivered_v1` | Actual carrier `DELIVERED` event |
| `bl_delivery_window_elapsed_v1` | Explicit estimate at fulfillment +5 days; `estimated=true` |
| `bl_subscription_projection_v1` | Suppression state only; never starts subscriber messages |
| `bl_replenishment_due_v1` | One-time-order replenishment eligibility after all send-time checks |
| `bl_postpurchase_quickstart_v1` | Due-time usage guide signal at actual/estimated delivery +1 day |
| `bl_postpurchase_results_v1` | Due-time results check-in signal at actual/estimated delivery +14 days |

The Brevo payload contains only the email identifier, Shopify order/customer
IDs, bottle/pack classification, subscription-order flag/plan ID, lifecycle
status, and timestamps. It excludes names, phone numbers, addresses, line-item
prices, payment data, and raw Shopify objects.

### Single-SKU rules

- Single variant `42940461023303` counts as one bottle.
- Two-pack variant `42940461056071` counts as two bottles.
- Selling plan `2934145095`, variants, and quantities are detected from the
  raw signed order webhook's `line_items`. Admin GraphQL enriches only
  customer/email consent and full-refund status, so the app does not need
  `read_products`.
- A subscription order is durable history and is never placed into one-time
  replenishment.
- Active, paused, unknown, and conflicting subscription projections suppress
  replenishment. Cancelled/expired/failed may re-allow it only after a later
  positively consented one-time purchase.
- Single replenishment eligibility: paid +35 days. Two-pack: paid +77 days.
- A true carrier delivery cancels the estimate. Without one,
  `bl_delivery_window_elapsed_v1` is eligible at fulfilled +5 days. Supabase
  schedules the quickstart/results signals from that estimate and rechecks
  consent and order state at +1/+14 days. A later real delivery suppresses
  unsent estimate-basis education and schedules actual-basis education. If an
  estimate-basis email already sent, the matching actual-basis event is
  suppressed to prevent a duplicate.
- Any product-line refund exits that order's education and replenishment and
  applies a 60-day lifecycle hold. A shipping-only adjustment keeps education
  but cancels urgency/replenishment. Full refund/cancel hard-exits all journeys
  until a later positively consented purchase.

## Required secrets

Supabase Edge Functions:

```text
SHOPIFY_CLIENT_ID=<dedicated app client ID>
SHOPIFY_CLIENT_SECRET=<dedicated app client secret>
SHOPIFY_WEBHOOK_SECRET=<optional explicit HMAC secret; defaults to SHOPIFY_CLIENT_SECRET>
COMMERCE_SYNC_WORKER_SECRET=<random service-only bearer token>
COMMERCE_LIFECYCLE_MODE=audit
COMMERCE_PUBLISH_SHOP_DOMAINS=kpfzdg-kw.myshopify.com
BREVO_API_KEY=<existing key>
```

The bridge exchanges the client credentials at
`https://kpfzdg-kw.myshopify.com/admin/oauth/access_token` using
`grant_type=client_credentials`. Shopify tokens expire after 86,399 seconds;
the Edge Function caches each token only inside its isolate, refreshes five
minutes early, and retries once with a newly minted token after an Admin API
401. Never store or configure a static `SHOPIFY_ADMIN_ACCESS_TOKEN`.

Shopify uses the app client secret for webhook HMACs. Setting
`SHOPIFY_WEBHOOK_SECRET` explicitly makes rotation intent visible; when it is
unset, the handler securely falls back to `SHOPIFY_CLIENT_SECRET`. During a
secret rotation, update both values together or keep the old explicit webhook
secret only until Shopify begins signing with the new client secret. Secrets,
minted tokens, token-endpoint response bodies, and upstream exception messages
are never logged.

Netlify:

```text
COMMERCE_SYNC_WORKER_SECRET=<same random value>
```

Keep `COMMERCE_LIFECYCLE_MODE=audit` in both deployed Supabase functions until
every acceptance test passes twice. Never expose these values in Vite/browser
environment variables.

### Audit-mode credential smoke test

1. Run `supabase secrets list --project-ref rymidvhuyxqvvyjpodqn` and confirm
   the names `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`,
   `SHOPIFY_WEBHOOK_SECRET`, and `COMMERCE_LIFECYCLE_MODE` exist. The command
   prints digests, not values. Remove any obsolete `SHOPIFY_ADMIN_ACCESS_TOKEN`.
2. Confirm `COMMERCE_LIFECYCLE_MODE` was last set to the literal `audit`, then
   deploy `shopify-lifecycle-webhook` with `--no-verify-jwt`.
3. An unsigned `POST` to the callback must return HTTP 401 with
   `invalid_signature`. Never weaken this check for testing.
4. In Shopify, create a consented internal test order for the single-bottle
   variant and mark it paid. Do not use Shopify's synthetic test-webhook body:
   the bridge intentionally enriches the real order through Admin GraphQL.
5. Within one minute, verify one `orders/paid` receipt with shop domain
   `kpfzdg-kw.myshopify.com`, the expected one-bottle order projection, and
   only `held` outbox records with `hold_reason = 'audit_mode'`:

   ```sql
   select topic, event_type, shop_domain, resource_id, received_at
   from public.commerce_lifecycle_receipts
   order by received_at desc limit 10;

   select order_id, purchased_bottles, is_subscription_order, paid_at
   from public.commerce_orders
   order by updated_at desc limit 10;

   select event_name, status, hold_reason, available_at
   from public.commerce_lifecycle_outbox
   order by created_at desc limit 10;
   ```

6. Redeliver the same Shopify webhook. The receipt count for its
   `X-Shopify-Webhook-Id` must remain one. Confirm Brevo has no `bl_*_v1`
   event and the worker still reports `claimed: 0`.

### Dedicated lifecycle QA store

Use the Shopify development store `base-layer-lifecycle-qa.myshopify.com` for
state-machine and suppression testing. It is intentionally separate from the
live storefront and uses Shopify's generated test data and payment behavior.

The Base Layer QA catalog is:

| Item | Shopify ID | QA value |
| --- | --- | --- |
| Product | `15227427488048` | Performance Daily Face Cream |
| One-bottle variant | `67548639199536` | $38, 88 g |
| Two-bottle variant | `67548639232304` | $68, 176 g |
| Subscription offer | Shopify Subscriptions plan page `80118907184` | one bottle, $35 every 6 weeks; not the signed `selling_plan_id` |

Install the read-only `Base Layer Lifecycle Bridge` app and register its seven
shop-specific webhook subscriptions after every new dev-store install:

```bash
SHOPIFY_SHOP_DOMAIN=base-layer-lifecycle-qa.myshopify.com \
SHOPIFY_CLIENT_ID='...' \
SHOPIFY_CLIENT_SECRET='...' \
SHOPIFY_LIFECYCLE_CALLBACK_URL='https://rymidvhuyxqvvyjpodqn.supabase.co/functions/v1/shopify-lifecycle-webhook' \
npm run shopify:webhooks:register
```

The command is idempotent and supports `-- --dry-run`. Never put the client
secret in a checked-in env file or a `VITE_*` variable.

During pre-activation QA, production Supabase must remain configured with:

- `COMMERCE_LIFECYCLE_MODE=audit` during QA;
- `COMMERCE_PUBLISH_SHOP_DOMAINS=kpfzdg-kw.myshopify.com`, excluding the QA shop;
- the QA shop/variant environment variables documented above;
- an empty QA selling-plan allowlist only until the first real subscription
  checkout reveals the signed line-item `selling_plan_id`, then pin that ID.

On 2026-08-18, dev order `#1002` (`18834932007216`) passed the first paid-order
smoke test: one `orders/paid` receipt, one retained bottle, non-subscription,
and exactly two held outbox rows (`bl_order_paid_v1` and
`bl_replenishment_due_v1`) with `hold_reason = 'audit_mode'`. Replaying the
same webhook ID returned `duplicate: true`; no job was pending or published.

The QA Shopify Flow contract-created/updated workflows remain inactive test
fixtures. Production uses the separately verified workflows documented below.
Every branch must remove all six `bl_sub_*` tags before adding exactly one
state tag.

## Brevo attributes required before publish mode

Create these exact attributes; unknown attributes can reject the event:

| Name | Type |
|---|---|
| `CUSTOMER_STATUS` | Text/category |
| `ORDER_COUNT` | Number |
| `LAST_ORDER_ID` | Text |
| `LAST_ORDER_AT` | Date |
| `LAST_ORDER_STATUS` | Text/category |
| `LAST_ORDER_BOTTLE_COUNT` | Number |
| `LAST_ORDER_IS_SUBSCRIPTION` | Boolean |
| `LAST_FULFILLED_AT` | Date |
| `LAST_DELIVERED_AT` | Date |
| `LAST_REFUNDED_AT` | Date |
| `HAS_SUBSCRIPTION_ORDER` | Boolean |
| `LAST_SUBSCRIPTION_ORDER_AT` | Date |
| `SUBSCRIPTION_PLAN_ID` | Text |
| `SUBSCRIPTION_PROJECTION` | Text/category |
| `MARKETING_CONSENT_STATE` | Text/category |
| `LIFECYCLE_HOLD_UNTIL` | Date |

## Safe deployment

1. Run the full test/typecheck/lint/build suite.
2. Confirm migration history; run `supabase db push --linked --dry-run` and
   verify only this migration is pending.
3. Apply the migration and deploy both functions with audit mode still set.
4. Deploy the Netlify scheduler. In audit mode it must report `claimed: 0`.
5. Create/install the dedicated app after merchant approval, set secrets, and
   register webhooks.
6. Build the two Flow workflows inactive. Reconcile the two historical
   contracts manually and require 100% Contracts export ↔ tag ↔ Supabase
   projection agreement.
7. Run the remote state-machine suite twice and real signed single/two-pack
   paid-order plus fulfillment smokes. Inspect receipts, projections, and held
   jobs; no customer-facing event may appear in Brevo. Keep the remaining
   destructive/carrier/subscription scenarios in the ongoing regression
   matrix and roll back immediately if any production guard disagrees.
8. Create the Brevo attributes and inactive automation drafts. Preserve the
   existing PushOwl purchase/cart exits.
9. Change both functions to publish only after written operator acceptance.
   Start with an empty claim and do not release old held jobs.

### Current production containment and repair (2026-08-19)

- `COMMERCE_LIFECYCLE_MODE=audit`. The bridge was returned to fail-closed audit
  mode after an adversarial concurrency review. The authenticated worker
  reports `claimed: 0`; historical `audit_mode` jobs remain held and must never
  be replayed.
- Migration `20260819120000_commerce_lifecycle_delivery_safety.sql` adds
  chronological consent, safe Shopify customer-email migration, fenced worker
  leases, send-time shop allowlisting, and `delivery_uncertain` quarantine for
  provider requests whose final acknowledgement is unknown.
- The shared worker secret was rotated, synchronized between Supabase and
  Netlify, restricted to the production Functions scope, and marked secret.
- `COMMERCE_PUBLISH_SHOP_DOMAINS` contains only
  `kpfzdg-kw.myshopify.com`; the lifecycle QA store cannot publish Brevo
  events even though its signed webhooks continue populating audit state.
- Shopify Flow workflows `BL | Subscription State | Contract Created` and
  `BL | Subscription State | Contract Updated` are active. Their triggers are
  respectively `Subscription contract created` and `Subscription contract
  updated`; each has ACTIVE/CANCELLED/EXPIRED/FAILED/PAUSED plus a fallback and
  exclusively removes/adds the six `bl_sub_*` tags. They contain no email,
  HTTP, or notification action.
- Brevo is 9 active / 3 inactive. The existing welcome and cart journeys are
  unchanged. These authoritative retention journeys are active, permit
  re-entry for later qualifying orders, and have no legacy `order_created`
  trigger or redundant internal wait:
  - #5 `BL | Post-Purchase | Delivery +1 | Usage` →
    `bl_postpurchase_quickstart_v1`
  - #6 `BL | Post-Purchase | Delivery +14 | Results Check-In` →
    `bl_postpurchase_results_v1`
  - #7 `BL | Replenishment | Single | Day 35` →
    `bl_replenishment_due_v1` where `basis = single_day_35`
  - #12 `BL | Replenishment | Two-Pack | Day 77` →
    `bl_replenishment_due_v1` where `basis = two_pack_day_77`
- The obsolete order-created founder flow (#3), browse recovery (#4), and the
  extra welcome discount reminder (#11) remain inactive.
- Representative custom-event schemas were staged only to the internal test
  contact `samuel.r.doyle@gmail.com`; every staging endpoint was deleted after
  the Brevo event catalog learned the names/properties. No automation was
  active during that catalog-staging exercise and no lifecycle email was sent.
- Remote SQL acceptance passed after the safety migration as
  `bl-sql-audit-1787148747592-ed5f1d76`. It now covers duplicate and
  out-of-order delivery, cancellation/full-refund exits, product-refund holds,
  subscription suppression, monotonic consent chronology, customer email
  migration, fenced worker leases, provider-outcome quarantine, and one-/
  two-bottle replenishment routing. The script reports named scenarios instead
  of hardcoded check totals and performs no external provider call.
- Two real signed Shopify QA orders were also verified before activation:
  order `#1002` classified one bottle and replayed idempotently; order `#1003`
  (`18835060064560`) classified two bottles, queued day-77 replenishment, and
  on fulfillment queued the explicit +5-day delivery estimate plus +1/+14
  education signals. Every QA outbox row remained `held/audit_mode` and no
  Brevo event or customer email was published.
- Real carrier `DELIVERED`, refund, and subscription-transition scenarios stay
  on the ongoing regression matrix below. Their absence does not bypass the
  production guards: delivery estimates are labeled, refunds/cancellations are
  send-time exits, subscription orders are conservatively excluded from
  one-time replenishment. Do not restore publish mode until the repaired
  functions and full acceptance matrix pass twice with zero uncertain jobs.

### Rollback

If any live acceptance check fails, set `COMMERCE_LIFECYCLE_MODE=audit`
immediately, deactivate Brevo automations #5/#6/#7/#12, and deactivate both BL
subscription Flow workflows. Do not delete receipts or replay historical held
outbox jobs. Diagnose using the operational queries below, fix forward, and
repeat the full matrix twice before reconsidering activation.

## Acceptance matrix

Run each scenario twice with tagged internal test customers:

- single one-time order
- two-pack order
- subscription-order selling plan detection
- order cancellation
- partial product-line refund
- full product/order refund
- shipping-only adjustment
- fulfillment fallback at +5 days
- actual `DELIVERED` replacing the estimate
- duplicate webhook delivery
- out-of-order refund/cancel/fulfillment
- unsubscribe during a scheduled wait
- subscription active → paused → active → cancelled
- interim zero tag preserves prior status
- multiple subscription tags quarantine as `unknown_conflict`

Subscription tag/state propagation must complete in under five minutes. Audit
the two historical contracts manually before activation, then reconcile the
contract export against tags and projection weekly.

## Operational queries

```sql
select event_type, count(*)
from public.commerce_lifecycle_receipts
group by event_type order by event_type;

select status, hold_reason, count(*)
from public.commerce_lifecycle_outbox
group by status, hold_reason order by status, hold_reason;

select email, subscription_projection, subscription_tag_count,
       replenishment_blocked, lifecycle_hold_until, lifecycle_hard_exit
from public.commerce_customer_state
where subscription_tag_count > 1
   or subscription_projection in ('unknown', 'unknown_conflict')
order by updated_at desc;
```
