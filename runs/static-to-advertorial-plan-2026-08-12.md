# Base Layer — Static → Advertorial Flow: Plan + Deliverables

Date: 2026-08-12
Inputs: /last30days runs 1 & 2 (cold-traffic conversion, advertorial creation), 3 parallel subagent deliverables (advertorial draft, angle map, static creative research).

---

## THE PLAN (synthesis)

### Funnel shape

Cold static (native-looking, doesn't read as an ad) → matched advertorial (continues the ad's argument) → PDP. Solution-aware and warm traffic skips the advertorial and goes straight to PDP. Every advertorial-routed ad concept gets its OWN matched page — a shared generic advertorial is the most common reason these funnels underperform a plain PDP.

### Phase 0 — Fix truth issues (before any traffic)

1. **Live PDP compliance bug**: `src/pages/FaceCream.tsx` FAQ says copper peptide "stimulates collagen synthesis" — this exact phrase is on the brand's own banned-words list (`kb/wiki/brand-identity.md`). Replace with the sanctioned "helps diminish the visible signs of aging" framing. Also a Meta ad-review risk.
2. **Stale KB**: `kb/wiki/customer-insights.md` and `kb/wiki/competitor-landscape.md` claim "4.8/5 from 1,000+ men" — code truth is `PRODUCT_RATING = { rating: 0, count: 0 }` (sales opened 2026-08-10). Correct the wiki; never let that number leak into ad copy. `kb/wiki/product-formula.md` predates the $35 subscription tier.
3. **Proof strategy**: no real reviews yet, so all social proof uses the three FTC-disclosed testers (Sean/Denver, Marcus/Austin, Cooper/Boulder) with explicit tester disclosure. No star ratings anywhere until real ones exist.

### Phase 1 — Build the pages (week 1–2)

