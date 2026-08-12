# Base Layer — ICP Cards

Foundation file for the `ad-creative-engine` skill. Routing file — **read the canonical
sources before writing copy.** Voice-of-customer phrasing below is quoted verbatim from
research; use those exact words in ads rather than paraphrasing them into marketing-speak.

## Canonical sources (read these)

| What | File |
|---|---|
| Core ICP — demographics, pains, motivations, journey | `brand/references/audience/icp-core.md` |
| Segments | `brand/references/audience/segments.md` |
| Objection bank — 10 objections + rebuttals + copy examples | `brand/references/audience/objection-bank.md` |
| Customer insights (KB) | `kb/wiki/customer-insights.md` |
| Ad strategy — hooks that worked/fatigued (KB) | `kb/wiki/ad-strategy.md` |
| Competitor positioning | `brand/references/competitors/positioning-map.md` |

## Primary ICP

Male, 25–35 core (20–40 range), US, $50–150K household, college-educated. Values function
over form. Skeptical of beauty marketing. Owns 0–1 skincare products, or 5+ unused ones
under the sink. Treats grooming as maintenance — like the gym or an oil change — not ritual.

## Pain points, ranked

1. A visible problem shows up (acne, dryness, post-shave irritation, sun damage). Men solve
   problems; they don't browse.
2. Overwhelm. "I don't know where to start." 2x more likely than women to feel lost.
3. Greasy, heavy products.
4. Money wasted on products that sit unused.
5. Too many steps — the #1 barrier to starting.
6. Stigma. Skincare still codes feminine, especially 35+.

## Motivations, ranked

1. Simplicity — the single biggest lever.
2. Performance/optimization framing (maintenance, not beauty).
3. Aging prevention. 46% of men 18–34 prioritize it.
4. Confidence for a specific outcome — interview, date, video call.
5. Clinical ingredients as rational permission to buy (niacinamide, copper peptides).
6. Peer normalization. Statistics defuse stigma.

## Voice-of-customer phrases — use these words

- "That greasy feeling 30 minutes after applying — like your face is coated in cooking oil."
- "Spending $150 and looking exactly the same."
- "I don't know where to start."
- "You don't need 10 products."
- "Look sharper without thinking about it."
- "Do men actually need skincare?" (the literal search query)
- "Work in the background."

## Top objections → the angle that answers them

| Objection | Angle |
|---|---|
| "I don't need skincare" | Habit analogy. "You brush your teeth every morning. Same thing. 15 seconds." |
| "Skincare is for women" | Normalize with stats. 52% of US men already use it; 68% of Gen Z men. |
| "Too complicated" | One product replaces four. One step. |
| "Too expensive" | Value math — under $1/day, replaces three products. |
| "I'd just use my girlfriend's" | Men's skin is 20–25% thicker, more sebum, larger pores. |
| "Never seen results" | Realistic timeline (4–6 weeks) + 30-day money back. |
| "Don't want greasy" | Texture proof — show it. Absorbs in 15 seconds, matte, zero residue. |
| "Brands are all hype" | Full ingredient transparency. No influencer deals. |
| "My skin is fine" | Invisible damage. By the time wrinkles show, 80% of it is done. |
| "Subscription trap" | No lock-in. Pause or cancel in one click. |

## What repels — never put these in an ad

Feminine/beauty language ("radiance", "glow", "pamper", "nourishing") · multi-step systems ·
subscription pressure or dark patterns · influencer endorsement (peer > influencer) ·
flowery branding ("curated", "elevated", "artisanal") · overpromising ("miracle",
"clinically proven") · category jargon ("serum", "essence", "toner", "non-comedogenic").

## Pricing — verify before it goes on an image

Prices moved recently. **The live truth is `src/config/product.ts`, not the objection bank.**
As of the current build:

- 1 bottle (50mL) — **$38**
- 2-pack — **$68**, badged MOST POPULAR, and the PDP default
- Subscribe & Save — **$35 every delivery**, every 6 weeks, no lock-in
- Free shipping on all orders

`brand/references/audience/objection-bank.md` still frames the offer as a one-time $38
purchase, which predates the 2-pack default and the flat $35 subscription. Re-check
`src/config/product.ts` before any ad states a price or a shipping threshold.
