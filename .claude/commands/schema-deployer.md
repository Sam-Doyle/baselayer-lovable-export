# Schema Deployer

**Automated JSON-LD structured data generation for Base Layer Skin, powered by Sanity CMS content.**

Reads all content from Sanity via MCP, generates Google-compliant JSON-LD schema markup, validates against Rich Results requirements, and outputs deploy-ready `<script>` blocks for every page type.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/product/catalog.md`
- `brand/references/product/compliance.md`
- `brand/references/channels/seo-guidelines.md`

---

## When NOT to Use
- For writing product descriptions (use `/product-description-writer` — it generates schema as part of output)
- For SEO content optimization (use `/seo audit` or `/seo-monitor`)
- For Sanity CMS schema changes (use Sanity Studio directly)
- For ad landing pages (use `/landing-page-builder` — it includes schema generation)
- For ongoing SEO health monitoring (use `/seo-monitor`)

---

## Inputs

The user specifies a mode:

```
MODE:     batch | targeted
TARGET:   (targeted mode only) — document type or specific slug
          e.g., "products", "articles", "ingredients", "homepage", "all"
          or a specific slug: "performance-daily-face-cream"
DRY RUN:  true | false (default: false) — validate only, don't write files
```

If the user says "deploy all schema" or similar, default to:
- Mode: batch
- Target: all
- Dry Run: false

---

## ICP Context

Schema markup serves:
- **Males 20-40** discovering Base Layer through Meta ads, then searching Google
- **Google Shopping** free product listings (Merchant Center)
- **SEO** — rich snippets for product, article, and ingredient pages
- Traffic source: Instagram/Facebook cold traffic → Google brand search → rich results

---

## Brand Voice in Schema

Schema `description` fields must match brand voice:
- Direct, confident, conversational
- Lead with benefits, not features
- No flowery language ("curated", "elevated", "artisanal")
- Use real numbers ("absorbs in 15 seconds", "$38")
- No emojis in any schema field

---

## Schema Types by Content

### Product Pages — `Product` + `Offer` + `AggregateRating`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Performance Daily Face Cream",
  "image": ["<hero-image-url>", "<additional-image-urls>"],
  "description": "<from Sanity product.description — brand voice>",
  "brand": {
    "@type": "Brand",
    "name": "Base Layer"
  },
  "sku": "<from Sanity product.sku>",
  "gtin14": "<if available>",
  "mpn": "<from Sanity product.sku>",
  "color": "<if applicable>",
  "material": "<if applicable>",
  "weight": {
    "@type": "QuantitativeValue",
    "value": "<from Sanity product.size_ml>",
    "unitCode": "MLT"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://baselayerskin.co/products/<slug>",
    "priceCurrency": "USD",
    "price": "<from Sanity product.price>",
    "priceValidUntil": "<current year + 1>-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Base Layer Skin"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "USD"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "US"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 3,
          "maxValue": 7,
          "unitCode": "DAY"
        }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "US",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 30,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "<from Sanity or default 5.0>",
    "reviewCount": "<from Sanity or reviews array length>",
    "bestRating": 5,
    "worstRating": 1
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "<reviewer name>"
      },
      "datePublished": "<review date>",
      "reviewBody": "<review text>",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 5,
        "bestRating": 5
      }
    }
  ]
}
```

**Merchant Center Free Listing Requirements (enforced):**
- `price` — required, numeric
- `priceCurrency` — required, ISO 4217
- `availability` — required, must use schema.org URL enum
- `image` — required, at least one high-res product image (min 100x100, recommend 800x800+)
- `name` — required, match product title exactly as shown on page
- `description` — required, 1-5000 characters, no promotional text in description
- `brand` — required for Merchant Center
- `sku` or `gtin` — at least one product identifier required
- `shippingDetails` — required for US free listings
- `hasMerchantReturnPolicy` — required for US free listings
- `priceValidUntil` — recommended, must be future date
- `itemCondition` — required
- `seller` — recommended

