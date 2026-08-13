---
title: Shipping Economics & Packaging
domain: technical
created: 2026-08-12
last_compiled: 2026-08-12
revision: 3
sources: [Shopify admin shipping rate calculator (4 quoted lanes, 2026-08-12), /last30days research (Pirate Ship support docs, DimMath 2026 GA + Cubic rate tables, SellerEssentials, Ship.com, TransImpact, Shopify Community), SupplyHut product pages, PackagingSupplies.com, USPS DIM rules, packaging weight math, Sam's scale measurement 2026-08-12, Shopify Admin GraphQL mutation reference]
codePaths:
  - ~/baselayer-lovable-export/src/config/legal.ts
  - ~/baselayer-lovable-export/src/config/product.ts
---

How much it costs to put a 50 mL Base Layer bottle in a customer's hands, what
drives that number, and what does not. Origin is Denver, CO. Complements
`kb/wiki/conversion-learnings.md` (what to charge the customer) — this article is
strictly about cost.

---

## The Short Version

Rebuilt 2026-08-12 (rev 3) against a **measured** 82 g packed unit — carton plus
filled airless pump, on Sam's scale — the 9x12 plain poly mailer actually bought,
and **four quoted carrier rates** rather than published rate tables. Rev 1 was
estimated end to end; rev 2 fixed the weight; rev 3 fixes the postage.

| | 1 bottle | 2-pack |
|---|---|---|
| Product + carton (measured) | 82 g | 164 g |
| Mailer (9x12, 2 mil) | 8 g | 8 g |
| Shipped weight | **90 g / 3.17 oz** | **172 g / 6.07 oz** |
| USPS tier | **4 oz** | **8 oz** |
| Postage (blended) | **$5.78** (measured) | **$6.22** (est.) |
| Materials | ~$1.34 | ~$1.53 |
| **Landed shipping** | **$7.12** | **$7.75** |

**The second bottle costs $0.63 more to ship and earns $30 more revenue.** That
single fact drives the 2-pack PDP default and is the most important number in
this article.

Postage rebuilt 2026-08-12 from **four quoted Shopify Shipping rates**, superseding
the $6.12 / $6.59 zone-model estimates. The 2-pack figure is still derived rather
than quoted — see "Rebuilt blend" below.

> ⚠️ **Supersedes rev 1**, which had 4.8 oz / 9.1 oz shipped weights, the 8 oz and
> 12 oz tiers, and $8.10 / $8.49 landed. Rev 1 was wrong because it estimated the
> 50 mL airless pump at ~58 g empty. **The container is confirmed as the airless
> pump (Sam, 2026-08-12)** — the bottle is simply much lighter than estimated,
> around 25-30 g for a thin-wall mono-material PP airless. 82 g is the real
> shipped weight of a Batch 01 unit.

Weighing one packed box moved landed cost more than any pricing decision made
this month. Do it before modelling, not after.

**Corollary worth keeping: a component-weight estimate that is off by 30 g moves
the parcel a full USPS band.** The 58 g guess wasn't wildly wrong in isolation —
it was wrong enough to cost $0.47/order and to mis-specify the shipper.

---

## Three Counterintuitive Rules

These each cost real money to get wrong, and all three run against instinct.

### 1. Package dimensions do not affect USPS cost at this size

USPS applies dimensional weight only above **1 cubic foot (1,728 cu in)**. Any
single- or double-unit skincare shipper is an order of magnitude under that, so
only weight is billed. Shrinking the box saves nothing on postage.

The July 2026 DIM divisor cut (166 → 139) is therefore irrelevant here — it bites
UPS/FedEx and oversized USPS parcels only. *(2026-08-12, /last30days — DimMath
Cubic rate table + USPS DIM rules, confidence: high)*

### 2. Ground Advantage Cubic is a trap for lightweight goods

Cubic tier 0.1 (≤0.10 cu ft) prices at **$7.20 Zone 1-2 / $8.10 Zone 5** — *more*
than the weight-based sub-1-lb rate. Cubic only wins on dense parcels (4+ lbs in
a small box) shipping to Zone 5+. Do not enable it. *(2026-08-12, /last30days —
DimMath Cubic rate table, confidence: high)*

### 3. Where you buy the label matters more than what you put in the box

USPS killed ounce-based Ground Advantage pricing at **published Commercial on
2026-07-12** — every sub-1-lb package now bills at the 15.999 oz rate. Platforms
passing **below-Commercial USPS Connect rates still keep the 4/8/12 oz tiers** for
contiguous non-rural addresses. **Shopify Shipping is one of them** — measured at
$5.48 to Zone 5, ~6% under the $5.83 published Commercial rate (see below), so
there is no reason to add Pirate Ship or Shippo to the fulfilment loop.

For a sub-4-oz parcel to Zone 5 that is **$5.48 vs. $7.69 — a ~$2.21/order swing
purely from where the label is bought.**

**Rural ZIPs lose the tiers on every platform**, measured at +36% (Denver → 59645
quoted $7.46 against $5.48 to Berkeley). This is the only lane that meaningfully
deviates, and it is why the blend below carries a rural weighting.

⚠️ **Corrected 2026-08-12 by measurement:** rev 1 grouped **AK/HI/PR and APO/FPO/
DPO** with rural ZIPs as tier-loss lanes, sourced from research rather than quotes.
Juneau AK quoted **$5.97, only +9%** — nowhere near tier loss. Treat the tier-loss
claim as **rural ZIPs only** until a HI/PR/APO quote proves otherwise.
*(2026-08-12, Shopify admin rate calculator — measured, supersedes the /last30days
read from Pirate Ship support docs, DimMath, SellerEssentials, confidence: high)*

---

## USPS Ground Advantage Rate Cliffs (2026 Commercial, Zone 5)

| Weight | Rate | Step |
|---|---|---|
| 4 oz | $5.83 | — |
| 8 oz | $6.36 | +$0.53 |
| 12 oz | $6.52 | +$0.16 |
| 15.999 oz | $7.69 | +$1.17 |
| 1 lb | $8.74 | +$1.05 |
| 2 lb | $9.95 | +$1.21 |

**Practical rules:** never cross 1 lb, and do not over-engineer packaging between
8 and 12 oz — that band is nearly free. The expensive cliffs are 12→16 oz and
16 oz→1 lb. *(2026-08-12, /last30days — DimMath 2026 GA rate tables, confidence: high)*

### Measured rates — the zone model was the wrong frame

**2026-08-12, Shopify admin shipping rate calculator, origin 80206, 9x12 poly
preset, 82 g. These are quoted rates, not estimates.**

| Destination | Zone | Ground Advantage | vs. Berkeley |
|---|---|---|---|
| Berkeley, CA 94707 | 5 | **$5.48** | — |
| New York, NY 10001 | 7 | **$5.62** | +$0.14 |
| Juneau, AK 99801 | non-contiguous | **$5.97** | +$0.49 |
| White Sulphur Springs, MT 59645 | **rural** | **$7.46** | **+$1.98 (+36%)** |

Carrier comparison on the Berkeley lane: FedEx Home Delivery $8.69 (+59%), USPS
Priority $11.50 (+110%), FedEx 2Day One Rate $16.63 (+204%). **Ground Advantage
is not close to being beaten at this weight.**

Three findings, in order of how much they change the model:

**1. Zone is nearly irrelevant at 4 oz.** Zone 5 → Zone 7, ~700 extra miles, costs
$0.14. This supersedes the zone-blending approach used in rev 1 and rev 2 — there
is effectively one contiguous non-rural rate, ~**$5.55**, and building a
zone-weighted average was solving the wrong problem.

**2. Rural ZIPs are the only material variable, at +36%.** Rev 1 predicted the
rural tier-loss effect and estimated +32%; measured is +36%. That thesis holds and
is the single thing worth modelling.

**3. ⚠️ Corrects rev 1: AK/HI are *not* a penalty lane at this weight.** Juneau at
$5.97 is +9%, nowhere near the tier-loss behaviour rev 1 attributed to
AK/HI/PR/APO alongside rural ZIPs. Whatever tier loss those lanes suffer at
published Commercial, Shopify Shipping is not passing it through here. Treat the
rev 1 claim as applying to **rural ZIPs only** until a HI/PR quote says otherwise.

**Shopify Shipping is ~6% under published Commercial** ($5.48 against the $5.83
4 oz Z5 Commercial rate). **Decision: buy labels through Shopify Shipping** — it is
already a below-Commercial source, so adding Pirate Ship or Shippo to the
fulfilment loop buys nothing.

### Rebuilt blend (single unit, 82 g)

```
0.87 × $5.55 (contiguous non-rural)
0.12 × $7.46 (rural)
0.01 × $5.97 (AK/HI/PR)
         = $5.78 blended
```

Supersedes the $6.12 rev-2 estimate. **The result is insensitive to the rural
weighting**, which is the one input still unmeasured: 5% rural → $5.65, 20% rural
→ $5.94. A $0.29 spread across a range that confidently brackets reality, so there
is no need to pin down the rural share.

⚠️ **Still estimated: the 2-pack.** $6.22 postage is derived by scaling the 4 oz →
8 oz step, not quoted. Re-run the same four ZIPs at **164 g** to close it — that is
the PDP default and the row that matters most. **Prediction to test:** if rural
bills at the top sub-1-lb rate regardless of weight, the rural 2-pack should quote
the same **$7.46**, not more. If it does, that confirms the tier-loss mechanism.

Also unconfirmed: whether the calculator's "Total weight" field is inclusive of
the 8 g package preset (i.e. bills 82 g or 90 g). Immaterial to the tier — both
clear the 113.4 g cliff — but it matters for label accuracy in production.

### Denver as an origin

Denver is close to optimal for a US-national DTC brand. By great-circle distance,
**LA, SF, Chicago, Houston, Portland, Dallas and Minneapolis all land in Zone 5**;
NYC, Boston and Miami are Zone 7.

⚠️ **But this matters far less than rev 1 and rev 2 assumed.** Measured Zone 5 →
Zone 7 is $0.14 at 82 g. Origin choice is close to a non-issue for a light-parcel
DTC brand on Ground Advantage; **the customer's rural/non-rural status swamps the
zone by 14x.** Keep the zone map for context, not for modelling. Origin location
would only start to matter at heavier weights, where the zone spread widens.

---

## Primary Container Drives the Tier

Shipped weights for a 50 mL moisturizer:

| Configuration | Weight | Tier |
|---|---|---|
| **Airless pump + carton + poly mailer** (measured 2026-08-12) | **3.17 oz** | **4 oz** |
| Same, rev-1 estimate at ~58 g bottle | ~4.8 oz | 8 oz |
| Glass jar + carton + box | ~9.9 oz | 12 oz |

Glass costs only ~$0.16 more than plastic on a single-unit order but is punishing
on bundles: **two glass units land ~18 oz (2 lb tier, $9.95 Z5) against two
plastic units at ~10 oz (12 oz tier) — a $3.43 gap.** Glass jars weigh 4-5x an
equivalent paperboard box and carry breakage risk a poly mailer will not mitigate.
*(2026-08-12, /last30days — ThePkgCo, eFulfillment Service, Lussopack + weight
math, confidence: medium)*

The rev-1 model concluded 4 oz was unreachable — product 50 g + bottle ~58 g +
carton 14 g = 122 g (4.30 oz) before any shipper touched it, so 8 oz was the
floor. **The measured unit is 82 g.** The container is still the airless pump; the
58 g estimate was simply ~30 g too heavy. The single clears the 4 oz tier.

Container weight is the single highest-leverage packaging decision here: ~40 g of
container is worth $0.47/order at the 4→8 oz cliff and, on the 2-pack, $1.10 at
the 8→12 oz cliff. Nothing else in the parcel comes close.

---

## Shipper Selection (decided 2026-08-12)

**PURCHASED: white 9x12 plain poly mailer, 2 mil, self-seal — $43.25 per 1,000
($0.0433/ea) from SupplyHut, ~8 g each. One SKU for both the single and the
2-pack.**

The recommendation history on this decision ran #0 6x10 poly bubble → #1 7.25x12
poly bubble → **9x12 plain poly (bought)**. The bubble analysis below is retained
because the fit rule and the tier math still apply, but the padding premium was
not bought: **plain poly is $0.172/unit cheaper and 13 g lighter than the #1
bubble**, and 13 g × 2 units is what keeps the 2-pack inside the 8 oz tier.

### Is plain poly enough for an airless pump? (open, 2026-08-12)

The container is confirmed as an airless pump, so the mailer is unpadded film
around a pump actuator. Worth being precise about the failure modes rather than
reflexively buying bubble:

| Failure mode | Cause | Does bubble fix it? |
|---|---|---|
| Actuator depressed in transit, product pumps into the carton | axial compression down the parcel stack | **No.** ~3 mm of standoff against a stacked-parcel load. Fixed by a lock-down actuator or an over-cap, and by the actuator sitting *below* the carton's top edge so the folding carton takes the load. |
| Actuator head snapped | point load / drop onto a corner | **Yes, partly.** This is the case padding actually addresses. |
| Bottle body crushed | compression | Not really a risk — an airless cylinder is thick-walled and rigid. |

So the first and most likely failure is a **carton geometry and closure problem,
not a padding problem.** Check that before spending $215 on bubble mailers:

1. Does the pump have an over-cap or a lock/clip actuator? An over-cap is ~$0.05
   and fixes the dominant failure mode outright.
2. Does the actuator sit below the carton's top edge? If it touches the lid, the
   carton transmits stack load straight into the pump and no mailer will help.
3. Drop- and stack-test 3-5 packed units before the first real fulfilment run.

**The fallback is cheap and carries no postage penalty.** Switching to the #1
7.25x12 poly bubble adds 13 g/unit: single 103 g (3.63 oz) and 2-pack 185 g
(6.53 oz) both stay inside the same 4 oz and 8 oz tiers. Cost is $0.172/unit,
~$172 per 1,000. Decide it on the drop test, not on instinct — but know the 1,000
plain mailers already bought are not a trap if the test fails.

⚠️ **9x12 is oversized** for a ~5.8" carton (5.5" bottle). It costs nothing in
postage — see Rule 1 — but the carton will slide inside the mailer and the excess
film has to be folded at pack time. Accepted deliberately: at $0.043/ea the
optionality is free, and one bin beats two.

