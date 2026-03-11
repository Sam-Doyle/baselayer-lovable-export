# Social Content Batch

**Produce a full week of platform-native social content for Base Layer Skin in one pass.**

Takes a weekly theme or content brief, then generates ready-to-post content across Instagram Feed, Instagram Stories, Instagram Reels, and Facebook — complete with copy, visual direction, hashtags, image generation prompts for nano-banana-pro, and a posting schedule optimized for men 20-40 on Meta.

---

## The Process

```
1. BRIEF    -> Weekly theme + content mix allocation
2. GENERATE -> Platform-native content for each channel
3. VISUALS  -> Image generation prompts for nano-banana-pro
4. SCHEDULE -> Posting times optimized for male 20-40 audience
5. REVIEW   -> Quality gate + brand voice check
```

---

## When to Use This Skill

**Use when:**
- Producing the next week of social content
- A content calendar item needs to be turned into actual posts
- Need a batch of platform-ready content for a campaign launch
- Weekly content planning session

**Skip when:**
- Planning long-term strategy (use `/keyword-cluster`)
- Writing product page copy (use `/product-description-writer`)
- Need Meta ad copy (use `/ad-copy-variants`)
- Generating ad creative images (use `/ad-creative-pipeline`)
- Resizing existing images to multiple sizes (use `/asset-batch`)

---

## Phase 1: Weekly Brief

The user provides a brief. Extract or ask for:

```
## Weekly Content Brief

**Week of:** YYYY-MM-DD
**Primary Theme:** _______ (e.g., "Ingredient Science: Niacinamide")
**Secondary Theme:** _______ (e.g., "Summer UV prep")
**Active Campaign:** _______ (e.g., founding batch launch, seasonal push)

**Product Focus:**
- Primary: _______ (e.g., Performance Daily Face Cream)
- Promotion: _______ (e.g., $38 founding price)

**Content from Calendar:**
[Paste any content calendar items scheduled for this week]

**Specific Requests:**
- _______
```

If no brief is provided, pull from the content calendar in Sanity:

```
*[_type == "contentCalendarItem" && publishDate >= $weekStart && publishDate <= $weekEnd] | order(publishDate asc) {
  title, angle, contentType, pillar, funnelStage, contentBrief
}
```

Use `mcp__Sanity__query_documents` to execute. If the query returns nothing, default to the brand's core messaging pillars: simplicity, performance, credibility, founding batch urgency.

---

## Phase 2: Weekly Content Mix

Every week maintains this ratio across all posts:

| Category | % of Posts | Purpose | Examples |
|----------|-----------|---------|---------|
| **Educational** | 40% | Teach something useful, build authority | Ingredient deep-dives, skincare myths busted, how-to |
| **Product / Promotional** | 30% | Showcase the product, drive conversion | Product benefits, absorption demo, pricing, CTA |
| **Social Proof / UGC** | 20% | Build trust through real people | Tester quotes, review highlights, results |
| **Brand Personality** | 10% | Show the human side, build connection | Behind the scenes, Colorado lifestyle, founder takes |

### Weekly Post Count

| Platform | Posts/Week | Breakdown |
|----------|-----------|-----------|
| **IG Feed** | 3-4 | 1-2 educational + 1 product + 1 UGC/proof |
| **IG Stories** | 5-7 | 2 polls/quizzes + 2 education + 1-2 BTS + 1 CTA |
| **IG Reels** | 2-3 | 1-2 educational hooks + 1 product demo or trend |
| **Facebook** | 2-3 | 1 long-form + 1 product/testimonial + 1 link post |

**Total: 12-17 content pieces per week.**

---

## Phase 3: Generate Content

### Output Format for Every Post

```
---
## [Post Title / Internal Reference]

**Platform:** Instagram Feed | Instagram Stories | Instagram Reels | Facebook
**Format:** Single Image | Carousel | Story Sequence | Reel | Text + Image
**Category:** Educational | Product | Social Proof | Brand Personality
**Posting Date:** YYYY-MM-DD
**Posting Time:** HH:MM [timezone]

### Copy
[Full caption / post copy — platform-native length and style]

### Visual Direction
[Detailed description of the image/video — enough for nano-banana-pro or a designer]

### Hashtags
[Platform-appropriate hashtag set]

### Engagement Prompt
[Question, poll, or CTA designed for male 20-40 audience]

### Image Generation Prompt (nano-banana-pro)
[Ready-to-use prompt if applicable]
---
```

---

## Phase 3A: Instagram Feed Posts (3-4/week)

### Caption Rules

