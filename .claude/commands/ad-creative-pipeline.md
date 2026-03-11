# Ad Creative Pipeline

**End-to-end Meta ad creative production for Base Layer Skin.**

Takes a campaign brief and outputs a complete folder of platform-ready ad assets with copy variants — from research through final production.

## When NOT to Use
- For text-only ad copy without images (use `/ad-copy-variants`)
- For resizing an existing hero image to multiple platform sizes (use `/asset-batch`)
- For analyzing existing ad performance from CSV exports (use `/campaign-auditor`)
- For building a web landing page for ads to link to (use `/landing-page-builder`)
- For writing social media captions (use `/social-content-batch`)

---

## Inputs

The user provides a campaign brief. Extract or ask for:

```
PRODUCT:          Performance Daily Face Cream (default — only SKU)
ANGLE:            The core message/hook (e.g., "simplicity", "anti-grease", "altitude credibility")
AUDIENCE SEGMENT: Subset of ICP to target (e.g., "gym guys", "professionals", "skincare skeptics")
BUDGET TIER:      Low (3 creatives) | Medium (6 creatives) | High (10+ creatives)
OBJECTIVE:        Awareness | Traffic | Conversions (default: Conversions)
```

If the user gives a loose brief ("make some ads for the face cream"), default to:
- Angle: Simplicity — "One step. Zero shine."
- Segment: General ICP (men 25-40, skincare-curious, Meta-native)
- Budget: Medium (6 creatives)
- Objective: Conversions

---

## ICP — Hardcoded

Every creative targets:
- **Males 20-40** (skew 25-35 for Meta)
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- 0-1 products in current routine (or 5+ unused ones under the sink)
- Responds to: efficiency, proof, directness
- Traffic source: Instagram/Facebook cold traffic
- Device: 85%+ mobile

---

## Brand Voice — Non-Negotiable

Read and internalize: `/Users/samdoyle/baselayer-lovable-export/brand/BASE_LAYER_BRAND_GUIDELINES.md`

Key rules for ad creative:
- **Direct, confident, conversational.** Like a sharp friend who knows skincare but doesn't make it weird.
- **Short. Punchy. Stacked.** Period-terminated or no punctuation.
- **UPPERCASE for all headlines.** No exceptions.
- **No flowery/feminine language.** No "curated", "elevated", "artisanal", "miracle".
- **No exclamation marks in headlines.** No emojis in brand touchpoints.
- **Lead with benefits, not features.** Use real numbers ("15 seconds", "50 testers", "$38").
- **Monochrome palette.** Black/white/gray. Color is functional only (amber=ratings, green=success, red=friction).
- **Sharp corners everywhere.** The brand is angular, not soft.

---

## Pipeline

```
1. BRIEF       → Lock inputs, confirm with user
2. RESEARCH    → Competitive intelligence on Meta
3. CONCEPTS    → Generate 3 creative concepts with visual direction
4. PREVIEW     → Draft visuals at 1K for feedback
5. COPY        → Generate headline/primary text/CTA combos per creative
6. PRODUCTION  → Final assets at correct Meta sizes
7. PACKAGE     → Output campaign folder with all assets + copy doc
```

---

## Phase 1: Brief Lock

Confirm the brief back to the user:

```
CAMPAIGN BRIEF
--------------
Product:    Performance Daily Face Cream
Angle:      [angle]
Segment:    [segment description]
Budget:     [X creatives]
Objective:  [objective]
Sizes:      1080x1080 (feed), 1080x1350 (portrait feed), 1080x1920 (story/reel)
```

Get explicit approval before proceeding.

---

## Phase 2: Competitive Research

Use WebSearch to research:

