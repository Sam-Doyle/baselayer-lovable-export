---
title: Ad & Marketing Strategy
domain: marketing
created: 2026-04-03
last_compiled: 2026-08-12
revision: 2
sources: [ads/AI_CREATIVE_SYSTEM.md, ads/CLAUDE.md, marketing/ads/, marketing/strategy/, marketing/social/, advertorial/, content/CLAUDE.md, /last30days research (hawky.ai, prooflytics, adamigo.ai, dtcroas.com, usedaymark.io, shopify-fee-calc.com, Eightx, Shopify MER blog), subagent research (native statics), Sam interview]
codePaths:
  - ~/BaseLayer/ads/AI_CREATIVE_SYSTEM.md
  - ~/BaseLayer/ads/CLAUDE.md
  - ~/BaseLayer/marketing/ads/brief-one-product-simplicity-2026-03-18.md
  - ~/BaseLayer/marketing/ads/hooks-one-product-simplicity-2026-03-18.md
  - ~/BaseLayer/marketing/ads/variations-2026-03-18.md
  - ~/BaseLayer/marketing/ads/meta-ad-specs.md
  - ~/BaseLayer/marketing/ads/IG_AD_AUDIT_IMPLEMENTATION_CHECKLIST.md
  - ~/BaseLayer/marketing/strategy/CONVERSION_STRATEGY.md
  - ~/BaseLayer/marketing/strategy/FOUNDING_BATCH_LAUNCH_PLAYBOOK.md
  - ~/BaseLayer/marketing/strategy/conversion-playbook-2026-03-19.md
  - ~/BaseLayer/marketing/social/SOCIAL_CONTENT_PLAYBOOK.md
  - ~/BaseLayer/advertorial/DESIGN.md
  - ~/BaseLayer/advertorial/stitch-prompt.md
---

# Ad & Marketing Strategy

## Ad Platform Strategy

### Primary Platform: Meta (Instagram + Facebook)

**Campaign objective:** Drive first purchase among men 25-40 at <$25 CAC
**Current phase:** Pre-launch, founding batch (1,000 units at $38, retail $48)
**Primary CTA:** "GET BATCH 01 -- $38"
**Meta Pixel ID:** `916078074161719`

### Meta Ad Specs (Quick Reference)

| Placement | Dimensions | Ratio | Best For |
|---|---|---|---|
| Feed (recommended) | 1080x1350 | 4:5 | Highest CTR (~1% above average) |
| Feed (square) | 1080x1080 | 1:1 | Works across 80% of placements |
| Stories/Reels | 1080x1920 | 9:16 | Full-screen vertical |
| Audience Network | 1200x628 | 1.91:1 | External placements |
| Carousel (per card) | 1080x1080 | 1:1 | All cards must match |

**Stories/Reels safe zones:** Top 14% clear (profile info), bottom 20-35% clear (CTA/captions), sides 6% each.
**Character limits:** Primary text visible 125 chars (max 2200), headline visible 40 chars, link description 30 chars.

### Performance Benchmarks (DTC Skincare)

| Metric | Skincare DTC | All-Industry Median |
|---|---|---|
| CPM | $14.20 (Q4) | $13.48 |
| CPC | $1.70 | $1.72 |
| CTR | ~0.93% | 0.90% |
| CPA | -- | $38.17 |

**Placement performance:**

| Placement | CTR | CPC | CPM | Best For |
|---|---|---|---|---|
| Facebook Feed | 1.11% | ~$2.50 | ~$16 | Consistent long-term |
| Instagram Feed | 0.22-0.88% | $3.35 | ~$16 | Upper-funnel awareness |
| Instagram Stories | 1.34% | $1.83 | $10-12 | Quick CTAs |
| Reels (FB + IG) | Spikes early | Lowest | $10-12 | Awareness at lowest CPM |

### Creative Fatigue Thresholds

