---
title: Launch Timeline & GTM
domain: brand
created: 2026-04-03
last_compiled: 2026-08-12
revision: 2
sources: [FAQSection.tsx, Checkout.tsx, SoldOutModal.tsx, EarlyAccessModal.tsx, HeroSection.tsx, StickyCartBar.tsx, GuaranteeSection.tsx, ProductSection.tsx, ExitIntentPopup.tsx, operations/BASE_LAYER_GTM_PLAN.md, checkout browser test + Supabase count query]
codePaths:
  - ~/baselayer-lovable-export/src/components/FAQSection.tsx
  - ~/baselayer-lovable-export/src/components/SoldOutModal.tsx
  - ~/baselayer-lovable-export/src/components/EarlyAccessModal.tsx
  - ~/baselayer-lovable-export/src/components/HeroSection.tsx
  - ~/baselayer-lovable-export/src/components/WaitlistCounter.tsx
  - ~/baselayer-lovable-export/src/components/StickyCartBar.tsx
  - ~/baselayer-lovable-export/src/pages/Checkout.tsx
  - ~/BaseLayer/operations/BASE_LAYER_GTM_PLAN.md
---

## Launch Timeline

**GTM plan date:** 2026-03-13
**Stage at plan time:** Pre-launch, zero revenue, zero customers
**Target ship date (FAQ):** April 2026
**Target ship date (StickyCartBar):** "Ships Spring 2026"

### Pre-Launch Phases (10-week plan from GTM doc)

