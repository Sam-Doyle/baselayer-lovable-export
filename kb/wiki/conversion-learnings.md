---
title: Conversion Learnings
domain: conversion
created: 2026-08-12
last_compiled: 2026-08-12
revision: 4
sources: [experiments, code, research, verified USPS + SupplyHut landed shipping cost rebuild, measured packed-unit weight 2026-08-12]
---

# Conversion Learnings

CRO and conversion-rate findings for Base Layer — unit economics decisions, cold-traffic landing page research, and advertorial-specific learnings. Complements `kb/wiki/ad-strategy.md` (platform/creative strategy) and `kb/wiki/seo-strategy.md` (organic).

---

## ROAS Levers & Traffic Routing (2026-08-11, /last30days research — Triple Whale, convertcart, easyappsecom ROAS guides, confidence: medium)

Three fastest ROAS levers, in order:
1. **Raise AOV via bundles/upsells** — a 10% AOV lift is a 10% ROAS lift with zero ad changes.
2. **Cut CPA via creative and landing page.**
3. **Shift budget from low- to high-ROAS audiences.**

Sending paid traffic to the homepage suppresses ROAS versus a PDP or a dedicated landing page — this validates the Hero → PDP routing decision already implemented on this site. Suggested budget split: 60% prospecting, 25% retargeting, 15% creative testing. Test creative at $50-100 per variant before scaling.

---

## Pricing & Shipping Threshold Economics (2026-08-11, unit-economics model at COGS $10 + Shopify Help Center free-shipping/automatic-discount docs, confidence: high)

Base Layer moved the PDP default from the $38 single bottle to the $68 2-pack and put shipping behind a $50 threshold (subscriptions exempt). The economics driving it: at COGS $10 and ~$5.50 landed shipping, a single bottle carries ~$21.10 contribution (breakeven ROAS 1.80x) while the 2-pack carries ~$38.73 (breakeven 1.76x) — the CAC ceiling nearly doubles while breakeven ROAS stays flat, so the same ad spend buys a materially better customer.

**Free-shipping threshold construction:** Shopify natively supports both halves as automatic discounts — a Free Shipping automatic discount with "Minimum purchase amount" for the $50 rule, and a second one with "Purchase type: Subscription" for the subscribe-and-save exemption. No Shopify Function or second shipping profile is required. The account limit is 25 active automatic discounts and Shopify applies the best applicable one, so the two coexist safely.

**Watch metric:** shipping fees at checkout are a top cart-abandonment driver, so the single-bottle tier's conversion rate is the metric that decides whether the $50 threshold nets out positive.

> ⚠️ **SUPERSEDED 2026-08-12 — the $50 threshold no longer exists.** Commit `fb4814a` ("free shipping on all orders, subscription discount moves to retention") removed it; `814c647` had introduced it one commit earlier. Shipping is now unconditional on every order and the subscription discount is a retention lever rather than a shipping exemption. Code truth is `FREE_SHIPPING_PHRASE` in `src/config/legal.ts`, which exists specifically so this phrase is stated once — a stale "free shipping over $50" anywhere on the site is an FTC Mail/Internet/Telephone Order Rule mismatch. The 2-pack contribution economics above still hold and still justify the $68 default; only the threshold mechanism is dead, and the "watch metric" note is now moot. (2026-08-12, git log + src/config/legal.ts)

