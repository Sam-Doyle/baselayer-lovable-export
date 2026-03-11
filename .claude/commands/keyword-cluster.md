# Keyword Cluster

**SEO keyword research, intent clustering, and content gap analysis for Base Layer Skin.**

Takes seed keywords, discovers the full keyword universe via web search, clusters by search intent, maps each cluster to a content type, cross-references existing Sanity content for gaps, and outputs a prioritized action plan. Built for men's skincare keyword language — not generic beauty terms.

---

## When to Use

- Planning the next quarter's content calendar
- Launching a new product or ingredient page
- Identifying content gaps competitors are filling
- Building internal linking architecture
- Preparing briefs for blog writers or `/product-description-writer`
- Auditing existing content for keyword cannibalization

---

## Inputs

The user provides seed keywords. If none are given, use these Base Layer defaults:

```
Primary seeds:
- men's face cream
- skincare for men
- men's moisturizer
- men's skincare routine

Product-specific seeds:
- niacinamide for men
- copper peptide skincare
- lightweight moisturizer men
- matte moisturizer
- oil control face cream

Pain point seeds:
- oily skin men
- dry skin men winter
- simple skincare routine men
- skincare routine for beginners men

Long-tail seeds:
- best face cream for oily skin men
- one step skincare for men
- face cream that absorbs fast
- men's skincare no fragrance
```

Optional additional inputs:
```
FOCUS AREA:     [e.g., "ingredient content", "comparison pages", "seasonal"]
COMPETITORS:    [e.g., "Tiege Hanley, Lumin, Bulldog, Hims, Geologie"]
CONTENT GOALS:  [e.g., "build topical authority", "drive product page traffic", "capture comparison searches"]
EXISTING URLS:  [list of current site pages for gap analysis]
```

---

## Execution Flow

### Step 1: Expand Seed Keywords via Web Search

For each seed keyword, run web searches to discover the keyword universe. Use WebSearch for all lookups.

```
Search queries to run per seed:
- "{seed keyword}"                          -> Top-ranking pages, related searches
- "{seed keyword} site:reddit.com"          -> Real language men use (critical for this ICP)
- "{seed keyword} site:youtube.com"         -> Video intent signals
- "best {seed keyword} 2026"                -> Commercial intent variations
- "how to {seed keyword}"                   -> Informational intent variations
- "{seed keyword} vs"                       -> Comparison intent variations
- "People also ask {seed keyword}"          -> Question mining
- "{seed keyword} for beginners"            -> Entry-level content opportunities
```

**Men's skincare language awareness — critical for this ICP:**

Men search differently than the general skincare audience. Mine for these patterns:
- "face cream" over "moisturizer" (simpler, less gendered language)
- "for guys" / "for men" / "for dudes" (informal qualifiers)
- "no greasy" / "not shiny" / "matte" (problem-oriented searches)
- "simple" / "easy" / "one step" / "minimal" (friction-averse)
- "best [product] for [activity]" — gym, outdoor, skiing, after shaving
- Reddit/forum language: "recommend me", "what do you use", "is it worth it"
- Comparison language: "[brand] vs [brand]", "alternative to [brand]"
- Skeptic language: "do men need", "is moisturizer necessary", "waste of money"

Men are LESS likely to search:
- Clinical terms (sebum, ceramides, retinoid) — unless they are deep in the funnel
- Multi-step routine terms (toner, serum layering, double cleanse)
- Feminine-coded terms (glow, radiant, luminous, dewy)

Capture the actual language used on Reddit, YouTube comments, and forums. This is how Base Layer's ICP actually talks about skincare.

### Step 2: Collect Related Keywords and Questions

From search results, extract:

**Related keywords:**
- Google "Related searches" at the bottom of SERPs
- Google "People also search for" expandable sections
- Autocomplete suggestions (partial query completions)
- Competitor page title tags and H1s from top-ranking pages
- Reddit thread titles and top comments (goldmine for real language)