- **Length:** 150-300 words (Instagram rewards longer captions for engagement)
- **Structure:** Hook (first line) > Value > CTA > Hashtags
- **First line is everything.** It is the only thing visible before "...more". Make it sharp.
- **Line breaks** between every 1-2 sentences for mobile readability
- **No emojis.** Brand guidelines ban them.
- **No exclamation marks** in the opening hook
- **CTA in every post:** Link in bio, comment trigger, save prompt, or share prompt

### Hook Formulas That Work for Men

```
"Most guys don't know this about [topic]."
"The [number] skincare mistake you're making right now."
"Your face does [surprising fact] every single day."
"Stop buying [product category]. Here's why."
"[Specific claim]. Here's the proof."
"One ingredient. [Dramatic result]."
"I tested [thing] for [time]. Here's what happened."
"[Pain point]? There's one fix."
```

### Post Type Templates

**Educational Carousel (1-2/week):**
```
Slide 1: Bold hook text on brand-dark background (UPPERCASE, DM Sans Black)
Slide 2-5: One point per slide — short text + supporting visual
Slide 6: Summary + CTA ("Save this. Link in bio.")

Caption: Expand on the topic. Add context the slides don't cover.
End with: "Save this for later." or "Tag a guy who needs this."

Visual notes: Dark background (#0A0A0A), white text (#EBEBEB), sharp corners.
Each slide has one idea. No clutter. Text large enough to read on mobile.
```

**Product Spotlight (1/week):**
```
Visual: Product on dark surface, dramatic lighting, macro texture detail
Caption: Single benefit as hook -> how it works -> ingredient callout -> CTA
Focus: ONE benefit per post, not the entire product story

Example flow:
Hook: "Absorbs in 15 seconds. Not 15 minutes."
Body: What makes it different (squalane + niacinamide formulation)
Proof: "50 guys tested it. Zero greasy complaints."
CTA: "Link in bio. $38."
```

**UGC-Style / Social Proof Post (1/week):**
```
Visual: Product-in-hand photo, natural lighting, casual composition
Caption: Tester quote as the hook -> product story -> CTA
Feels: native, not branded. Like a guy posted this himself.

Example flow:
Hook: "'One step, no shine — that's all I wanted.' — Sean G., 34"
Body: What the product does, why it clicked for him
CTA: "Same deal. $38. Link in bio."
```

---

## Phase 3B: Instagram Stories (5-7/week)

### Story Rules

- **Vertical only** (9:16 / 1080x1920)
- **Text must be readable** at mobile size (large font, high contrast)
- **Every story has an interaction element:** poll, quiz, slider, question box, or link sticker
- **Duration:** Keep text stories to 3-5 seconds of reading time
- **Sequence:** Stories can be 1-3 frames telling a micro-story
- **Safe zones:** Avoid top 14% (profile pic/username) and bottom 20% (reply bar)

### Story Type Templates

**Poll / Quiz (2/week):**
```
Frame: Question on brand-dark background with product image
Interaction: Poll sticker or quiz sticker

Examples:
- "What bugs you more? [Greasy face] vs [Dry skin]"
- "How many products in your routine? [0-1] [2-3] [4+]"
- "Quiz: Which ingredient controls oil? [Niacinamide] [Retinol] [Coconut Oil]"
- "Rate your current skincare: [Not great...] to [Dialed in]" (slider)
```

**Behind the Scenes (1-2/week):**
```
Frame: Casual photo/video — formulation process, Colorado landscape, packaging, warehouse
Copy: 1-2 sentences, conversational. Show the real process.
Interaction: Question sticker "What do you want to know about the formula?"
```

**Product Education (1-2/week):**
```
Frame 1: "Did you know..." or quick fact about skin/ingredients
Frame 2: How Base Layer addresses it
Frame 3: CTA with link sticker to baselayerskin.co

Keep each frame to one idea. Big text. Dark background.
```

**CTA / Link (1/week):**
```
Frame: Product image or lifestyle shot
Copy: Direct CTA — "Founding batch. $38. Link below."
Interaction: Link sticker to baselayerskin.co
Placement: End of the day's story sequence (after value frames)
```

---

## Phase 3C: Instagram Reels (2-3/week)

### Reel Rules

- **Hook in the first 1.5 seconds** — text on screen + spoken word or caption
- **Length:** 15-45 seconds (sweet spot for reach)
- **Vertical 9:16** always (1080x1920)
- **Text overlay** on every key frame (most viewers watch without sound)
- **Trending audio** when it fits — but the content must work on mute
- **End with CTA:** "Follow for more" or "Link in bio"

### Reel Structure

