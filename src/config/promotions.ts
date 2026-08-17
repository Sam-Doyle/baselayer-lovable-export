import { FREE_SHIPPING_CODE } from "@/config/legal";

export const SKIN_QUIZ_PROMOTION = {
  code: "SKIN15",
  percentOff: 15,
  source: "skin_concern_quiz",
  storageKey: "bl_skin_quiz_discount",
} as const;

export type SkinConcernId = "dryness" | "shine" | "irritation" | "texture";

export const SKIN_CONCERNS: Array<{
  id: SkinConcernId;
  label: string;
  result: string;
}> = [
  {
    id: "dryness",
    label: "Dry / tight",
    result: "Lightweight hydration without the greasy finish.",
  },
  {
    id: "shine",
    label: "Oily / shiny",
    result: "Daily hydration designed to stay matte.",
  },
  {
    id: "irritation",
    label: "Red / irritated",
    result: "Fragrance-free barrier support for post-shave skin.",
  },
  {
    id: "texture",
    label: "Texture / fine lines",
    result: "Niacinamide and peptides in one daily layer.",
  },
];

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function activateSkinQuizDiscount(): void {
  browserStorage()?.setItem(SKIN_QUIZ_PROMOTION.storageKey, SKIN_QUIZ_PROMOTION.code);
}

export function hasSkinQuizDiscount(): boolean {
  return browserStorage()?.getItem(SKIN_QUIZ_PROMOTION.storageKey) === SKIN_QUIZ_PROMOTION.code;
}

/** Codes sent to Shopify in application order: merchandise/order savings,
 * then the evergreen shipping offer. Both discounts must be configured to
 * combine in Shopify Admin. */
export function activeCheckoutDiscountCodes(): string[] {
  return hasSkinQuizDiscount()
    ? [SKIN_QUIZ_PROMOTION.code, FREE_SHIPPING_CODE]
    : [FREE_SHIPPING_CODE];
}
