# Email Copywriter

**High-output email copy generator for Base Layer Skin. Takes a campaign type, product, and segment — returns production-ready email copy with subject lines, preview text, full body in three tones, and A/B test pairings.**

---

## When NOT to Use
- For planning email sequences and automation logic (use `/email-strategist`)
- For building HTML templates (use `/email-template-builder`)
- For analyzing past email performance (use `/email-analyzer`)
- For ad copy (use `/ad-copy-variants`)
- For social media copy (use `/social-content-batch`)

---

## Inputs

The user provides a campaign brief. Extract or ask for:

```
CAMPAIGN TYPE:   product-launch | educational | promotional | retention | seasonal
PRODUCT:         Performance Daily Face Cream (default — only SKU)
SEGMENT:         Target sub-audience (e.g., "new subscribers", "lapsed 60-day", "cart abandoners", "VIPs")
SEQUENCE:        Single email (default) | Full sequence (specify: welcome, post-purchase, winback, etc.)
TONE PRIORITY:   direct | educational | social-proof (default: generate all three)
```

If the user gives a loose brief ("write a welcome email"), default to:
- Campaign type: product-launch
- Product: Performance Daily Face Cream
- Segment: New subscribers (cold from Meta ads)
- Sequence: Single email
- Tone: All three

Can also generate full sequences in one run (e.g., "Write the complete 5-email Welcome Series").

---

## ICP — Hardcoded

Every email targets:
- **Males 20-40** (skew 25-35 for Meta-acquired subscribers)
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- 0-1 products in current routine (or 5+ unused ones under the sink)
- Responds to: efficiency, proof, directness
- Acquisition source: Instagram/Facebook cold traffic -> email capture

---

## Brand Voice — Non-Negotiable

Read and internalize: `/Users/samdoyle/baselayer-lovable-export/brand/BASE_LAYER_BRAND_GUIDELINES.md`

Key rules for email copy:
- **Confident, peer-to-peer, masculine.** Like a sharp friend who knows skincare but doesn't make it weird.
- **Short. Punchy. Direct.** Period-terminated. No filler.
- **No flowery/feminine language.** Banned words: pamper, indulge, luxurious, treat yourself, self-care, glow, radiant, dewy, miracle, curated, elevated, artisanal, game-changer.
- **No exclamation marks in subject lines or headlines.** No emojis in any copy.
- **Lead with benefits, not features.** Use real numbers ("15 seconds", "50 testers", "$38").
- **Don't say "we think" or "we believe" — state facts.**
- **Reference Colorado/altitude as a credibility anchor when natural.**
- **CTA: action verb + benefit.** Always.

**Product facts for copy:**
- Performance Daily Face Cream, 50mL
- $38 founding batch / $48 post-launch
- Absorbs in 15 seconds
- Replaces serum + moisturizer + eye cream
- Matte finish, zero shine, zero residue
- Fragrance-free
- One bottle lasts 6-8 weeks
- 30-day money-back guarantee (keep the bottle)
- Key ingredients: Niacinamide (oil control), Copper Peptide GHK-Cu (anti-aging), Panthenol (barrier repair), Centella Asiatica (calming), Squalane (lightweight hydration), Hyaluronic Acid (moisture retention)
- Engineered in Breckenridge, Colorado at 9,600 ft
- "5.0 from 50 early testers" — zero refund requests
- Results: immediate hydration, 1-2 weeks oil control, 4-8 weeks visible anti-aging

**Personalization tokens available (Klaviyo):**

| Token | Klaviyo | Mailchimp | Usage |
|-------|---------|-----------|-------|
| First name | {{ first_name\|default:"" }} | *\|FNAME\|* | Greeting, subject line |
| Last order date | {{ person.last_order_date }} | — | Reorder timing |
| Days since signup | {{ person.days_since_signup }} | — | Welcome series logic |
| Skin type (if collected) | {{ person.skin_type }} | *\|SKINTYPE\|* | Targeted content blocks |
| Order count | {{ person.order_count }} | — | Loyalty messaging |
| City/State | {{ person.city }} | *\|CITY\|* | Localization |

**Personalization rules:**
- Never use "Friend" or "Valued Customer" as a fallback. If no name, skip personalization.
- Use name mid-body, not as opener. "Here's the thing, {first_name}" > "Hey {first_name},"
- Behavioral > demographic. "Since you grabbed your first bottle 30 days ago" > "As a 30-year-old male"
- Max 1-2 personalized elements per email. More feels creepy.

---

## Pipeline

