import { LEGAL } from "@/config/legal";

/**
 * Offer-level fields required for Google Merchant Listing rich results.
 * GSC flags offers missing shippingDetails, hasMerchantReturnPolicy, and
 * priceSpecification.validFrom (Search Console URL inspection, 2026-08-10).
 *
 * Values must stay consistent with /shipping-policy and /refund-policy:
 * free US shipping over LEGAL.freeShippingThreshold, 1–2 business day handling,
 * 3–7 business day transit, 30-day keep-the-bottle guarantee (no physical
 * return — KeepProduct).
 *
 * shippingRate is derived from the offer price rather than hardcoded to 0.
 * Google Merchant Center reconciles this against the rate the shopper is
 * actually quoted at checkout and suspends items that disagree, so a blanket
 * "0" here would be wrong for the single bottle the moment shipping is charged
 * on it. Subscription offers ship free at any value; they are priced below the
 * threshold, so they pass shipsFree explicitly.
 */
export function merchantOfferFields(price: string, priceCurrency = "USD", shipsFree = false) {
  const freeShipping =
    shipsFree || Number.parseFloat(price) >= LEGAL.freeShippingThreshold;
  return {
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: freeShipping ? "0" : LEGAL.flatShippingRate.toFixed(2),
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
