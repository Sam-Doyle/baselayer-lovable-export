# Ad Copy Variants

**High-volume ad copy generation for Base Layer Skin's Meta campaigns.**

Takes a product, benefit angles, and emotional triggers — outputs 15+ copy variants organized by psychological lever. Each variant includes hook, primary text (short + long), headline, description, and CTA. Built for Meta (Instagram/Facebook) ads targeting men 20-40. Tone: confident, direct, no-BS. NOT feminine skincare language.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/voice/tone-rules.md`
- `brand/references/voice/copy-patterns.md`
- `brand/references/product/catalog.md`
- `brand/references/product/ingredient-database.md`
- `brand/references/audience/icp-core.md`
- `brand/references/audience/segments.md`
- `brand/references/audience/objection-bank.md`
- `brand/references/channels/meta-ad-specs.md`

## When NOT to Use
- For full ad production with images and assets (use `/ad-creative-pipeline`)
- For email subject lines and body copy (use `/email-copywriter`)
- For social media captions and post copy (use `/social-content-batch`)
- For product page descriptions (use `/product-description-writer`)
- For landing page copy (use `/landing-page-builder`)

---

## Inputs

The user provides a brief. Extract or ask for:

```
PRODUCT:          Product name (default: Performance Daily Face Cream)
BENEFITS:         Core benefits to highlight (e.g., "15-second absorption, shine control, replaces 3 products")
ANGLE:            Primary messaging angle (e.g., "simplicity", "anti-grease", "altitude credibility", "skeptic conversion")
AUDIENCE SEGMENT: Specific sub-segment if not general ICP (e.g., "gym guys", "outdoor athletes", "office professionals")
OFFER:            Current offer/price point (default: "$38 founding price")
OBJECTIVE:        Campaign objective (Conversions / Traffic / Awareness — affects CTA selection)
VARIANT COUNT:    Minimum 15, can request more
```

If the user gives a loose brief ("write ad copy for the face cream"), default to:
- Benefits: 15-second absorption, all-day shine control, replaces your entire routine
- Angle: Simplicity + anti-complexity
- Segment: General ICP (men 25-40, skincare-skeptical, Meta-native)
- Offer: $38 founding price
- Objective: Conversions
- Count: 15 variants

---

## ICP — Hardcoded

Every variant targets:
- **Males 20-40** (skew 25-35 for Meta)
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- 0-1 products in current routine (or 5+ unused ones under the sink)
- Responds to: efficiency, proof, directness
- Device: 85%+ mobile (design copy for small screens)

---

## Brand Voice — Non-Negotiable

### Voice: "Your Sharp Friend"

Direct, confident, conversational. Like a friend who happens to know about skincare but doesn't make it weird.

### What We Sound Like

| We ARE | We are NOT |
|--------|-----------|
| "One step. Done." | "Explore our carefully curated range" |
| "The product works." | "We believe this could help" |
| "50 early testers. Zero refund requests." | "Clinically proven by dermatologists" |
| "That greasy feeling? Gone." | "Eliminate excess sebum production" |
| "Look sharper" | "Anti-aging miracle for him" |

### Hard-Banned Language

```
FEMININE SKINCARE (never use):
- pamper, indulge, luxurious, ritual, self-care, glow-up
- treat yourself, spa-like, pampering, decadent, beauty routine
- skincare journey, radiant, luminous, dewy

WEAK/CORPORATE (never use):
- we believe, we think, we feel
- carefully curated, artisanal, elevated, premium experience
- revolutionary, game-changing, breakthrough, miracle

FILLER (never use):
- very, really, truly, incredibly, absolutely
- best-in-class, world-class, cutting-edge