```
HOOK (0-2s):    Text on screen + opening line. Must stop the scroll.
BODY (2-25s):   Deliver the value. 3-5 quick points or a demonstration.
PAYOFF (25-35s): The result, the proof, or the punchline.
CTA (35-45s):   "Follow for more." / "Link in bio." / "Save this."
```

### Reel Type Templates

**Hook + Education (1-2/week):**
```
Hook: "Most guys use moisturizer wrong." [text on screen, spoken or captioned]
Body: 3 quick points, each with text overlay and visual change
Payoff: Product as the solution — quick shot of the jar
CTA: "Follow @baselayerskin for more."

Script format:
[0-2s]  TEXT: "Most guys use moisturizer wrong." VISUAL: Close-up of guy applying product
[2-8s]  TEXT: "1. Too much product." VISUAL: Demonstration of correct amount
[8-14s] TEXT: "2. On wet skin = better absorption." VISUAL: Application technique
[14-20s] TEXT: "3. Skip the 6-step routine." VISUAL: Single jar vs. bathroom clutter
[20-30s] TEXT: "One step. 15 seconds. Done." VISUAL: Product hero shot
[30-35s] TEXT: "Follow for more." VISUAL: Logo

Audio suggestion: [Clean beat, 120 BPM, trending if available]
Backup audio: [Original voiceover — record in conversational tone, not announcer voice]
```

**Product Demo (1/week):**
```
Hook: "15 seconds. Watch." [timer overlay on screen]
Body: Real-time application and absorption demo
Payoff: Matte finish result — touch test, no shine
CTA: "Link in bio. $38 founding price."

Audio suggestion: [Satisfying ASMR-style audio or clean ambient beat]
```

**Trend Adaptation (when applicable):**
```
Hook: [Trending format adapted to skincare/men's angle]
Body: Base Layer twist on the trend — keep it authentic
Payoff: Product tie-in that feels natural, not forced
CTA: Standard follow/link CTA

Audio: The trending audio that inspired the format
Rules:
- Only use trends that fit the brand voice
- Skip anything requiring emojis, excessive energy, or cringe humor
- The brand is confident and direct — trends should amplify that, not contradict it
- If a trend cannot be done without looking desperate, skip it
```

### Audio Research Notes

Before generating reel scripts, check current trending audio:
- Instagram Reels tab (top trending sounds this week)
- Suggest 2-3 audio options per reel since trends change weekly
- Always write the script so it works on mute with text overlays
- Voiceover should sound like a friend talking, not a commercial narrator

---

## Phase 3D: Facebook Posts (2-3/week)

### Facebook Rules

- **Longer form performs better on FB** — 200-400 words for text posts
- **No engagement bait** ("Like if you agree", "Share with a friend who...")
- **FB rewards meaningful interaction** — ask genuine questions
- **Link posts get less reach** — use sparingly (1/week max)
- **Native video and carousels get priority** in the algorithm
- **Image posts outperform text-only** — always attach a visual

### FB Post Type Templates

**Long-form Educational (1/week):**
```
Structure: Hook question -> 3-4 paragraphs of value -> Product tie-in -> Discussion question

Length: 250-400 words
Tone: More conversational than IG. Like explaining something to a buddy over drinks.
End with: A genuine question that invites discussion (not engagement bait).

Example ending: "What's the one thing you'd want your skincare to do?
Curious what matters most to you."
```

**Product + Testimonial (1/week):**
```
Structure: Tester quote as hook -> What the product does -> Specifics -> CTA

Length: 150-250 words
Include: Product image, tester quote, key benefit, price
CTA: Link to site or "Drop a comment if you want to know more"
```

**Link Post (1/week max):**
```
Structure: 2-3 sentence teaser -> Link to blog post or product page

Length: 50-100 words (short — the article does the work)
Image: Auto-generated OG image from the link, or custom graphic
Note: These get less organic reach — reserve for high-value content
```

---

## Phase 4: Hashtag Strategy

### Hashtag Sets (Rotate Weekly)

**Branded (always include 1-2):**
```
#baselayerskin #baselayer #onestepzeroshine
```

**Niche — Men's Skincare (pick 5-8):**
```
#mensskincare #skincarformen #mensgrooming #guyskincare
#mensfacecare #malegrooming #menskincareroutine #groomingformen
#mensskincaretips #skincareguysguide
```

**Ingredient / Education (pick 2-3 when relevant):**
```
#niacinamide #skincareingredients #skinbarrier #hyaluronicacid
#skincareforbeginners #skincaretips #cleanformula
```

**Lifestyle / Audience (pick 2-3):**
```
#menslifestyle #looksharp #dailyroutine #simplicity
#coloradolife #activelifestyle #minimalistroutine #breckenridge
```

