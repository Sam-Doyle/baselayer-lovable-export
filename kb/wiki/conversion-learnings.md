---
title: Conversion Learnings
domain: conversion
created: 2026-08-12
last_compiled: 2026-08-12
revision: 1
sources: [experiments, code, research]
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

*Cross-reference: see the "Breakeven Math" subsection of `kb/wiki/ad-strategy.md` for the general breakeven-ROAS formula this analysis applies.*

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

## See Also

- `kb/wiki/ad-strategy.md` — platform/creative ad strategy, ROAS benchmarks, peptide-maxxing angle
- `kb/wiki/seo-strategy.md` — organic and technical SEO
- `kb/wiki/customer-insights.md` — objection bank and customer language
