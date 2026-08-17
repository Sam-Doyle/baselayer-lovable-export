# Base Layer Brevo lifecycle blueprint

Status date: 2026-08-17

## Operating rules

Global precedence is purchase > checkout > cart > browse > welcome > site abandonment.

- A purchase exits every pre-purchase flow.
- Checkout suppresses cart; cart suppresses browse; browse suppresses site abandonment.
- Do not send two marketing emails inside 20 hours.
- Cap marketing at three emails in seven days.
- Suppress unsubscribed, blocklisted, complained, refunded, employee, and test contacts.
- Brevo is the email suppression authority; Shopify is the order/customer authority.
- Only one platform may own cart and checkout email recovery. Do not enable overlapping Shopify, PushOwl, and Brevo emails.

## Persona-to-action map

| Persona / shop state | Signal | Best next action | Offer posture | Exit / suppression |
| --- | --- | --- | --- | --- |
| Quiz lead, no cart | Website Email #2 list + `SKIN_CONCERN` | Concern-aware welcome education | `SKIN15`, then product proof | Purchase; pause during cart/checkout |
| PDP viewer, no cart | `product_viewed` | One browse reminder after 4 hours, proof follow-up after 24 hours | No new discount | Cart, checkout, purchase; max once per 7 days |
| Cart abandoner | `cart_updated` without purchase | Restore cart at 1 hour, proof at +20 hours, final reminder at +44 hours | Existing `SKIN15` eligibility or `SHIP26`; no new incentive in emails 1-2 | `cart_deleted`, checkout, purchase; restart on newer cart |
| Checkout abandoner | `checkout_started` without purchase | Reminder at 30-45 minutes, reassurance at +18 hours | Preserve existing offer only | Purchase; suppress cart flow |
| First-time buyer | `order_created` / completed | Founder thanks, usage education, check-in, review ask | No upsell in first message | Cancel/refund; respect unsubscribe |
| One-bottle buyer | Last order + 35 days | Replenishment reminder; second at day 41 | Two-pack value, then subscription convenience | New order/subscription/refund |
| Two-bottle buyer | Last order + 77 days | Replenishment reminder; second at day 83 | Subscription convenience | New order/subscription/refund |
| Lapsed buyer | 75 days after one bottle or 120 days after two | Two-message winback seven days apart | Start with `SHIP26`; no invented urgency | New order/refund/unsubscribe |

## Recommended sequences

### Welcome and quiz

1. Immediate: deliver `SKIN15` and acknowledge the selected skin concern.
2. +1 day: explain the concern and the Base Layer mechanism.
3. +3 days: compare one bottle with the 12-week two-pack.
4. +5 days: address texture, shine, simplicity, and the 30-day guarantee.
5. +7 days: honest code reminder without false expiration.

No re-entry for the same contact. Purchase exits the flow.

### Cart recovery

1. +1 hour: "Your Base Layer is still waiting"; restore the exact cart.
2. +20 hours: product proof, finish/feel, and guarantee.
3. +44 hours: final reminder; mention only an offer the contact already has.

### Post-purchase

1. +12 hours: founder thank-you; do not repeat Shopify's order receipt.
2. Day 3: how much to use, when to apply, and what the finish should feel like.
3. Day 10: expectation-setting and a customer check-in.
4. Day 28: review/replenishment request for satisfied, consented buyers.

## Current Brevo implementation

- Automation 1: `Welcome message` — active; one SKIN15 delivery email; re-entry disabled.
- Automation 2: `BL | Cart Recovery` — active; `cart_updated`, 1-hour wait, branded first-email copy, exact `{{ params.url }}` cart CTA, verified legal footer, order/cart-deletion exits, and newer-cart restart.
- Automation 3: `BL | Post-Purchase | Draft` — inactive; `order_created`, 12-hour wait, founder-led first email, verified legal footer.
- Automation 4: `BL | Browse Recovery | Awaiting Event QA` — inactive and intentionally incomplete until `product_viewed` is present and selectable in Brevo event logs.
- Shopify `Recover abandoned checkout` — inactive. Brevo is the sole configured cart/checkout email sender.

## Activation gates

Do not activate Automations 2-4 until all gates pass.

1. Identify one consented test contact on the storefront.
2. Run: PDP view -> add cart -> delete cart -> add cart -> checkout -> completed order.
3. Confirm exactly one instance of each expected event in Brevo.
4. Confirm the cart preview renders products and a working cart URL, not raw `{{ }}` or `{% %}` variables.
5. Replace the generic Brevo logo and Paris postal footer with the verified Base Layer legal footer.
6. Confirm a completed order exits cart, checkout, browse, and welcome recovery.
7. Run a second test for cancellation/refund and a subscription order.
8. Confirm only one cart/checkout sender is active across Brevo, PushOwl, and Shopify.
9. Send desktop and mobile inbox tests to Gmail and Apple Mail.

### Live QA status on 2026-08-17

- `samuel.r.doyle@gmail.com` produced identified `cart_deleted` and `cart_updated` events in Brevo.
- The cart email rendered absolute product images, names, prices, quantities, variants, recipient, and the exact Shopify cart URL from the live event; no template variables remained raw.
- Welcome, cart, and post-purchase templates now use `BASE LAYER.` and `955 Harrison St, Denver, CO 80206`.
- The storefront lifecycle payload now normalizes product images to absolute URLs and emits Brevo's `variant_id_name` field.
- One event-aware test email to `samuel.r.doyle@gmail.com` was processed, sent, and delivered. Brevo's two log rows were the `Sent` and `Delivered` statuses for the same message, not duplicate messages.
- Shopify `Recover abandoned checkout` remains inactive, so Brevo is the sole cart/checkout email sender.

Automation 2 is live. Automations 3-4 remain inactive until their own event-specific preview, inbox, and suppression checks pass. A completed test order is still required to prove the purchase exit end to end before expanding recovery into additional pre-purchase branches.