### Fit rule

SupplyHut lists **outside** W×L. Usable interior ≈ **W − 0.25", L − 1.25"** (seal
flap). For a rigid carton of width `w` and thickness `t`:

- Required interior width ≥ **w + t** (the pocket must bow around the thickness)
- Required interior length ≥ **carton length + 0.5"**

Against a 1.8 × 1.8 × 5.8" carton (bottle measured at 5.5" on 2026-08-12) — single
needs 3.6" × 6.3", 2-pack (side by side) needs 5.4" × 6.3":

| Size | Outside | Est. interior | Single | 2-pack |
|---|---|---|---|---|
| 4×6 plain poly | 4×6 | 3.75 × 4.75 | ✗ | ✗ |
| #000 | 4×8 | 3.75 × 6.75 | ✓ | ✗ |
| #00 | 5×10 | 4.75 × 8.75 | ✓ | ✗ |
| #0 | 6×10 | 5.75 × 8.75 | ✓ | marginal |
| #CD | 7.25×8 | 7.0 × 6.75 | ✓ | ✓ (least waste) |
| #1 | 7.25×12 | 7.0 × 10.75 | ✓ | ✓ |
| **9×12 plain poly (bought)** | **9×12** | **8.75 × 10.75** | **✓** | **✓** |

Note plain poly mailers lose less to the seal flap than bubble, and the interior
is soft — the "interior width ≥ w + t" rule is the binding constraint, not length.

