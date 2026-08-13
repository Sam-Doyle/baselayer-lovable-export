import packshot from "@/assets/product-carousel/base-layer-carousel-01-primary.webp";
import type { ShopifyProduct } from "@/lib/shopify";

// Live Shopify catalog mapping. Store: base-layer-skin.myshopify.com
// Product: "Performance Daily Face Cream" (gid://shopify/Product/7469557612615)
// Subscription: Shopify Subscriptions app plan "Subscribe & Save",
// deliver every 6 weeks. If the plan or variants are recreated in admin, update
// the GIDs below to match.
// Tiers stay hidden until their IDs are filled in — no fake buttons.
export const PRODUCT_HANDLE = "performance-daily-face-cream";
export const PRODUCT_GID = "gid://shopify/Product/7469557612615";

const TIER_1_BOTTLE_GID = "gid://shopify/ProductVariant/42940461023303";
const TIER_2_BOTTLE_GID: string | null = "gid://shopify/ProductVariant/42940461056071";
const SELLING_PLAN_GID: string | null = "gid://shopify/SellingPlan/2934145095";

/*
 * One subscription price, every delivery: $35. Below the $38 single, above the
 * $34/bottle the 2-pack works out to, so the ladder reads left to right without
 * anybody having to do arithmetic.
 *
 * This replaced a staged plan that billed $38 on delivery one and $34 after. The
 * staged version was defensible on paper and the four-order economics are a wash
 * — $72.74 flat against $72.73 staged, a one cent difference — but it cost two
 * prices in every piece of copy, a renewal disclosure in the cart, and a Shopify
 * selling plan carrying separate initial and recurring pricing policies that the
 * native Subscriptions app UI doesn't reliably expose. A flat $3 off is one
 * number the shopper can hold in their head and one field in admin.
 *
 * Where the two actually differ: staged earns $2.91 more on the first order,
 * flat earns $0.98 more on every renewal, and they cross at the fourth delivery.
 * Betting on flat is a bet on retention past six months, which is also the
 * business we say we're in.
 *
 * At $35 the contribution is $17.57 on COGS $9 plus $7.12 landed shipping and
 * 2.9% + $0.30 in fees — 50.2% margin, breakeven ROAS 1.99x.
 *
 * That figure took three corrections on 2026-08-12 and the sequence is the point.
 * It started at $18.19 / 52.0% / 1.93x on an *assumed* $5.50 landed shipping.
 * Rebuilding from published carrier tables gave $8.10 — worse, and it caught a
 * live error, because media bought against 1.93x when breakeven was really 2.11x
 * loses money on everything in that band. Weighing a packed unit (82 g, carton
 * plus filled airless pump) dropped it to $7.46: at 82 g plus an ~8 g 9x12 poly
 * mailer the parcel is 90 g / 3.17 oz and clears the USPS Ground Advantage 4 oz
 * tier, not the 8 oz tier the tables were read against. Finally, quoting four
 * real Shopify Shipping lanes landed it at $7.12 — $5.78 blended postage plus
 * ~$1.34 in mailer, label, insert and tape.
 *
 * Each step replaced an assumption with a measurement and each one moved the
 * number more than any pricing decision in this file. Two of the three estimates
 * were wrong in the *direction that flattered us*, which is the failure mode to
 * watch for.
 *
 * Note the error only ever bit single-unit tiers. The 2-pack ships two units in
 * one 8 oz parcel, so shipping is 11.4% of revenue against 18.7% on a single, and
 * contribution is $39.98 (58.8%, breakeven 1.70x). That spread, not a shipping
 * fee, is the reason the PDP defaults to the 2-pack.
 *
 * Container confirmed as the airless pump on 2026-08-12, so 82 g is the shipped
 * weight of the real Batch 01 unit and these figures are final until the carton
 * or fill changes. The earlier note here doubted the pump because a ~58 g bottle
 * estimate wouldn't fit 82 g — the estimate was wrong, not the scale.
 *
 * This number must match the selling plan in Shopify admin, which is the only
 * place the price is actually set — the Storefront token here is read-only and
 * cannot change it. The plan carries a single fixed-price policy with
 * orderCount null, meaning it applies to every delivery forever.
 *
 * `npm run verify:pricing` reads the live plan and every variant and fails if
 * either disagrees with this file. Run it after any pricing change in admin.
 * It exists because this comment once claimed a price nobody had checked.
 */
const SUBSCRIBE_PRICE = 35;

