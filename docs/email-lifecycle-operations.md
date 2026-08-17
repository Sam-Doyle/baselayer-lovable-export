# Base Layer email lifecycle operations

This is the dashboard runbook for the code in `src/lib/lifecycle.ts`. Brevo is
the system of engagement, Shopify is authoritative for checkout/orders, and
Supabase remains the first-party lead/consent record. Do not send the same
abandonment or post-purchase message from two platforms.

## Access and configuration required

1. **Brevo administrator access**
   - Go to **Settings > Automations > Brevo tracker** and copy the **client
     key** from the Version 2 tracking snippet. This is not the REST API key.
   - Add `VITE_BREVO_TRACKER_CLIENT_KEY=<client key>` to Netlify production
     environment variables and trigger a clean production build. Vite embeds
     this public tracker key at build time.
   - In **Contacts > Settings > Contact attributes**, create the exact
     attributes listed below before testing. Brevo ignores attributes that do
     not exist.
   - Enable the eCommerce app and grant permission to create/edit automations,
     templates, segments, senders, and domain authentication.
2. **Shopify administrator access**
   - Connect the official Brevo Shopify integration so customer and completed
     order data reach Brevo server-side.
   - Confirm the integration emits `order_created` or `order_completed` in
     **Brevo > Automations > Logs > Event logs** after a test order.
   - Leave Shopify's transactional order/shipping messages on. Disable any
     Shopify Marketing abandoned-cart campaign before activating Brevo's, or
     keep Shopify recovery and do not activate Brevo recovery. Never run both.
3. **Netlify access**
   - Required to set the build-time tracker key and deploy. The repository CSP
     already permits only the exact loader origins used here:
     `cdn.brevo.com`, `sibautomation.com`, and their tracker request hosts.
4. **DNS access**
   - Add the Brevo DKIM/verification records exactly as shown in the Brevo
     dashboard and publish one DMARC record. The current DNS audit found Google
     and Postmark authentication but no DMARC and no confirmed Brevo DKIM.
   - Use a dedicated sending subdomain when Brevo offers the managed setup.

No Supabase secret or Brevo REST API key is required for the browser lifecycle
tracker. The existing subscription edge function still needs its existing
`BREVO_API_KEY` and `BREVO_LIST_ID` secrets.

## Contact attributes

Create these attributes in Brevo with the exact uppercase names:

| Attribute | Type | Rule |
|---|---|---|
| `SKIN_CONCERN` | text/category | Canonical ID: `dryness`, `shine`, `irritation`, or `texture` |
| `FIRST_SOURCE` | text | Set once; never overwrite |
| `LAST_SOURCE` | text | Update on the latest capture |
| `SIGNUP_AT` | date | UTC capture date; exact timestamp remains in Supabase |
| `LAST_SIGNUP_AT` | date | Latest UTC capture date |
| `CONSENT_AT` | date | UTC marketing-consent date; exact timestamp remains in Supabase |
| `CONSENT_VERSION` | text | Version of the displayed consent statement |
| `UTM_SOURCE` | text | First-touch campaign source |
| `UTM_MEDIUM` | text | First-touch campaign medium |
| `UTM_CAMPAIGN` | text | First-touch campaign name |
| `UTM_CONTENT` | text | First-touch creative/content identifier |
| `UTM_TERM` | text | First-touch term |
| `LAST_UTM_SOURCE` | text | Latest-touch campaign source |
| `LAST_UTM_MEDIUM` | text | Latest-touch campaign medium |
| `LAST_UTM_CAMPAIGN` | text | Latest-touch campaign name |
| `LAST_UTM_CONTENT` | text | Latest-touch creative/content identifier |
| `LAST_UTM_TERM` | text | Latest-touch term |
| `LANDING_PATH` | text | Latest capture path |
| `DISCOUNT_CODE` | text | Code delivered to this lead |
| `CUSTOMER_STATUS` | category | lead, customer, repeat, subscriber, lapsed |
| `ORDER_COUNT` | number | Shopify-synchronized order count |
| `LAST_ORDER_AT` | date/time | Latest paid order |
| `SUBSCRIPTION_STATUS` | category | none, active, paused, cancelled |

For French contacts, Brevo now treats consent to receive email separately from
consent to individual email-open pixel tracking. Configure Brevo's
`_PIXEL_TRACKING_CONSENT` policy and preference-center field separately; do
not infer it from the marketing opt-in.

## Event ownership

| Event | Owner | Purpose |
|---|---|---|
| `product_viewed` | Netlify storefront | Browse-intent segmentation |
| `cart_updated` | Netlify storefront | Current cart and dynamic recovery content |
| `cart_deleted` | Netlify storefront | Exit recovery only when the cart is empty |
| `order_created` / `order_completed` | Shopify/Brevo integration | Authoritative purchase and automation exit |
| GA4/Meta commerce events | Existing analytics layer | Measurement and ad optimization only |

The storefront does not send email addresses inside cart/product events. It
first identifies the Brevo visitor after the quiz opt-in, then Brevo associates
the visitor cookie with the queued session events. If analytics consent is
rejected, the tracker, identify call, and lifecycle events stay off.

## Suppression and revocation authority

Brevo is the live sending/suppression authority. The capture API adds or
updates a contact but never clears Brevo's email blocklist, so a hard bounce,
spam complaint, or prior unsubscribe cannot be accidentally overridden by a
quiz submission. Supabase stores the exact signup grants and their history; it
must not be used as a sendable-contact list without checking Brevo status.