| Signal | Threshold | Action |
|---|---|---|
| Frequency (cold) | >2.5 | Refresh creative or expand audience |
| Frequency (retargeting) | >4.0 | Rotate creative |
| CTR decline | >15% WoW | Creative fatigue likely |
| CPA increase | 2x historical | Meta flags "Creative Fatigue" |
| Refresh cadence (small audience) | Every 3-4 days | High-budget, narrow audience |
| Refresh cadence (broad audience) | Every 2-3 weeks | Larger audiences sustain longer |

---

## 2026 Paid Acquisition Benchmarks (2026-08-11, /last30days research, confidence: medium)

### ROAS Benchmarks by Channel

Google Ads median ~3.5-3.7x (Shopping 4-8x), Meta ~1.86-2.2x (2-4x on direct attribution), TikTok ~1.4x. Beauty & personal care industry benchmark ~4.2x. Meta B2C is strongly seasonal: 4-5x in Q4, 2-2.5x in Jan/Feb, 3-3.5x in summer. **Caveat:** attribution windows are not comparable across platforms (Google 30-day click vs. Meta 7-day click + 1-day view), so raw platform ROAS cannot be ranked head-to-head. (Source: hawky.ai, prooflytics, adamigo.ai, dtcroas.com — full raw output at `kb/raw/research/2026-08-11-shopify-apps-and-roas-benchmarks.md`.)

### Breakeven Math (the number that actually matters for a new store)

Breakeven ROAS = 1 / gross margin. A DTC skincare brand at 65% gross margin and $55 AOV breaks even at ~1.5x; at 35% COGS with Shopify Payments it lands ~2.0-2.5x. Breakeven blended MER = 1 / contribution margin (30% CM → MER 3.3; 40% CM → 2.5). Healthy blended MER target is 3.0-5.0. **Base Layer needs its own version of this calculated from real COGS + shipping + Shopify fees before any spend target is set** — see the "Pricing & Shipping Threshold Economics" section of `kb/wiki/conversion-learnings.md` for the current best estimate. (Source: usedaymark.io, shopify-fee-calc.com, Eightx, Shopify MER blog.)

---

## Target Audience Segments

**Primary ICP:** Men 25-35, active lifestyles, skincare newcomers or skeptics

| Segment | Name | Key Pain Point | Best Hook Type |
|---|---|---|---|
| Segment 1 | The Gym Bro | Visible skin problems, greasy products | Performance framing, post-workout angle |
| Segment 2 | The Career Climber | Confidence for professional outcomes | Aspiration, Zoom call angle |
| Segment 4 | The Reddit Researcher | Doesn't trust brands, wants transparency | Ingredient callout, percentage transparency |
| Broad | The Dating-Motivated | Wants to look better for partner | Social proof, "girlfriend noticed" |
| Broad | The Aging-Concerned 35+ | Wrinkle prevention | Fear + prevention framing |
| Broad | Subscription-Burned | Burned by auto-renew traps | Anti-subscription anger |

### Top Pain Points (ranked by frequency)

1. Visible skin problem (dryness, oiliness)
2. Greasy/heavy products
3. Too complicated / too many steps
4. Wasted money on products that sit unused
5. Never seen results from skincare
6. Don't trust brands -- all hype
7. Don't want a subscription

### Top Objections

- "It's too complicated" -- #3 objection, highest barrier to entry
- "I don't trust skincare brands -- they're all hype" -- #8 objection, 42% check labels
- "Don't want a subscription" -- #10, burned by Lumin/Tiege auto-renew

---

## Creative Approaches

### Format Mix

| Format | Usage | Production |
|---|---|---|
| Founder talking head (30-45s) | Primary format, 60%+ of content | One person + phone, bathroom/kitchen setting |
| UGC talking head (30s) | Social proof format | UGC creator, casual setting |
| Text-heavy static ad series | Cost/complexity comparison | Matte black background, white uppercase text |
| POV video (30s) | Simplicity proof | No talking, text overlays, morning routine |

### Creative Concepts (One Product Simplicity Campaign, March 2026)

