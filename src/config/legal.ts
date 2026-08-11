/*
 * LEGAL PAGE FACTS
 *
 * Single source of truth for the business facts referenced across the four
 * policy pages (privacy, terms, refund, shipping). They live here rather than
 * inline because several appear on more than one page, and a fact that is wrong
 * in one place and right in another is worse than one that is simply wrong.
 *
 * NONE OF THIS TEXT HAS BEEN REVIEWED BY AN ATTORNEY. It is conventional DTC
 * e-commerce drafting, not legal advice. Get counsel to read the Terms of
 * Service in particular before relying on the liability cap.
 *
 * CONFIRM BEFORE THESE PAGES CARRY ANY WEIGHT:
 *
 *  - entityName: confirmed as the registered LLC. The privacy policy names this
 *    entity as the data controller, so it has to stay exact.
 *
 *  - processingDays / deliveryWindow: written to match Shopify's standard
 *    fulfilment defaults. If actual fulfilment is slower, these become
 *    deceptive shipping representations under the FTC Mail, Internet, or
 *    Telephone Order Merchandise Rule (16 CFR Part 435), which requires
 *    shipment within the stated window or 30 days if none is stated.
 *
 *  - refundProcessingDays: confirm against what Shopify Payments and the
 *    customer's issuing bank actually take end to end.
 *
 *  - guaranteeStart: "purchase" per product decision. The homepage and PDP
 *    advertise "30-day guarantee" and "Hate it? Keep the bottle. Full refund."
 *    Those claims and this policy have to keep matching — if the marketing
 *    copy changes, this changes with it.
 */

export const LEGAL = {
  /** Registered legal entity. Named as data controller in the privacy policy. */
  entityName: "Base Layer Skin LLC",
  /** State whose law governs the Terms and where the business operates. */
  entityState: "Colorado",
  contactEmail: "contact@baselayerskin.co",
  siteDomain: "baselayerskin.co",
  /** Shown at the top of all four policy pages. Bump on material revision. */
  effectiveDate: "August 10, 2026",

  // Fulfilment
  processingDays: "1–2 business days",
  deliveryWindow: "3–7 business days",
  shipsInternationally: false,

  /*
   * Shipping charges. This is the on-site representation of a rule that
   * actually lives in Shopify admin — the US shipping profile's rate. If admin
   * and this flag disagree, the site is making a deceptive shipping
   * representation, so change them together or not at all.
   *
   * A $50 free-shipping threshold with a $5.95 flat rate below it was built and
   * then reversed before it went live. The reason it lost: $38 + $5.95 and a
   * flat $44 collect the same contribution to within four cents, so the fee
   * bought no margin a price change couldn't — it only added a second line item
   * at checkout, on the cheapest tier, for a brand whose whole pitch is that it
   * doesn't play billing games. If shipping ever needs to be paid for, raise the
   * bottle price instead of reintroducing a threshold.
   */
  freeShippingOnAllOrders: true,

  // Guarantee — must stay consistent with on-site marketing claims.
  guaranteeDays: 30,
  /** "purchase" | "delivery" — which event starts the guarantee clock. */
  guaranteeStart: "purchase" as const,
  /** No physical return required; the site promises "keep the bottle". */
  requiresReturn: false,
  refundProcessingDays: "5–10 business days",

  // Eligibility
  minimumAge: 18,
} as const;

/** "30 days from the date of purchase" — used in both refund and shipping copy. */
export const GUARANTEE_WINDOW_PHRASE = `${LEGAL.guaranteeDays} days from the date of ${LEGAL.guaranteeStart}`;

/**
 * The short marketing form, used in the announcement bar, hero, PDP trust line,
 * and landing page. Import this rather than retyping it: if shipping ever stops
 * being unconditional, one edit here has to be able to correct every banner at
 * once. A stale "free shipping" in one place is exactly the mismatch the FTC
 * Mail, Internet, or Telephone Order Merchandise Rule punishes.
 */
export const FREE_SHIPPING_PHRASE = "Free shipping";