**Rejected: 4x6 poly mailer.** ~4.75" usable length against a ~5.8" carton — it
does not fit. This was the size originally asked about.

### Cost comparison

| Option | Cost/ea | Shipped wt (1 unit) | Tier | Postage |
|---|---|---|---|---|
| **9x12 plain poly, 2 mil (bought)** | **$0.0433** (1,000/$43.25) | **3.17 oz** | **4 oz** | **$6.12** |
| #1 7.25x12 white poly bubble | $0.215 (1,000/$215) | 3.63 oz | 4 oz | $6.12 |
| #0 6x10 poly bubble | $0.130 (1,000/$130) | 3.42 oz | 4 oz | $6.12 |
| 4×4×8 corrugated 32 ECT + void fill | $0.52-0.57 | ~5.0 oz | 8 oz | $6.59 |
| #1 7.25x12 kraft bubble | $0.248 (500/$124) | 3.63 oz | 4 oz | $6.12 |

**At 82 g the mailer choice now does move the tier** — the corrugated box crosses
into 8 oz where every mailer stays at 4 oz. That is a reversal from rev 1, where
all five options landed in the same band.

**Revised rule: at 82 g the parcel sits ~23 g under the 4 oz cliff, so packaging
weight is a live constraint. Anything added to the box — a heavier insert, a
second carton, a branded box — has to be checked against 113.4 g first.**