```
1. BRIEF     -> Lock inputs, confirm campaign type + segment
2. SUBJECTS  -> Generate 5 subject line variants
3. PREVIEW   -> Generate 3 preview text variants
4. BODY      -> Full body copy in 3 tones
5. CTA       -> CTA + P.S. line variants
6. A/B       -> A/B test pairings with isolated variables
7. SEQUENCE  -> Full multi-email sequence (if requested)
```

---

## Phase 1: Subject Lines

Generate **5 subject line variants**. Each must:
- Be **6-10 words** (display char count and word count)
- Work on mobile (front-load the hook in first 30 chars)
- Avoid spam triggers (no ALL CAPS full subjects, no "$$$", no "FREE")
- Match the campaign type tone
- Never use exclamation marks or emojis

### Subject Line Format

```
SUBJECT LINES
=============

1. "[Subject line text]" (XX chars, X words)
   Strategy: [Why this works — curiosity, benefit, pain, proof, urgency]

2. "[Subject line text]" (XX chars, X words)
   Strategy: [Why this works]

3. "[Subject line text]" (XX chars, X words)
   Strategy: [Why this works]

4. "[Subject line text]" (XX chars, X words)
   Strategy: [Why this works]

5. "[Subject line text]" (XX chars, X words)
   Strategy: [Why this works]
```

### Subject Line Patterns by Campaign Type

| Campaign Type | Pattern | Example |
|---------------|---------|---------|
| Product Launch | Announcement + benefit | "the face cream that absorbs in 15 seconds" |
| Educational | Curiosity + knowledge gap | "why your moisturizer leaves you greasy" |
| Promotional | Price + scarcity | "founding price locked at $38 — limited" |
| Retention | Personal + result | "your skin after 4 weeks of one step" |
| Seasonal | Timely + problem/solution | "winter skin needs one product, not five" |

---

## Phase 2: Preview Text

Generate **3 preview text variants** per subject line. Each must:
- Be 40-90 characters (optimized for mobile truncation)
- Complement the subject line, not repeat it
- Add a second reason to open
- No emojis

### Preview Text Format

```
PREVIEW TEXT
============

For Subject Line 1:
  a. "[Preview text]" (XX chars)
  b. "[Preview text]" (XX chars)
  c. "[Preview text]" (XX chars)

For Subject Line 2:
  a. "[Preview text]" (XX chars)
  b. "[Preview text]" (XX chars)
  c. "[Preview text]" (XX chars)

[... repeat for all 5 subject lines]
```

---

## Phase 3: Body Copy — Three Tones

Generate full body copy in **3 distinct tones**. Same core message, different voice. Each version includes:
- Opening hook (first 2 lines visible in preview pane)
- Core message (2-3 short paragraphs)
- Product proof points
- Single CTA (action verb + benefit)
- P.S. line

### Tone A: Direct / No-BS

**The default Base Layer voice. Highest-performing tone for male 20-40.**

```
TONE A: DIRECT / NO-BS
=======================

Subject: [Recommended pairing from Phase 1]
Preview: [Recommended pairing from Phase 2]

---

[First name],

[Opening hook — 1-2 sentences. Address a pain point or state a fact. No greeting filler.]

[Core message — 2-3 short paragraphs. Short sentences. Benefits first. Numbers where possible.]

[Product proof — one specific claim with evidence. "Absorbs in 15 seconds. Zero greasy residue. 50 early testers, zero refund requests."]

[CTA — standalone line, bold, action verb + benefit]
Example: **Get early access — $38 founding price**

P.S. [Urgency, scarcity, or secondary benefit. One sentence.]
```

**Voice rules for Tone A:**
- Sentences under 12 words
- No adjective stacking
- No transitional filler ("Additionally", "Furthermore", "As you know")
- One idea per paragraph
- Total body copy: 100-150 words

### Tone B: Educational / Science

**Best for ingredient spotlights, skin concern segments, and nurture sequences.**

```
TONE B: EDUCATIONAL / SCIENCE
==============================

Subject: [Recommended pairing from Phase 1]
Preview: [Recommended pairing from Phase 2]

---

[First name],

[Opening hook — pose a question or challenge a misconception about skincare.]

[Education section — teach one thing the reader didn't know. Ingredients, skin science, or routine logic. Be specific but not clinical.]

[Bridge to product — connect the lesson to Base Layer's formulation. Name 1-2 ingredients and what they do.]

[CTA — "See the full ingredient breakdown" or "Try the formula — $38"]

P.S. [Additional science fact or credibility anchor.]
```

