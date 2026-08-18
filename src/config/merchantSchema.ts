import { LEGAL } from "@/config/legal";

/**
 * The date the current offer terms took effect. Google documents `validFrom` in
 * two places — directly on the Offer node and on a nested PriceSpecification —
 * and Search Console asks for both independently: the 2026-08-18 Merchant
 * listings report wanted `validFrom` "(in \"offers\")" while the nested copy was
 * already present. So both are emitted, from one constant, because two dates
 * for one offer is the drift bug this codebase keeps re-learning.
 */
const OFFER_VALID_FROM = "2026-08-10";

/**
 * Offer-level fields required for Google Merchant Listing rich results.
 * GSC flags offers missing shippingDetails, hasMerchantReturnPolicy, and
 * priceSpecification.validFrom (Search Console URL inspection, 2026-08-10).
 *
 * Values must stay consistent with /shipping-policy and /refund-policy:
 * free US standard shipping through the automatically applied SHIP26 offer,
 * 1–2 business day handling, 3–7 business day transit, and a 30-day
 * keep-the-bottle guarantee (no physical return; see the returnMethod note
 * below for why that last part cannot be expressed in schema.org).
 *
 * shippingRate is "0" for every offer because every purchase path applies the
 * shipping promotion. This is only true while LEGAL.freeShippingOnAllOrders
 * holds. Google Merchant Center reconciles this
 * against the rate the shopper is actually quoted at checkout and suspends
 * items that disagree, so the moment any order pays shipping this has to become
 * a derived value again — a stale "0" here is a suspension, not a typo.
 */
export function merchantOfferFields(price: string, priceCurrency = "USD") {
  return {
    validFrom: OFFER_VALID_FROM,
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: priceCurrency,
      },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "US",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: LEGAL.guaranteeDays,
      /*
       * returnMethod is deliberately absent. It used to say
       * "https://schema.org/KeepProduct", which Search Console rejected on
       * 2026-08-17 as `Invalid enum value in field "returnMethod"` on the
       * homepage Merchant listing. KeepProduct is not a member of schema.org's
       * ReturnMethodEnumeration — the only valid values are ReturnByMail,
       * ReturnInStore and ReturnAtKiosk, and none of them is true here.
       *
       * There is no markup vocabulary for "keep the bottle, we don't want it
       * back", so the honest move is to omit the field rather than claim a
       * return channel we don't operate. The three fields that remain already
       * describe the policy accurately: a finite 30-day window at no cost to
       * the customer. The keep-the-product part belongs in Merchant Center's
       * own return settings, which do model it, not in schema.org.
       *
       * Search Console re-raised this on 2026-08-18 as a NON-CRITICAL Merchant
       * listings issue, `Missing field "returnMethod" (in
       * "offers.hasMerchantReturnPolicy")`. Google's own merchant listing
       * documentation was re-read the same day and confirms the enumeration is
       * still the same three values with no no-return option. So this warning
       * is permanent and correct to ignore. Do not "fix" it by picking
       * ReturnByMail: that is a false statement about the policy, and the
       * previous attempt at KeepProduct was rejected outright as an invalid
       * enum value, which is a worse outcome than the warning.
       */
      returnFees: "https://schema.org/FreeReturn",
    },
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency,
      validFrom: OFFER_VALID_FROM,
    },
  };
}
