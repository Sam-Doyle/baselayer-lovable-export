# Content Calendar Planner

**Strategic content planning for Base Layer Skin across blog, social, email, and video channels.**

Takes brand voice, keyword targets, and seasonal context to generate 30/60/90 day content plans mapped to the customer journey and funnel stages. Outputs structured data ready to write to Sanity as draft documents.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/voice/tone-rules.md`
- `brand/references/product/catalog.md`
- `brand/references/audience/icp-core.md`
- `brand/references/audience/segments.md`
- `brand/references/channels/social-specs.md`

---

## The Process

```
1. INPUTS    → Gather planning parameters
2. AUDIT     → Review existing content + gaps
3. MAP       → Align to customer journey + seasonality
4. GENERATE  → Build the content plan
5. OUTPUT    → Structured data → Sanity drafts
```

---

## Example

### Input
```
/content-calendar
Duration: 30 days
Focus: Product launch week + ongoing education
Start date: 2026-04-01
```

### Output (abbreviated)
```markdown
# Content Calendar — April 2026

## Week 1: Launch Push (Apr 1-7)
| Date | Platform | Pillar | Topic | Funnel | Format |
|------|----------|--------|-------|--------|--------|
| Apr 1 | IG Feed | Product (20%) | "WHAT'S ACTUALLY IN YOUR MOISTURIZER" | TOFU | Carousel |
| Apr 1 | IG Story | Education (25%) | SPF myth poll | TOFU | Poll |
| Apr 2 | FB Post | Social Proof (15%) | Customer before/after | MOFU | Image |
| Apr 3 | IG Reel | Ingredient Science (20%) | Niacinamide 60-sec explainer | TOFU | Video |
| Apr 4 | IG Feed | Lifestyle (20%) | Morning routine integration | MOFU | Carousel |
...

## Pillar Distribution Check
- Ingredient Science: 6 posts (20%) ✅
- Education: 8 posts (26%) ✅
- Product: 6 posts (20%) ✅
- Lifestyle: 6 posts (20%) ✅
- Social Proof: 4 posts (13%) ⚠️ slightly under — add 1 testimonial post
```

---

## When to Use This Skill

**Use when:**
- Planning the next 30/60/90 days of content
- Launching a new campaign or product drop
- Seasonal planning (summer, winter, holidays)
- Content feels random or disconnected from funnel goals
- Need to fill gaps in the customer journey

## When NOT to Use
- For writing actual post copy (use `/social-content-batch`)
- For email scheduling (use `/email-strategist`)
- For SEO content planning specifically (use `/keyword-cluster` → feeds into this calendar)
- For ad creative scheduling (use `/ad-creative-pipeline`)

---

## Phase 1: Inputs

Gather these before generating:

```
## Content Calendar Intake

**Planning Horizon:**
[ ] 30 days (tactical sprint)
[ ] 60 days (campaign arc)
[ ] 90 days (quarterly strategy)

**Start Date:** ________

**Keyword Targets (up to 10):**
- Primary: _______ (e.g., "men's face cream", "skincare for men")
- Secondary: _______ (e.g., "niacinamide benefits", "oily skin men")
- Long-tail: _______ (e.g., "best face cream for men who don't use skincare")

**Active Campaigns / Launches:**
- _______ (e.g., founding batch launch, summer campaign)

**Content Already Published:**
- Blog posts: _______
- Email sequences: _______
- Social themes covered: _______