**Single-SKU discipline:** one mailer size for both tiers buys one bin, no pick
errors, and undivided volume pricing. At $0.0433/ea the cost of oversizing the
single is $0 — plain poly is cheap enough that the discipline is free.

### Open risks

- **Actuator protection in unpadded film** — see the section above. The dominant
  failure mode is a depressed actuator, which is a carton/over-cap problem rather
  than a padding one. Drop-test before the first fulfilment run.
- **Weigh a fully packed, sealed mailer** including insert card and label before
  treating 4 oz as real. Estimated at ~95 g with insert; the cliff is 113.4 g.
- **Sanity-re-weigh once.** 82 g for a filled 50 mL airless pump plus carton is at
  the light end of plausible (implies a ~25-30 g bottle and a ~8-10 g carton).
  It is believable for thin-wall mono-material PP, but it is the single input every
  figure in this article rests on, so it is worth confirming on a second unit.
- **2-pack headroom** is 55 g to the 8 oz cliff — comfortable, but two units plus
  any divider or void fill should still be weighed once.
- 9x12 is oversized for the carton; the carton slides and the excess film folds at
  pack time. Accepted (see above).
- Plain poly is **not curbside recyclable**. Kraft paper padded is, and is more
  on-brand — but it is heavier and would need re-checking against the 4 oz cliff.