1. **Competitor Meta ads** — Search for:
   - "[competitor brand] Facebook ads" (Tiege Hanley, Lumin, Geologie, Hims, Bulldog, Harry's)
   - "men's skincare Facebook ad examples [current year]"
   - "DTC skincare Meta ad creative trends"
   - Check Facebook Ad Library (https://www.facebook.com/ads/library/) for active competitor ads

2. **What's working in the space** — Search for:
   - "best performing Facebook ad formats [current year]"
   - "men's grooming ad creative trends Meta"
   - "DTC skincare ad hooks that convert"

3. **Compile competitive intel:**

```
COMPETITIVE LANDSCAPE
---------------------
[Brand 1]: [Visual style] | [Messaging angle] | [What works/doesn't]
[Brand 2]: [Visual style] | [Messaging angle] | [What works/doesn't]
[Brand 3]: [Visual style] | [Messaging angle] | [What works/doesn't]

GAPS WE CAN EXPLOIT:
- [Gap 1: e.g., "Everyone uses bright/clean aesthetics — our dark/dramatic look stands out"]
- [Gap 2: e.g., "Nobody leads with simplicity — all pushing multi-step"]
- [Gap 3: e.g., "No altitude/origin story differentiation"]
```

---

## Phase 3: Creative Concepts

Generate 3 distinct creative concepts. Each concept should have a different strategic angle.

### Concept Template

```
CONCEPT [A/B/C]: [Name]
-----------------------
STRATEGY:     [Why this concept works for the target segment]
HOOK:         [First thing the viewer sees/reads — must stop the scroll]
VISUAL:       [Detailed image description]
HEADLINE:     [UPPERCASE, short, punchy]
BODY:         [Supporting copy direction]
CTA:          [Action text]
MOOD:         [Emotional tone]
DIFFERENTIATION: [How this stands apart from competitor ads found in research]
```

### Concept Archetypes (choose 3 that fit the angle)

| Archetype | Visual Direction | Copy Direction |
|-----------|-----------------|----------------|
| **Product Hero** | Jar on dark surface, dramatic lighting, macro texture | Lead with the product claim ("Absorbs in 15 seconds") |
| **Problem/Agitate** | Split-screen: bathroom clutter vs. single jar | Pain point copy ("5 products. 4 unused.") |
| **Lifestyle** | Man in Colorado/outdoor setting, natural light | Aspiration ("Look sharper without thinking about it") |
| **Social Proof** | Review text overlay on dark background, star ratings | Testimonial-led ("50 guys. Zero refund requests.") |
| **Origin Story** | Mountain/altitude imagery, Breckenridge landscape | Credibility ("Engineered at 9,600 ft") |
| **Before/After** | Side-by-side or swipe comparison | Results ("Week 1 vs. Week 4") |
| **Anti-Routine** | Strike-through of multi-step routine, single product remains | Simplicity ("Delete your routine") |
| **Ingredient Science** | Clean ingredient visualization, molecular/lab aesthetic | Education ("Niacinamide controls oil. Peptides rebuild.") |

Present concepts to user for approval before generating visuals.

---

## Phase 4: Visual Previews

For each approved concept, generate draft images at 1K resolution using nano-banana-pro.

### Generation Command

```bash
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[detailed prompt]" \
  --filename "[concept-name]-[size]-draft.png" \
  --resolution 1K
```

### Prompt Construction for Base Layer Ads

Always include these elements in the prompt:

```
"Create an image of: [subject/scene].
Style: High-contrast, editorial, monochrome-dominant commercial photography.
Composition: [specific framing for the ad size].
Lighting: Dramatic side lighting or rim lighting, dark shadows, premium feel.
Background: [dark surface / mountain landscape / clean studio].
Color palette: Near-black backgrounds, white/gray tones, minimal color — only amber for accents if needed.
Text overlay space: [Leave clear space in top/bottom third for headline text].
Avoid: Bright colors, soft/rounded aesthetics, feminine styling, stock photo feel, cluttered composition."
```

### Size-Specific Composition Notes

| Size | Aspect | Composition |
|------|--------|-------------|
| 1080x1080 | 1:1 Feed | Product/subject centered. Text space top and bottom. |
| 1080x1350 | 4:5 Portrait | Product/subject in center-lower third. Headline space in top third. |
| 1080x1920 | 9:16 Story/Reel | Full vertical. Product in lower third. Large text space in upper half. Safe zones: avoid top 14% (profile pic) and bottom 20% (CTA button). |

Generate 1:1 feed size first as the draft. Get user feedback before producing all three sizes.

### Feedback Loop

Present each draft and ask:
- Does the visual direction match your intent?
- Adjust lighting/mood/composition?
- Any elements to add/remove?

Iterate at 1K until the user approves direction. Then produce final versions.

---

## Phase 5: Ad Copy

For each approved creative, generate **5+ headline/primary text/CTA combinations**.

### Copy Structure

```
CREATIVE [X] — [Concept Name]
==============================

COMBO 1:
  Hook Line:      [First line of primary text — MUST stop the scroll, <10 words]
  Primary Short:  [125 characters max — for collapsed view]
  Primary Long:   [Full primary text, 3-5 lines, mobile-formatted with line breaks]
  Headline:       [40 characters max, UPPERCASE]
  Description:    [30 characters max]
  CTA Button:     [Shop Now | Learn More | Sign Up | Get Offer]

COMBO 2: ...
COMBO 3: ...
COMBO 4: ...
COMBO 5: ...
```

### Copy Rules for Meta

1. **Hook in first line.** Mobile shows ~125 chars before "See more". The hook must be in that window.
2. **Mobile-first formatting.** Short paragraphs. Line breaks between ideas. No walls of text.
3. **No emojis.** Brand guidelines prohibit emojis in brand touchpoints.
4. **Price anchoring.** Always include "$38" or "founding price" when angle supports it.
5. **Social proof where possible.** "50 early testers. Zero refund requests." is a power line.
6. **Clear CTA.** Tell them exactly what to do. "Get early access" > "Learn more" for conversion campaigns.
7. **Headline is UPPERCASE.** Always.
8. **Description supports headline.** Don't repeat — add a new reason to click.

### Copy by Emotional Trigger

Map each combo to a trigger:

| Trigger | Hook Pattern | Example |
|---------|-------------|---------|
| **Pain/Problem** | Call out the frustration | "That greasy feeling 30 minutes after applying?" |
| **Simplicity** | Contrast with complexity | "One product. 15 seconds. Done." |
| **Credibility** | Proof + origin | "Engineered at 9,600 ft in Breckenridge, CO." |
| **Social Proof** | Numbers + results | "50 guys tested this. Zero asked for a refund." |
| **Urgency** | Scarcity + price | "Founding batch. $38. Limited run." |

---

## Phase 6: Final Production

Once concepts and copy are approved, produce final assets.

### Generate Final Images

For each approved creative, generate all three Meta sizes at appropriate resolution:

```bash
# Feed square
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[locked prompt, composed for 1:1]" \
  --filename "[campaign]-[concept]-1080x1080.png" \
  --resolution 1K

# Portrait feed
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[locked prompt, composed for 4:5 portrait]" \
  --filename "[campaign]-[concept]-1080x1350.png" \
  --resolution 1K

# Story/Reel
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[locked prompt, composed for 9:16 vertical, safe zones respected]" \
  --filename "[campaign]-[concept]-1080x1920.png" \
  --resolution 1K
```

### Text Overlay Compliance

Meta's text overlay rule: **text should cover <20% of the image area.**

- If the creative concept requires text on image, keep it to headline only (3-5 words max)
- Use the ad platform's headline/description fields for copy — not baked-in text
- Exception: social proof numbers ("5.0 stars", "50 testers") can be small overlays

---

## Phase 7: Package & Deliver

Create a campaign folder with all deliverables.

### Folder Structure

```
[campaign-name]/
  assets/
    [concept-a]-1080x1080.png
    [concept-a]-1080x1350.png
    [concept-a]-1080x1920.png
    [concept-b]-1080x1080.png
    ...
  copy/
    ad-copy-all-variants.md
  brief/
    campaign-brief.md
    competitive-research.md
  README.md  (only if user requests)
```

### Copy Document Format

Output all copy variants in a single structured markdown file:

```markdown
# [Campaign Name] — Ad Copy Variants
Generated: [date]

## Creative A: [Concept Name]
**Image:** [filename reference]

### Combo 1: [Trigger Label]
- **Hook:** [hook line]
- **Primary (short):** [125 char version]
- **Primary (long):**
  [Line 1]
  [Line 2]
  [Line 3]
- **Headline:** [UPPERCASE, 40 char max]
- **Description:** [30 char max]
- **CTA:** [button text]

### Combo 2: ...

---

## Creative B: [Concept Name]
...

---

## A/B Test Matrix
| Test | Variant A | Variant B | Variable Isolated |
|------|-----------|-----------|-------------------|
| 1    | A-Combo1  | A-Combo3  | Hook style (pain vs. proof) |
| 2    | A-Combo1  | B-Combo1  | Visual concept (same hook) |
| ...  | ...       | ...       | ... |
```

### Campaign Brief Document

```markdown
# Campaign Brief: [Name]

## Strategy
- **Angle:** [angle]
- **Segment:** [audience segment]
- **Objective:** [objective]
- **Competitive Insight:** [key gap we're exploiting]

## Assets Produced
| Creative | Concept | Sizes | Copy Combos |
|----------|---------|-------|-------------|
| A | [name] | 1080x1080, 1080x1350, 1080x1920 | 5 |
| B | [name] | 1080x1080, 1080x1350, 1080x1920 | 5 |
| ... | ... | ... | ... |

## Recommended Launch Plan
1. Start with [X] ad sets, 1 creative per ad set
2. $[X]/day per ad set for 3-5 day learning phase
3. Kill anything below [X] ROAS after 1000 impressions
4. Scale winners by duplicating ad set at 20% budget increase
5. Rotate creatives every 2-3 weeks to combat fatigue
```

---

## Meta Ad Best Practices — Built In

These rules are enforced throughout the pipeline:

### Static Image Ads
- Text overlay <20% of image area
- High contrast for mobile (small screens, outdoor viewing)
- Product must be recognizable at thumbnail size
- Clear visual hierarchy: one focal point per image

### Video/Reel Ads (if extending to video)
- Hook in first 3 seconds — must stop the scroll before sound
- Captions required (85% of video is watched without sound)
- Optimal length: 15-30 seconds for feed, 6-15 seconds for stories
- First frame must work as a static thumbnail

### Copy Best Practices
- Hook in first 125 characters (mobile truncation point)
- One clear CTA per ad (don't split attention)
- Price in ad copy reduces low-intent clicks (good for ROAS)
- Social proof numbers outperform generic claims

### Targeting Notes for Base Layer
- Interest stacking: men's grooming + fitness + outdoor sports
- Lookalike audiences from email list (when available)
- Exclude existing customers from cold traffic campaigns
- Broad targeting often outperforms narrow for DTC at scale

---

## Quality Gate

Before delivering the final package:

- [ ] All images generated at correct dimensions (1080x1080, 1080x1350, 1080x1920)
- [ ] Text overlay <20% on every image
- [ ] All headlines UPPERCASE, under 40 characters
- [ ] All primary text short versions under 125 characters
- [ ] Brand voice check: no flowery language, no exclamation marks, no emojis
- [ ] At least 5 copy combos per creative
- [ ] A/B test matrix included
- [ ] Campaign folder structure created with all files
- [ ] Competitive research documented
- [ ] User approved concepts before final production