**Voice rules for Tone B:**
- Conversational expert, not professor
- Name ingredients by function, not just name ("Niacinamide controls oil" not "Contains Niacinamide")
- One concept per email
- Reference Colorado altitude / testing environment when natural
- Total body copy: 150-200 words

### Tone C: Social Proof / Story

**Best for testimonial-heavy emails, milestone campaigns, and trust-building.**

```
TONE C: SOCIAL PROOF / STORY
=============================

Subject: [Recommended pairing from Phase 1]
Preview: [Recommended pairing from Phase 2]

---

[First name],

[Opening hook — a quote from a tester, a moment from the origin story, or a relatable scenario.]

[Story — 2-3 paragraphs. Could be: a tester's experience, the founding story (Breckenridge, altitude testing), or a "day in the life" scenario.]

[Bridge to reader — "Here's why this matters for you" or "Same problem, same fix."]

[CTA — action verb + benefit]

P.S. [Social proof number: "50 early testers. Zero refund requests." or "5.0 rating from guys who actually use it."]
```

**Voice rules for Tone C:**
- Use real names from review template (Sean G. 34 Oily, Matt M. 36 Combination, Cooper S. 27 Dry)
- Stories are short — 3-5 sentences max
- The story proves the product; it doesn't replace the pitch
- End with a concrete number for credibility
- Total body copy: 120-170 words

---

## Phase 4: CTA & P.S. Variants

### CTA Library

| CTA | Format | Use When |
|-----|--------|----------|
| Get early access — $38 | Action + price | Product launch, founding batch |
| Try the 15-second routine | Action + benefit | Educational, new subscribers |
| Lock in the founding price | Action + urgency | Promotional, scarcity-driven |
| See why 50 guys didn't return it | Action + proof | Social proof, retention |
| Start with one step | Action + simplicity | Welcome series, skeptics |
| See the full formula | Action + curiosity | Educational content |
| Reorder Base Layer | Action + direct | Replenishment, retention |
| Subscribe and save 15% | Action + value | Subscription push |

**CTA rules:**
- One CTA per email. One button. One action.
- Button text: UPPERCASE, under 25 characters
- Repeat CTA as text link at bottom for plain-text readers
- Button above the fold on mobile (within first 300px)

**Anti-patterns (never use):**
- "Shop Now" (generic, no benefit)
- "Buy Now" (aggressive, no value)
- "Click Here" (meaningless)
- "Don't Miss Out" (manufactured urgency)
- "Act Fast" (spam trigger)

### P.S. Lines by Campaign Type

```
Product Launch:
  - P.S. Founding batch is limited. When it's gone, price goes to $48.
  - P.S. One bottle. 6-8 weeks. $38. That's under $1/day for your face.
  - P.S. 30-day guarantee. Keep the bottle either way.

Educational:
  - P.S. Niacinamide + Copper Peptides + Squalane. That's the whole formula. No filler.
  - P.S. It absorbs in 15 seconds. Time it.
  - P.S. Formulated in Breckenridge at 9,600 ft. The altitude isn't a gimmick — it's the proving ground.

Promotional:
  - P.S. $38 now. $48 after founding batch sells out. No discount codes, no games.
  - P.S. 30-day money-back guarantee. You keep the bottle.
  - P.S. Free shipping on founding batch orders.

Retention:
  - P.S. Your bottle lasts 6-8 weeks. Time for a restock?
  - P.S. Same formula, same price, same 15 seconds.
  - P.S. 50 guys tested it. Then they reordered.

Seasonal:
  - P.S. Colorado winters break skin down fast. This was built for exactly that.
  - P.S. Your skin barrier takes the hit every season change. One product handles it.
  - P.S. SPF in summer, barrier repair in winter — Base Layer does both seasons with one jar.
```

---

## Phase 5: A/B Test Pairings

Generate a test matrix isolating one variable per test:

```
A/B TEST MATRIX
================

| Test # | Element Tested | Variant A | Variant B | Hypothesis |
|--------|---------------|-----------|-----------|------------|
| 1 | Subject line | Subject 1 (benefit-led) | Subject 3 (curiosity-led) | Benefit-led drives higher open rate for product-launch campaigns |
| 2 | Tone | Tone A (direct) | Tone C (social proof) | Social proof converts better for cold Meta-acquired subscribers |
| 3 | CTA | "Get early access — $38" | "Try the 15-second routine" | Price anchoring in CTA drives higher click rate |
| 4 | P.S. line | Scarcity P.S. | Guarantee P.S. | Risk reversal outperforms urgency for skeptical ICP |
| 5 | Preview text | Benefit-led preview | Curiosity-led preview | Curiosity gap increases open rate on mobile |

TESTING RULES:
- Test one variable at a time
- Minimum 1,000 recipients per variant
- 48-hour minimum test window
- Primary metric: unique click rate (not open rate — Apple MPP skews opens)
- Secondary metric: revenue per recipient
```

