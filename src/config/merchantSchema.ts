import { LEGAL } from "@/config/legal";

/**
 * Offer-level fields required for Google Merchant Listing rich results.
 * GSC flags offers missing shippingDetails, hasMerchantReturnPolicy, and
 * priceSpecification.validFrom (Search Console URL inspection, 2026-08-10).
 *
 * Values must stay consistent with /shipping-policy and /refund-policy:
 * free US shipping on every order, 1–2 business day handling, 3–7 business day
 * transit, 30-day keep-the-bottle guarantee (no physical return — KeepProduct).
 *
 * shippingRate is "0" for every offer, which is only true while
 * LEGAL.freeShippingOnAllOrders holds. Google Merchant Center reconciles this
 * against the rate the shopper is actually quoted at checkout and suspends
 * items that disagree, so the moment any order pays shipping this has to become
 * a derived value again — a stale "0" here is a suspension, not a typo.
 */
export function merchantOfferFields(price: string, priceCurrency = "USD") {
  return {
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
      returnMethod: "https://schema.org/KeepProduct",
      returnFees: "https://schema.org/FreeReturn",
    },
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency,
      validFrom: "2026-08-10",
    },
  };
}