| Concept | Angle | Hook |
|---|---|---|
| "The Graveyard Under Your Sink" | Abandoned multi-product system | Show bathroom cabinet full of half-used products |
| "The Math" | Cost and complexity comparison | Static ads: "THEIR KIT: $81, 4 PRODUCTS. BASE LAYER: $38, 1 PRODUCT." |
| "POV: You Actually Stick With It" | Simplicity = sustainability | UGC POV, no talking, text overlays with results timeline |

### Hook Bank (18 hooks documented, top performers)

**Curiosity hooks:**
- "Nobody tells you that most skincare routines are designed to fail."
- "There's a reason your 4-product starter kit is sitting under your sink."
- "One ingredient does what most guys think takes three products."

**Problem-agitation hooks:**
- "You bought the kit. Used the cleanser twice. Never touched the toner. The serum expired."
- "Your face is greasy by noon and you have no idea why."
- "Three products. Three steps. Two weeks later you quit because who has time for that."

**Result-first hooks:**
- "Two weeks. One product. My face stopped looking like an oil slick."
- "I spend 15 seconds on my face every morning and it looks better than when I used four products."

**Social proof hooks:**
- "My girlfriend keeps asking what I changed. It's one product."
- "I told my dermatologist I use one product. She said that's actually the right move."

**Controversy hooks (highest scroll-stop potential):**
- "Bar soap on your face is bad. A 6-step routine is worse."
- "Skincare companies don't sell you four products because you need four products."
- "The skincare industry is built on one lie: that your face needs a routine."

### Ad Copy Variations (8 documented, March 2026)

| Variation | Segment | Headline | Core Angle |
|---|---|---|---|
| 1. The Abandoned Kit | Career Climber | YOU DIDN'T FAIL. THE SYSTEM DID. | Frustration + wasted money |
| 2. Post-Workout | Gym Bro | PROTEIN FOR YOUR FACE. ONE STEP. | Performance framing |
| 3. The Zoom Call | Career Climber | YOUR FACE IS YOUR FIRST SLIDE. | Professional aspiration |
| 4. The Ingredient Callout | Reddit Researcher | WE PUBLISH EVERY PERCENTAGE. | Transparency + trust |
| 5. The Girlfriend | Dating-Motivated | SHE NOTICED. I DIDN'T TELL HER. | Social proof |
| 6. The Subscription Trap | Broad | NO SUBSCRIPTION. NO TRICKS. $38. | Anti-subscription anger |
| 7. The Math | Reddit Researcher / Career Climber | $38. REPLACES $120 IN PRODUCTS. | Logic + value |
| 8. The Prevention Play | Aging-Concerned 35+ | YOUR 45-YEAR-OLD SELF WILL THANK YOU. | Fear + prevention |

---

## Native Static Ads Research (2026-08-12, subagent research, confidence: medium)

**Source:** native static ads for skincare/DTC Meta 2026 — full output at `runs/static-to-advertorial-plan-2026-08-12.md`.

- Statics are 64.8% of DTC ad volume and acquire customers ~28% cheaper than video (video gets 73% more clicks but lower intent), per a Curtis Howland 67,852-ad study.
- Platform-native formats (Notes-app posts, screenshots) get 30-40% lower CPMs.
- Founder-led skincare creative converts 5.8-7.1% vs. 3.2% cold average (consistent with the Social Content Strategy data point above) and fatigues slowest (6-12 months).
- 56% of US consumers compare ingredient lists before buying (Bigeye 2026) — reinforces the ingredient-transparency angle already core to this brand's positioning.
- **Meta skincare compliance additions:** "treats X" is flagged; "helps/supports/visibly reduces" clears. Second-person personal attributes ("your acne") are disallowed. Dramatic before/after is prohibited. (Extends the Compliance Checklist below.)
- **Testing cadence:** two clocks running simultaneously — new concepts every 1-2 weeks, variants within winners weekly, 7-day learning window. **Skincare-specific fatigue rule:** skincare fatigues faster than the DTC average, so kill winners on >20-25% decay from peak performance, not on a calendar schedule (refines the generic Creative Fatigue Thresholds table above, which is calendar/frequency-based).

## Peptide-Maxxing Ad Angle (2026-08-12, Sam interview, confidence: high)