1. **Ship the drafted advertorial** ("The One-Bottle Experiment", full draft below) as the first pre-sell page. It fuses the anti-complexity + ingredient-transparency angles, journalist voice (audience distrusts first-person hype per KB objection #9). Route: new page, e.g. `/edge/one-bottle`, built from the `Point`/`ZigZagStep` component patterns in `Listicle.tsx` / `ListicleGirlfriend.tsx`, with the sponsored-content disclosure line at top.
2. **Build the Shine Problem advertorial** second — highest-validated angle (two SEO pages already prove demand, 73% texture complaint). ~80% of the copy already exists in `MatteMoisturizer.tsx` / `NonGreasyMoisturizer.tsx`; re-skin into editorial format. Headline: "I Stopped Blotting My Forehead Before Every Meeting — Here's What Actually Changed."
3. **Re-scope `Listicle.tsx`** as the dedicated Identity/Status angle page (it's ~90% there already) instead of the generic catch-all — frees each angle to own its lane.
4. Angles 2 (First Routine) and 3 (Ingredient Literacy) advertorials come after the first message-match test confirms lift.

### Phase 2 — Produce the statics (week 2–3)

First batch, 8–10 statics: 2 variants each of the four advertorial-routed concepts (Notes-app text post, 5-products-under-the-sink grid, us-vs-them table, reasons-why listicle) + hold the ingredient-callout and tester-quote statics for PDP-direct/retargeting. Statics acquire customers ~28% cheaper than video; native-style formats pull 30–40% lower CPMs. Base Layer's monochrome/no-emoji/uppercase brand system is natively suited to lo-fi text-post and data-callout formats.

Compliance rails: no second-person personal attributes ("your acne" is disallowed outright), no dramatic before/after, "helps/supports/visibly reduces" language only.

### Phase 3 — Campaign structure + measurement (week 3+)

- Run-1 consensus structure: 3–4 campaigns max, broad targeting, scale 15–20% every 3–4 days.
- Learning window: 5–7 days / ~$40–50 spend per ad before judging. Kill at CPA ≥1.5–2x breakeven after the window, or near-zero CTR vs account average. Kill winners when rolling 3–5 day CTR/CPA decays >20–25% from peak (skincare fatigues faster than DTC average).
- Every validated static gets 2–3 follow-up variants before retirement.
- New CONCEPT every 1–2 weeks; VARIANTS within proven concepts weekly. Don't confuse the two clocks.
- Track per angle: static CTR → advertorial scroll depth + advertorial→PDP CTR → PDP CVR. UTM per angle so message match is measurable.

### Phase 4 — Iterate

Retargeting listicles per angle (warm traffic wants to scan, not be re-educated), expand to angles 2/3, refresh statics on fatigue signal not calendar.

---

## DELIVERABLE 1 — Advertorial draft (agent output, verbatim)

**Format:** Native/editorial advertorial for cold Meta traffic. **Voice: third-person journalist/editorial**, not first-person. Reasoning: Base Layer's own customer research (kb/wiki/customer-insights.md, objection #9) shows this audience explicitly distrusts first-person "I tried this and it changed my life" copy and skincare-brand hype — their stated language is "show me the science, not the marketing." A journalist voice investigating a trend lets the real named testers carry the first-person proof instead of an invented narrator, which keeps every claim traceable and avoids fabricating a persona.

**Target awareness level:** Problem-aware, cold. Reader knows their skin gets oily by afternoon / feels tight and shiny / reacts after shaving / looks tired — but hasn't identified Base Layer as the fix, and may not have tried anything beyond a drugstore basic.

**Ad angle:** Anti-complexity + ingredient-transparency + anti-subscription-trap, fused into a "minimalism experiment" investigative frame. Maps to Objection #2 (routine complexity), #7 (subscription dark patterns), #9 (ingredient skepticism) in kb/wiki/customer-insights.md.

---

*Sponsored feature — this article contains a paid partnership with Base Layer Skin.*

### HOOK

## The One-Bottle Experiment: What Happened When Men Stopped Buying Serums, Toners, and Eye Cream

**Alt headline 1:** Why Some Guys Cut Their Skincare Down to One Product — And Started Getting Unsolicited Compliments Instead

**Alt headline 2:** The Six-Ingredient Face Cream Men Are Using to Replace Their Entire Bathroom Shelf

**Sub: No 10-step lineup. No subscription you have to fight your way out of. Just published ingredient percentages and a 15-second habit, formulated at 9,600 feet in Breckenridge, Colorado.**

Ask ten men what's in their moisturizer and most won't know. Ask what percentage of anything is actually in the bottle, and the room goes quiet. That's not an accident — most men's skincare brands don't publish concentrations at all. A quiet experiment among a small group of testers in Colorado started with a simpler question: what if one product, with the doses printed on the label, did the job of four?

### PROBLEM

Fifty-eight percent of men rarely or never moisturize. Not because they don't have a problem — because the fix looks like a chore. A serum here, a moisturizer there, an eye cream nobody remembers to use, and a routine that falls apart by week two. The men who do try something usually land on one of two paths: a drugstore basic that feels heavy and doesn't touch oil control, or a subscription kit that mails a new box every month whether you want it or not — and that's turned into its own well-documented headache. Trustpilot and BBB complaint boards are full of men describing the same thing: a "free trial" that quietly becomes a recurring charge, and a cancellation flow designed to wear you down.

The actual pain points, in the words men use: skin that's shiny by noon. Razor burn every time. Looking tired in photos nobody's supposed to see. And underneath all of it, a low-grade suspicion that none of these products are doing much of anything — just sitting on the skin, or worse, sitting in a subscription queue.

### EDUCATION

Base Layer's approach starts from a narrower question than most brands ask: not "what feels premium," but "what's actually dosed at a level that does something." The Performance Daily Face Cream carries six active ingredients, each at a published concentration, doing three distinct jobs:

**Oil control — Niacinamide, 5%.** The most-studied clinical concentration of the ingredient, chosen because it's effective without the sensitization risk of going higher. In the formula, it works on the cause of midday shine rather than blotting it away after the fact.

**Fast absorption without residue — Squalane.** A plant-derived oil that's structurally close to what human skin already produces, which is the reason it's designed to sink in in about 15 seconds instead of sitting on top. It carries a comedogenicity rating of 0 — the lowest possible, meaning it isn't expected to clog pores.

**Post-shave recovery — Panthenol, 2%, plus Centella Asiatica.** Panthenol is a barrier-support ingredient with decades of use behind it; in this formula it's aimed at calming razor burn and micro-irritation. Centella is included alongside it to help the skin's moisture barrier recover from the daily stress of shaving, wind, and dry indoor air.

**Firmer-looking skin over time — Copper Peptide GHK-Cu, 0.03%, and Hyaluronic Acid.** Copper peptides are a naturally occurring class of compound that decline as skin ages; here they're included for their role in supporting firmer, smoother-looking skin, particularly around the eyes, over 4 to 8 weeks of daily use. Hyaluronic Acid — capable of holding roughly 1,000 times its weight in water — is layered in to help plump the visible appearance of fine lines from underneath.

[NEEDS SUBSTANTIATION: any specific percentage improvement figure or named clinical trial for the *finished Base Layer product* — none exists yet. The ingredient science above is drawn from published third-party research on the raw ingredients, not a trial of this product, and is described here without using "clinically proven," which the brand reserves for finished-product trial data it does not currently have.]

There's no fragrance in the formula, no separate eye cream, no separate barrier cream. One pump, morning and night, on a clean face.

### PROOF

Base Layer doesn't yet have a public review count — the company is upfront that it's early. What it does have are three named product testers who received the cream for free in exchange for honest feedback (disclosed below, per FTC guidelines — they're testers, not verified customers):

> [REVIEW] "I used to blot my forehead before every afternoon meeting. After about a week on Base Layer, I just stopped. My skin stays matte all day and it doesn't feel dry or tight."
> — Sean, 34, oily skin, Denver, CO

> [REVIEW] "My girlfriend kept saying my skin looked different, like clearer and healthier. I hadn't even told her I was trying anything new. That's when I figured it was actually working."
> — Marcus, 28, combination skin, Austin, TX

> [REVIEW] "Hotel air, airplane cabins, hiking in January. Everything used to wreck my skin. Now I throw one bottle in my bag and forget about it. Goes on fast, no grease, done."
> — Cooper, 27, dry skin, Boulder, CO

*Disclosure: The testers pictured received free Base Layer product in exchange for their honest feedback. They are product testers, not paying customers or verified buyers.*

Every ingredient in the formula is non-comedogenic. The company publishes its concentrations on the product page rather than hiding behind "clinically tested" language with no data attached — a direct response to the most common complaint men have about this category: that nobody will show their work.

### OFFER

Base Layer sells one product, three ways to buy it:

- **1 bottle — $38.** A 6-week supply. About $0.90 a day.
- **2 bottles — $68.** The most-picked option. A 12-week supply at $34/bottle — about $0.81 a day.
- **Subscribe & Save — $35 every delivery, every 6 weeks.** One price, forever — not a promotional rate that jumps after the first shipment. Pause or cancel in one click. No lock-in, no multi-step retention flow to fight through.

Every order ships free. Every order is covered by a 30-day guarantee — if it's not for you, Base Layer refunds it in full and doesn't ask for the bottle back.

[NEEDS SUBSTANTIATION: comparison math against buying niacinamide serum + separate moisturizer + eye cream at retail — no verified per-product price data for that stack exists in the codebase, so no specific dollar-savings claim is made above.]

### CTA

## GRAB YOURS — $38

**Secondary:** 2-Pack, most picked — $68
**Tertiary:** Subscribe & Save — $35 every delivery, no lock-in

Free shipping. 30-day guarantee — hate it, keep the bottle, full refund.

---

**Draft flags (from the drafting agent):**
1. KB wiki claims "4.8/5 from 1,000+ men" but code truth is zero reviews (`PRODUCT_RATING = { rating: 0, count: 0 }`, sales opened 2026-08-10). Draft follows code. KB needs correcting.
2. `kb/wiki/product-formula.md` (rev 1, 2026-04-03) predates the subscription tier; code (`src/config/product.ts`) is authoritative: $38 / $68 2-pack / $35 subscribe.
3. Live `FaceCream.tsx` FAQ uses banned phrase "stimulates collagen synthesis" — pre-existing compliance inconsistency, needs separate fix.
4. Headline uses title case (intentional deviation from all-caps brand rule — all-caps would read as an ad and kill the native format). CTAs still follow brand formula.
5. A stale `advertorial-builder` skill template (old pricing, no 2-pack/subscription) was ignored in favor of verified code pricing.
6. No invented clinical stats; ingredient-level research only, "clinically proven" never used.

---

## DELIVERABLE 2 — Ad angle → advertorial map (agent output, condensed)

**Principle**: message match. Comparable DTC case lifted CVR 4.3%→6.6% (+54%) by splitting one generic lander into per-angle pages.

### Angle 1 — The Shine Problem (BUILD FIRST)
- Insight: shine by midday causes real social anxiety; men assume the fix is skipping moisturizer, which backfires. #1 texture complaint (73% per Mintel, already cited in `NonGreasyMoisturizer.tsx`).
- Awareness/framework: problem-aware; Hook→Promise→Proof.
- Hooks: "Your face is greasy by noon and you have no idea why." / "73% of guys who try a face moisturizer say the same thing: it feels like cooking oil. This one doesn't." / "Zero shine. Zero grease. 15 seconds. That's the whole pitch."
- Advertorial headline: *I Stopped Blotting My Forehead Before Every Meeting — Here's What Actually Changed*
- Education = squalane-vs-petroleum molecular comparison + 15-Second Test demo (already written). Proof = Sean's testimonial + "touch your face at 3pm" challenge.
- Reuse: `MatteMoisturizer.tsx`, `NonGreasyMoisturizer.tsx` copy re-skinned into the `ZigZagStep`/`Point` editorial pattern.
- Retargeting: listicle ("5 reasons your face stays matte").

### Angle 2 — First Routine, Simplified
- Insight: the real competitor is inertia — 71% of men run no routine; complexity is objection #1. Only angle targeting non-buyers, not switchers.
- Awareness/framework: unaware→problem-aware; Problem→Pivot→Payoff.
- Hooks: "Nobody tells you that most skincare routines are designed to fail." / "You don't need a routine. You need one step." / "You bought the kit. Used the cleanser twice. Never touched the toner. The serum expired."
- Advertorial headline: *The 15-Second Habit That Replaced My Entire (Abandoned) Skincare Kit*
- Education = "graveyard under your sink" narrative before naming the brand. Proof = "The Math" ($38 one product vs $81 4-product kit) + simplicity testimonials.
- Reuse: `AllInOneSkincare.tsx` value math + `ListicleGirlfriend.tsx` narrative arc.
- Retargeting: listicle ("5 reasons men are switching").

### Angle 3 — Ingredient Literacy / The Skeptic
- Insight: Reddit Researcher segment fact-checks formulations; 42% of men check labels; Lumin publishes zero concentrations (documented exploit).
- Awareness/framework: solution-aware; Hook→Promise→Proof, weighted to proof/mechanism.
- Hooks: "We publish every percentage. Most brands won't." / "Niacinamide 5%. Copper peptide 0.03%. That's not marketing copy. That's the label." / "Show me the science, not the marketing. Fine. Here's the science."
- Advertorial headline: *I Fact-Checked Every Ingredient In This Men's Moisturizer Before Buying It*
- Education = ingredient-by-ingredient mechanism breakdown with concentrations + the 2006 J. Cosmetic Dermatology niacinamide citation. Proof = `ComparisonTable.tsx` active-ingredient matrix (Base Layer 6/6 vs Caldera Lab 0/6, Kiehl's 0/6, Brickell 1/6) as the proof unit.
- Reuse: `ComparisonTable.tsx`, `/ingredients/*` pages, citation block in `MatteMoisturizer.tsx`.
- Retargeting: comparison-table listicle.

### Angle 4 — Identity / Status (Career Climber)
- Insight: face care as professional edge, not vanity ("your face is your first slide"); Gen Z men = fastest-growing spend segment (42% income share vs 29% millennials).
- Awareness/framework: problem-aware→aspirational; Identity→Tribe→Status.
- Hooks: "Your face is your first slide." / "High-performers don't have 10-step routines. They have one that works." / "The unfair advantage nobody's talking about: 15 seconds before your first meeting."
- Advertorial headline: *Why High-Performers Are Quietly Switching to a One-Step Face Routine*
- Education = performance/maintenance reframe ("athletic wear for your face" white space). Proof = status-coded testimonials by title (Founder, Attorney, VP Sales) vs skin-type-coded.
- Reuse: `Listicle.tsx` is ~90% this page — rename/dedicate it to this angle.
- Retargeting: `Listicle.tsx` largely as-is.

**Rejected territories**: razor burn (real ingredient support but secondary pain; fold into Angle 1's education), girlfriend cross-shop (already shipped as `ListicleGirlfriend.tsx`; near-duplicate of angles 2/4).

**Build order**: 1) Shine Problem (most reusable copy, biggest named objection), 2) Identity via `Listicle.tsx` re-scope, 3) Angles 2+3 in parallel after message-match lift confirms.

---

## DELIVERABLE 3 — Static ad research + concepts (agent output, condensed)

### Findings
1. Statics are 64.8% of DTC ad volume; video gets 73% more clicks but statics acquire customers ~28% cheaper (filters for intent). (Curtis Howland 67,852-ad study; AskNeedle)
2. "Doesn't look like an ad" is the core mechanic: platform-native formats (Notes-app posts, screenshots, iMessage threads) get 30–40% lower CPMs. UGC-style beats studio by 35–55% CTR on cold. (AdMetrics; Web Tonic)
3. 12-format taxonomy mapped to funnel stage; healthy accounts keep 6–8 formats live simultaneously. TOF: UGC-native, grid/collage, ugly/lo-fi, meme. MOF: social proof, before/after, feature callout, data callout, listicle. BOF: product hero, offer.
4. Ingredient callouts are a trust mechanic: 56% of US consumers compare ingredient lists before buying. (Bigeye 2026)
5. Founder-led/text-post formats fatigue slowest (can run 6–12 months); founder-led skincare creative converts 5.8–7.1% vs 3.2% cold average. (Foreplay; Landing Partners)
6. Production velocity is the moat: 30–60 min per static vs 4–8 hrs per video; Fraggell reports 30–60% CPA reductions via creative diversity (ALOHA -40% CAC, Solawave -60% CPA).
7. Awareness routes the destination: cold/skeptical → advertorial; solution-aware/comparison → listicle or PDP. (Motion; Landra)
8. Meta skincare compliance: "treats acne/eczema" flagged; "helps soothe / supports / visibly reduces" clears. Second-person personal attributes ("your acne") disallowed outright. Dramatic before/after prohibited. (AuditSocials; InnoBotZ)
9. Two testing clocks: new CONCEPTS every 1–2 weeks; VARIANTS within proven concepts daily/weekly. ~7-day learning window per ad set. (RocketShip HQ; Affect Group)
10. Skincare creative fatigues faster than DTC average — refresh on decay signal, not calendar. (Web Tonic)

### 6 static concepts for Base Layer
1. **Notes-app text post** (lo-fi, no product shown): "things i stopped buying at 32 — serum. eye cream. separate moisturizer…" → unaware/problem-aware → routes to advertorial (One-Bottle Experiment).
2. **"5 products under the sink" grid**: flat-lay of half-used bottles, one circled red. "5 PRODUCTS YOUR GIRLFRIEND TOLD YOU TO BUY. 4 OF THEM SITTING UNUSED UNDER THE SINK." → problem-aware → advertorial.
3. **Us-vs-them table**: 5-STEP ROUTINE ($150+, 12 min) vs BASE LAYER (1 step, $35/mo, 15 seconds). "ONE STEP. ZERO SHINE. EVERYTHING YOUR SKIN NEEDS. NOTHING IT DOESN'T." → problem/solution-aware → advertorial (claims need substantiation on-page).
4. **Ingredient/data callout**: product on dark stone, three callout lines (NIACINAMIDE 5% — OIL CONTROL / COPPER PEPTIDE GHK-CU / CENTELLA ASIATICA). "WHAT'S ACTUALLY IN IT." → solution-aware → PDP direct.
5. **Reasons-why listicle static**: "3 REASONS GUYS ARE DITCHING THE 5-STEP ROUTINE." → problem-aware → advertorial expanding each reason.
6. **Tester-quote social proof**: "50 EARLY TESTERS. ZERO REFUND REQUESTS." [verify the number before use] + tester quote → warm/retargeting → PDP direct.

### Cadence
8–10 net-new statics/week (single-SKU appropriate; agencies run 12–15 at scale), ≥4 formats live at all times. 1 new concept per 1–2 weeks; 3–5 variants weekly within winners. 5–7 days / $40–50 spend before judging. Kill at CPA ≥1.5–2x breakeven or near-zero CTR; kill winners on >20–25% decay from peak. Every survivor gets 2–3 follow-up variants before retirement. Every advertorial-routed concept needs its own matched page.