> ⚠️ **CORRECTED 2026-08-12 — the contribution figures above are overstated on single-unit tiers.** The `$5.50 landed shipping` input was an estimate and is wrong. Verified cost from Denver is **$8.10**: USPS Ground Advantage 8 oz tier at a $6.59 zone-blended below-Commercial rate (12% rural weighting) plus ~$1.51 in mailer, label, insert and tape. With COGS at $9 (Sam, 2026-08-12, superseding the $10 modelled here):
>
> | Tier | Old CM | **Real CM** | Old BE ROAS | **Real BE ROAS** | Ship % rev |
> |---|---|---|---|---|---|
> | 1 bottle $38 | $21.10 | **$19.50** (51.3%) | 1.80x | **1.95x** | 21.3% |
> | 2-pack $68 | $38.73 | **$39.24** (57.7%) | 1.76x | **1.73x** | 12.5% |
> | Subscribe $35 | $18.19 | **$16.58** (47.4%) | 1.93x | **2.11x** | 23.1% |
>
> **The error only bites single-unit tiers.** Two bottles ride one 12 oz parcel ($6.79 postage vs. $6.59 for one), so the 2-pack amortises shipping and its old estimate happened to land within $0.51. The directional conclusion of the section above therefore survives intact — the 2-pack default is still right, and by a slightly wider margin than originally argued. What does not survive is any media decision made against the old single-unit breakevens.
>
> **Live implication:** the $35 subscription is now the *worst*-margin tier on a customer we want the most LTV from, and a 50ml bottle at ~1ml/day is ~7 weeks of product against a 6-week cadence — so the plan over-ships. Moving the plan to **2 bottles / $70 / every 12 weeks** holds price-per-bottle and consumption constant, halves shipments, and lifts contribution with no price change to the customer. Untested; it is a Shopify admin edit, not a code change.

> ✅ **REVISED AGAIN 2026-08-12 (same day) — a packed unit was weighed, and both tiers drop a USPS band.** Sam measured carton + filled container at **82 g** and bought the **9x12 plain poly mailer (~8 g, $0.0433/ea)** rather than the #1 bubble the correction above priced at $0.215. Shipped weight is therefore **90 g / 3.17 oz single (4 oz tier)** and **172 g / 6.07 oz 2-pack (8 oz tier)** — one band better than the corrected figures, two better than the original estimate. Landed shipping: **$7.46 single, $8.12 2-pack.**
>
> | Tier | Original est. | Corrected | **Measured** | **BE ROAS** | Ship % rev |
> |---|---|---|---|---|---|
> | 1 bottle $38 | $21.10 | $19.50 | **$20.14** (53.0%) | **1.89x** | 19.6% |
> | 2-pack $68 | $38.73 | $39.24 | **$39.61** (58.2%) | **1.72x** | 11.9% |
> | Subscribe $35 | $18.19 | $16.58 | **$17.23** (49.2%) | **2.03x** | 21.3% |
>
> The 2-bottle/12-week subscription proposal above is worth **$41.55 per 12 weeks** against $34.46 on the current plan (+$7.09, +21%). Still the highest-return untested move on the list.
>
> **The methodological point outranks the numbers.** This tier went $5.50 (assumed) → $8.10 (carrier tables) → $7.46 (scale). The middle step was worth doing — it caught a live media-buying error where breakeven was 2.11x against a claimed 1.93x. The third step was worth doing because it moved landed cost more than any pricing decision made this month. **Do not model unit economics on an unweighed parcel.**
>
> ✅ **FINAL 2026-08-12 — postage rebuilt from quoted rates, not tables.** Four Shopify Shipping quotes at 82 g from 80206: Berkeley $5.48 (Z5), NYC $5.62 (Z7), Juneau AK $5.97, rural White Sulphur Springs MT **$7.46**. Blended at 12% rural = **$5.78**, landed **$7.12 single / $7.75 2-pack**.
>
> | Tier | Landed | **CM** | Margin | **BE ROAS** |
> |---|---|---|---|---|
> | 1 bottle $38 | $7.12 | **$20.48** | 53.9% | **1.86x** |
> | 2-pack $68 | $7.75 *(est.)* | **$39.98** | 58.8% | **1.70x** |
> | Subscribe $35 | $7.12 | **$17.57** | 50.2% | **1.99x** |
>
> **Two structural findings, both of which change how to think about shipping rather than just the number:**
> 1. **Zone is nearly irrelevant.** Zone 5 → Zone 7 costs $0.14 at 82 g. Every prior revision blended across a Denver zone map; that was solving the wrong problem.
> 2. **Rural ZIPs are the only material variable, at +36%.** This was the one input flagged as least certain in the prior revision, and it is the one that held (predicted +32%, measured +36%). Alaska, predicted as a penalty lane, came in at only +9% — that prediction was wrong.
>
> The blend is insensitive to the rural weighting, which remains unmeasured: 5% rural → $5.65, 20% → $5.94. No need to pin it down.
>
> ⚠️ **One estimate left:** the 2-pack's $6.22 postage is scaled from the 4→8 oz step, not quoted. Re-run the four ZIPs at 164 g to close it. Prediction to test: if rural bills at the top sub-1-lb rate regardless of weight, rural 2-pack should quote the same $7.46.

