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
 * The subscription discount is a RETENTION discount, not an acquisition one:
 * first delivery bills at the one-time price, $34 from the second onward.
 *
 * Why it moved. At $34 on delivery one the subscription carried $17.21 of
 * contribution against $21.10 for a plain single bottle — the worst first order
 * on the site, breakeven ROAS 1.98x vs 1.80x, and it took two retained cycles
 * just to catch a one-time buyer. With zero retention data there was nothing
 * justifying that bet. Full price on delivery one costs a subscriber nothing
 * they weren't already willing to pay and lifts four-order contribution from
 * $68.86 to $72.73.
 *
 * It's also the honest version for a brand that sells itself as the alternative
 * to subscription traps: reward staying, don't bribe signing up.
 *
 * BOTH numbers must match the selling plan in Shopify admin. The plan needs an
 * initial pricing policy at 0% off and a recurring policy at $4 off after cycle
 * 1 (SellingPlanPricingPolicy supports this; the native Subscriptions app UI
 * may not expose it — see the admin note in the commit). If admin bills $34 on
 * delivery one while the PDP says $38, the site is misrepresenting the price.
 */
const SUBSCRIBE_FIRST_PRICE = 38;
const SUBSCRIBE_RENEWAL_PRICE = 34;

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
  /**
   * Subscription tiers only. What every delivery after the first bills at.
   * `price` is what the shopper pays today, so it is the number the buy box and
   * the add_to_cart event use; this is the number the renewal disclosure uses.
   */
  renewalPrice?: number;
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
    // savings is 0 because there is nothing saved on this order. The chip it
    // drives would otherwise claim a discount the shopper isn't getting yet.
    price: SUBSCRIBE_FIRST_PRICE, badge: "$34 ONGOING", badgeColor: "bg-brand", savings: 0,
    subCopy: `First bottle $${SUBSCRIBE_FIRST_PRICE}. Every one after that $${SUBSCRIBE_RENEWAL_PRICE}. Pause or cancel in one click.`,
    variantGid: TIER_1_BOTTLE_GID,
    sellingPlanGid: SELLING_PLAN_GID,
    renewalPrice: SUBSCRIBE_RENEWAL_PRICE,
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

/** Build the CartItem payload the cart store expects for a given tier. */
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
