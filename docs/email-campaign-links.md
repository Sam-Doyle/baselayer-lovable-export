# Email campaign link contract

This is the production contract for links from Brevo lifecycle emails to the Base Layer storefront. Use these shapes instead of assembling one-off URLs inside each template.

## Attribution

Every storefront link uses all four required fields:

| Field | Convention | Example |
|---|---|---|
| `utm_source` | Sending platform | `brevo` |
| `utm_medium` | Always `email` | `email` |
| `utm_campaign` | Durable journey name | `welcome`, `cart_recovery`, `post_purchase`, `replenishment` |
| `utm_content` | Unique message and CTA | `w02_dryness_formula`, `c02_proof_primary`, `r01_single_offer` |

`utm_content` must be unique within its journey. Use lowercase snake case and this structure:

`<message sequence>_<persona or offer>_<destination>`

Do not reuse one content value for the logo, hero CTA and body CTA. Add `_logo`, `_primary` or `_text` when a message contains multiple links.

## Deterministic destinations

### Concern and formula education

```text
https://baselayerskin.co/face-cream?concern=dryness&utm_source=brevo&utm_medium=email&utm_campaign=welcome&utm_content=w02_dryness_formula#formula
```

Allowed concern values are `dryness`, `shine`, `irritation` and `texture`. The concern value is for reporting and email-content continuity; `#formula` is the stable visual destination.

### Proof and customer reviews

```text
https://baselayerskin.co/face-cream?utm_source=brevo&utm_medium=email&utm_campaign=welcome&utm_content=w03_proof_primary#reviews
```

Use `#results` only when the email claim is about the product's benefit framework rather than customer reviews.

### Cart and checkout recovery

The primary CTA must use Brevo's authoritative Shopify cart/checkout URL from the event payload. Do not replace it with a generic PDP link; that would discard the shopper's lines and selling plan.

When the event URL is unavailable, the fallback is:

```text
https://baselayerskin.co/face-cream?offer=single&utm_source=brevo&utm_medium=email&utm_campaign=cart_recovery&utm_content=c01_fallback_offer#offer
```

The storefront preserves a restored local cart and carries stored email UTMs into the Shopify checkout URL. Shopify's required checkout `key` is never replaced.

### Replenishment and subscription offers

```text
# One bottle
https://baselayerskin.co/face-cream?offer=single&utm_source=brevo&utm_medium=email&utm_campaign=replenishment&utm_content=r01_single_offer#offer

# Two bottles
https://baselayerskin.co/face-cream?offer=two&utm_source=brevo&utm_medium=email&utm_campaign=replenishment&utm_content=r01_two_offer#offer

# Subscribe and save
https://baselayerskin.co/face-cream?offer=subscription&utm_source=brevo&utm_medium=email&utm_campaign=replenishment&utm_content=r02_subscription_offer#offer
```

These query values preselect the stated PDP tier. Unknown values fall back to the normal PDP default.

## Promised discounts

SKIN15 may be auto-applied only when it was already promised to that subscriber:

```text
https://baselayerskin.co/face-cream?offer=single&discount=SKIN15&utm_source=brevo&utm_medium=email&utm_campaign=welcome&utm_content=w01_code_primary#offer
```

The storefront accepts only the allow-listed `SKIN15` value from campaign links, persists it for a new cart, and updates an existing Shopify cart when one is present. SHIP26 remains automatically attached by the storefront. Do not add a different code to a URL without adding it to the allow-list and confirming Shopify combination rules first.

## Subscriber experience

- A tab that arrives with `utm_medium=email` is not shown the email-capture quiz, including after client-side navigation. `?quiz=preview` remains an explicit QA override.
- Campaign anchor scrolling retries while lazy PDP sections mount.
- The PDP purchase bar is visible on mobile whenever the full buy-box CTA is outside the viewport.
- Links retain campaign attribution through the Shopify checkout handoff.

## Pre-send QA

1. Click every link from an actual test email, not only the Brevo editor.
2. Confirm the intended PDP tier, section and discount.
3. Confirm the quiz does not appear after 15 seconds or 40% scroll.
4. On a 360px-wide viewport, confirm the sticky purchase CTA is reachable and does not cover consent controls.
5. For cart recovery, confirm the exact cart lines, selling plan, checkout key and discount survive.
6. Confirm every link has a unique `utm_content` and the same journey-level `utm_campaign`.
