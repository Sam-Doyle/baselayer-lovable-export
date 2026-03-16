# Product Catalog

Reference for AI content skills. Add new SKUs as additional `## Product Name` sections.

## Performance Daily Face Cream

- **SKU:** BL-PDFC-50ML
- **Size:** 50 mL
- **Price:** $38 (founding batch) / $48 (post-launch retail)
- **Category:** All-in-one daily moisturizer
- **Tagline:** "One step. Zero shine."
- **Classification:** Cosmetic

### Key Benefits (ordered by importance)
1. Absorbs in 15 seconds -- no greasy residue
2. Replaces serum + moisturizer + eye cream
3. Matte finish, all-day shine control
4. Fragrance-free
5. One bottle lasts 6-8 weeks

### Key Ingredients

| Ingredient | Concentration | Primary Benefit | Marketing Claim |
|---|---|---|---|
| Niacinamide (Vitamin B3) | 5% | Oil control, pore refinement, tone evening | "Clinically studied form of Vitamin B3 that helps visibly refine pores and even skin tone" |
| Copper Peptide GHK-Cu | -- | Anti-aging, collagen support | "Supports firmer, younger-looking skin" |
| Panthenol (Vitamin B5) | -- | Barrier support, soothing | "Helps soothe and condition skin" |
| Centella Asiatica | -- | Calms irritation, sensitive skin | "Calms and soothes even sensitive skin" |
| Squalane | -- | Lightweight hydration, barrier reinforcement | "Biomimetic moisturizer that mirrors your skin's natural oils" |
| Hyaluronic Acid | -- | Deep moisture retention | "Holds up to 1,000x its weight in water for lasting hydration" |

### Results Timeline
- **Immediate:** Hydration, skin feels smoother, no greasy residue
- **1-2 weeks:** Oil control, improved skin texture, reduced post-shave irritation
- **4-8 weeks:** Visible improvements in tone, texture, and fine lines to combat signs of aging
- **12+ weeks:** Cumulative brightening, sustained barrier health, texture improvement

### Pricing & Offers
- **Founding price:** $38 (limited first production run)
- **Post-launch retail:** $48
- **Free shipping threshold:** $50+
- **Guarantee:** 30-day money-back, keep the bottle
- **No subscriptions at launch**

### Schema.org Product Data

```json
{
  "@type": "Product",
  "name": "Performance Daily Face Cream",
  "brand": { "@type": "Brand", "name": "Base Layer" },
  "description": "All-in-one daily face cream for men. Absorbs in 15 seconds. Replaces serum, moisturizer, and eye cream.",
  "sku": "BL-PDFC-50ML",
  "offers": {
    "@type": "Offer",
    "price": "38.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/PreOrder",
    "priceValidUntil": "TBD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "50"
  }
}
```