### Suppliers

| Supplier | Use | Note |
|---|---|---|
| **SupplyHut** | Poly bubble mailers, poly mailers, kraft padded | **Supplier of record.** 9x12 plain poly 2 mil at 1,000/$43.25 (purchased 2026-08-12). Also #0 6x10 bubble at 500/$69.00, 1,000/$130.00 |
| **PackagingSupplies.com** | Corrugated | 4×4×8 32 ECT, $14.20/25 → $13.07/25 at 10 bundles |
| **EcoEnclose** | Recyclable/custom printed | **Louisville, CO — ~30 min from Denver.** Near-zero inbound freight; first call for anything branded |

A custom-printed E-flute mailer box (8×3×3) was priced at ~$1.30-2.00 in
materials, landing ~$7.90-8.60/order — only ~$0.50 over a plain box if brand
presentation is worth it later.

---

## Shopify Configuration

Weight unit: **grams**. Variant weights are product-only; the package preset
carries the mailer, so do not bake it into both or you double-count.

| Setting | Value |
|---|---|
| Variant weight — 1 Bottle | **82 g** |
| Variant weight — 2 Bottles | **164 g** |
| Package type | Soft package / poly mailer |
| Package dimensions | **9 × 12 × 2 in** |
| Package weight | **8 g** |
| US rate | Single flat rate, `Free shipping`, $0.00, no conditions |

Resulting billed weights: **90 g (3.17 oz)** single → 4 oz tier with 23 g headroom;
**172 g (6.07 oz)** 2-pack → 8 oz tier with 55 g headroom.

With `freeShippingOnAllOrders: true` in `src/config/legal.ts`, Shopify never
calculates a rate — these weights matter only for label accuracy. Remove any
carrier-calculated rates from the US zone.

⚠️ **Check the Rest of World zone.** If it is open at $0.00, international orders
lose $25-50 each.

### Why this cannot be scripted (checked 2026-08-12)

Shopify CLI does **not** configure shipping — it targets app, theme and Hydrogen
development and has no shipping commands. Against the Admin GraphQL API:

| Setting | API | Status |
|---|---|---|
| Package preset | `shippingPackageMakeDefault` / `Update` / `Delete` exist; **no create mutation is documented** | **Admin UI only** |
| Variant weight | `productVariantsBulkUpdate` → `inventoryItem.measurement.weight` | Needs Admin token + `write_products` |
| Delivery profile / rates | `deliveryProfileUpdate` | Needs Admin token + `write_shipping` |

The repo holds only `VITE_SHOPIFY_STOREFRONT_TOKEN` — **read-only**, and there is
no Admin token anywhere in `.env`. Since free shipping means there are no rates to
create, the whole remaining job is one package preset plus two weight fields:
~3 minutes in admin. Standing up a custom app and a write-scoped credential to
automate that is a bad trade and puts a token in a repo that currently has none.
*(2026-08-12, shopify.dev Admin GraphQL mutation reference + repo `.env` audit,
confidence: high)*

---

## See Also

- `kb/wiki/conversion-learnings.md` — contribution margin by tier, why shipping is
  free to the customer, and the subscription cadence fix
- `kb/wiki/launch-timeline.md` — full unit economics table
- `src/config/legal.ts` — `freeShippingOnAllOrders` and `FREE_SHIPPING_PHRASE`,
  the single source of truth for the on-site shipping claim (FTC Mail, Internet,
  or Telephone Order Rule exposure if it drifts)
