# Lifecycle acceptance matrix

Run this matrix in the lifecycle QA store first. Use unique tagged orders and
only an internal seed address. Never reuse a real customer or a production
order. Every scenario requires timestamps from Shopify, Supabase, and Brevo.

## Evidence convention

Use a run ID such as `BL-EMAIL-20260819-01`. Store the following for each row:

- Shopify order/cart/customer ID.
- Supabase receipt, outbox row, event name, status, and hold reason.
- Brevo automation log and provider message ID when a send is expected.
- Screenshot of the delivered email and final landing state.
- Actual send count and recipient list.

The expected count is exact. “At least one” is never acceptable for a
lifecycle email.

## Entry, exit, and commerce scenarios

| ID | Scenario | Expected authoritative result | Expected email result | Pass gate |
| --- | --- | --- | --- | --- |
| WEL-01 | New quiz signup for each of four concerns | One contact with canonical `SKIN_CONCERN`; positive consent recorded once | One immediate `w01_code`; correct concern branch later | Four variants render; no duplicate immediate send |
| WEL-02 | Same contact submits the quiz again | Contact updates without clearing blocklist or creating a second consent grant | Welcome re-entry remains off | Zero duplicate `w01_code` |
| WEL-03 | Contact purchases after `w01_code`, before later welcome steps | `bl_order_paid_v1` and paid customer state | Remaining welcome steps exit before send | Zero welcome email after paid timestamp |
| CART-01 | Single-bottle cart abandoned | One current `cart_updated` with exact permalink | One `c01_restore` at configured delay | CTA restores one bottle, checkout key, SHIP26, and message UTM |
| CART-02 | Two-bottle cart abandoned | One current `cart_updated` with two-bottle line | One `c01_restore` | CTA restores two-bottle tier and price |
| CART-03 | Subscription cart abandoned | Cart event contains selling plan | One eligible cart message | CTA restores the same selling plan and auto-renew disclosure |
| CART-04 | Cart emptied before delay | `cart_deleted` after current cart event | Cart journey exits | Zero cart email |
| CART-05 | Newer cart replaces older cart | New cart ID/event becomes current | Only latest cart is recoverable | Older permalink never sends |
| CART-06 | Purchase before cart delay | Paid order is authoritative | Cart journey exits in under five minutes | Zero recovery email after paid timestamp |
| PUR-01 | Positively consented one-bottle paid order | One `bl_order_paid_v1`; quickstart/results scheduled; day-35 replenishment scheduled | No immediate duplicate Shopify receipt; education only at its due events | Exact outbox event set, no generic `order_created` flow |
| PUR-02 | Positively consented two-bottle paid order | Day-77 replenishment basis | Same education timing; no day-35 entry | One two-pack replenishment event only |
| PUR-03 | Paid order without positive marketing consent | Authority recorded; marketing rows held/suppressed | Shopify service mail only | Zero Brevo marketing send |
| DLV-01 | Fulfillment before paid | Later paid event reconciles estimate-based education | Education waits for ready signal | One quickstart and one results event only |
| DLV-02 | Actual delivered event follows estimate | Actual delivery replaces/cancels estimate rows | Education timing uses actual delivery | No duplicate actual + estimated education |
| DUP-01 | Exact Shopify webhook retry | One receipt/idempotency result | No duplicate automation entry | One provider event maximum |
| OOO-01 | Cancel or refund arrives before paid | Later identity backfills hard exit/hold | No stale education/replenishment | Zero send after exit authority |

## Refund, subscription, and consent scenarios

| ID | Scenario | Expected authoritative result | Expected email result | Pass gate |
| --- | --- | --- | --- | --- |
| REF-01 | Shipping-only adjustment | Education remains eligible; replenishment is suppressed for affected order | No tone-deaf replenishment | Zero replenishment entry |
| REF-02 | Partial product refund | Product-refund hold applies | Pending marketing waits/exits per current policy | Zero send during hold |
| REF-03 | Full product refund | Hard exit and replenishment block | All order-linked education/replenishment stops | Zero post-refund send |
| REF-04 | Genuine later positively consented purchase after refund | New order clears eligible prior exit | New order may enter its own journeys | Old order remains suppressed; new order exactly once |
| SUB-01 | Paid subscription order | `is_subscription_order=true`; no ordinary replenishment row | Subscriber receives no day-35/day-77 email | Zero `bl_replenishment_due_v1` |
| SUB-02 | Active → paused → active → cancelled tags | One chronological projection per update | Replenishment stays blocked until qualifying later one-time order | No overlap or stale-state send |
| SUB-03 | Conflicting subscription tags | `unknown_conflict`; fail closed | No replenishment | Zero send until reconciled |
| UNS-01 | Brevo unsubscribe while waiting | Brevo blocklist says not sendable | Worker suppresses before publish | Zero send after unsubscribe timestamp |
| UNS-02 | Unsubscribe followed by quiz resubmission | Capture does not clear provider blocklist | No welcome re-entry | Zero send |
| UNS-03 | Delayed older “subscribed” Shopify event after newer unsubscribe | Chronological consent remains unsubscribed | No event publishes | Stored consent and provider both remain suppressed |
| IDN-01 | Shopify customer changes email | Customer state migrates without uniqueness error; old address suppressed | No send to old address | One current identity, zero duplicate contacts sent |

## Collision and presentation scenarios

| ID | Scenario | Expected behavior | Pass gate |
| --- | --- | --- | --- |
| COL-01 | Immediate welcome followed by cart within 12 hours | Suppress early cart email; retain later recovery if still relevant | No two commercial emails inside 20 hours |
| COL-02 | Campaign queued while cart recovery is due | Cart takes precedence; campaign is skipped/delayed | Maximum three commercial emails in seven days |
| COL-03 | Replenishment due while a newer cart or purchase exists | Newer commerce state wins | No stale replenishment |
| COL-04 | Purchase and cart trigger cross in flight | Purchase exit wins atomically | No recovery after purchase |
| LNK-01 | Every static link in delivered HTML | Matches manifest | Correct path, offer, anchor, discount, and unique UTM content |
| LNK-02 | Dynamic cart CTA | Exact cart restored | Key, lines, selling plan, discounts, and UTMs survive |
| LNK-03 | Email-origin landing | Quiz suppression persists through client navigation | Quiz never appears unless `quiz=preview` |
| RND-01 | 360px mobile | Single column, readable type, reachable CTA | No horizontal scroll or covered consent/unsubscribe |
| RND-02 | Dark mode and image-off | Brand, offer, CTA, and unsubscribe remain legible | No invisible logo/CTA; alt text carries meaning |
| DEL-01 | Gmail raw source | SPF, DKIM, and DMARC pass; aligned From; one-click unsubscribe headers present | All authentication and header gates pass |

## Stop conditions

Immediately pause the affected automation if any scenario produces:

- A non-seed recipient during QA.
- More than the exact expected send count.
- A cart email after purchase.
- Any marketing email after unsubscribe, cancellation, or full refund.
- A replenishment email for an active/uncertain subscriber.
- Loss of Shopify checkout key, lines, selling plan, or discounts.
- A complaint, systematic authentication failure, or malformed subject.

After a failure, create a new run ID. Do not overwrite or reinterpret the
failed evidence.