export interface BuyTier {
  id: number;
  kind: "one-time" | "subscription";
  bottles: number;
  label: string;
  duration: string;
  price: number;
  badge: string | null;
  badgeColor?: string;
  savings: number;
  subCopy?: string;
  variantGid: string | null;
  sellingPlanGid?: string | null;
}

export const BUY_TIERS: BuyTier[] = [
  {
    id: 1, kind: "one-time", bottles: 1, label: "1 Bottle", duration: "6 weeks",
    price: 38, badge: null, savings: 0,
    variantGid: TIER_1_BOTTLE_GID,
  },
  {
    id: 2, kind: "one-time", bottles: 2, label: "2 Bottles", duration: "12 weeks",
    price: 68, badge: "MOST POPULAR", badgeColor: "bg-[#1A2F4C]", savings: 8,
    variantGid: TIER_2_BOTTLE_GID,
  },
  {
    id: 3, kind: "subscription", bottles: 1, label: "Subscribe & Save", duration: "every 6 weeks",
    /*
     * The badge answers the objection instead of restating the price — the buy
     * box already shows $35, and the thing keeping a Jack Black refugee off this
     * tile isn't the number, it's whether he can get back out.
     *
     * Keep it at or under ~90px rendered. The badges are whitespace-nowrap and
     * centred on their tile, so a long one bleeds into the 12px gap and hits
     * "MOST POPULAR" coming the other way. At a 360px viewport (most Android)
     * tiles are 96px: "NO LOCK-IN" clears by 13px, "CANCEL ANYTIME" collided.
     */
    price: SUBSCRIBE_PRICE, badge: "NO LOCK-IN", badgeColor: "bg-brand", savings: 38 - SUBSCRIBE_PRICE,
    subCopy: `Same $${SUBSCRIBE_PRICE} every time. Pause or cancel in one click.`,
    variantGid: TIER_1_BOTTLE_GID,
    sellingPlanGid: SELLING_PLAN_GID,
  },
];

export const AVAILABLE_TIERS = BUY_TIERS.filter(
  t => t.variantGid !== null && (t.kind !== "subscription" || !!t.sellingPlanGid)
);
/*
 * Preselected tier on the PDP. The 2-bottle pack, deliberately: at COGS $10 it
 * carries ~$38.73 of contribution against ~$21.10 for the single, which nearly
 * doubles the CAC ceiling at a breakeven ROAS that barely moves (1.76x vs
 * 1.80x).
 *
 * Falls back to the first available tier so a 2-pack variant that gets deleted
 * in Shopify admin degrades to the single instead of rendering an empty buy box.
 */
export const DEFAULT_TIER =
  AVAILABLE_TIERS.find(t => t.id === 2) ?? AVAILABLE_TIERS[0];

/**
 * Homepage $38 CTAs must land on the single-bottle tier they advertise.
 * Direct PDP visits keep the higher-value default tier selected.
 */
export function getInitialTier(offer: string | null): BuyTier {
  if (offer === "single") {
    return AVAILABLE_TIERS.find(t => t.id === 1) ?? DEFAULT_TIER;
  }
  return DEFAULT_TIER;
}

/**
 * Build the CartItem payload the cart store expects for a given tier.
 *
 * The price here is a seed, not the truth. It renders for the few hundred
 * milliseconds between the click and Shopify's cart response, after which the
 * store overwrites it with the line's real `cost.amountPerQuantity`. Keep it in
 * sync with Shopify anyway (see verify:pricing) so the seed never flashes a
 * different number than the one that replaces it.
 */
export function buildCartItem(tier: BuyTier) {
  return {
    product: {
      node: {
        id: PRODUCT_GID,
        title: "Performance Daily Face Cream",
        handle: PRODUCT_HANDLE,
        description: "",
        // Light packshot — matches the variant image Shopify shows in checkout.
        images: { edges: [{ node: { url: packshot, altText: "Base Layer Face Cream" } }] },
        variants: { edges: [] },
        options: [],
        priceRange: { minVariantPrice: { amount: tier.price.toFixed(2), currencyCode: "USD" } },
      },
    } as ShopifyProduct,
    variantId: tier.variantGid as string,
    variantTitle: tier.kind === "subscription" ? "Subscribe & Save · every 6 weeks" : tier.bottles === 1 ? "50mL" : `${tier.bottles} Bottles`,
    price: { amount: tier.price.toFixed(2), currencyCode: "USD" },
    quantity: 1,
    selectedOptions: [],
    sellingPlanId: tier.sellingPlanGid ?? null,
  };
}
