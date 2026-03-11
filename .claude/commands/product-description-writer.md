# Product Description Writer

**SEO-optimized, conversion-driven product copy for Base Layer Skin.**

Takes product data (from Sanity, Shopify export, or manual input), applies brand voice guidelines, and generates a complete product page copy suite — hero headline through Schema.org markup. Built for men who are new to skincare: direct, science-backed, zero fluff. Can batch-process an entire catalog and write directly to Sanity via MCP.

---

## The Process

```
1. INPUT     -> Product data (name, ingredients, benefits, price)
2. RESEARCH  -> Keyword targets + competitor positioning
3. GENERATE  -> Full product description suite (9 sections)
4. OPTIMIZE  -> SEO metadata + Schema.org markup
5. PUBLISH   -> Write to Sanity via MCP or export for manual paste
```

---

## When to Use This Skill

**Use when:**
- Launching a new product and need full page copy
- Rewriting existing product descriptions for SEO
- Batch processing the entire catalog
- A/B testing new copy angles on existing products
- Expanding to new channels (Amazon, retail) that need different copy formats

**Skip when:**
- Need social captions (use `/social-content-batch`)
- Planning content strategy (use `/keyword-cluster`)
- Need ad copy specifically (use `/ad-copy-variants`)
- Need schema markup only without product copy (use `/schema-deployer`)

---

## Phase 1: Product Input

Gather this data before writing. Accept from Sanity query, Shopify export, or manual input.

```
## Product Data Intake

**Product Name:** _______ (e.g., "Performance Daily Face Cream")
**SKU:** _______ (e.g., BL-PDFC-50ML)
**Price:** $_______ (founding: $38 / post-launch: $48)
**Size:** _______ (e.g., 50 mL)

**Key Ingredients (up to 8):**
1. _______ -> Benefit: _______
2. _______ -> Benefit: _______
3. _______ -> Benefit: _______
(Reference brand guidelines Section 9 for current product data)

**Key Claims:**
- _______
- _______
- _______

**Target Keywords:**
- Primary: _______ (e.g., "men's face cream")
- Secondary: _______ (e.g., "moisturizer for men", "men's skincare")
- Long-tail: _______ (e.g., "best face cream for oily skin men")

**Competitive Positioning:**
- What makes this different from Lumin, Tiege Hanley, Bulldog, Hims, Geologie?

**Target Skin Concerns:**
[ ] Oily / shine
[ ] Dry / flaking
[ ] Aging / fine lines
[ ] Sensitivity / redness
[ ] Post-shave irritation
[ ] "I don't know, I just want to look better"
```

### Pull from Sanity

If product data exists in Sanity, query it first:

```
*[_type == "product" && slug.current == $slug][0] {
  title, price, sku, ingredients, benefits, description
}
```

Use `mcp__Sanity__query_documents` to execute this query. If the schema is unknown, run `mcp__Sanity__get_schema` first to discover the product content type structure.

---

## Phase 2: Brand Voice Rules

**Read and internalize these before writing a single word.**

Reference: `/Users/samdoyle/baselayer-lovable-export/brand/BASE_LAYER_BRAND_GUIDELINES.md` Section 7.

### Voice: "Your Sharp Friend"
Direct, confident, conversational. Like a friend who happens to know about skincare but doesn't make it weird.

### Mandatory Tone Rules

| Rule | Do | Don't |
|------|-----|-------|
| Lead with benefits | "Controls shine all day" | "Contains oil-absorbing niacinamide" |
| Be specific | "Absorbs in 15 seconds" | "Fast-absorbing formula" |
| Use real numbers | "50 testers. Zero refund requests." | "Loved by customers" |
| Stay conversational | "That greasy feeling? Gone." | "Eliminates excess sebum" |
| State facts | "The product works." | "We believe this could help" |
| Short sentences | "One step. Done." | "Our carefully formulated product" |

### Banned Words and Phrases

Never use these in any product copy:

```
FEMININE SKINCARE LANGUAGE (hard ban):
- pamper, indulge, luxurious, ritual, self-care Sunday
- treat yourself, spa-like, pampering, decadent
- beauty routine, skincare journey, glow-up
- radiant, luminous, dewy, silky

WEAK/CORPORATE LANGUAGE (hard ban):
- we believe, we think, we feel
- carefully curated, artisanal, elevated, premium experience
- clinically proven (unless you have the clinical trial data)
- revolutionary, game-changing, breakthrough

FILLER (hard ban):
- very, really, truly, incredibly, absolutely
- best-in-class, world-class, cutting-edge
- exclamation marks in any headline or subheadline
- emojis anywhere
```

### Power Words (use these)

