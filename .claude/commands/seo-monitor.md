# SEO Monitor — Automated Audit & Regression Detection

**Designed for `/loop` scheduling.** Run weekly to catch SEO regressions before they cost rankings.

This skill orchestrates the existing `/seo` skill — it does not reinvent auditing. It adds the diff layer: what changed, what broke, what improved.

---

## When to Use

- Weekly scheduled runs via `/loop` (recommended: every Monday)
- After deploying site changes (new pages, schema updates, CMS migrations)
- After Google algorithm updates (check Search Status Dashboard first)
- When organic traffic drops unexpectedly

---

## When NOT to Use
- For initial keyword research (use `/keyword-cluster`)
- For writing SEO content (use `/seo content` sub-skills)
- For deploying structured data (use `/schema-deployer`)
- For one-time site audits (use `/seo audit`)
- For competitor SEO analysis (use `/competitive-intel`)
- For weekly business metrics overview (use `/weekly-growth-report`)

---

## Configuration

```
SITE_URL: https://baselayerskin.co
BRAND: Base Layer
REPORT_DIR: seo-reports/
SEO_SKILL_DIR: /Users/samdoyle/.claude/skills/seo
KEY_PAGES:
  - https://baselayerskin.co                          # Homepage
  - https://baselayerskin.co/products                  # Product listing
  - https://baselayerskin.co/products/performance-daily-face-cream  # Hero PDP
  - https://baselayerskin.co/ingredients               # Ingredient hub
  - https://baselayerskin.co/skin-concerns             # Skin concerns hub
  - https://baselayerskin.co/blog                      # Blog index
BLOG_TOP_POSTS: 5                                      # Auto-detect top 5 blog posts by internal links
CWV_STRATEGY: mobile                                   # Mobile-first (100% mobile-first indexing)
```

---

## Execution Flow

### Step 0 — Preflight

```
1. Verify seo-reports/ directory exists (create if not)
2. Find most recent previous audit: seo-reports/YYYY-MM-DD-audit.md
3. Set PREVIOUS_AUDIT path (null if first run)
4. Set TODAY = current date (YYYY-MM-DD)
5. Set OUTPUT = seo-reports/${TODAY}-audit.md
```

### Step 1 — Discover Key Pages

Crawl the sitemap and combine with configured KEY_PAGES:

```bash
# Fetch sitemap for full page inventory
python3 $SEO_SKILL_DIR/scripts/fetch_page.py ${SITE_URL}/sitemap.xml --output /tmp/bl-sitemap.xml

# Identify top blog posts (by internal link count)
python3 $SEO_SKILL_DIR/scripts/internal_links.py $SITE_URL --depth 2 --max-pages 50
```

Build the audit page list:
- All configured KEY_PAGES
- Top N blog posts by internal link count
- Any new pages not in previous audit (flag as "New")

### Step 2 — Run Audits via /seo Skill

For each page in the audit list, collect evidence using the existing `/seo` scripts. Do NOT rewrite these — call them directly.

**Per-page checks:**

```bash
# Fetch and parse each page
python3 $SEO_SKILL_DIR/scripts/fetch_page.py $PAGE_URL --output /tmp/bl-page.html
python3 $SEO_SKILL_DIR/scripts/parse_html.py /tmp/bl-page.html --url $PAGE_URL --json

# Core Web Vitals (mobile-first)
python3 $SEO_SKILL_DIR/scripts/pagespeed.py $PAGE_URL --strategy mobile

# Broken links
python3 $SEO_SKILL_DIR/scripts/broken_links.py $PAGE_URL --workers 5

# Schema validation
python3 $SEO_SKILL_DIR/scripts/validate_schema.py /tmp/bl-page.html

# Social meta (OG tags, Twitter cards)
python3 $SEO_SKILL_DIR/scripts/social_meta.py $PAGE_URL

# Redirect chains
python3 $SEO_SKILL_DIR/scripts/redirect_checker.py $PAGE_URL
```

**Site-wide checks (run once):**

```bash
# Robots.txt + AI crawler management
python3 $SEO_SKILL_DIR/scripts/robots_checker.py $SITE_URL

# llms.txt for AI search readiness
python3 $SEO_SKILL_DIR/scripts/llms_txt_checker.py $SITE_URL

# Security headers
python3 $SEO_SKILL_DIR/scripts/security_headers.py $SITE_URL

# Internal link structure
python3 $SEO_SKILL_DIR/scripts/internal_links.py $SITE_URL --depth 2 --max-pages 100
```

### Step 3 — Skincare E-commerce Specific Checks

These go beyond generic SEO. Base Layer sells one hero SKU to men 25-40 via Meta ads.