---

## Phase 6: Full Sequence Generation

When the user requests a sequence, generate a complete multi-email flow. Each email gets the full treatment: 5 subject lines, 3 preview texts, body in 3 tones, CTA, P.S., and A/B recommendation.

### Sequence Arc Rules

Every sequence follows an emotional arc:

```
Email 1: INTRODUCE    — Hook + value prop + credibility
Email 2: EDUCATE      — Depth on ingredients/process/science
Email 3: PROVE        — Social proof, testimonials, results
Email 4: CHALLENGE    — Pain point agitation, status quo attack
Email 5: CLOSE        — Urgency, guarantee, final push
Email 6: PERSONAL     — Survey, feedback, human connection (if 6+)
Email 7: LAST CALL    — Deadline, scarcity, clear finality (if 7)
```

### Welcome Series (5 emails)

```
Email 1: WELCOME + OFFER (Send: Immediately)
  Focus: Introduce brand + founding price + CTA
  Tone: Direct
  CTA: Get early access — $38

Email 2: ORIGIN STORY (Send: Day 2)
  Focus: Breckenridge story, altitude testing, why this exists
  Tone: Social proof / story
  CTA: See the formula

Email 3: EDUCATION (Send: Day 4)
  Focus: Why one product beats five. Ingredient breakdown.
  Tone: Educational
  CTA: Try the 15-second routine

Email 4: SOCIAL PROOF (Send: Day 7)
  Focus: Tester quotes, 5.0 rating, zero refunds
  Tone: Social proof
  CTA: Join 50 guys who switched

Email 5: LAST CHANCE (Send: Day 10)
  Focus: Founding batch scarcity + 30-day guarantee
  Tone: Direct / urgency
  CTA: Lock in $38 before it's gone
```

### Post-Purchase Series (4 emails)

```
Email 1: ORDER CONFIRMATION + USAGE (Send: Immediately)
  Focus: What to expect, how to use (15 seconds, done), results timeline

Email 2: CHECK-IN (Send: Day 7)
  Focus: "How's the first week?" + tip for best results

Email 3: RESULTS REMINDER (Send: Day 21)
  Focus: "Week 3 — oil control should be kicking in" + education on Niacinamide

Email 4: REORDER NUDGE (Send: Day 42)
  Focus: "Your bottle is about halfway done" + easy reorder CTA
```

### Winback Series (3 emails)

```
Email 1: WE NOTICED (Send: Trigger + 0 days)
  Focus: Direct acknowledgment + new angle (education or social proof they haven't seen)

Email 2: WHAT CHANGED (Send: Trigger + 5 days)
  Focus: New testimonials, product updates, or seasonal relevance

Email 3: FINAL OFFER (Send: Trigger + 12 days)
  Focus: Guarantee reminder + last CTA. No discounting — preserve brand value.
```

Maintain narrative continuity across the sequence — each email builds on the previous one while still working standalone.

---

## Campaign Type Templates

### Product Launch

```
Structure:
1. Announcement hook (what's new, why it matters)
2. Product hero (key claim + proof point)
3. Founding batch context (limited, price locked)
4. CTA + price
5. P.S. with scarcity or guarantee

Key elements: Price anchor ($38 now / $48 later), founding batch language, early access framing
Avoid: Hype language, "revolutionary", unsubstantiated superlatives
```

### Educational

```
Structure:
1. Question or myth-bust hook
2. Teach one concept (ingredients, skin science, routine simplification)
3. Connect concept to Base Layer's approach
4. Soft CTA (learn more / see ingredients) or hard CTA (try it)
5. P.S. with additional fact

Key elements: One lesson per email, name ingredients by function, real numbers
Avoid: Lecturing tone, jargon without explanation, multiple topics per email
```

### Promotional

```
Structure:
1. Direct offer statement (no buildup)
2. Why the offer exists (founding batch, seasonal, milestone — not desperation)
3. Product proof (quick reminder of value)
4. CTA + clear offer terms
5. P.S. with deadline or quantity limit

Key elements: Price transparency, reason for the offer, no discount-brand positioning
Avoid: Percentage-off language (use dollar amounts), flash-sale desperation
Base Layer rule: No coupon codes. No "SALE" in subject lines. Founding price IS the promotion.
```