**Budget / Capacity:**
- Blog posts per month: ___ (recommend 4-6)
- Email sends per month: ___ (recommend 4-8)
- Social posts per week: ___ (recommend 10-15 across platforms)
- Video scripts per month: ___ (recommend 2-4)
```

---

## Phase 2: Content Pillars

Every piece of content maps to one of these five pillars. Maintain a balanced mix across the plan.

| Pillar | Weight | Description | Example Angles |
|--------|--------|-------------|----------------|
| **Ingredient Science** | 20% | What's in it, why it works, how it's different | Niacinamide deep dive, peptide science, why squalane beats coconut oil |
| **Men's Skincare Education** | 25% | Teaching guys who know nothing about skincare | What does moisturizer actually do, how to tell your skin type, SPF basics |
| **Product Benefits** | 20% | How Base Layer solves specific problems | 15-second absorption, replaces 3 products, matte finish all day |
| **Lifestyle / Confidence** | 20% | Looking sharp without overthinking it | Morning routine under 2 minutes, first impressions, post-workout skin |
| **Social Proof** | 15% | Real results, real guys, real feedback | Tester stories, before/after, "50 guys, zero refunds" |

---

## Phase 3: Seasonal Calendar Overlay

Map content to seasonal skincare concerns and cultural moments relevant to men 20-40.

### Skincare Seasons

| Period | Theme | Content Angles |
|--------|-------|----------------|
| **Jan-Feb** | New Year Reset | "Simplify your routine in 2026", resolution content, cold weather skin repair, dry air defense |
| **Mar-Apr** | Spring Transition | Seasonal skin changes, allergy season + skin barrier, outdoor activity ramp-up |
| **May-Jun** | Summer Prep + Father's Day | Sun protection education, gift guides for Father's Day, sweat-proof skincare, outdoor lifestyle |
| **Jul-Aug** | Peak Summer | UV damage control, post-sun repair, oil control in heat, travel-size routines |
| **Sep-Oct** | Fall Reset | Skin recovery after summer, back-to-routine content, altitude/dry air (Colorado story) |
| **Nov-Dec** | Holiday + Winter | Gift guides for men, winter dryness, holiday party skin, year-end "best of" roundups |

### Cultural Moments for Male 20-40

- **Super Bowl (Feb):** "Game day, not greasy face day"
- **March Madness (Mar):** Bracket-style content (ingredients face-off)
- **Father's Day (Jun):** Gift guide, "upgrade his bathroom shelf"
- **Back to Office (Sep):** First impressions, looking sharp on camera
- **Movember (Nov):** Men's health awareness tie-in, beard care adjacent
- **Black Friday / Cyber Monday (Nov):** Promotional content, founding price lock
- **New Year (Dec-Jan):** "One resolution you'll actually keep"

---

## Phase 4: Customer Journey Mapping

Every content piece targets one funnel stage. Balance the plan so you're not over-indexing on awareness without conversion support.

### Funnel Distribution Target

| Stage | % of Content | Goal | Content Types |
|-------|-------------|------|---------------|
| **TOFU (Awareness)** | 40% | Reach new audiences, educate | Blog SEO, IG Reels, educational carousels, FB posts |
| **MOFU (Consideration)** | 30% | Build trust, address objections | Ingredient spotlights, comparison content, email nurture, founder story |
| **BOFU (Purchase)** | 20% | Convert to buyer | Product-focused posts, testimonials, urgency/scarcity, email offers |
| **Retention** | 10% | Keep buyers engaged, drive referrals | Usage tips, reorder reminders, community content, loyalty hooks |

---

## Phase 5: Meta Content Mix

For Instagram and Facebook specifically, maintain this weekly content mix:

### Instagram Feed (3-4 posts/week)

| Format | Frequency | Purpose | Example |
|--------|-----------|---------|---------|
| **Educational Carousel** | 1-2/week | TOFU — teach something useful | "5 ingredients your face cream needs (and 3 it doesn't)" |
| **UGC-Style** | 1/week | Social proof — looks native, not branded | Tester quote over product-in-hand photo |
| **Product Spotlight** | 1/week | MOFU/BOFU — showcase the product | Ingredient callout, texture close-up, absorption demo |

### Instagram Stories (5-7/week)

| Format | Frequency | Purpose |
|--------|-----------|---------|
| **Poll / Quiz** | 2/week | Engagement — "What's your biggest skin complaint?" |
| **Behind the Scenes** | 1-2/week | Brand personality — formulation, Colorado, founder |
| **Product Education** | 1-2/week | MOFU — quick tips, ingredient facts |
| **CTA / Link** | 1/week | BOFU — drive to site, email capture |

### Instagram Reels (2-3/week)

| Format | Frequency | Purpose |
|--------|-----------|---------|
| **Hook + Education** | 1-2/week | TOFU — "Most guys don't know this about their skin" |
| **Before/After** | 1/week | Social proof — absorption demo, skin transformation |
| **Trend Adaptation** | 1/week | Reach — trending audio + skincare angle |

### Facebook (2-3/week)

| Format | Frequency | Purpose |
|--------|-----------|---------|
| **Long-form Educational** | 1/week | TOFU — deeper dive, FB rewards longer posts |
| **Product + Testimonial** | 1/week | MOFU/BOFU — social proof driven |
| **Link Post** | 1/week | Traffic — blog post or landing page |

---

## Phase 6: Generate the Plan

For each content piece in the plan, output this structure:

```
## [Content Piece Title]

**Date:** YYYY-MM-DD
**Pillar:** [Ingredient Science | Education | Product Benefits | Lifestyle | Social Proof]
**Funnel Stage:** [TOFU | MOFU | BOFU | Retention]
**Content Type:** [Blog | IG Feed | IG Story | IG Reel | FB Post | Email | Video Script]
**Target Keyword:** [primary keyword this piece targets]
**Seasonal Hook:** [if applicable — e.g., "Summer UV protection"]