**People Also Ask (PAA) questions:**
- Capture every PAA question visible for each seed
- These are direct content opportunities — Google is telling you what people want answered
- Group by theme (routine, ingredients, concerns, comparisons)
- PAA questions often make great H2s in blog posts and FAQ schema content

**Long-tail variations:**
- 4+ word phrases from search results
- Question-format queries ("what is the best...", "how often should...")
- Location/context modifiers ("...for dry climate", "...for oily skin", "...in winter")
- Activity modifiers ("...after gym", "...before bed", "...for outdoor work")

### Step 3: Cluster by Search Intent

Group all discovered keywords into four intent buckets:

**Informational** (learn, understand, research)
```
Signals: "how to", "what is", "why", "guide", "tips", "routine", "does", "should"
Examples:
  - "how to start a skincare routine men"
  - "best ingredients for men's skin"
  - "what does niacinamide do"
  - "do men need moisturizer"
  - "how often should men moisturize"
  - "why is my face oily"
Content type: Blog post, guide, ingredient deep-dive, FAQ page
Funnel stage: Top-of-funnel (awareness, education)
```

**Commercial Investigation** (compare, evaluate, consider)
```
Signals: "best", "top", "review", "vs", "comparison", "worth it", "alternative"
Examples:
  - "best face cream for men"
  - "men's moisturizer reviews"
  - "niacinamide vs retinol for men"
  - "is expensive moisturizer worth it"
  - "base layer skin review"
  - "tiege hanley vs bulldog"
Content type: Comparison page, product review, buying guide, "best of" roundup
Funnel stage: Mid-funnel (consideration)
```

**Transactional** (buy, get, order)
```
Signals: "buy", "price", "discount", "where to buy", "order", "shop", "deal", "coupon"
Examples:
  - "buy men's face cream"
  - "men's skincare set"
  - "face cream for men under $50"
  - "base layer skin discount"
Content type: Product page, landing page, collection page
Funnel stage: Bottom-of-funnel (purchase)
```

**Navigational** (find specific brand/site)
```
Signals: brand name, specific product name, "[brand] + [term]"
Examples:
  - "base layer skincare"
  - "base layer face cream"
  - "baselayerskin.co"
Content type: Homepage, product page, about page (usually already covered)
Funnel stage: Brand-aware
```

### Step 4: Map Clusters to Content Types

For each cluster, assign the optimal content format:

| Cluster Theme | Intent | Content Type | URL Pattern | Priority |
|---------------|--------|-------------|-------------|----------|
| Skincare routine basics | Informational | Pillar blog post | /blog/mens-skincare-routine-guide | HIGH |
| Ingredient education | Informational | Ingredient page | /ingredients/{ingredient} | HIGH |
| Product comparisons | Commercial | Blog post | /blog/best-{category}-for-men | HIGH |
| Skin concern solutions | Informational | Concern page | /skin-concerns/{concern} | HIGH |
| Brand vs. brand | Commercial | Comparison post | /blog/{brand}-vs-{brand} | MEDIUM |
| Buying guides | Commercial | Blog post | /blog/{product}-buying-guide | MEDIUM |
| Seasonal skincare | Informational | Blog post | /blog/mens-skincare-{season} | MEDIUM |
| FAQ / PAA answers | Informational | FAQ page or blog | /faq or /blog/{question-slug} | MEDIUM |
| Activity-specific | Informational | Blog post | /blog/skincare-for-{activity} | LOW |
| Routine builder | Informational | Interactive page | /routine-quiz | LOW |

### Step 5: Cross-Reference Existing Sanity Content

Query Sanity CMS to find what content already exists. Use `mcp__Sanity__query_documents` for each query.

**First, discover the schema:**
```
Use mcp__Sanity__get_schema to understand available content types.
Then mcp__Sanity__list_workspace_schemas for the full picture.
```

**Then query existing content:**

```
Blog posts / Articles:
*[_type == "article" || _type == "post" || _type == "blogPost"] {
  title, slug, _createdAt, _updatedAt, "wordCount": length(pt::text(body))
}

Product pages:
*[_type == "product"] {
  title, slug, description, seoTitle, seoDescription
}

Ingredient pages:
*[_type == "ingredient"] {
  title, slug, description
}

Skin concern pages:
*[_type == "skinConcern" || _type == "concern"] {
  title, slug, description
}

Landing pages:
*[_type == "landingPage" || _type == "page"] {
  title, slug
}
```

