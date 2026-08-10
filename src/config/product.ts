import productShot from "@/assets/product-hero-rock.png";
import type { ShopifyProduct } from "@/lib/shopify";

// Live Shopify catalog mapping. Store: base-layer-skin.myshopify.com
// Product: "Performance Daily Face Cream" (gid://shopify/Product/7469557612615)
// Subscription: Shopify Subscriptions app plan "Subscribe & Save",
// deliver every 6 weeks at SUBSCRIBE_PRICE. If the plan or variants are
// recreated in admin, update the GIDs below to match.
// Tiers stay hidden until their IDs are filled in — no fake buttons.
export const PRODUCT_HANDLE = "performance-daily-face-cream";
export const PRODUCT_GID = "gid://shopify/Product/7469557612615";

const TIER_1_BOTTLE_GID = "gid://shopify/ProductVariant/42940461023303";
const TIER_2_BOTTLE_GID: string | null = "gid://shopify/ProductVariant/42940461056071";
const SELLING_PLAN_GID: string | null = "gid://shopify/SellingPlan/2934145095";
const SUBSCRIBE_PRICE = 34;                     // match the plan's discounted price

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
    price: SUBSCRIBE_PRICE, badge: "BEST VALUE", badgeColor: "bg-brand", savings: 38 - SUBSCRIBE_PRICE,
    subCopy: "Pause or cancel in one click. Never required.",
    variantGid: TIER_1_BOTTLE_GID,
    sellingPlanGid: SELLING_PLAN_GID,
  },
];

export const AVAILABLE_TIERS = BUY_TIERS.filter(
  t => t.variantGid !== null && (t.kind !== "subscription" || !!t.sellingPlanGid)
);
export const DEFAULT_TIER = AVAILABLE_TIERS[0];

/** Build the CartItem payload the cart store expects for a given tier. */
export function buildCartItem(tier: BuyTier) {
  return {
    product: {
      node: {
        id: PRODUCT_GID,
        title: "Performance Daily Face Cream",
        handle: PRODUCT_HANDLE,
        description: "",
        images: { edges: [{ node: { url: productShot, altText: "Base Layer Face Cream" } }] },
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
