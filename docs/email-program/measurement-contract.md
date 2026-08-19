# Email measurement contract

Status: execution baseline, 2026-08-19

## Authority and attribution

- Shopify owns paid, cancelled, refunded, fulfilled, delivered, variant, and
  selling-plan facts.
- Supabase owns normalized commerce state, chronological consent snapshots,
  lifecycle eligibility, and authoritative event publication.
- Brevo owns delivery, clicks, live email blocklisting, and automation entry.
- The storefront owns first-party landing parameters and the handoff to
  Shopify checkout.
- GA4 may assist analysis but never decides whether a lifecycle message is
  eligible or whether an order exists.

Brevo's 48-hour reported revenue remains a platform diagnostic. The Base Layer
decision metric is Shopify-confirmed net contribution within the windows below.

## Canonical UTM taxonomy

Every static storefront link has these four fields:

| Field | Value |
| --- | --- |
| `utm_source` | `brevo` |
| `utm_medium` | `email` |
| `utm_campaign` | `welcome`, `cart_recovery`, `post_purchase`, or `replenishment` |
| `utm_content` | Unique lowercase message/persona/destination identifier |

`utm_content` follows `<message>_<persona-or-job>_<destination>`. Logo, text,
and button links may not reuse one value. Examples:

- `w01_code_primary`
- `w02_dryness_formula`
- `c01_restore_primary`
- `p02_results_primary`
- `r01_two_offer`

Do not encode subject-line tests in `utm_campaign`. Add a final content token,
such as `_subject_a`, only when a real sequential test is running.

## Landing-link matrix

The JSON manifest is authoritative; this table is the operator view.

| Message | Destination | Required behavior |
| --- | --- | --- |
| `w01_code` | Single-bottle offer with `SKIN15` | Auto-apply only the promised code, keep SHIP26, suppress quiz |
| `w02_concern` | `#formula`, concern parameter | Allow only dryness, shine, irritation, or texture; render matching education |
| `w03_proof` | `#reviews` | Scroll after lazy PDP content mounts; no quiz |
| `c01_restore` | Authoritative `params.url` | Preserve Shopify checkout key, exact lines, selling plan, and discounts |
| `c02_objection` | Same authoritative cart URL | Same restoration invariants; unique UTM content |
| `p01_quickstart` | `#formula` | Education only; no discount activation |
| `p02_results` | `#results` | Results framework, not the reviews section |
| `r01_single` | Single offer | Select one bottle; do not imply subscription |
| `r01_two_pack` | Two-bottle offer | Select two bottles; do not imply subscription |

### Exact-cart exception

Cart recovery must never replace or concatenate onto the authoritative Shopify
return URL merely to improve attribution. The primary CTA remains the exact
`{{ params.url }}` supplied by the event. This avoids guessing whether the URL
already contains a query delimiter and protects the checkout key, cart lines,
selling plan, and discounts. Measure this documented exception through Brevo's
unique link click plus the Shopify purchase that retains the restored cart.
Do not describe it as UTM-confirmed revenue. If the event URL is absent, the
template may use only the manifest's UTMed PDP fallback.

## Attribution windows

Report two distinct outcomes:

1. **Click-confirmed order:** a Shopify paid order within seven days after a
   unique human click, using the latest eligible lifecycle click before the
   order.
2. **Entrant conversion:** a Shopify paid order inside the journey window even
   if no click was observed. This measures the whole automation but is not a
   causal claim.

Journey windows:

| Journey | Entrant conversion window |
| --- | --- |
| Welcome | 7 days from entry |
| Cart recovery | 72 hours from the latest cart entry |
| Post-purchase | Not a conversion flow; measure adoption/reply and downstream retention |
| Replenishment | 14 days from the due event |

When more than one email is eligible, precedence is purchase/service > cart >
welcome > replenishment > campaign. Never credit the same order to two primary
journeys. Keep Brevo's platform-reported attribution in a separate column.

## Required event fields

The event ledger needs these fields to reconcile email and shop behavior:

| Category | Required fields |
| --- | --- |
| Email delivery | provider message ID, contact ID/email hash, automation ID, message ID, sent/delivered/bounced/complained/unsubscribed timestamps |
| Click | message ID, normalized destination, UTM content, click timestamp, bot classification |
| Journey entry | event name, event ID/idempotency key, contact ID/email hash, order/cart ID where applicable, entry timestamp |
| Commerce | Shopify order ID, paid timestamp, gross and refunded amount, discounts, taxes, shipping collected, product quantity, selling plan, cancellation/refund state |
| Cost | COGS, outbound shipping, payment fee, discount cost, refund loss |

Email addresses should be hashed or replaced with an internal contact key in
analysis exports. Keep the unmodified address only where the provider requires
it for operational suppression.

## Evidence retained per release

- Verifier JSON output.
- Delivered-message screenshots for desktop, 360px mobile, dark mode, and
  image-off rendering.
- Raw Gmail authentication headers and one-click unsubscribe confirmation.
- Landing screenshot plus checkout URL with the `key` redacted.
- Shopify order ID, normalized receipt ID, Brevo event ID, and automation log.
- Proof that no unintended recipient received the seed/test messages.