| Phase | Weeks | Activities |
|-------|-------|------------|
| Foundations | 1-2 | Form Colorado LLC, EIN, bank account, convertible notes, research 3-5 contract manufacturers, request samples, install Meta Pixel + GA4, set up Shopify |
| Product Lock | 3-4 | Evaluate manufacturer samples, test with 10 real people, select manufacturer, finalize formula, get product liability insurance, wire Shopify Buy Button into site, update CTAs from "Reserve" to "Buy Now" |
| Production | 5-6 | Sign manufacturing contract (LLC signs), approve label design (MoCRA compliant), place PO for 1,000 units, build Brevo email flows, file FDA product listing, publish legal pages, set up Google Search Console |
| Ad Prep | 7-8 | Approve production samples, create 5-8 ad creatives, set up Meta ad campaigns (don't launch), test checkout end-to-end, buy fulfillment supplies, build sold-out to Batch 02 waitlist state |
| QC + Receive Inventory | 9 | Receive Certificate of Analysis, inspect 10% of units, ship 5 test orders to friends, set Shopify inventory to 950 (50-unit buffer), confirm sold-out state works |
| Launch | 10 | Flip site from "Reserve" to "Buy Now -- $38", send launch email, post founder announcement, turn on Meta ads at $50/day, ship all Day 1 orders same day |
| Scale | 11-12 | Review ad performance, increase spend to $100-200/day if CAC < $25, request reviews from first customers, begin 3PL research if > 20 orders/day for 3 days |

### Launch Day Schedule

| Time | Action |
|------|--------|
| 06:00 | Final site check -- buy button, price, inventory |
| 06:30 | Send launch email via Brevo |
| 07:00 | Post on personal social channels |
| 08:00 | Turn on Meta ads ($50/day, 3 ad sets) |
| 09:00 | First order check, pixel verification |
| 12:00 | Midday checkout error check |
| 17:00 | Order count, ship everything received by 3pm |
| 21:00 | Ad performance review, kill low-performers (CTR < 0.8%, CPC > $1.50) |

---

## Batch Strategy

### Batch 01

- **Run size:** 1,000 units
- **Model:** Semi-custom manufacturing
- **Product:** Performance Daily Face Cream (BL-PDFC-50ML), 50 mL
- **COGS:** $10/unit
- **Total COGS (incl. packaging, shipping to warehouse):** $12/unit ($12,000 total)
- **Inventory risk:** $10-12K
- **Fulfillment:** Self-fulfill (at peak 15-18 orders/day = 1-2 hours work)
- **3PL trigger:** 20+ orders/day for 3 consecutive days
- **Shopify inventory set:** 950 units (50-unit buffer for QC/testing)
- **Sell-through target (aggressive):** 10-12 weeks
- **Sell-through target (moderate):** 14-16 weeks

### Batch 02

- **Run size:** 2-3K units (up to 5K if home-run scenario)
- **Model:** Semi-custom refined
- **COGS target:** $7-8/unit
- **Gross margin target:** 77-79%
- **Timeline:** Month 4-5
- **Price:** $48 retail (price increase from founding)
- **Trigger for PO:** Based on Batch 01 velocity data, placed at ~100 units remaining

### Batch 03+

- **Run size:** 10K+ units
- **Model:** Full-custom (owned IP)
- **COGS target:** $5-7/unit
- **Gross margin target:** 82-87%
- **Timeline:** Month 9-12

### Batch 01 Outcome Scenarios

| Outcome | Probability | Signal | Next Action |
|---------|-------------|--------|-------------|
| Home Run: sells out 4-6 weeks, CAC < $15, returns < 5% | 10% | Product-market fit | 5K unit Batch 02, raise more capital, start full-custom dev |
| Solid Single: sells out 10-16 weeks, CAC $18-30, returns 5-10% | 50% | Promising, needs data | 2-3K unit Batch 02, optimize based on #1 complaint |
| Grind: 20+ weeks, CAC > $30, returns 10-15% | 30% | Offer/product problem | Stop ads, talk to every returner AND reorderer, reformulate before Batch 02 |
| Wipeout: < 200 sold in 12 weeks, CAC > $50, returns > 15% | 10% | No PMF | Pivot positioning, reformulate, or wind down |

---

## Pricing Strategy

### Current Pricing

- **Founding price:** $38 (displayed on site as primary price)
- **Retail / strikethrough price:** $48 (displayed as line-through on HeroSection and StickyCartBar)
- **Discount framing:** "21% off" (StickyCartBar)
- **Shipping:** Free over $50, standard $5.99, express $9.99

### Price Anchoring on Site

- HeroSection: `$48` strikethrough + `$38` bold + "Founding Price" label
- StickyCartBar: `$48` strikethrough + `$38 (21% off)` + "Ships Spring 2026"
- ProductSection CTA: "RESERVE BATCH 01 . $38"
- GuaranteeSection: "ONE BOTTLE. $38. NO DOWNSIDE."
- EarlyAccessModal: "Pre-launch pricing at $38"
- Confirmation: "Early access secured at $38"
- Multiple CTAs across site: "$38" anchored in button copy

### Price Increase Plan

- **Batch 01:** $38 founding price
- **Batch 02 (month 4-5):** Raise to $48 retail
- **Repeat purchases at $48:** Second purchase at retail price, lower shipping cost, $0 CAC

### Unit Economics at $38

| Line Item | Per Unit | Total (1,000 units) |
|-----------|----------|---------------------|
| Revenue | $38.00 | $38,000 |
| Total COGS | ($12.00) | ($12,000) |
| Gross Margin | $26.00 (68.4%) | $26,000 |
| Total Fulfillment | ($7.00) | ($7,000) |
| Contribution Margin (pre-marketing) | $19.00 (50%) | $19,000 |
| **Breakeven CAC** | **$19** | -- |

### Waitlist Incentive

- **SoldOutModal offers:** 15% off for waitlist signups at checkout intercept
- **Waitlist counter:** Hardcoded display floor of 387 in SoldOutModal, live Supabase count in WaitlistCounter component

---

## Pre-Order / Waitlist Flow

### Current Site State (as of 2026-04-03)

The site is in **pre-launch / waitlist mode**. There is no live checkout -- the checkout page immediately shows a SoldOutModal. All CTAs funnel into email capture.

### Email Capture Points

| Entry Point | Component | Source Tag | Behavior |
|-------------|-----------|------------|----------|
| Hero inline form | HeroSection.tsx | `hero_inline` | Email capture, shows "Allocation Secured. Check your inbox for Batch 01 details." |
| "RESERVE BATCH 01" button (product section) | EarlyAccessModal via ProductSection | `early_access` | 3-step modal: email -> confirm + survey -> done |
| "RESERVE MY BOTTLE" button (guarantee section) | EarlyAccessModal via GuaranteeSection | `early_access` | Same modal flow |
| "GET STARTED" (testimonials section) | EarlyAccessModal | `early_access` | Same modal flow |
| "GET MY BOTTLE" (payoff section) | EarlyAccessModal | `early_access` | Same modal flow |
| "SAVE MY SPOT" (sticky cart bar) | EarlyAccessModal via StickyCartBar | `early_access` | Same modal flow |
| Exit intent popup | ExitIntentPopup.tsx | `exit_intent` | Desktop-only, fires on mouse leave, "NOTIFY ME" CTA |
| Checkout intercept | SoldOutModal via Checkout.tsx | `checkout` | Captures full checkout data (name, address, cart, shipping method) alongside email |

### EarlyAccessModal Funnel (3 screens)

1. **Email capture:** "GET EARLY ACCESS" -- "Pre-launch pricing at $38. One email when we launch. No spam."
2. **Confirmation + survey:** "YOU'RE IN" -- Reserve toggle ("Reserve a bottle for me") + inline survey (3 questions: biggest skin issue, ideal price, product preference). Partial survey submissions accepted.
3. **Done:** "YOU'RE SHAPING THE FIRST DROP" / "YOU'RE ALL SET" -- Instagram follow CTA

### SoldOutModal / Checkout Intercept

- Checkout.tsx sets `showSoldOut = true` immediately on render
- Modal headline: "WE SOLD OUT FASTER THAN EXPECTED"
- CTA: "GET EARLY ACCESS + 15% OFF"
- Captures full checkout context (name, address, cart items, cart total, shipping method) into Supabase `waitlist` table
- Hardcoded counter: "387 people already waiting" (pre-submission), "388 people on the waitlist" (post-submission)

### WaitlistCounter Component

- Live counter querying Supabase `waitlist` table (exact count)
- Supports configurable `floor` prop to avoid showing low early numbers
- Supabase Realtime subscription for live increment on new signups
- Animated count-up from 0 on page load

### Data Capture Strategy

| Data Point | Source |
|------------|--------|
| Email | All entry points |
| First/last name | Checkout intercept only |
| Full shipping address | Checkout intercept only |
| Cart items + total | Checkout intercept only |
| Shipping method | Checkout intercept only |
| Biggest skin issue | EarlyAccessModal survey |
| Ideal price point | EarlyAccessModal survey ($28 / $38 / $45 options) |
| Product preference | EarlyAccessModal survey (one moisturizer / 2-step AM / full 3-4 step system) |
| Reserve intent | EarlyAccessModal reserve toggle |

---

## Positioning & Waitlist Update (2026-07-07, checkout browser test + Supabase count query)

**Subscribe & Save repositioning:** Subscribe & Save was added as an OPTIONAL tier alongside the 1-bottle/$38 and 2-bottle/$68 options. All absolute "no subscription" copy was reconciled to "no subscription required" / "never locked in"; FAQ answers were rewritten accordingly. The anti-subscription WEDGE (see `kb/wiki/ad-strategy.md` and `kb/wiki/customer-insights.md` Objection 7) is retained, but reframed as anti-*forced*-subscription rather than anti-subscription absolutely. **Open item:** Sanity CMS articles (e.g. `no-subscription-model`) and comparison pages may still carry the old absolute claims — needs a CMS content pass.

**Real waitlist count vs. displayed floor:** As of 2026-07-07 the real waitlist was **13 emails** (Supabase count). This is well below the `WaitlistCounter` component's configurable display floor of 387 documented above — the floor exists precisely to avoid showing low early numbers, so this is not a contradiction of that mechanism, just a data point on how early the list still was at this date.

**Social proof claim removal (superseded, see also `kb/wiki/customer-insights.md`):** All "1,000+ reviews" / "4.8-star" claims were removed sitewide as of 2026-07-07 and replaced with true "Founding Batch 01 = 1,000 bottles" scarcity framing (production-run count, not review count). `kb/wiki/customer-insights.md`'s Social Proof Data Points table (as compiled 2026-04-03) predates this change and has been marked superseded there as of 2026-08-12, once code-level confirmation surfaced (see `customer-insights.md` for the correction).

**Testimonial authenticity flag:** Testimonial cards (Sean/Marcus/Cooper, see `kb/wiki/customer-insights.md`) were kept through this copy pass but their authenticity is unverified — founder must confirm real testers or replace before further reliance on these quotes as social proof.

---

## Go-to-Market Channels

### Primary Channels

1. **Meta Ads (Facebook/Instagram):** Primary paid acquisition. Start $50/day, scale to $100-300/day based on CAC. Risk: account suspension for skincare claims.
2. **Email (Brevo):** Pre-launch list building at $0.35 CPC for email capture. Launch day email blast. Post-purchase flows (day 1/7/21), reorder flows (day 35/45). 15% conversion rate target from email list on launch day.
3. **SEO / Organic:** 70+ articles already published. Compounding organic traffic target: 30-40% of traffic by month 6-8.
4. **Founder-led social:** Personal Instagram, LinkedIn. Founder content gets 2.3x engagement and 41% lower CPA vs generic UGC.

### Backup Channels

- **Google Ads (search + shopping):** Backup if Meta account flagged. Expand intentionally at month 6-8.
- **TikTok:** Evaluate at month 6-8 if founder content performs.

### Month 4-5 Additions

- Referral program (give $10, get $10)
- Freelance Meta ads buyer if spend > $5K/mo

### Month 9-12 Additions

- Wholesale conversations if DTC proven

### Email List Accelerator Model

| List Size at Launch | Expected Week 1 Orders (15% CVR) | CAC |
|---------------------|-----------------------------------|-----|
| 500 emails | 75 units | $0 |
| 1,000 emails | 150 units | $0 |

**Pre-launch email capture CPC:** $0.35 vs cold purchase CPC of $0.50-0.80. Every email captured pre-launch = ~$5.70 customer vs ~$20-25 from cold ads.

---

## Key Milestones

| Milestone | Timing | Success Metric |
|-----------|--------|----------------|
| Colorado LLC formed | Pre-launch week 1 | Entity active, EIN obtained |
| Manufacturer selected | Pre-launch week 3-4 | Samples tested with 10 real people |
| Batch 01 PO placed | Pre-launch week 5-6 | 1,000 units ordered |
| Site flipped to "Buy Now" | Launch day | Checkout live, Shopify inventory set |
| Email list launch blast | Launch day | 15% conversion rate target |
| Meta ads live | Launch day | $50/day starting spend |
| 50-100 reviews collected | Month 1-3 | Social proof for ads and site |
| First reorder data | Month 2-3 | 90-day repeat purchase rate signal |
| Batch 01 sold out | Month 3-4 (moderate) | 1,000 units moved |
| Price increase to $48 | Month 4-5 (Batch 02) | Founding price ends |
| Organic traffic at 30%+ | Month 3-6 | SEO compounding from 70+ articles |
| 3PL onboarded | When 20+ orders/day for 3 days | Self-fulfillment outgrown |
| Batch 02 PO placed | At ~100 units remaining | Based on velocity data |
| Referral program live | Month 4-5 | Give $10 / get $10 |
| SKU #2 evaluation | Month 6-8 | Based on customer data and feedback |
| $25-40K/mo revenue | Month 9-12 | Sustainable growth proven |
| C-Corp conversion (if raising) | Month 9-12 | $250K+ institutional round trigger |

### Critical Metrics to Prove During Batch 01

1. **90-day repeat purchase rate > 25%** -- proves product-market fit
2. **Blended CAC < $25** -- proves acquisition economics
3. **Return rate < 10%** -- proves product quality
4. **Organic traffic mix > 30% by month 3** -- proves sustainable growth

---

## Current Status (as of 2026-04-03)

**Phase:** Pre-launch / waitlist collection
**Site state:** All purchase CTAs funnel to email capture (EarlyAccessModal or HeroSection inline form). Checkout page intercepts with SoldOutModal. No live transactions.
**GTM plan written:** 2026-03-13
**FAQ ship date published:** "First batch ships April 2026"
**CTA language on site:** "RESERVE BATCH 01", "GRAB YOURS", "SAVE MY SPOT", "GET EARLY ACCESS"
**Checkout backend:** Shopify Buy Button planned (not yet integrated -- current checkout is visual-only with disabled payment fields)
**ESP:** Brevo (set up, email-subscribe edge function active via Supabase)
**Waitlist data:** Stored in Supabase `waitlist` table with real-time counter
**Survey data:** Stored in Supabase `survey_responses` table

### What Remains Before Launch

- Shopify store setup with live payment processing
- Product liability insurance ($1M policy)
- FDA MoCRA product listing filed
- Label compliance (full INCI list, net weight, mfg address, adverse event contact)
- Terms of Service, Privacy Policy, Return Policy published on site
- Manufacturing contract signed and PO placed
- Inventory received and QC'd
- Meta ad campaigns built (not launched)
- Brevo email flows built (welcome, post-purchase, reorder)
- Flip CTAs from "Reserve" to "Buy Now"

---

## 12-Month Roadmap Summary

| Period | Focus | Revenue Target | Key Actions |
|--------|-------|----------------|-------------|
| Month 1-3 | Batch 01 Validation | Sell 1,000 units at $38 | Collect reviews, establish baseline metrics, first reorder data |
| Month 4-5 | Batch 02 Optimization | Scale revenue | 2-3K unit order, raise price to $48, launch referral program, evaluate 3PL |
| Month 6-8 | Growth | $15-25K/mo | Organic at 30-40%, expand to Google Ads, test TikTok, evaluate SKU #2 |
| Month 9-12 | Scale or Niche | $25-40K/mo | Batch 03-04 at 5K+ units, consider seed raise / C-Corp conversion, begin wholesale if DTC proven |