### Angle
[1-2 sentences: what's the specific take/hook for this piece]

### Content Brief (200 words)
[Detailed brief covering: key points to hit, tone notes, data/stats to reference,
CTA direction, visual direction if social, subject line if email.
Reference Base Layer brand voice: direct, confident, conversational.
No "pamper", "indulge", "luxurious". Speak to men who are new to skincare.
Lead with benefits. Use real numbers. Short sentences. Period-terminated.]

### Meta Content Format
[If social: carousel/single image/reel/story + visual direction]
[If blog: H2 outline + target word count]
[If email: subject line + preview text + CTA]
[If video: hook + 3-act structure + CTA]
```

### Posting Frequency Recommendations

| Platform | Frequency | Best Times (Male 20-40 on Meta) |
|----------|-----------|-------------------------------|
| IG Feed | 3-4x/week | Tue/Thu/Sat 7-9am, Mon/Wed 12-1pm |
| IG Stories | Daily (5-7/week) | 8-10am, 6-8pm |
| IG Reels | 2-3x/week | Tue/Thu 8am, Sat 10am |
| Facebook | 2-3x/week | Wed/Thu 1-3pm, Sun 12-2pm |
| Email | 1-2x/week | Tue/Thu 7-8am |
| Blog | 1-2x/week | Publish Mon/Wed for SEO crawl timing |

---

## Phase 7: Output to Sanity

After the plan is approved, write each content piece to Sanity as a draft document.

### Sanity Document Structure

Use the Sanity MCP to create draft documents with this shape:

```json
{
  "_type": "contentCalendarItem",
  "title": "Content piece title",
  "publishDate": "YYYY-MM-DD",
  "pillar": "ingredientScience | education | productBenefits | lifestyle | socialProof",
  "funnelStage": "tofu | mofu | bofu | retention",
  "contentType": "blog | igFeed | igStory | igReel | fbPost | email | videoScript",
  "targetKeyword": "primary keyword",
  "seasonalHook": "seasonal tie-in if applicable",
  "angle": "1-2 sentence angle/hook",
  "contentBrief": "Full 200-word brief",
  "metaFormat": "Format-specific details",
  "status": "planned",
  "platform": "instagram | facebook | email | blog | youtube"
}
```

### Batch Creation Workflow

1. Generate the full plan as structured data
2. Review with user — mark any items to cut or revise
3. Use `mcp__Sanity__create_documents_from_json` to batch-create all approved items as drafts
4. Each document gets `status: "planned"` — move to "in-progress" and "published" as content is produced

### Query Existing Content

Before generating, check what already exists in Sanity:

```
*[_type == "contentCalendarItem"] | order(publishDate asc) {
  title, publishDate, pillar, funnelStage, contentType, status
}
```

This prevents duplicate topics and ensures the new plan builds on what's already scheduled.

---

## Edge Cases
- If duration exceeds 90 days: split into 3 monthly calendars with a quarterly theme overview connecting them. Do not generate a single 90+ day table.
- If a seasonal event falls within the window (e.g., Father's Day, Black Friday): automatically allocate 30% of that week's content to event-themed posts, reducing Lifestyle and Education pillars proportionally.
- If user specifies fewer than 3 content pillars: warn that brand consistency requires all 5 pillars, generate with all 5 but weight the specified pillars at 30% each and distribute remaining 10% across others.
- If Sanity MCP connection fails during batch creation: save calendar as local markdown to `content/calendar/YYYY-MM-calendar.md` and provide manual Sanity import instructions.
- If start date is in the past: adjust to next Monday and flag the date shift to the user.

---

## Quality Gate

Before finalizing the content calendar:

- [ ] Every piece maps to a pillar + funnel stage (no orphan content)
- [ ] Seasonal hooks are timely and relevant to the planning window
- [ ] Keyword targets are distributed across the plan (not all on one post)
- [ ] Content mix matches the 40/30/20/10 funnel distribution
- [ ] Meta content follows the weekly format mix (carousel, UGC, product, reel, story)
- [ ] No feminine skincare language ("pamper", "indulge", "luxurious ritual", "self-care Sunday")
- [ ] All copy direction follows Base Layer voice: direct, confident, no exclamation marks, no emojis
- [ ] Posting frequency is sustainable for stated capacity
- [ ] Plan builds on existing published content (no duplicate angles)
- [ ] Sanity document structure is valid before batch creation

---

## Handoff

```
## Content Calendar Handoff

**Planning Window:** [30/60/90 days from start date]
**Total Pieces Planned:** [count]
**Breakdown:**
- Blog: [count]
- IG Feed: [count]
- IG Stories: [count]
- IG Reels: [count]
- FB Posts: [count]
- Email: [count]
- Video Scripts: [count]

**Pillar Distribution:**
- Ingredient Science: [%]
- Education: [%]
- Product Benefits: [%]
- Lifestyle: [%]
- Social Proof: [%]

**Funnel Distribution:**
- TOFU: [%]
- MOFU: [%]
- BOFU: [%]
- Retention: [%]

**Sanity Status:** [X] items written as drafts
**Next Step:** Begin production on Week 1 content using social-content-batch
```