**Trending (rotate — research weekly):**
```
[Use WebSearch to find current trending hashtags in men's grooming space]
```

### Hashtag Rules

| Platform | Count | Placement |
|----------|-------|-----------|
| IG Feed | 15-20 | In caption below the fold, or in first comment |
| IG Reels | 5-8 | In caption (fewer = better for Reels discovery) |
| IG Stories | 1-3 | Use hashtag sticker, not text |
| Facebook | 0-3 | In post body (FB penalizes hashtag-heavy posts) |

---

## Phase 5: Posting Schedule

### Optimal Times for Male 20-40 on Meta

| Day | IG Feed | IG Stories | IG Reels | Facebook |
|-----|---------|------------|----------|----------|
| **Monday** | 12:00-1:00pm | 8:00am, 7:00pm | -- | -- |
| **Tuesday** | 7:00-8:00am | 8:00am, 6:30pm | 8:00am | 1:00-2:00pm |
| **Wednesday** | -- | 8:00am, 7:00pm | -- | 1:00-2:00pm |
| **Thursday** | 7:00-8:00am | 8:00am, 6:30pm | 8:00am | 1:00-2:00pm |
| **Friday** | -- | 8:00am, 5:00pm | -- | -- |
| **Saturday** | 9:00-10:00am | 10:00am, 6:00pm | 10:00am | -- |
| **Sunday** | -- | 10:00am | -- | 12:00-1:00pm |

**Timing logic:**
- Weekday mornings (7-9am): morning scroll before work/commute
- Weekday lunch (12-1pm): lunch break scroll
- Evenings (6-8pm): post-work wind-down
- Saturday mornings: longer browsing sessions, good for educational content
- All times in the audience's primary timezone (default: US Mountain, adjust per analytics)
- These are starting points — refine based on Instagram Insights data after 4-6 weeks

---

## Phase 6: Engagement Prompts for Male Audiences

Generic "comment below" does not work for men 20-40. Use these patterns instead.

### Engagement Formats That Work

**Opinion / Preference:**
```
"Matte finish or dewy? Pick one."
"Morning routine: before or after the shower?"
"One product or five? Where do you land?"
```

**Challenge / Bet:**
```
"Bet you can't name 3 ingredients in your current moisturizer."
"Try this for 2 weeks. Come back and tell me I'm wrong."
"Your current routine takes how long? Be honest."
```

**Knowledge Test:**
```
"What does niacinamide actually do? Wrong answers only."
"Quick — what's the #1 cause of oily skin? (It's not what you think.)"
```

**Direct Question:**
```
"What's the one thing you hate about your current skincare?"
"How many products are sitting unused under your sink right now?"
"At what age did you start giving a damn about your skin?"
```

**This or That:**
```
"Oily by noon OR dry and flaking — which is your deal?"
"Buy one good product OR five cheap ones?"
"SPF every day OR only at the beach?"
```

### Engagement Rules
- Never use "Tag a friend" or "Share if you agree" (engagement bait = reach penalty)
- Questions should be genuinely interesting, not performative
- Keep it casual — the brand talks like a friend, not a marketer
- Respond to every comment within 2 hours during business hours
- Pin the best comment to the top of each post

---

## Phase 7: Image Generation Prompts

For posts that need generated visuals, output prompts ready for nano-banana-pro.

### Generation Command

```bash
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "[detailed prompt]" \
  --filename "[post-reference]-[platform].png" \
  --resolution 1K
```

### Prompt Templates by Post Type

**Product on Dark Surface (product spotlight posts):**
```
Create an image of: a 50mL white skincare jar labeled "BASE LAYER" on a dark
slate stone surface. Style: premium product photography, minimal. Composition:
centered, slight top-down angle. Lighting: dramatic side light with warm accent,
dark moody background. Background: near-black with subtle texture. Color palette:
monochrome — black, white, dark gray. Avoid: bright colors, cluttered backgrounds,
feminine styling, rounded soft aesthetics.
```

**Educational Text Graphic (carousel slides, info posts):**
```
Create an image of: a bold typographic design on a pure black background. Text
reads "[HEADLINE TEXT]" in white uppercase sans-serif font (DM Sans style, extra
bold, tight tracking). Style: modern minimalist graphic design. Composition:
centered text with generous margins. Lighting: n/a — flat graphic. Color palette:
black background (#0A0A0A), white text (#EBEBEB). Avoid: gradients, colors,
decorative elements, rounded fonts, emojis.
```