**Product Schema Validation:**
- Verify Product schema has: name, image, price, priceCurrency, availability (Merchant Center free listing requirements)
- Confirm schema is in server-rendered HTML, not JS-injected (Google JS SEO guidance, December 2025)
- Check Brand schema nested in Product
- Validate AggregateRating if reviews exist
- Verify Offer price matches displayed price ($38 founding / $48 post-launch)

**Review Schema Monitoring:**
- Check for Review / AggregateRating schema on product pages
- Verify reviewCount matches actual review count in CMS
- Flag stale ratings (no new reviews in 30+ days)

**Ingredient Page SEO:**
- Each ingredient page should have unique meta title/description
- Check for appropriate schema (consider MedicalEntity for active ingredients like Niacinamide, Copper Peptide GHK-Cu)
- Verify internal links between ingredient pages and product page
- Check for thin content (minimum 400 words per ingredient)

**Skin Concern Page SEO:**
- Verify HealthTopicContent or appropriate schema
- Check search intent alignment (informational content, not just product push)
- Confirm internal linking to relevant product and ingredient pages

### Step 4 — Compute Health Score

Score each category (0-100) using the `/seo` skill's weights:

| Category | Weight | What to Check |
|----------|--------|---------------|
| Technical SEO | 25% | Robots, canonicals, redirects, mobile, security headers |
| Content Quality | 20% | Thin content, unique descriptions, readability |
| On-Page SEO | 15% | Titles, metas, headings, internal links |
| Schema / Structured Data | 15% | Product, Review, Organization, BreadcrumbList validity |
| Performance (CWV) | 10% | LCP, INP, CLS (mobile) |
| Images | 10% | Alt text, format (WebP), sizing, lazy loading |
| AI Search Readiness | 5% | llms.txt, citability, structured answers |

**Overall Health Score** = weighted average across all categories.

### Step 5 — Diff Against Previous Audit

If PREVIOUS_AUDIT exists, compare:

**Score Comparison:**
```
| Category              | Previous | Current | Delta | Status      |
|-----------------------|----------|---------|-------|-------------|
| Technical SEO         | 85       | 82      | -3    | REGRESSED   |
| Content Quality       | 78       | 82      | +4    | IMPROVED    |
| Schema                | 90       | 90      |  0    | STABLE      |
| Overall Health        | 83       | 84      | +1    | IMPROVED    |
```

**Regression Detection Rules:**
- Score drop >= 5 points in any category: flag as WARNING
- Score drop >= 10 points in any category: flag as CRITICAL
- Overall score drop >= 3 points: flag as WARNING
- Any new broken link (404): flag as CRITICAL
- Any schema validation error that was previously passing: flag as CRITICAL
- CWV metric crossing from "Good" to "Needs Improvement" or "Poor": flag as CRITICAL
- New page missing from sitemap: flag as WARNING

**Change Detection:**
- New pages added since last audit
- Pages removed since last audit
- Schema changes (types added/removed/modified)
- Title/meta description changes
- New broken links
- Redirect chain changes
- CWV metric movements

### Step 6 — Generate Alert Summary

Categorize all findings by severity:

```
CRITICAL (fix immediately):
- Blocks indexing, breaks schema, 404s on key pages, CWV degradation

WARNING (fix this week):
- Score regressions, missing schema fields, new thin content pages

INFO (track):
- Minor score fluctuations, new pages detected, stable metrics
```

### Step 7 — Keyword Ranking Proxy

If Google Search Console data is accessible:
- Pull top queries for key pages (impressions, clicks, position)
- Compare position changes vs. previous period
- Flag any keyword dropping 5+ positions
- Track branded vs. non-branded query split

If Search Console is not available:
- Use web search to check SERP presence for core terms:
  - "men's face cream"
  - "base layer skin"
  - "men's moisturizer"
  - "skincare for men"
- Note: this is a proxy only, not authoritative ranking data

### Step 8 — Write Report

Save to `seo-reports/${TODAY}-audit.md` with this structure:

```markdown
# Base Layer SEO Audit — YYYY-MM-DD

## Health Score: XX/100 (DELTA from previous)

### Score Trend
| Date       | Score | Delta |
|------------|-------|-------|
| 2026-03-11 | 84    | +1    |
| 2026-03-04 | 83    | --    |
| 2026-02-25 | 80    | +3    |

### Critical Alerts
[List of CRITICAL findings — anything blocking indexing or breaking schema]

### Regressions
[What got worse since last audit, with evidence]

### Improvements
[What got better since last audit]

### New Findings
[Issues or opportunities not present in previous audit]

---

## Detailed Scores

| Category              | Score | Delta | Key Finding |
|-----------------------|-------|-------|-------------|
| Technical SEO         | XX    | +/-   | ...         |
| Content Quality       | XX    | +/-   | ...         |
| On-Page SEO           | XX    | +/-   | ...         |
| Schema                | XX    | +/-   | ...         |
| Performance (CWV)     | XX    | +/-   | ...         |
| Images                | XX    | +/-   | ...         |
| AI Search Readiness   | XX    | +/-   | ...         |

---

## Page-by-Page Results

### Homepage (baselayerskin.co)
- CWV: LCP Xs / INP Xms / CLS X.XX
- Schema: [valid/errors]
- Broken links: [count]
- Notes: ...

### Product Page (Performance Daily Face Cream)
- Product schema: [valid/errors]
- Merchant Center ready: [yes/no — name, image, price, priceCurrency, availability]
- Review schema: [present/missing] — reviewCount: X
- CWV: LCP Xs / INP Xms / CLS X.XX

### [Repeat for each key page]

---

## Keyword Ranking Proxy
[Search Console data or SERP spot-checks]

---

## Recommendations (Prioritized)
1. [CRITICAL] ...
2. [WARNING] ...
3. [INFO] ...

---

## Environment Notes
[Any script failures, API limits, or data gaps]
```

---

## Health Score Interpretation

| Score   | Rating            | Action                              |
|---------|-------------------|-------------------------------------|
| 90-100  | Excellent         | Maintain. Monitor weekly.           |
| 70-89   | Good              | Address warnings. Maintain cadence. |
| 50-69   | Needs Improvement | Prioritize critical fixes this week.|
| 30-49   | Poor              | Emergency audit. Fix blockers now.  |
| 0-29    | Critical          | Site likely deindexed. War room.    |

---

## Loop Integration

When running via `/loop` for scheduled recurring execution:

```
Schedule: Weekly (Monday 9 AM recommended)
Trigger: /seo-monitor
Output: seo-reports/YYYY-MM-DD-audit.md
Alert threshold: Any CRITICAL finding triggers immediate notification
Trend window: Last 8 audits (2 months of weekly runs)
```

The `/loop` skill should:
1. Run this full skill
2. Check the "Critical Alerts" section of the output
3. If any CRITICAL alerts exist, surface them immediately
4. Store the report for trend analysis

---

## First Run Behavior

On first run (no previous audit exists):
- Skip all diff/comparison logic
- Establish baseline scores for every category
- Generate full report with "BASELINE" tag
- All subsequent runs will diff against this baseline

---

## Example

### Input
```
/seo-monitor
Mode: weekly
Previous report: reports/seo/2026-03-03-seo-health.md
```

### Output (abbreviated)
```markdown
# SEO Health Report — 2026-03-10

## Health Score: 78/100 (up 3 from last week)

## Regressions Detected
| Page | Metric | Last Week | This Week | Severity |
|------|--------|-----------|-----------|----------|
| /ingredients/niacinamide | Position | 8.2 | 14.6 | CRITICAL |
| /blog/spf-myths | Clicks | 42 | 28 | WARNING |

## Wins
- /face-cream ranked position 3.1 for "men's moisturizer with spf" (was 5.4)
- New page /skin-concerns/oily-skin indexed within 48 hours

## Schema Validation
- Product schema: valid
- BlogPosting (12 pages): valid
- Missing schema: /about (Organization recommended)

## Action Items
1. URGENT: Investigate /ingredients/niacinamide drop — check for content changes, lost backlinks, or SERP feature displacement
2. Add Organization schema to /about page via `/schema-deployer`
3. Refresh /blog/spf-myths with updated statistics (content is 6+ months old)
```

---

## Edge Cases
- If no previous report exists: run full baseline audit instead of comparison. Save as first report and skip all WoW trend calculations.
- If Search Console API returns no data (new site or no verification): fall back to WebSearch-based position checking for top 10 target keywords. Flag that GSC verification is required for accurate monitoring.
- If a monitored page returns 404 or 5xx: immediately flag as CRITICAL regression with specific remediation (check redirect, restore from git, verify Netlify deployment).
- If health score drops more than 15 points WoW: trigger an "SEO Emergency" section at the top of the report with root cause analysis before the standard sections.
- If the site has fewer than 10 indexed pages: adjust scoring weights to de-emphasize breadth metrics and focus on individual page performance and technical health.

---

## Quality Gate

Before marking the run complete:
- [ ] All key pages were audited (no silent failures)
- [ ] Health score was computed with all 7 categories
- [ ] Report file was written to seo-reports/
- [ ] If previous audit exists, diff was generated
- [ ] Any CRITICAL alerts are clearly surfaced at the top
- [ ] Product schema verified for Merchant Center requirements
- [ ] Script failures logged in Environment Notes (not silently ignored)