```
PERFORMANCE: engineered, formulated, built, designed, tested
SIMPLICITY: one step, done, forget about it, that's it, zero
PROOF: 50 testers, zero refunds, 15 seconds, 6-8 weeks
CONFIDENCE: sharper, cleaner, dialed in, put-together
DIRECTNESS: works, handles, controls, repairs, defends
```

---

## Phase 3: Generate Product Description

Output all of the following sections in order.

### 3A. Hero Headline

**Rules:**
- Benefit-driven, not feature-driven
- UPPERCASE
- 3-8 words
- Period-terminated or no punctuation
- Must pass the "would a guy actually care?" test

**Format:**
```
[HEADLINE — benefit-driven, uppercase, 3-8 words]
```

**Examples for Base Layer:**
```
ONE STEP. ZERO SHINE.
PUT IT ON. FORGET ABOUT IT.
YOUR ENTIRE ROUTINE. ONE PRODUCT.
15 SECONDS. ALL DAY RESULTS.
```

### 3B. Subheadline

**Rules:**
- Integrates the primary target keyword naturally
- Sentence case
- 15-25 words
- Expands on the headline's promise
- Not a repeat of the headline

**Format:**
```
[Subheadline — keyword-integrated, 15-25 words, sentence case]
```

**Example:**
```
The men's face cream that absorbs in 15 seconds, controls shine all day,
and replaces your entire routine. Engineered in Colorado.
```

### 3C. Benefit Bullets (3-5)

**Rules:**
- Each bullet: icon-ready format (short label + explanation)
- Benefit first, mechanism second
- Specific and measurable where possible
- No more than 15 words per bullet

**Format:**
```
[Icon placeholder] **[Benefit Label]** — [1-sentence explanation]
```

**Example:**
```
[clock icon]    **15-Second Absorption** — Apply it. It's gone. No greasy residue, ever.
[shield icon]   **All-Day Shine Control** — Niacinamide regulates oil so your face stays matte.
[layers icon]   **Replaces 3 Products** — Serum + moisturizer + eye cream in one step.
[leaf icon]     **Clean Formula** — No fragrance, no parabens, no filler ingredients.
[calendar icon] **Lasts 6-8 Weeks** — One bottle, two months. $38 founding price.
```

### 3D. Long Description (400+ words)

**Rules:**
- E-E-A-T optimized (Experience, Expertise, Authoritativeness, Trustworthiness)
- Integrate primary and secondary keywords naturally (2-3% density)
- Structure: Problem > Solution > How it works > Proof > CTA
- Short paragraphs (2-3 sentences max)
- Include at least one first-person tester quote
- Reference Colorado origin for credibility
- End with a clear CTA

**Structure:**
```
## [H2: Problem statement — keyword-rich]

[2-3 sentences identifying the pain point. Speak directly to the reader with "you".]

## [H2: Solution — product name + primary keyword]

[2-3 sentences introducing the product as the answer. Lead with the core benefit.]

## [H2: How It Works]

[Explain the key ingredients and what they do. Science-backed but accessible.
No jargon. "Here's what's in it and why it matters."]

## [H2: Built in Colorado]

[Origin story tie-in. Altitude, dry air, UV — the proving ground.
This is the E-E-A-T credibility anchor.]

## [H2: What Real Guys Are Saying]

[2-3 tester quotes. Use the review format from brand guidelines Section 10.
"50 early testers. Zero refund requests."]

## [H2: CTA]

[Direct, urgent, specific. Reference founding price if applicable.]
```

### 3E. Ingredient Spotlight Section

**Rules:**
- Lead with the benefit, then name the ingredient
- 1-2 sentences per ingredient
- Link ingredient to a specific skin concern men have
- No scientific jargon without plain-English translation

**Format:**
```
## WHAT'S INSIDE (AND WHY)

**Controls oil without drying you out** — Niacinamide (Vitamin B3)
regulates sebum production so your face stays matte, not flaky.

**Repairs your skin barrier overnight** — Panthenol (Pro-Vitamin B5)
strengthens the moisture barrier that dry air, shaving, and UV break down.

**Fights aging without looking like you're trying** — Copper Peptide GHK-Cu
signals your skin to produce collagen. Results show up at 4-8 weeks.

**Calms irritation from shaving and weather** — Centella Asiatica
reduces redness and soothes sensitive, post-shave skin.

**Lightweight hydration that disappears** — Squalane
mimics your skin's natural moisture. Absorbs instantly. No residue.

**Locks in deep moisture all day** — Hyaluronic Acid
pulls moisture from the air into your skin and holds it there.
```

### 3F. "Who It's For" Section