### Retention

```
Structure:
1. Personal check-in hook (acknowledge their history)
2. Results reminder (what they should be seeing at this point)
3. Usage tip or new content
4. Reorder CTA with timing context
5. P.S. with loyalty proof

Key elements: Timing-aware (know where they are in the 6-8 week bottle cycle), non-pushy
Avoid: "We miss you" without substance, generic win-back language
```

### Seasonal

```
Structure:
1. Seasonal relevance hook (weather, activity, lifestyle shift)
2. Skin impact (what this season does to skin — altitude/Colorado angle)
3. How Base Layer handles it
4. CTA
5. P.S. with seasonal tip
```

| Season | Skin Concern | Angle | Lead Ingredient |
|--------|-------------|-------|-----------------|
| Winter | Dryness, cracking, wind damage | "Your skin vs. winter. Here's how to win." | Hyaluronic Acid + Squalane |
| Spring | Transition, sensitivity, allergies | "New season, same routine. That's the point." | Centella Asiatica + Panthenol |
| Summer | Oil, sweat, shine, UV exposure | "Sweat-proof your face. 15 seconds." | Niacinamide |
| Fall | Repair, recovery, barrier rebuild | "Summer did a number on your skin. Fix it." | Copper Peptide + Panthenol |
| Colorado | Altitude, dry air, UV at elevation | "Engineered at 9,600 ft for a reason." | Full formula positioning |

---

## Email Design Notes

Copy direction to pair with design:

**Layout:** Minimal. Single column. No heavy graphics. Plain-text aesthetic preferred.
**Font:** System fonts that echo DM Sans / Inter. Sans-serif only.
**Colors:** Black background with white/light gray text, OR white background with dark text. No color decorations.
**Images:** Product hero image (hero-product.jpg) where relevant. No stock photos.
**CTA button:** White on dark background, OR dark on white. Sharp corners (0 border radius). Uppercase text, tight tracking.
**Mobile:** Single-column, large tap targets, 16px+ body text. All emails must read perfectly on mobile.
**Plain text:** Always generate a plain-text version alongside HTML.

---

## Output Format

Deliver all copy in a single structured block:

```markdown
# Base Layer Email Copy — [Campaign Type]
Generated: [date]
Segment: [segment]
Product: Performance Daily Face Cream

## Subject Lines
[5 variants with char counts and strategy]

## Preview Text
[3 variants per subject line]

## Body Copy

### Tone A: Direct / No-BS
[Full email]

### Tone B: Educational / Science
[Full email]

### Tone C: Social Proof / Story
[Full email]

## CTA Variants
[3 per tone]

## P.S. Lines
[3 per campaign type]

## A/B Test Matrix
[Test pairings with hypotheses]

## Recommended Send
- Day: [Tuesday-Thursday for campaigns, immediate for flows]
- Time: [9-10am EST for opens, 7-8pm EST for clicks]
- Segment size: [minimum viable for testing]
```

---

## Edge Cases
- If the email type is not one of the 5 standard types: ask user to describe the goal and map to the closest type, or generate custom copy with explicit tone/CTA guidance.
- If user provides a specific subject line: incorporate as subject line #1 and generate 4 variations testing different angles around the same core message.
- If the email needs to reference a price or offer: always pull current pricing from Shopify or Sanity rather than hardcoding. Flag if pricing might change before send date.
- If generating a full sequence: maintain narrative continuity across all emails. Each builds on the previous, no point repeated.
- If brand voice guidelines conflict with email best practices (e.g., no emojis but emoji subject lines perform 15% better): flag the tension and provide both versions, letting the user decide.

---

## Quality Gate

Before delivering:
- [ ] All subject lines are 6-10 words with char counts
- [ ] No exclamation marks in subject lines or headlines
- [ ] No emojis anywhere
- [ ] CTA follows action verb + benefit format
- [ ] Every email has a P.S. line
- [ ] Brand voice check: no flowery language, no "we believe", no filler
- [ ] No banned words (pamper, indulge, glow, radiant, dewy, miracle, curated, elevated, artisanal)
- [ ] Personalization tokens use correct Klaviyo/Mailchimp syntax
- [ ] A/B test matrix isolates one variable per test
- [ ] Three distinct tones delivered (not three versions of the same tone)
- [ ] If sequence requested: correct send timing, narrative continuity, and flow logic
- [ ] Price references use $38 (founding) / $48 (post-launch) accurately
- [ ] Body copy under 200 words (under 150 for Tone A)
- [ ] All copy would pass a "would a 28-year-old guy actually read this?" test