**Gap analysis classification:**

For each keyword cluster, mark one of:

| Status | Definition | Action |
|--------|-----------|--------|
| **COVERED** | Existing content targets this cluster well | Link the Sanity document. Review for freshness. |
| **PARTIAL** | Content exists but doesn't fully target the cluster | Update existing content to better target the cluster. |
| **GAP** | No content targets this cluster | New content needed. Prioritize based on difficulty + relevance. |
| **CANNIBALIZATION** | Multiple pages target the same cluster | Consolidate into one authoritative page or differentiate targeting. |
| **THIN** | Content exists but is too short/shallow to rank | Expand and improve. Add depth, examples, data. |

### Step 6: Estimate Keyword Difficulty

For each priority keyword, estimate difficulty based on SERP analysis via WebSearch.

**Low difficulty (target first):**
- SERP has forums (Reddit, Quora), thin content, or outdated articles (2+ years old) in top 10
- Few or no dedicated pages for the exact query
- Small/new domains ranking alongside major brands
- PAA boxes showing generic answers (opportunity to answer better)
- Sparse ad presence

**Medium difficulty:**
- Mix of authority sites and niche sites in top 10
- Dedicated pages exist but content quality varies
- Some rich results present (FAQs, reviews)
- Moderate ad competition

**High difficulty:**
- Top 10 dominated by major brands (Kiehl's, Bulldog, Tiege Hanley, Lumin, GQ, Men's Health)
- Strong rich results (product carousels, knowledge panels, featured snippets)
- High-authority domains only (.com sites with massive backlink profiles)
- Significant ad presence (Google Shopping, text ads)

**Difficulty assessment per keyword:**
```
For each target keyword:
1. Search the keyword via WebSearch
2. Analyze top 10 results:
   - Domain authority signals (brand recognition, site age)
   - Content quality (depth, freshness, multimedia, E-E-A-T signals)
   - Search features present (ads, shopping, PAA, featured snippet, video carousel)
3. Rate: LOW / MEDIUM / HIGH
4. Note the opportunity angle (what is missing from current top results that Base Layer can provide)
5. Estimate time to rank: LOW = 1-3 months, MEDIUM = 3-6 months, HIGH = 6-12+ months
```

### Step 7: Identify People Also Ask Questions

PAA questions are high-value content targets. Compile them separately.

```
PEOPLE ALSO ASK — COMPILED
============================

ROUTINE QUESTIONS:
- "Do men need a skincare routine?"
- "What is the simplest skincare routine for men?"
- "How many skincare products do men need?"
- "What order should men apply skincare?"

INGREDIENT QUESTIONS:
- "What does niacinamide do for skin?"
- "Is hyaluronic acid good for men?"
- "What is the best anti-aging ingredient for men?"
- "Are copper peptides worth it?"

CONCERN QUESTIONS:
- "How do men get rid of oily skin?"
- "What causes dry skin in men?"
- "How to reduce shine on face men?"
- "Best moisturizer for men with acne?"

PRODUCT QUESTIONS:
- "What is the best face cream for men?"
- "How much should men spend on skincare?"
- "Is expensive moisturizer better?"
- "What is the best one-product skincare for men?"

[Each PAA question = potential FAQ schema entry or blog section H2]
```

### Step 8: Build Internal Linking Map

Map how clusters connect to each other and to existing pages:

**Hub-and-spoke model:**
```
Hub: /blog/mens-skincare-routine-guide (pillar)
  Spoke: /ingredients/niacinamide
  Spoke: /ingredients/copper-peptide
  Spoke: /skin-concerns/oily-skin
  Spoke: /blog/best-face-cream-for-men
  Spoke: /products/performance-daily-face-cream
  Spoke: /blog/skincare-after-gym
  Spoke: /faq

Hub: /ingredients (index page)
  Spoke: /ingredients/{each ingredient}
  Cross-link to: /skin-concerns/{related concern}
  Cross-link to: /products/performance-daily-face-cream

Hub: /skin-concerns (index page)
  Spoke: /skin-concerns/{each concern}
  Cross-link to: /ingredients/{related ingredient}
  Cross-link to: /products/performance-daily-face-cream
```