> ✅ **Container confirmed (Sam, 2026-08-12): airless pump.** An earlier note here doubted that, on the reasoning that 82 g minus ~50 g product and ~14 g carton leaves ~18 g of container — tube territory. The bad input was the ~58 g empty-bottle estimate, not the scale reading; a thin-wall mono-material PP airless at 50 mL runs 25-30 g. **The figures above stand and are safe to buy media against.** What the confirmation does change is packaging: the mailer is unpadded 2-mil film around a pump actuator, which is a protection question tracked in `kb/wiki/shipping-economics.md`, not an economics one — the bubble-mailer fallback costs $0.172/unit and stays inside the same USPS tiers.

*Cross-reference: see the "Breakeven Math" subsection of `kb/wiki/ad-strategy.md` for the general breakeven-ROAS formula this analysis applies. Verified shipping inputs live in `kb/_inbox.md` entries dated 2026-08-12 targeting `shipping-economics`.*

---

## Cold Traffic Landing Page Research (2026-08-12, /last30days research, confidence: medium)

### Pre-Sell Pages vs. PDPs

Pre-sell pages (advertorial/listicle) convert 2-3x higher than PDPs for cold traffic; PDPs run 1.8-2.5% on cold paid clicks, and paid social averages 1.1% overall (Eightx 2026 benchmark). Advertorials suit problem-aware cold traffic; listicles suit comparison-ready warmer traffic. Collection pages beat single PDPs for cold traffic when the catalog is wide — not applicable to Base Layer's single-SKU catalog.

### Message Match

Message match is the #1 cited high-CTR/low-CVR killer — the ad headline should mirror the lander H1, the same product should appear in ad and hero, and the offer should sit above the fold. **Case study:** Bloom (Shark Tank keycard, per @sariabuhamad on X) went 4.3%→6.6% CVR (+54%, zero added spend) by building angle-specific landers instead of pointing every ad angle at one homepage.

### 2026 Meta Account Structure Consensus

3-4 campaigns max (broad prospecting / retargeting / retention), test 15-25 creatives/month, scale budget 15-20% every 3-4 days.

### On What Actually Drives Conversion

Blue Sense Digital (YouTube): "conversion rate is an output of ~50 variables, most of which sit nowhere near your landing page" — offer, traffic quality, and creative angle matter more than on-page tweaks.

*Source: raw research includes X, YouTube, and web (Reddit 403'd this run).*

---

## Advertorial Creation Findings (2026-08-12, /last30days run — "creating high converting advertorials for mens skincare"; raw at `~/Documents/Last30Days/creating-high-converting-advertorials-for-mens-skincare-raw-v3.md`, confidence: medium)

**Structure consensus (X):** Hook → Problem → Education → Proof → Offer → CTA; "when done right it doesn't feel like advertising, it feels like discovering the solution yourself" (@IsmailLate52662, 25 likes).

**Story-led, not pitch-led:** "Most brands have a traffic problem… until they realize they actually have a trust problem" (@Divancedesign, 34 likes); stories capture attention, build trust, and answer objections (@techedigitals, 37 likes).

**Format-to-warmth matching:** advertorials fit cold/skeptical problem-aware traffic (4-6 min time on page, lower CTR); listicles fit warm comparison traffic (90-120s, higher CTR). Snow Teeth Whitening scaled on "reasons why" listicles; Jones Road uses listicles for warm traffic and editorial/quiz for cold.

**2026 DTC copy frameworks:** Hook→Promise→Proof, Problem→Pivot→Payoff (cold acquisition), Identity→Tribe→Status. AG1 runs 59% of its active US ads on one template ("in 30 seconds" hook × benefit stack).

**Native statics feed advertorials:** the ad doesn't look like an ad → the advertorial does the selling → the sales page closes (@fromzerotomill).

**Proof discipline:** "Advertorial is the hardest form of copywriting… because the proof has to hold up. Every claim backed by research" (@SeharFDRC).

**Men's skincare specifics:** ingredient education converts (see COSRX's creator-led explainer format); Gen Z men are the biggest spenders (42% devote a larger share of income to grooming vs. 29% of millennials); peptides/niacinamide/retinol/ceramides are now table stakes in male-positioned formulas. Replo is the dominant page-builder tool among X advertorial designers.