**Rules:**
- Target specific male skin concerns and lifestyles
- Use "you" language
- Include 4-6 persona descriptions
- Each persona: 1 sentence, starts with "You" or a direct descriptor

**Format:**
```
## WHO THIS IS FOR

- **The guy who owns zero skincare products** and wants exactly one.
- **The guy with an oily T-zone** who's tired of looking shiny by noon.
- **The guy who bought 5 products** his girlfriend recommended — and uses none of them.
- **The guy who works outdoors** and needs something that handles sun, wind, and dry air.
- **The guy who's noticing fine lines** but isn't ready for "anti-aging cream."
- **The guy who just wants to look sharper** without thinking about it.
```

### 3G. Social Proof Section

**Format:**
```
## WHAT 50 EARLY TESTERS SAID

"One step, no shine — that's all I wanted."
— Sean G. | Oily Skin | Age 34
  Verified Early Tester

"I never wanted a 6-step routine."
— Matt M. | Combination Skin | Age 36
  Verified Early Tester

"Everything else feels heavy now."
— Cooper S. | Dry Skin | Age 27
  Verified Early Tester

**Average rating: 5.0 / 5.0**
**Refund requests: 0**
```

### 3H. SEO Metadata

**Rules:**
- Meta title: 60 characters max, includes primary keyword and brand name
- Meta description: 155 characters max, includes primary keyword, benefit, and CTA
- Both must read naturally — not keyword-stuffed

**Format:**
```
## SEO METADATA

**Meta Title (60 char max):**
[Primary Keyword] | [Benefit] | Base Layer Skin

**Meta Description (155 char max):**
[Benefit-driven sentence with primary keyword. End with CTA or differentiator.]

**URL Slug:**
/products/[keyword-rich-slug]

**Canonical URL:**
https://baselayerskin.co/products/[slug]

**Alt Text for Hero Image:**
[Descriptive, keyword-inclusive alt text for product hero image]
```

**Example:**
```
Meta Title: Men's Face Cream | 15-Second Absorption, Zero Shine | Base Layer
Meta Description: The men's face cream that absorbs in 15 seconds, controls shine all day, and replaces your entire routine. Engineered in Colorado. $38 founding price.
URL Slug: /products/performance-daily-face-cream
Alt Text: Base Layer Performance Daily Face Cream 50mL jar on dark stone surface
```

### 3I. Schema.org Product Markup

Generate JSON-LD structured data for the product page:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Product Name]",
  "description": "[Meta description]",
  "brand": {
    "@type": "Brand",
    "name": "Base Layer Skin"
  },
  "image": "[product hero image URL]",
  "sku": "[SKU]",
  "url": "https://baselayerskin.co/products/[slug]",
  "offers": {
    "@type": "Offer",
    "url": "https://baselayerskin.co/products/[slug]",
    "priceCurrency": "USD",
    "price": "[price]",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "[date]",
    "itemCondition": "https://schema.org/NewCondition"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "50",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Sean G." },
      "datePublished": "[date]",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "reviewBody": "One step, no shine — that's all I wanted."
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Matt M." },
      "datePublished": "[date]",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "reviewBody": "I never wanted a 6-step routine."
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Cooper S." },
      "datePublished": "[date]",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
      "reviewBody": "Everything else feels heavy now."
    }
  ]
}
```

Validate the JSON-LD at https://validator.schema.org or via Google's Rich Results Test.

---

## Phase 4: Batch Processing

When processing multiple products, repeat Phase 3 for each product in the catalog.

### Batch Workflow

1. Query all products from Sanity: `*[_type == "product"]{title, slug, sku, price, ingredients, benefits}`
2. For each product, generate the full description suite (sections 3A-3I)
3. Present each product to user for review before publishing
4. Write to Sanity in batch via MCP

### Sanity Write — Single Product

Use `mcp__Sanity__patch_document_from_json` to update existing products, or `mcp__Sanity__create_documents_from_json` for new ones:

```json
{
  "_type": "product",
  "heroHeadline": "ONE STEP. ZERO SHINE.",
  "subheadline": "The men's face cream that absorbs in 15 seconds...",
  "benefitBullets": [
    { "icon": "clock", "label": "15-Second Absorption", "text": "Apply it. It's gone. No greasy residue, ever." },
    { "icon": "shield", "label": "All-Day Shine Control", "text": "Niacinamide regulates oil so your face stays matte." },
    { "icon": "layers", "label": "Replaces 3 Products", "text": "Serum + moisturizer + eye cream in one step." },
    { "icon": "leaf", "label": "Clean Formula", "text": "No fragrance, no parabens, no filler ingredients." },
    { "icon": "calendar", "label": "Lasts 6-8 Weeks", "text": "One bottle, two months. $38 founding price." }
  ],
  "longDescription": "[portable text or markdown - 400+ words]",
  "ingredientSpotlight": [
    { "benefit": "Controls oil without drying you out", "ingredient": "Niacinamide", "description": "Regulates sebum production so your face stays matte, not flaky." },
    { "benefit": "Repairs your skin barrier overnight", "ingredient": "Panthenol", "description": "Strengthens the moisture barrier that dry air, shaving, and UV break down." }
  ],
  "whoItsFor": [
    "The guy who owns zero skincare products and wants exactly one.",
    "The guy with an oily T-zone who's tired of looking shiny by noon.",
    "The guy who bought 5 products his girlfriend recommended — and uses none of them."
  ],
  "seoTitle": "Men's Face Cream | 15-Second Absorption, Zero Shine | Base Layer",
  "seoDescription": "The men's face cream that absorbs in 15 seconds, controls shine all day, and replaces your entire routine. Engineered in Colorado. $38 founding price.",
  "schemaMarkup": "[JSON-LD string]"
}
```

Before writing to Sanity, run `mcp__Sanity__get_schema` to verify the actual field names in the product content type. The field names above are illustrative — adapt to the real schema.

### Sanity Batch Write

For multiple products:
1. Query existing products to get their `_id` values
2. Patch each one with the generated copy
3. Use `mcp__Sanity__publish_documents` to publish when the user approves

---

## Phase 5: Channel Adaptation

### Amazon Listing Format

If expanding to Amazon, adapt the product description:

```
TITLE (200 char max):
Base Layer Men's Face Cream - [Primary Keyword] - Absorbs in 15 Seconds - Matte Finish - [Size]