**Internal linking rules for Base Layer:**
- Every blog post links to the product page at least once (transactional intent capture)
- Every ingredient page links to the product page AND the ingredient hub
- Every skin concern page links to relevant ingredient pages AND the product
- Blog posts link to 2-3 other blog posts in related clusters (topical depth signals)
- Product page links back to key ingredient pages and skin concern pages (authority flow)
- Comparison posts link to both the product page and the relevant buying guide
- Use descriptive anchor text that includes the target keyword of the destination page

### Step 9: Prioritize and Output

Generate the final prioritized keyword cluster report.

---

## Output Format

### Full Cluster Report

```markdown
# Base Layer Keyword Cluster Report
**Generated:** YYYY-MM-DD
**Seeds analyzed:** [X] seed keywords
**Total keywords discovered:** [X]
**Clusters identified:** [X]
**Content gaps found:** [X]

---

## Executive Summary
- Total keywords discovered: [X]
- Clusters identified: [X]
- Content gaps found: [X]
- Cannibalization risks: [X]
- Immediate opportunities (low difficulty + high relevance): [X]
- Estimated content pieces needed: [X]
- Top recommendation: [one sentence]

---

## Priority 1: Immediate Opportunities (Low Difficulty, High Relevance)

### Cluster: [Cluster Name]
**Primary keyword:** [keyword]
**Difficulty:** LOW
**Intent:** Informational / Commercial / Transactional
**Volume proxy:** [High / Medium / Low — based on SERP richness and autocomplete presence]

**Related keywords:**
- [keyword 2]
- [keyword 3]
- [long-tail variation]
- [long-tail variation]

**People Also Ask:**
- [PAA question 1]
- [PAA question 2]
- [PAA question 3]

**Recommended content type:** [Blog post / Ingredient page / Comparison / FAQ]
**Suggested title:** "[H1 targeting primary keyword]"
**Suggested URL:** /blog/[keyword-slug] or /ingredients/[slug]

**Existing coverage:** GAP / PARTIAL / COVERED
**If PARTIAL:** [What existing page covers it, what's missing]

**SERP opportunity angle:** [What's missing from current top results — this is Base Layer's way in]

**Internal links from:** [list of existing pages that should link TO this new page]
**Internal links to:** [list of existing pages this new page should link TO]

**Content brief (for writer):**
- Target keyword: [primary]
- Secondary keywords: [list]
- Word count target: [X] words
- H2 structure: [suggested outline]
- PAA questions to answer: [list]
- Proof points to include: [Base Layer-specific stats]
- CTA placement: [where to link to product page]

---

### [Repeat for each cluster in Priority 1]

---

## Priority 2: Medium-Term Targets (Medium Difficulty)
[Same format as Priority 1]

## Priority 3: Long-Term / Competitive (High Difficulty)
[Same format as Priority 1]

---

## Content Gap Summary

| Keyword Cluster | Intent | Difficulty | Volume Proxy | Content Status | Recommended Action | Content Type |
|----------------|--------|------------|-------------|----------------|-------------------|-------------|
| men's skincare routine | Info | LOW | High | GAP | Write pillar blog post | Blog (pillar) |
| niacinamide benefits men | Info | LOW | Medium | PARTIAL | Update ingredient page | Ingredient page |
| best face cream men | Commercial | MED | High | GAP | Write comparison post | Blog (comparison) |
| oily skin men solutions | Info | LOW | Medium | GAP | Write concern page | Concern page |
| base layer skin review | Commercial | LOW | Low | GAP | Create review/results page | Landing page |
| ... | ... | ... | ... | ... | ... | ... |

---

## People Also Ask — Full List

### Routine Questions
| Question | Primary Keyword Cluster | Content Type | Status |
|----------|------------------------|-------------|--------|
| [question] | [cluster] | [type] | [GAP/COVERED] |

### Ingredient Questions
[Same format]

### Concern Questions
[Same format]

### Product Questions
[Same format]

---

## Internal Linking Map

[Hub-and-spoke diagram in text format]

### New Links to Add to Existing Pages
| Source Page | Destination Page | Anchor Text | Reason |
|------------|-----------------|-------------|--------|
| /products/performance-daily-face-cream | /ingredients/niacinamide | "niacinamide controls oil" | Ingredient authority |
| /blog/[existing post] | /products/performance-daily-face-cream | "[product name]" | Transactional capture |
| ... | ... | ... | ... |

---

## Cannibalization Warnings

| Keyword | Page A | Page B | Overlap Type | Action |
|---------|--------|--------|-------------|--------|
| [keyword] | [URL] | [URL] | [Same keyword targeted] | Consolidate / differentiate / 301 redirect |

---

## Next Steps (Prioritized)
1. **[Highest-priority content piece]** — [keyword cluster], [difficulty], [estimated impact]
   Use: /product-description-writer or write directly
2. **[Second priority]** — [details]
3. **[Update existing page X]** — Add [keywords], expand by [X] words, add [FAQ schema]
4. **[Add internal links]** — [X] new links between existing pages
5. **[Monitor]** — Re-run this cluster analysis in [X] weeks to track ranking progress
```