### Article Pages — `Article` / `BlogPosting`

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "<from Sanity article.title — max 110 chars>",
  "description": "<from Sanity article.excerpt — max 200 chars>",
  "image": {
    "@type": "ImageObject",
    "url": "<from Sanity article.featured_image>",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "<from Sanity article.author.name>",
    "url": "https://baselayerskin.co/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Base Layer Skin",
    "logo": {
      "@type": "ImageObject",
      "url": "https://baselayerskin.co/logo-white.png",
      "width": 600,
      "height": 60
    }
  },
  "datePublished": "<from Sanity article._createdAt>",
  "dateModified": "<from Sanity article._updatedAt>",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://baselayerskin.co/blog/<slug>"
  },
  "wordCount": "<calculated from body>",
  "articleSection": "<from Sanity article.category>"
}
```

**Google requirements for Article rich results:**
- `headline` — required, max 110 characters
- `image` — required, min 696px wide, multiple images recommended (1200px wide ideal)
- `datePublished` — required, ISO 8601
- `author.name` — required
- `publisher` — required with `logo`

### Ingredient Pages — `MedicalWebPage` + `Drug` / `Substance`

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "<ingredient name> for Skincare",
  "description": "<from Sanity ingredient.description>",
  "about": {
    "@type": "Drug",
    "name": "<ingredient name>",
    "nonProprietaryName": "<INCI name from Sanity>",
    "description": "<benefit summary>",
    "mechanismOfAction": "<from Sanity ingredient.how_it_works>",
    "drugClass": {
      "@type": "DrugClass",
      "name": "<e.g., Humectant, Peptide, Antioxidant>"
    }
  },
  "mainEntity": {
    "@type": "WebPage",
    "@id": "https://baselayerskin.co/ingredients/<slug>"
  },
  "lastReviewed": "<from Sanity ingredient._updatedAt>",
  "medicalAudience": {
    "@type": "MedicalAudience",
    "audienceType": "Consumer"
  }
}
```

**Note:** Use `Drug` type for established cosmetic actives (niacinamide, retinol, hyaluronic acid). Use `Substance` for plant-derived ingredients (centella asiatica, squalane). Never make medical claims — keep descriptions factual and cosmetic.

### Skin Concern Pages — `MedicalCondition` + `MedicalWebPage`

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "<concern name> — Causes and Skincare Solutions",
  "description": "<from Sanity concern.description>",
  "about": {
    "@type": "MedicalCondition",
    "name": "<concern name>",
    "alternateName": ["<synonyms from Sanity>"],
    "signOrSymptom": [
      {
        "@type": "MedicalSignOrSymptom",
        "name": "<symptom>"
      }
    ],
    "possibleTreatment": [
      {
        "@type": "MedicalTherapy",
        "name": "<ingredient or routine recommendation>",
        "description": "<how it helps>"
      }
    ],
    "riskFactor": [
      {
        "@type": "MedicalRiskFactor",
        "name": "<risk factor, e.g., UV exposure, dry climate>"
      }
    ]
  },
  "lastReviewed": "<from Sanity concern._updatedAt>",
  "medicalAudience": {
    "@type": "MedicalAudience",
    "audienceType": "Consumer"
  }
}
```

**Disclaimer enforcement:** Every skin concern schema must NOT make medical claims. Use "may help", "commonly used for", "associated with" language. Base Layer is cosmetic, not pharmaceutical.

### Homepage — `Organization` + `WebSite` + `SearchAction`

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Base Layer Skin",
    "alternateName": "Base Layer",
    "url": "https://baselayerskin.co",
    "logo": "https://baselayerskin.co/logo-white.png",
    "description": "Performance men's skincare engineered in Breckenridge, Colorado. One product. One step. Done.",
    "foundingLocation": {
      "@type": "Place",
      "name": "Breckenridge, Colorado"
    },
    "sameAs": [
      "https://www.instagram.com/baselayerskin/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@baselayerskin.co",
      "contactType": "customer service"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Base Layer Skin",
    "url": "https://baselayerskin.co",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://baselayerskin.co/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
]
```

---

## Pipeline

```
1. CONNECT      → Read content from Sanity via MCP
2. MAP          → Determine which schema types apply to each document
3. GENERATE     → Build JSON-LD for each document
4. VALIDATE     → Check against Google Rich Results requirements
5. FIX          → Auto-correct common schema errors
6. OUTPUT       → Write schema files / inject into page components
```

