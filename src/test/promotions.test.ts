import { beforeEach, describe, expect, it } from "vitest";
import { FREE_SHIPPING_CODE } from "@/config/legal";
import {
  SKIN_QUIZ_PROMOTION,
  activateSkinQuizDiscount,
  activeCheckoutDiscountCodes,
} from "@/config/promotions";

describe("skin quiz promotion", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the evergreen shipping code when no quiz offer is active", () => {
    expect(activeCheckoutDiscountCodes()).toEqual([FREE_SHIPPING_CODE]);
  });

  it("combines the quiz offer with free shipping after lead capture", () => {
    activateSkinQuizDiscount();
    expect(activeCheckoutDiscountCodes()).toEqual([SKIN_QUIZ_PROMOTION.code, FREE_SHIPPING_CODE]);
  });
});