The "peptide maxxing" static ad hook and its landing page deliberately target different people. The slang belongs to the young looksmaxxing crowd and earns the click; the buying audience is aging-concerned men 30-45 (see Aging-Concerned 35+ segment above) for whom peptides are a mechanism, not an identity. So the slang stays in the ad creative and the page opens in editorial voice. **Practical rule:** the page should name the gap out loud (the men doing the most reading are a decade away from the changes they're chasing) rather than pretend the ad's audience and the page's audience are the same. See `kb/wiki/conversion-learnings.md` for the paired objection-handling decisions for this creative angle.

---

## AI Creative System (Google PMax / Shopping)

**Source:** `~/BaseLayer/ads/AI_CREATIVE_SYSTEM.md`
**Tool:** Nano Banana Pro (Gemini 3 Pro Image)
**Purpose:** Generate secondary creative assets for Google Shopping and Performance Max campaigns

### 5-Concept Framework

| Concept | Type | What It Shows |
|---|---|---|
| A: Aspirational Lifestyle | Lifestyle editorial photo | Model in context (bathroom, morning light), product present but lifestyle is hero |
| B: Feature Deep Dive | Macro close-up | Extreme close-up of product texture/formulation, proves core USP |
| C: Social Proof & Validation | Product + badge overlay | Clean product shot with star rating badge (< 20% area, modern UI) |
| D: Price Anchoring | Product + price overlay | Price comparison (original strikethrough, current bold), clean white background |
| E: Problem-Solution Contrast | Split-screen before/after | Left: desaturated problem skin. Right: warm healthy skin with product in corner |

**Output specs:** 1.91:1 landscape (1200x628 min) + 1:1 square (1200x1200 min) per concept
**Evaluation:** 10 universal evals (text rendering, geometry, artifacts, color) + 5-8 concept-specific evals per concept. All pass/fail.
**Iteration:** 3 attempts per concept. If stuck after 3 iterations, start new chat with best output as reference image.
**Estimated time:** 2-3 hours for 10 assets per SKU (60-90 min with practice)

### Brand Defaults for AI Creative

```yaml
BRAND_NAME: "Base Layer"
SURFACE_MATERIAL: "dark concrete"
SURFACE_MATERIAL_DARK: "matte black slate"
LIGHTING_MOOD: "warm soft morning"
MODEL_ARCHETYPE: "man in his late 20s to early 30s, clean-shaven, healthy natural skin, relaxed confidence"
LIFESTYLE_ENVIRONMENT: "modern minimalist bathroom with concrete and wood accents"
BACKGROUND_COLOR: "dark charcoal (#1a1a1a)"
RATING: "4.8"
```

### Nano Banana Pro Tips

- Shorter prompts work better (3-5 conversational sentences, not paragraphs)
- Specify real camera gear (Canon R5, 85mm f/1.4, ISO 400) to ground in real optics
- Add photographic imperfections (grain, vignette, slight off-center framing) to avoid AI look
- Add lived-in scene details (water spots, toothbrush, towel) for realism
- Specify skin imperfections explicitly (pores, slight redness, stubble)
- Kill "editorial" and "premium" language -- use "candid", "natural", "snapshot quality"
- If quality degrades after 3-4 iterations, start a new chat with best output as reference

---

## Landing Page Strategy

### Advertorial Landing Page

**Source:** `~/BaseLayer/advertorial/DESIGN.md`, `stitch-prompt.md`
**Format:** Long-form editorial advertorial -- looks like a magazine article, NOT a product page
**Tool:** Google Stitch for initial design, then Claude Code for production refinement

**Design system:**
- **Colors:** Alpine Navy #1A2F4C (headlines, hero), Ascent Orange #F95D1A (CTAs only, max 2 per screen), Glacier Grey #ABB3BB (borders), White #FFFFFF (background)
- **Typography:** Montserrat Bold ALL CAPS for headlines, Inter for body
- **Rule:** 70% Navy+White, 20% Grey, 10% Orange. Orange is surgical, never decorative.

**Advertorial page structure (10 sections):**
1. Editorial header (looks like magazine masthead, "SPONSORED CONTENT")
2. Hook headline (problem-focused, not product-focused)
3. Problem section (3 cards: greasy products, unused products, wasted money)
4. Discovery narrative (founding story, Breckenridge, CO, 10,000 ft)
5. Product reveal (product shot, tagline: "One step. Zero shine.")
6. Ingredient evidence grid (6 ingredients with concentrations)
7. Results timeline (Day 1 / Week 2 / Month 2 / Month 3+)
8. Social proof (tester quotes, "50 testers. 0 refund requests.")
9. Offer section (30-day guarantee, free shipping — see pricing note below)

> ⚠️ **Pricing in this outline is stale (flagged 2026-08-12).** Live tiers are $38 single / $68 2-pack / $35 Subscribe & Save, and shipping is free on *all* orders — the ">$50" threshold was removed in commit `fb4814a`. Read `BUY_TIERS` in `src/config/product.ts` and `FREE_SHIPPING_PHRASE` in `src/config/legal.ts` rather than these numbers. (2026-08-12, git log + code)
10. FAQ accordion

**Voice rules:** Short, punchy, declarative. Lead with benefits. Use real numbers. Never: "curated", "elevated", "luxury", "clinically proven".

### Conversion-Optimized Landing Page (for Meta Traffic)

**Source:** `conversion-playbook-2026-03-19.md`
**Target:** Cold Meta traffic (partial context, partial intent, zero trust)
**CVR target:** 2.0%+ from paid, $0.50-0.80 CPC

**Above-the-fold requirements:**
- Headline restating ad hook (UPPERCASE with period)
- Hero image (product in-use for cold traffic, product-only for warm)
- Price + anchor: "$38 Founding Batch" with "$48 after this batch" struck
- CTA: "GET IT" or "TRY IT RISK-FREE" (not "Buy Now" for cold traffic)
- Trust strip: "Free Shipping | 30-Day Guarantee | No Subscription"

**Section order (each section resolves one objection):**
1. Problem agitation ("You wash your face with whatever's in the shower...")
2. Product as solution ("ONE PRODUCT. ONE STEP. DONE.")
3. Ingredient transparency (exact percentages, one-line per ingredient)
4. Results timeline (Day 1, Weeks 1-2, Weeks 4-8)
5. Founder story (3-4 sentences, Breckenridge, real photo)
6. Social proof (beta tester quotes or founding batch demand counter)
7. Risk reversal + CTA (30-day guarantee, price anchor, scarcity)
8. FAQ accordion

**Critical technical risk:** React SPA load time on mobile from Instagram in-app browser produces 60-75% bounce rate. Recommendation: build dedicated static HTML landing page for paid traffic.

---

## Social Content Strategy

**Source:** `SOCIAL_CONTENT_PLAYBOOK.md` (March 2026)

### Strategy in One Sentence

Founder-led content + UGC demos + self-aware humor, optimized for saves/shares (not likes), targeting oily skin, greasy products, and breakouts.

### Key Data Points

| Finding | Source | Implication |
|---|---|---|
| Founder-led content converts at 5.8-7.1% vs 3.2% average | McKinsey Beauty 2025 | Sam's face in 60%+ of content |
| UGC video = 36.8% of top-performing skincare ads | Evolut Agency 2026 | Raw mobile-shot > polished studio |
| 68% of men trust founder over influencer | McKinsey Beauty 2025 | Don't hire influencers yet. Be the influencer. |
| 89% of TikTok users purchase after seeing beauty content | Accio / TikTok Data | TikTok is the discovery engine |
| Average skincare buyer spends 8.3 hours researching before purchase | Beauty Independent 2026 | Content ecosystem IS the sales funnel |

### Content Pillars

| Pillar | % of Content | Purpose | Format |
|---|---|---|---|
| FOUNDER TRUTH | 40% | Trust, authority, differentiation | Sam talking to camera, no script, raw takes |
| PRODUCT PROOF | 25% | Conversion, texture demos, results | UGC-style demos, absorption tests |
| PAIN POINT COMEDY | 20% | Reach, shares, virality | Sketches, relatable scenarios, self-deprecating humor |
| INGREDIENT SCIENCE | 15% | Saves, SEO, authority | Ingredient breakdowns, myth-busting |

### Platform Strategy

| Platform | Role | Frequency | Optimal Length |
|---|---|---|---|
| TikTok | Primary discovery engine | 1x/day (2x during launch) | 15-45s, hook in first 2s |
| Instagram Reels + Feed | Credibility engine | 5x/week Reels, 1-2x carousels, daily Stories | 15-30s Reels |
| YouTube Shorts | SEO + long-tail | 3x/week (repurposed TikTok) | Search-optimized titles |

### Optimization Metrics

- **TikTok/Instagram:** Saves and shares (NOT likes). Saves drive algorithmic amplification.
- **YouTube Shorts:** Watch time and click-through to site.
- **Stories:** DMs ("DM me SKIN for the link" CTA pattern).

---

## Conversion Strategy

### Pre-Launch Funnel

**Primary goal:** Email signup / waitlist capture
**Funnel:** Awareness (Homepage/Ads) -> Consideration (Product Page) -> Trust Building (About) -> Action (Email Signup)

**Email signup targets:**
- Month 1: 300-500 (with content + ads)
- Month 2: 500-1,500 (with word-of-mouth + press)
- Month 3: 1,000-3,000 (pre-launch momentum)

### Founding Batch Psychology

**Three triggers:**
1. **Exclusivity:** "Batch" implies limited production, not mass market
2. **Origin story participation:** Buyer becomes a brand founder, not just a customer
3. **Scarcity without desperation:** Production-based scarcity feels authentic vs manufactured urgency

**Offer structure:**
- 1,000 units (first production run)
- Founding price: $38 (retail: $48)
- 30-day money-back guarantee
- ~~Free shipping over $50~~ → **Free shipping on all orders** (threshold removed 2026-08-12, commit `fb4814a`)
- ~~No subscription~~ → a $35 Subscribe & Save tier now exists (`BUY_TIERS` id 3, "NO LOCK-IN")

**Urgency mechanism:** "1,000 units. Founding batch. When they're gone, they're gone."

### CTA Copy Rules

- **Do:** Action verb + specificity. "GET EARLY ACCESS -- $38", "RESERVE BATCH 01"
- **Don't:** "Learn More", "Shop Now", "Add to Cart" (too transactional for cold traffic)
- **Headlines:** UPPERCASE, period-terminated, short stacked lines
- **Body:** Conversational, benefit-first, real numbers
- **Banned in all copy:** curated, elevated, artisanal, luxury, miracle, regimen, explore (as CTA), fragrance/scent language, emojis, exclamation marks in headlines

### Compliance Checklist (Meta Ads)

- All ingredient claims match "Safe claims" in ingredient-database.md
- No before/after language in Meta ad copy
- No "clinical", "medical", "treatment", "cure" language
- Claims softened: "helps visibly improve" not "improves"
- No competitor names -- referenced by category only ("that 4-product starter kit")
- FDA disclaimer only on product/landing pages, not in ads

---

## Competitive Intelligence (Ad-Relevant)

**Lumin (primary foil):** Sells 4-7 product bundles while claiming simplicity. "Class Act Bundle" is $81 for 4 products. Free trial auto-converts to subscription. 3.3/5 Trustpilot. The "One Product" campaign directly exploits this contradiction without naming them.

**Positioning lever:** Most competitors sell systems (Lumin, Tiege Hanley, Geologie). Base Layer's single-product simplicity is the differentiator. Every ad should make multi-step systems look like the problem, not the solution.

---

## See Also

- `kb/wiki/seo-strategy.md` -- SEO and content marketing strategy
- `~/BaseLayer/marketing/ads/` -- full ad briefs, hooks, and variations
- `~/BaseLayer/marketing/strategy/` -- launch playbook and conversion strategy
- `~/BaseLayer/ads/AI_CREATIVE_SYSTEM.md` -- full AI creative generation system
- `~/BaseLayer/advertorial/` -- advertorial landing page designs