---

## Phase 1: Read Sanity Content

Use Sanity MCP to query all relevant documents.

### Product Query

```
mcp__Sanity__query_documents
GROQ: *[_type == "product"]{
  _id, title, slug, description, sku, price, images[]{asset->{url, metadata}},
  ingredients[]->{name, inci_name, description, how_it_works, category},
  reviews[]{author, rating, body, date},
  rating_average, review_count, size_ml, availability
}
```

### Article Query

```
mcp__Sanity__query_documents
GROQ: *[_type == "article" || _type == "post"]{
  _id, title, slug, excerpt, body, featured_image{asset->{url, metadata}},
  author->{name, bio, image}, category, tags, _createdAt, _updatedAt,
  word_count
}
```

### Ingredient Query

```
mcp__Sanity__query_documents
GROQ: *[_type == "ingredient"]{
  _id, name, slug, inci_name, description, how_it_works, category,
  benefits[], concerns_addressed[]->{name, slug}, _updatedAt
}
```

### Skin Concern Query

```
mcp__Sanity__query_documents
GROQ: *[_type == "skinConcern" || _type == "concern"]{
  _id, name, slug, description, symptoms[], risk_factors[],
  recommended_ingredients[]->{name, description},
  _updatedAt
}
```

If targeted mode, filter queries by slug:
```
GROQ: *[_type == "<type>" && slug.current == "<slug>"][0]{...}
```

---

## Phase 2: Schema Mapping

For each Sanity document, determine the schema type:

| Sanity `_type` | JSON-LD Schema | Page Path |
|----------------|---------------|-----------|
| `product` | Product + Offer + AggregateRating | `/products/<slug>` |
| `article` / `post` | BlogPosting | `/blog/<slug>` |
| `ingredient` | MedicalWebPage + Drug/Substance | `/ingredients/<slug>` |
| `skinConcern` / `concern` | MedicalWebPage + MedicalCondition | `/skin-concerns/<slug>` |
| (homepage) | Organization + WebSite | `/` |

---

## Phase 3: Generate JSON-LD

For each document, build the JSON-LD object using the templates above. Apply these rules:

### Data Mapping Rules

1. **Images** — Resolve Sanity image references to full CDN URLs. Use `image.asset.url` with Sanity image pipeline params for correct dimensions.
2. **Dates** — Convert Sanity `_createdAt` / `_updatedAt` to ISO 8601 format.
3. **Descriptions** — Strip Portable Text to plain text. Truncate to 5000 chars for Product, 200 chars for Article excerpt.
4. **Prices** — Use numeric values only. No currency symbols in the `price` field.
5. **URLs** — Construct canonical URLs from slugs: `https://baselayerskin.co/<section>/<slug.current>`.
6. **Reviews** — Map Sanity review objects to schema.org Review format. If no reviews exist, omit `review` array but keep `aggregateRating` if rating data exists.
7. **Fallbacks** — If a required field is missing from Sanity, flag it in the validation report. Do not generate invalid schema.

### Schema Rules (Non-Negotiable)

1. **JSON-LD only.** No Microdata, no RDFa.
2. **No FAQ schema on commercial pages.** Google devalued FAQ rich results for commercial sites. Waste of markup.
3. **No HowTo schema.** Base Layer is one step — there is no "how to" beyond "put it on."
4. **No SpeakableSpecification.** Not supported for most sites.
5. **One `@context` declaration per JSON-LD block.** Don't nest contexts.
6. **Use schema.org URL enums for `availability`, `itemCondition`, `returnPolicyCategory`.** Not plain text.
7. **All URLs must be absolute.** No relative paths in any schema field.

---

## Phase 4: Validation

Validate every generated JSON-LD block against Google Rich Results requirements.

### Validation Checks