**Lifestyle / Colorado (brand personality, aspiration posts):**
```
Create an image of: a man in his late 20s-30s outdoors in a mountain setting
(Colorado Rockies style). Style: editorial lifestyle photography, natural and
candid. Composition: environmental portrait, rule of thirds. Lighting: golden
hour natural light, dramatic mountains in background. Background: snow-capped
peaks, alpine environment. Color palette: natural tones with cool mountain air
feel. Avoid: studio lighting, posed model look, stock photo aesthetic, feminine
styling.
```

**Before/After Skin Texture (social proof, results posts):**
```
Create an image of: a split-screen comparison showing male facial skin — left
side shows oily/shiny texture, right side shows matte/healthy texture. Style:
clinical but approachable, real skin texture. Composition: 50/50 split with
clean dividing line. Lighting: even, soft studio lighting to show skin texture.
Color palette: neutral, skin tones. Avoid: airbrushed skin, unrealistic results,
feminine presentation.
```

**Ingredient Close-Up (educational, science posts):**
```
Create an image of: a minimalist scientific visualization of [ingredient name]
on a dark background. Style: clean, modern, editorial science aesthetic.
Composition: centered with text space above and below. Lighting: soft, even,
with subtle glow on the subject. Color palette: near-black background, white
accents, single amber highlight for emphasis. Avoid: overly clinical/medical
look, colorful chemistry visuals, feminine aesthetics.
```

---

## Brand Voice — Applied to Social

Read and internalize: `/Users/samdoyle/baselayer-lovable-export/brand/BASE_LAYER_BRAND_GUIDELINES.md`

**Social-specific rules:**
- Voice is "Your Sharp Friend" — direct, confident, conversational
- Headlines/hooks: UPPERCASE, short, punchy
- No emojis. Not in captions, not in stories, not in comments.
- No exclamation marks in hooks or headlines
- No "we believe" or "we think" — state facts
- No feminine language: pamper, indulge, ritual, glow-up, self-care Sunday
- Lead with benefits, not features
- Use real numbers: "15 seconds", "50 testers", "$38", "6-8 weeks"
- Colorado/altitude story is a credibility anchor — reference it at least once per week
- The brand is monochrome. Dark backgrounds, white text. Color is functional only.

---

## Quality Gate

Before finalizing the weekly batch:

- [ ] Content mix matches target: ~40% educational, ~30% product, ~20% social proof, ~10% brand personality
- [ ] Every post has: copy + visual direction + hashtags + posting time
- [ ] First line of every caption is a scroll-stopping hook
- [ ] No banned words (pamper, indulge, luxurious, ritual, self-care, glow-up)
- [ ] No exclamation marks in hooks or headlines
- [ ] No emojis anywhere in any copy
- [ ] Hashtags follow platform-specific count rules (15-20 IG Feed, 5-8 Reels, 1-3 Stories, 0-3 FB)
- [ ] Reel scripts have full structure: hook + body + payoff + CTA with timestamps
- [ ] Reel scripts work on mute (text overlays specified for every key frame)
- [ ] Audio suggestions included for each reel (trending + backup)
- [ ] Facebook posts are longer form (200+ words for educational)
- [ ] Engagement prompts are male-audience appropriate (no "tag a friend")
- [ ] Posting times match the optimal schedule for male 20-40 on Meta
- [ ] nano-banana-pro prompts included for every post needing a generated image
- [ ] Visual direction is specific enough for a designer or image gen tool
- [ ] All CTAs use approved brand language from guidelines
- [ ] Colorado/altitude story referenced at least once during the week
- [ ] At least one post per week includes a specific number or proof point
- [ ] Story safe zones respected (no content in top 14% or bottom 20%)

---

## Handoff

```
## Weekly Social Batch Handoff

**Week of:** YYYY-MM-DD
**Theme:** [Primary theme]

**Content Produced:**
- IG Feed: [X] posts (types: [carousel, product, UGC])
- IG Stories: [X] frames (types: [poll, quiz, BTS, education, CTA])
- IG Reels: [X] scripts (types: [education, demo, trend])
- FB Posts: [X] posts (types: [long-form, testimonial, link])
- Total: [X] content pieces

**Content Mix Achieved:**
- Educational: [X]% ([count] pieces)
- Product: [X]% ([count] pieces)
- Social Proof: [X]% ([count] pieces)
- Brand Personality: [X]% ([count] pieces)

**Image Generation Needed:** [X] images via nano-banana-pro
**Prompts Ready:** [X] / [X]

**Scheduling Tool:** [Manual / Buffer / Later / Meta Business Suite]

**Next Steps:**
1. Generate images with nano-banana-pro
2. Review and approve all copy
3. Schedule via [scheduling tool]
4. Monitor engagement and respond to comments within 2 hours
```