BULLET POINTS (5, each <500 chars):
- [Benefit-first bullet with keyword integration]
- [Benefit-first bullet]
- [Benefit-first bullet]
- [Benefit-first bullet]
- [Guarantee/trust bullet]

A+ CONTENT:
[Adapted long description with hero image + benefit modules]
```

### Retail Sell Sheet

For wholesale/retail placement:

```
PRODUCT NAME: [name]
TAGLINE: [hero headline]
3 KEY BENEFITS:
1. [Benefit + proof point]
2. [Benefit + proof point]
3. [Benefit + proof point]
MARGIN: [wholesale vs. MSRP]
SHELF APPEAL: [visual differentiators]
```

---

## Quality Gate

Before finalizing any product description:

- [ ] Hero headline is benefit-driven, UPPERCASE, 3-8 words
- [ ] Primary keyword appears in: meta title, subheadline, at least one H2, meta description, first 100 words of long description
- [ ] Secondary keywords appear naturally in long description body
- [ ] No banned words or feminine skincare language anywhere
- [ ] No exclamation marks in headlines or subheadlines
- [ ] No emojis anywhere
- [ ] Long description is 400+ words with E-E-A-T signals
- [ ] All ingredient claims are accurate (cross-reference brand guidelines Section 9)
- [ ] No invented claims — every stat has a source in brand guidelines
- [ ] "Who It's For" section addresses at least 4 distinct male personas
- [ ] At least one tester quote included in social proof
- [ ] Colorado/altitude origin referenced for credibility
- [ ] Meta title is under 60 characters
- [ ] Meta description is under 155 characters and includes primary keyword
- [ ] URL slug is keyword-rich and lowercase-hyphenated
- [ ] Schema.org JSON-LD is valid (test at validator.schema.org)
- [ ] Schema includes Product type, AggregateRating, Offer, and Review
- [ ] Copy reads like "your sharp friend" — not a beauty brand, not a medical journal
- [ ] Every claim has a specific number or proof point
- [ ] CTA uses approved language from brand guidelines Section 7
- [ ] If writing to Sanity: schema verified, field names match, document created as draft

---

## Handoff

```
## Product Description Handoff

**Product:** [Product Name]
**SKU:** [SKU]

**Generated Sections:**
- [x] Hero headline
- [x] Subheadline (keyword-integrated)
- [x] Benefit bullets ([X] items)
- [x] Long description ([X] words, [X] H2 sections)
- [x] Ingredient spotlight ([X] ingredients)
- [x] Who it's for ([X] personas)
- [x] Social proof (3 tester quotes)
- [x] Meta title ([X] chars) + meta description ([X] chars)
- [x] Schema.org JSON-LD (Product + AggregateRating + Reviews)

**Primary Keyword:** [keyword]
**Keyword Integration Points:** [list where keyword appears]

**Sanity Status:** [Written as draft / Ready to write / Manual export]
**Next Step:** Review copy, then publish to Sanity / Shopify
```