| Check | Rule | Severity |
|-------|------|----------|
| Required fields present | Per schema type (see Google docs) | ERROR |
| `price` is numeric | No `$` symbol, no commas | ERROR |
| `availability` uses schema.org URL | `https://schema.org/InStock` not `"InStock"` | ERROR |
| `image` is absolute URL | Must start with `https://` | ERROR |
| `headline` max 110 chars | Article schema only | WARNING |
| `description` max 5000 chars | Product schema | WARNING |
| `datePublished` is ISO 8601 | Format: `YYYY-MM-DDTHH:mm:ssZ` | ERROR |
| `priceValidUntil` is future date | Must be after today | ERROR |
| `ratingValue` within range | Between `worstRating` and `bestRating` | ERROR |
| `reviewCount` > 0 if `aggregateRating` | Can't have rating without reviews | WARNING |
| No duplicate `@type` on same page | One Product schema per product page | ERROR |
| `sku` or `gtin` present | At least one product identifier | ERROR (Merchant Center) |
| `shippingDetails` present | Required for US free listings | ERROR (Merchant Center) |
| `hasMerchantReturnPolicy` present | Required for US free listings | ERROR (Merchant Center) |
| Image dimensions adequate | Product: min 100x100 (800x800+ recommended) | WARNING |
| No HTML in text fields | Strip all tags from descriptions | ERROR |
| No medical claims in cosmetic schema | Flag "cure", "treat", "heal" in descriptions | WARNING |

### Validation Output

```
SCHEMA VALIDATION REPORT
========================
Generated: <timestamp>
Mode: <batch|targeted>
Documents processed: <count>

ERRORS (must fix before deploy):
  [ERROR] product/performance-daily-face-cream: missing 'shippingDetails' in Offer
  [ERROR] article/how-niacinamide-works: 'datePublished' is not ISO 8601

WARNINGS (recommended fixes):
  [WARNING] product/performance-daily-face-cream: image resolution below 800x800 recommended
  [WARNING] ingredient/niacinamide: description contains "treats" — consider cosmetic-safe language

PASSED:
  [OK] homepage: Organization + WebSite — all required fields present
  [OK] product/performance-daily-face-cream: Product + Offer + AggregateRating — valid
  ...
```

---

## Phase 5: Auto-Fix Common Errors

Before flagging errors to the user, attempt auto-correction for known patterns:

| Error Pattern | Auto-Fix |
|---------------|----------|
| Price has `$` prefix | Strip `$` and commas, convert to float |
| Availability is plain text | Map to schema.org URL enum |
| Date is `MM/DD/YYYY` | Convert to ISO 8601 |
| Description has HTML tags | Strip tags, preserve text |
| Image URL is relative | Prepend `https://baselayerskin.co` |
| `priceValidUntil` is past | Set to December 31 of current year + 1 |
| Missing `unitCode` | Infer from context (mL → MLT, g → GRM, oz → ONZ) |
| `ratingValue` is string | Convert to float |
| Description has trailing whitespace | Trim |
| Medical claim language | Replace "treats" → "helps address", "cures" → "supports", "heals" → "helps repair" |

Log all auto-fixes in the validation report:
```
AUTO-FIXES APPLIED:
  [FIX] product/performance-daily-face-cream: stripped '$' from price "38" → 38
  [FIX] article/altitude-skincare: converted date "03/01/2026" → "2026-03-01T00:00:00Z"
```

---

## Phase 6: Output

### File Output Structure

```
src/schema/
  product/
    performance-daily-face-cream.json
    <other-products>.json
  article/
    <article-slug>.json
  ingredient/
    <ingredient-slug>.json
  concern/
    <concern-slug>.json
  homepage.json
  schema-manifest.json
```

### Schema Manifest

`src/schema/schema-manifest.json`:
```json
{
  "generated": "<ISO timestamp>",
  "base_url": "https://baselayerskin.co",
  "schemas": [
    {
      "type": "Product",
      "slug": "performance-daily-face-cream",
      "file": "product/performance-daily-face-cream.json",
      "page_path": "/products/performance-daily-face-cream",
      "validation": "passed",
      "auto_fixes": 0
    },
    {
      "type": "BlogPosting",
      "slug": "<slug>",
      "file": "article/<slug>.json",
      "page_path": "/blog/<slug>",
      "validation": "passed",
      "auto_fixes": 1
    }
  ],
  "summary": {
    "total": "<count>",
    "passed": "<count>",
    "warnings": "<count>",
    "errors": "<count>",
    "auto_fixed": "<count>"
  }
}
```