---

## Peptide-Led Creative — Objection Handling (2026-08-12, Sam interview, confidence: medium — UNTESTED, needs paid validation)

Two objection-handling decisions made for the peptide-led creative angle (paired with the "Peptide-Maxxing Ad Angle" section of `kb/wiki/ad-strategy.md`):

1. **Don't fight on concentration.** The 0.03% GHK-Cu number loses a concentration duel against brands advertising higher percentages, so the play is to reframe to the full stack of six actives with all six concentrations published, and argue that a peptide is a signal molecule rather than a solvent you use more of.
2. **The villain is delay, not a competitor.** Peptides are framed as maintenance you start before you need it, with the honest split being that men who start at 32 are maintaining while men who start at 45 are trying to reverse.

**Status: untested, needs paid validation before being treated as a proven learning** — flagged low-confidence per source instructions until validated.

---

## Technical: Advertorial Hero Image Layout (2026-08-12, PeptideStack.tsx build, measured in dev at 1280px, confidence: high)

Advertorial hero images need an explicit height cap. The source-kit product renders are 1000x1500 (2:3), and at `w-full h-auto` inside the 800px article column that draws 1125px tall, pushing the opening hook entirely below a 900px fold. **Fix:** `w-auto h-auto max-h-[440px] max-w-full object-contain` on a centered flex container. Worth checking on any advertorial that uses portrait product photography.


---

## Concentration Framing: A Live Contradiction, Flagged Not Blended (2026-08-12, ConcentrationTest.tsx build vs. this article's prior conclusion, confidence: medium)

This article previously concluded: **don't fight on concentration**, because 0.03% GHK-Cu loses a percentage duel against brands advertising higher numbers — reframe to the six-active stack. `/article/concentration-test` deliberately does the opposite.

The unlock is that the published GHK-Cu literature works in a **0.01%–1% effective range**, so 0.03% sits *inside* the researched band. That turns the number from a liability into proof, and changes the argument from "ours is bigger" (which loses) to **"a percentage means nothing without the band the research used, and almost no men's brand publishes either."**

Two live advertorials now run opposing arguments about the same ingredient: `/article/peptide-stack` argues breadth, `/article/concentration-test` argues dose-in-context. **Usable as an A/B, but it should be a deliberate one — don't scale spend behind both without deciding which claim the brand stands behind.** Untested; needs paid validation.

## Safer Construction for Competitor Comparison Tables (2026-08-12, ConcentrationTest.tsx build vs. live ComparisonTable.tsx, confidence: high)

Make every row a claim about **what a brand publishes**, never about what its formula contains.

- ✅ "Brickell states no active concentrations" — checkable against their own product page.
- ❌ "Brickell contains no niacinamide" — a formulation claim the brand can't defend from public information.

The live `ComparisonTable.tsx` uses the stronger presence/absence framing. The disclosure-only framing is strictly more conservative *and* lands harder on a transparency angle, because **the absence of a published number is itself the argument.** Pair it with a dated "as reviewed [month]" footnote plus an explicit line that the table describes disclosure practice, not formulation quality.

---

## See Also

- `kb/wiki/ad-strategy.md` — platform/creative ad strategy, ROAS benchmarks, peptide-maxxing angle
- `kb/wiki/seo-strategy.md` — organic and technical SEO
- `kb/wiki/customer-insights.md` — objection bank and customer language