---

## Men's Skincare Keyword Taxonomy

Reference this taxonomy when clustering. These are the topic pillars for Base Layer's content strategy:

**Routine and Basics**
- Starting a routine, simplifying routines, one-step routines, routine for age groups
- "Do I even need this?" skeptic content
- Morning vs. night routines, before/after shower

**Ingredients and Science**
- Niacinamide, copper peptides, hyaluronic acid, squalane, panthenol, centella asiatica
- What each ingredient does, how they work for men's skin specifically
- Ingredient comparisons (niacinamide vs. retinol, HA vs. squalane)

**Skin Concerns**
- Oily skin, dry skin, combination skin, sensitive skin
- Acne, aging/fine lines, dark circles, sun damage, razor burn, post-shave irritation
- Seasonal concerns (winter dryness, summer oil, altitude/outdoor)

**Product Education**
- Face cream vs. moisturizer vs. lotion (terminology men actually search)
- Serum vs. cream, SPF questions, fragrance-free benefits
- When to apply, how much to use, morning vs. night

**Lifestyle and Context**
- Skincare for athletes, outdoor/altitude skincare, post-gym routine
- Travel skincare, winter skincare, summer skincare
- Skincare for specific activities (skiing, hiking, surfing)

**Comparisons and Reviews**
- Brand vs. brand (Tiege Hanley vs. Lumin, etc.)
- Product category roundups ("best face cream for men 2026")
- "Is [product type] worth it" content
- Base Layer vs. competitor comparison pages (own the narrative)

---

## Quality Gate

Before delivering the cluster report:

- [ ] At least 50 unique keywords discovered from the seed set
- [ ] All keywords classified by intent (Informational / Commercial / Transactional / Navigational)
- [ ] Each cluster mapped to a specific content type with URL pattern
- [ ] Sanity CMS queried for existing content coverage (not assumed — actually checked)
- [ ] Every cluster marked: COVERED / PARTIAL / GAP / CANNIBALIZATION / THIN
- [ ] Difficulty estimated for top-priority keywords via actual SERP analysis (not guessed)
- [ ] Volume proxy noted for each cluster (High / Medium / Low)
- [ ] PAA questions compiled and mapped to clusters
- [ ] Internal linking opportunities documented with specific anchor text suggestions
- [ ] Cannibalization risks flagged with resolution action
- [ ] Content briefs included for top-priority GAP clusters
- [ ] Men's skincare keyword language used (not generic beauty terms)
- [ ] Competitor presence noted in SERP analysis
- [ ] Next steps are prioritized and actionable
- [ ] Cross-references to other slash commands where relevant (/product-description-writer, /social-content-batch)