### React Integration Snippet

For each schema type, generate a React component helper that can be imported into page components:

```typescript
// src/schema/useProductSchema.ts
import productSchema from './product/performance-daily-face-cream.json';

export function ProductSchema({ slug }: { slug: string }) {
  // Dynamic import based on slug
  const schema = require(`./product/${slug}.json`);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Provide integration instructions specific to the Vite + React + TypeScript stack:
- JSON files imported directly (Vite handles JSON imports natively)
- `<script type="application/ld+json">` injected via `dangerouslySetInnerHTML`
- For SSR/prerender (Netlify), ensure schema is in the initial HTML, not client-side only
- Recommend `react-helmet-async` or `<Head>` for proper `<head>` injection

---

## Dry Run Mode

When `DRY RUN: true`:
- Execute Phases 1-5 (read, map, generate, validate, fix)
- Print the validation report
- Print the first schema of each type as a preview
- Do NOT write any files
- Do NOT modify any components

---

## Example

### Input
```
/schema-deployer
Mode: batch
Content types: Product, BlogPosting
Source: sanity
```

### Output (abbreviated)
```markdown
# Schema Deployment Report

## Product: Performance Daily Face Cream
Generated JSON-LD:

{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Performance Daily Face Cream",
  "description": "All-in-one moisturizer with SPF 30, niacinamide, and hyaluronic acid.",
  "brand": {"@type": "Brand", "name": "Base Layer"},
  "offers": {
    "@type": "Offer",
    "price": "38.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://baselayerskin.co/face-cream"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}

## BlogPosting: "Why SPF in Your Moisturizer Matters"
Generated JSON-LD (truncated)

## Validation Results
| Page | Schema Type | Status | Issues |
|------|------------|--------|--------|
| /face-cream | Product | Valid | — |
| /blog/spf-myths | BlogPosting | Warning | Missing `image` field |
| /about | — | Missing | Add Organization schema |

## Files Modified
- src/pages/FaceCream.tsx — Product schema injected
- src/pages/ArticleDetail.tsx — BlogPosting template updated
```

---

## Edge Cases
- If Sanity content is missing required schema fields (e.g., product has no price): generate partial schema with TODO comments for missing fields. Do not omit the entire schema block.
- If a page already has schema markup: compare existing vs generated. If they differ, show a diff and ask user which to keep. Do not silently overwrite.
- If Google's Rich Results Test reports errors after deployment: include the specific error messages and auto-fix common issues (missing required fields, incorrect types).
- If deploying to more than 20 pages: batch into groups of 10, validate each batch, and provide a progress summary. Do not attempt all pages in a single operation.
- If the schema type is not one of the 6 supported templates: warn the user and offer to generate a generic schema based on schema.org documentation, clearly marked as "custom — verify manually."

---

## Quality Gate

Before delivering schema output:

- [ ] Every Product schema has: name, image, description, brand, sku, price, priceCurrency, availability, itemCondition, offers, shippingDetails, hasMerchantReturnPolicy
- [ ] Every Article schema has: headline, image, datePublished, author.name, publisher
- [ ] Every Ingredient/Concern schema has: name, description, lastReviewed
- [ ] Homepage has: Organization + WebSite with SearchAction
- [ ] All URLs are absolute (`https://`)
- [ ] All dates are ISO 8601
- [ ] All prices are numeric (no `$`)
- [ ] No FAQ schema on any commercial page
- [ ] No HowTo schema anywhere
- [ ] No HTML in text fields
- [ ] No medical claims in cosmetic content
- [ ] Validation report generated with zero unresolved ERRORs
- [ ] Brand voice check: descriptions are direct, confident, benefit-led

---

## Example Usage

**Batch deploy all schema:**
```
/schema-deployer batch all
```

**Targeted product schema:**
```
/schema-deployer targeted products/performance-daily-face-cream
```

**Dry run validation only:**
```
/schema-deployer batch all --dry-run
```

**After adding new blog posts:**
```
/schema-deployer targeted articles
```