Before launch, configure a Brevo automation/webhook or scheduled export that
records unsubscribes in the operational audit process. A signed webhook into
Supabase can be added later to append `status = 'revoked'` consent records, but
the absence of that mirror must never weaken Brevo's suppression. If a
previously unsubscribed customer wants to opt back in, use a Brevo-managed
resubscription path that preserves the provider's reason-specific safeguards.

## Automation blueprint

Every automation must have global exclusions for blocklisted/unsubscribed
contacts, test/internal addresses, and contacts whose status makes the message
irrelevant. Purchase exits must happen immediately, not after the next delay.

### 1. Quiz welcome

**Entry:** added to the quiz subscriber list. **Re-entry:** off. **Exit:** first
paid order. Branch on `SKIN_CONCERN` for the concern-specific paragraph. Keep
the stored values canonical and map them to customer-facing copy in the email:
`dryness` → Dryness, `shine` → Oil & shine, `irritation` → Redness &
irritation, and `texture` → Fine lines & texture.

| Timing | Subject direction | Message job |
|---|---|---|
| Immediately | `Your 15% code: SKIN15` | Deliver the promised code, reflect their concern, one PDP CTA |
| +1 day | `Why Base Layer works for {{ contact.SKIN_CONCERN }}` | Explain the relevant formula/finish in three proof points |
| +3 days | `One step. Zero shine.` | Real review, texture objection, fragrance-free, 30-day guarantee |
| +5 days | `Your Base Layer code is still here` | Final truthful reminder; no fake expiry |

Do not stack another discount onto `SKIN15`. Exclude purchasers from every
remaining step as soon as Shopify reports the order.

### 2. Browse recovery

**Entry:** identified contact fires `product_viewed`. **Delay:** 4 hours.
**Exit:** `cart_updated` or paid order. Send one message, no discount:
`Still thinking it over?` with one benefit summary, guarantee, and PDP CTA.

Suppress if the contact entered welcome in the previous 24 hours; the welcome
series already performs this job.

### 3. Cart recovery

**Entry:** `cart_updated`. **Re-entry:** on, with a 3-day cooldown. **Exit:**
`cart_deleted`, `order_created`, or `order_completed`.

| Timing | Subject direction | Message job |
|---|---|---|
| +90 minutes | `Your Base Layer is still in the cart` | Dynamic items, checkout link from event data, guarantee |
| +20 hours | `One step away` | Objection handling and free-shipping code reminder |

Do not add a new discount. If Shopify Marketing owns checkout recovery, disable
this entire automation rather than trying to coordinate two senders.

### 4. Post-purchase education

**Entry:** first paid order. **Exclusions:** cancelled/refunded order. Keep
Shopify's transactional receipt and fulfillment emails; these are marketing
education messages.

| Timing | Subject direction | Message job |
|---|---|---|
| +2 days | `How to use Base Layer` | Application amount/location and where it sits in the routine |
| +7 days | `What to expect this week` | Set realistic timing and encourage consistent use |
| +18–21 days | Judge.me owns this send | Review request; do not duplicate it in Brevo |

### 5. Replenishment and subscription

**Entry:** paid non-subscription order. **Exit:** new paid order or active
subscription. Base timing on the published 6–8 week bottle life.

| Timing | Subject direction | Message job |
|---|---|---|
| Day 35 | `How is your bottle tracking?` | Usage check, no discount |
| Day 42–45 | `Ready for the next bottle` | Reorder CTA plus subscribe-and-save option |
| Day 60 | `Running low?` | Final replenishment reminder |
| Day 90 | Plain-text founder note | Lapsed-customer win-back and one-question feedback prompt |

Never send a replenishment discount to an active subscriber. Cancelled
subscribers may enter the non-subscription path only after their paid-through
period ends.

## Activation and verification

1. Set the Netlify tracker key and deploy a preview.
2. Accept analytics cookies, complete the quiz with a tagged test address, view
   the PDP, add a product, change quantity, then empty the cart.
3. In Brevo Event logs, verify this order: `identify`, `product_viewed`,
   `cart_updated`, updated `cart_updated`, `cart_deleted`. Confirm the cart event
   contains total, USD, checkout URL, item name, variant, price, quantity, image,
   and product URL.
4. Repeat after rejecting analytics consent. Verify no Brevo script request,
   identify call, or lifecycle event occurs.
5. Place a 100% discounted or immediately refunded test Shopify order. Verify a
   server-side `order_created`/`order_completed` event reaches the same contact
   and exits the recovery automation before any email is sent.
6. Test each automation with a one-minute temporary delay and an internal test
   segment. Restore production timing before activation.
7. Monitor send, bounce, unsubscribe, spam-complaint, flow conversion, and
   contribution-margin revenue per captured lead weekly.

References: [Brevo JavaScript tracker](https://developers.brevo.com/docs/getting-started-with-js-implementation),
[identify users](https://developers.brevo.com/docs/identify-users-js),
[custom cart events](https://developers.brevo.com/docs/track-custom-events-js),
[abandoned-cart automation](https://help.brevo.com/hc/en-us/articles/360002368860-Recovering-abandoned-carts-create-the-email-step-2-/),
and [Brevo pixel-tracking consent](https://help.brevo.com/hc/en-us/articles/37114679474706-About-email-tracking-pixels-and-the-CNIL-recommendation-in-Brevo).