FORMAT BANS:
- No exclamation marks in headlines
- No emojis anywhere
- No hashtags in primary text (save for organic posts)
```

### Power Language (use these)

```
PERFORMANCE:  engineered, formulated, built, designed, tested, handles, controls, repairs
SIMPLICITY:   one step, done, forget about it, that's it, zero, replaced, eliminated
PROOF:        50 testers, zero refunds, 15 seconds, 6-8 weeks, $38, Breckenridge
CONFIDENCE:   sharper, cleaner, dialed in, put-together, no-shine, matte
DIRECTNESS:   works, handles, controls, repairs, defends, absorbs, done
CONTRAST:     instead of, not another, unlike, the opposite of, while others
```

---

## Variant Structure

Every variant follows this structure:

```
VARIANT [#]: [Trigger Label]
=============================
Hook Line:       [First line of primary text — MUST stop the scroll. <10 words.]
Primary (Short): [125 characters max — what shows before "See more" on mobile]
Primary (Long):  [Full primary text. 3-7 lines. Mobile-formatted with line breaks.
                  Short paragraphs. One idea per line. End with CTA.]
Headline:        [40 characters max. UPPERCASE. Benefit-driven.]
Description:     [30 characters max. Supports headline — don't repeat.]
CTA Button:      [Shop Now | Learn More | Sign Up | Get Offer]
```

### Meta Copy Specs

| Field | Character Limit | Mobile Behavior | Rule |
|-------|----------------|-----------------|------|
| Primary Text | 125 chars visible, ~1000 max | Truncated at 125 chars on mobile with "See more" | Hook MUST be in first 125 chars |
| Headline | 40 chars optimal, 255 max | Shown below image on feed, overlay on stories | UPPERCASE always |
| Description | 30 chars optimal, 255 max | Only shown on some placements (feed) | Short, complementary |
| CTA Button | Fixed options | Platform-provided button | Match to campaign objective |

---

## Emotional Trigger Framework

Generate variants across these 6 psychological triggers. Minimum 2-3 variants per trigger.

### Trigger 1: Pain/Problem (3 variants minimum)

Agitate a specific frustration the ICP feels. Be vivid and specific. Make them feel seen.

**Hook patterns:**
- Direct question about the pain ("Still dealing with [specific problem]?")
- Vivid scenario description ("That moment when [embarrassing situation]")
- Contrast: what they are doing vs. what works ("You've been [wrong approach]")
- Call out the enemy: complexity, grease, wasted money

**Pain points for Base Layer ICP:**
- Greasy residue 30 minutes after applying moisturizer
- Buying 5+ products and using none of them
- Spending $150/year and looking exactly the same
- Confusing multi-step routines that feel like homework
- Products that smell like a department store counter
- Shiny forehead by noon every day
- Girlfriend's products that clearly were not formulated for male skin

**Example variant:**
```
VARIANT 1: Pain/Problem — Greasy Residue
=========================================
Hook Line:       That greasy feeling 30 minutes after applying?
Primary (Short): That greasy feeling 30 minutes after applying? It means your moisturizer wasn't built for you. Base Layer absorbs in 15 seconds.
Primary (Long):
  That greasy feeling 30 minutes after applying?

  It means your moisturizer wasn't built for you.

  Base Layer absorbs in 15 seconds flat.
  Zero residue. Zero shine. All day.

  One product. Replaces your entire routine.
  $38 founding price — limited batch.
Headline:        ZERO GREASE. ZERO SHINE.
Description:     Absorbs in 15 seconds
CTA Button:      Shop Now
```

### Trigger 2: Aspiration/Identity (3 variants minimum)

Speak to who they want to become. Not vanity — competence. Looking sharp = looking like you have it together.

**Hook patterns:**
- Future state visualization ("Look sharper without [effort they hate]")
- Identity statement ("For guys who [valued behavior]")
- Status/competence signal ("The difference between [mediocre] and [sharp]")
- Effortless excellence ("You don't think about it. You just look better.")

**Aspirational frames for Base Layer ICP:**
- Looking put-together without trying
- Having your routine dialed in like everything else
- The quiet confidence of good skin
- Being the guy who figured it out with one product
- Efficiency in every part of life, including this

**Example variant:**
```
VARIANT 4: Aspiration — Effortless
====================================
Hook Line:       Look sharper without thinking about it.
Primary (Short): Look sharper without thinking about it. One product. 15 seconds. Your entire skincare routine, handled. Engineered in Colorado.
Primary (Long):
  Look sharper without thinking about it.

  One product. 15 seconds in the morning.
  Your entire skincare routine, handled.

  Engineered at 9,600 ft in Breckenridge, CO
  where dry air and UV don't mess around.

  If it works here, it works anywhere.
  $38 founding price.
Headline:        ONE STEP. DONE.
Description:     Engineered in Colorado
CTA Button:      Shop Now
```

### Trigger 3: Social Proof (2-3 variants)

Lead with numbers, real results, and third-party validation. Men respond to proof over promises.

**Hook patterns:**
- Hard numbers upfront ("50 guys tested this. Here's what happened.")
- Zero-risk framing ("Zero refund requests out of 50 testers.")
- Specific tester quote as the hook
- Consensus signal ("Every single early tester reordered.")

**Social proof assets:**
- 50 early testers, zero refund requests
- 5.0/5.0 average rating
- Specific tester quotes (Sean G., Matt M., Cooper S. from brand guidelines Section 10)
- Founding batch positioning (limited quantity = implicit proof of demand)
- No paid endorsements, no influencers

**Example variant:**
```
VARIANT 7: Social Proof — Zero Refunds
========================================
Hook Line:       50 guys tested this. Zero asked for a refund.
Primary (Short): 50 guys tested this. Zero asked for a refund. Base Layer — one product that replaces your entire routine. $38.
Primary (Long):
  50 guys tested this. Zero asked for a refund.

  "One step, no shine — that's all I wanted." — Sean G., 34

  Base Layer is one product that does everything.
  Absorbs in 15 seconds. Controls shine all day.
  No fragrance. No grease. No 6-step routine.

  Founding batch. $38. Limited run.
Headline:        50 TESTERS. ZERO REFUNDS.
Description:     5.0 average rating
CTA Button:      Shop Now
```

### Trigger 4: Urgency/Scarcity (2-3 variants)

Founding batch creates natural scarcity. Use it. Price anchoring against post-launch price.

**Hook patterns:**
- Limited quantity ("Founding batch. Once it's gone, it's gone.")
- Price anchor ("$38 now. $48 at launch.")
- Time pressure ("First production run shipping now.")
- Exclusivity ("250 bottles. That's it for the founding batch.")

**Urgency levers:**
- Founding batch limited run
- $38 founding vs. $48 post-launch ($10 savings = 21% off)
- First production run
- Price lock — founding price will not return

**Example variant:**
```
VARIANT 10: Urgency — Price Lock
==================================
Hook Line:       $38 now. $48 at launch.
Primary (Short): $38 now. $48 at launch. The founding batch of Base Layer is a limited run. Lock in the price before it goes up.
Primary (Long):
  $38 now. $48 at launch.

  Base Layer's founding batch is a limited run.
  One face cream that replaces your entire routine.

  Absorbs in 15 seconds.
  Controls shine all day.
  Lasts 6-8 weeks per bottle.

  Lock in the founding price.
Headline:        FOUNDING PRICE. LIMITED RUN.
Description:     $38 — increases at launch
CTA Button:      Get Offer
```

### Trigger 5: Education/Science (2-3 variants)

Teach something useful. Men who are skeptical of skincare respond when you explain WHY something works, not just THAT it works. Science-backed but accessible — no jargon walls.

**Hook patterns:**
- "Here's why" explainer ("Here's why your moisturizer feels greasy.")
- Ingredient spotlight ("The ingredient that controls oil without drying you out.")
- Myth-busting ("You don't need 6 products. Here's why.")
- Behind-the-formula ("We put 6 active ingredients in one step. Here's what each one does.")

**Educational angles:**
- Niacinamide controls oil production (not just absorbs it — regulates it at the source)
- Copper peptides signal collagen production (anti-aging without calling it anti-aging)
- Why most moisturizers feel greasy (heavy emollients designed for dry female skin)
- Altitude as a proving ground (9,600 ft = extreme dry air + UV exposure)
- Why simple > complex for skin health (barrier disruption from too many actives)
- Why fragrance-free matters (fragrance is the #1 irritant in men's products)

**Example variant:**
```
VARIANT 12: Education — Why It's Greasy
=========================================
Hook Line:       Here's why your moisturizer feels greasy.
Primary (Short): Here's why your moisturizer feels greasy. Most aren't built for male skin. Base Layer absorbs in 15 seconds — zero residue.
Primary (Long):
  Here's why your moisturizer feels greasy.

  Most formulas are designed for dry skin types.
  Male skin produces more sebum on average.
  Slapping a heavy cream on top? That's the grease.

  Base Layer uses niacinamide to regulate oil
  and squalane for lightweight hydration.
  Absorbs in 15 seconds. Matte finish. Done.

  Engineered in Breckenridge, CO. $38.
Headline:        BUILT FOR MALE SKIN.
Description:     Absorbs in 15 seconds
CTA Button:      Learn More
```

### Trigger 6: Identity/Anti-Routine (2-3 variants)

Position Base Layer as a rebellion against the skincare industrial complex. For guys who refuse to have a "routine." Make simplicity the identity.

**Hook patterns:**
- Anti-establishment ("The skincare industry wants you to buy 6 products. You need one.")
- Identity alignment ("For guys who don't have a skincare routine. And don't want one.")
- Rejection of complexity ("Delete your skincare routine.")
- Masculine practicality ("You wouldn't use 6 tools when one works. Same logic.")

**Identity frames:**
- "I'm not a skincare guy" — but you still want to look good
- Efficiency as a value, not laziness
- One product = the smart choice, not the lazy choice
- Anti-BS, anti-marketing, anti-complexity

**Example variant:**
```
VARIANT 14: Identity — Not A Skincare Guy
===========================================
Hook Line:       You don't need a skincare routine.
Primary (Short): You don't need a skincare routine. You need one product that handles everything. Base Layer — 15 seconds, zero shine.
Primary (Long):
  You don't need a skincare routine.

  You need one product that handles everything.

  Hydration. Oil control. Anti-aging.
  One step. 15 seconds. That's the whole routine.

  50 guys tested it. 5.0 rating.
  Zero refund requests.

  $38 founding price.
Headline:        ONE PRODUCT. THAT'S IT.
Description:     Replaces your routine
CTA Button:      Shop Now
```

---

## Full Output Template

Generate all 15+ variants in this format:

```markdown
# Ad Copy Variants: Base Layer Skin
Generated: [date]
Product: [product name]
Angle: [primary angle]
Segment: [target segment]
Offer: [current offer]

---

## PAIN/PROBLEM (Variants 1-3)

### Variant 1: [Specific pain point label]
[Full variant structure]

### Variant 2: [Specific pain point label]
[Full variant structure]

### Variant 3: [Specific pain point label]
[Full variant structure]

---

## ASPIRATION (Variants 4-6)

### Variant 4: [Aspiration label]
[Full variant structure]

### Variant 5: [Aspiration label]
[Full variant structure]

### Variant 6: [Aspiration label]
[Full variant structure]

---

## SOCIAL PROOF (Variants 7-9)

### Variant 7: [Proof angle label]
[Full variant structure]

### Variant 8: [Proof angle label]
[Full variant structure]

### Variant 9: [Proof angle label]
[Full variant structure]

---

## URGENCY/SCARCITY (Variants 10-11)

### Variant 10: [Urgency lever label]
[Full variant structure]

### Variant 11: [Urgency lever label]
[Full variant structure]

---

## EDUCATION/SCIENCE (Variants 12-13)

### Variant 12: [Educational angle label]
[Full variant structure]

### Variant 13: [Educational angle label]
[Full variant structure]

---

## IDENTITY/ANTI-ROUTINE (Variants 14-15)

### Variant 14: [Identity frame label]
[Full variant structure]

### Variant 15: [Identity frame label]
[Full variant structure]
```

---

## A/B Test Pairing Suggestions

After generating all variants, recommend specific A/B test pairings. Each test isolates ONE variable.

```
A/B TEST MATRIX
================

| Test # | Variant A | Variant B | Variable Isolated | Hypothesis |
|--------|-----------|-----------|-------------------|------------|
| 1      | V1 (Pain: Greasy) | V7 (Proof: Zero Refunds) | Trigger: pain vs. proof | Pain hooks drive higher CTR; proof drives higher CVR |
| 2      | V4 (Aspire: Effortless) | V14 (Identity: Not Skincare Guy) | Frame: positive vs. negative | Aspiration may attract broader; anti-routine may resonate with skeptics |
| 3      | V1 (Pain: Greasy) | V3 (Pain: Wasted Money) | Pain point: product vs. cost | Which frustration resonates more with cold traffic |
| 4      | V10 (Urgency: Price Lock) | V7 (Proof: Zero Refunds) | Motivation: scarcity vs. trust | Does price urgency or social proof drive more purchases |
| 5      | V12 (Edu: Why Greasy) | V1 (Pain: Greasy) | Depth: educate vs. agitate | Same pain point — does explaining the science improve conversion |

TESTING PROTOCOL:
- Run each test with same creative image, same audience, same budget
- Minimum $50/variant or 1000 impressions before evaluating
- 95% confidence (p<0.05) before declaring a winner
- Test one variable at a time — never stack changes
- Winner gets scaled; loser informs the next round of variants
```

---

## Hooks Library

After generating all variants, compile all hooks into a standalone reference:

```
HOOKS BY TRIGGER
================

PAIN/PROBLEM:
1. "That greasy feeling 30 minutes after applying?"
2. "5 products under your sink. How many do you actually use?"
3. "You've spent $150 on skincare this year. Can you tell?"

ASPIRATION:
4. "Look sharper without thinking about it."
5. "The simplest upgrade you'll make this year."
6. "Dialed in. One product. 15 seconds."

SOCIAL PROOF:
7. "50 guys tested this. Zero asked for a refund."
8. "5.0 out of 5.0 from 50 early testers."
9. "'One step, no shine — that's all I wanted.' — Sean G."

URGENCY:
10. "$38 now. $48 at launch."
11. "Founding batch. Limited run."

EDUCATION:
12. "Here's why your moisturizer feels greasy."
13. "The ingredient that controls oil without drying you out."

IDENTITY:
14. "You don't need a skincare routine."
15. "The skincare industry wants you to buy 6 products."
```

---

## Adaptation Notes

### Adjusting for Campaign Objective

| Objective | CTA | Copy Emphasis | Headline Style |
|-----------|-----|---------------|----------------|
| Conversions | Shop Now / Get Offer | Price, offer, urgency, social proof | Direct benefit + price |
| Traffic | Learn More | Education, curiosity, problem-awareness | Question or intrigue |
| Awareness | Learn More | Brand story, identity, aspiration | Bold brand statement |

### Adjusting for Audience Temperature

| Temperature | Copy Strategy | Proof Level | CTA Directness |
|-------------|--------------|-------------|----------------|
| Cold | Lead with pain or education. Establish credibility. | Heavy (numbers, quotes, origin story) | Soft ("Learn More") or medium ("Shop Now") |
| Warm (retargeting) | Lead with offer or social proof. They already know the brand. | Medium (reinforce with testimonial) | Direct ("Get Offer", "Complete Your Order") |
| Hot (cart abandoners) | Lead with urgency or reminder. They almost bought. | Light (they already believe) | Aggressive ("Finish Checkout", "Still Thinking?") |

### Adjusting for Placement

| Placement | Copy Adjustment |
|-----------|----------------|
| IG Feed | Full primary text. Headline and description visible. All fields matter. |
| IG Stories | Hook line only visible (minimal text on story). Headline as overlay. |
| IG Reels | Hook must work as a caption overlay. Keep primary text ultra-short. |
| FB Feed | Longer primary text OK. Description field shown. More room to educate. |
| FB Marketplace | Price-forward. Transactional copy. Less storytelling. |

---

## Product Reference — Base Layer Performance Daily Face Cream

Use these facts in copy. Do not invent claims.

| Fact | Copy-Ready Version |
|------|-------------------|
| Absorbs in 15 seconds | "Absorbs in 15 seconds. Not 15 minutes." |
| Replaces serum + moisturizer + eye cream | "One product replaces three." |
| Matte finish, zero shine | "Zero shine. All day." |
| Fragrance-free | "No fragrance. No nonsense." |
| 50mL, lasts 6-8 weeks | "One bottle. Two months." |
| $38 founding / $48 post-launch | "$38 now. $48 at launch." |
| 30-day money-back guarantee | "Don't like it? Keep the bottle. Get your money back." |
| Niacinamide (oil control) | "Niacinamide controls oil at the source." |
| Copper Peptide GHK-Cu (anti-aging) | "Copper peptides rebuild what time breaks down." |
| Panthenol (barrier repair) | "Panthenol repairs what shaving and dry air damage." |
| Centella Asiatica (calming) | "Centella calms irritation. No redness." |
| Squalane (lightweight hydration) | "Squalane mimics your skin's own moisture." |
| Hyaluronic Acid (deep moisture) | "Hyaluronic acid pulls moisture in and holds it." |
| Engineered in Breckenridge, CO (9,600 ft) | "Built for altitude. Built for real life." |
| 50 early testers, zero refunds | "50 guys. 30 days. Zero refund requests." |
| 5.0 average rating | "5.0 from 50 real guys. Not influencers." |

---

## Quality Gate

Before delivering ad copy variants:

- [ ] Minimum 15 variants generated
- [ ] At least 2-3 variants per emotional trigger category
- [ ] Every hook is under 10 words and stops the scroll
- [ ] Every Primary (Short) is under 125 characters
- [ ] Every Headline is UPPERCASE and under 40 characters
- [ ] Every Description is under 30 characters
- [ ] No banned words or feminine skincare language in any variant
- [ ] No exclamation marks in any headline
- [ ] No emojis anywhere
- [ ] Price/offer included where the angle supports it
- [ ] At least one tester quote used in social proof variants
- [ ] Colorado/altitude referenced in at least 2 variants
- [ ] "15 seconds" absorption claim in at least 3 variants
- [ ] A/B test matrix included with at least 5 test pairings
- [ ] Each test isolates exactly one variable
- [ ] Hooks library compiled for standalone reference
- [ ] Copy reads like a sharp friend — not a beauty brand, not a bro-marketing company
- [ ] Every variant has a clear, single CTA (not split attention)
- [ ] All product claims sourced from brand guidelines (no invented claims)
