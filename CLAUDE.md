# Base Layer Skin — Production Site

## Project

- **Repo**: `~/baselayer-lovable-export`
- **Stack**: React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **CMS**: Sanity (articles, ingredients, skin concerns)
- **Backend**: Supabase (auth, waitlist, checkout)
- **Deploy**: Netlify → `baselayerskin.co`
- **Brand context**: `~/BaseLayer/brand/_brand-context.md`

## Before Any Code Change

1. Read `~/BaseLayer/brand/_brand-context.md` for voice/visual rules
2. Verify you're in the correct codebase (`netlify status` if unsure)
3. Production = this repo. NOT `~/baselayer-astro`.

## Knowledge Base Protocol

This project uses a self-compiling wiki at `kb/`. The KB captures domain knowledge (competitor insights, conversion learnings, ingredient research, ad strategy findings, performance data) so it persists across sessions.

### Session Start

1. Read `kb/_index.md` — the master routing table
2. If inbox (`kb/_inbox.md`) has 5+ items AND current task is not urgent → compile inbox entries into wiki articles first
3. Read any wiki articles relevant to the current task

### During Session

When you learn something worth preserving (research finding, user correction, competitive insight, performance data, conversion learning), capture it to `kb/_inbox.md` using this format:

```markdown
---
date: YYYY-MM-DD
category: product | brand | competitive | technical | marketing | conversion
source: where you learned it (URL, user, experiment, code)
confidence: high | medium | low
target_article: wiki article this should merge into (if known)
---
Finding text here.
```

What to capture:
- Competitor data (pricing, claims, ingredients, positioning)
- Conversion insights (what copy/layout changes moved metrics)
- Ingredient research (efficacy data, sourcing, regulatory)
- Performance findings (Lighthouse scores, CLS/LCP fixes, bundle size changes)
- Customer language (review quotes, objection patterns, testimonial themes)
- Ad creative learnings (what hooks work, fatigue signals, platform-specific findings)
- SEO findings (ranking changes, keyword opportunities, technical issues)

What NOT to capture (use agent memory instead):
- Operational state (current branch, deploy status)
- Temporary debugging context
- Things already in the codebase or git history

### Session End

1. Append a session digest to `kb/_session-log.md`:
   ```markdown
   ## YYYY-MM-DD — Brief task description
   - **Task**: What was done
   - **Findings**: Key learnings (if any)
   - **Files changed**: List of modified files
   - **KB updates**: What was added to inbox or wiki
   ```
2. If inbox has 10+ items → must compile before finishing

### Compilation Rules

When compiling inbox → wiki:

1. **Merge, don't overwrite**: Add new findings to existing articles. Never delete prior content unless it's factually wrong.
2. **Update frontmatter**: Bump `last_compiled` date, increment `revision` count
3. **Cite sources**: Include date and source for each fact
4. **Update index**: After creating or significantly updating a wiki article, update `kb/_index.md`
5. **Cross-reference**: If a finding relates to multiple articles, add a `See also:` link

### Wiki Article Format

```markdown
---
title: Article Title
domain: product | brand | competitive | technical | marketing | conversion
created: YYYY-MM-DD
last_compiled: YYYY-MM-DD
revision: N
sources: [list of source types]
---

Content organized by topic with dated facts.
```

### Opportunistic Refresh

When reading a wiki article for current task and its `last_compiled` is >14 days old → check inbox for entries targeting it and compile them in.

## /last30days Pipeline

When running `/last30days` research for Base Layer:
1. Save raw research output to `kb/raw/research/YYYY-MM-DD-topic.md`
2. Extract key findings to `kb/_inbox.md` with proper category tags
3. After research completes, compile inbox into relevant wiki articles if threshold met

## Memory vs Wiki

| Type | Goes in... | Example |
|------|-----------|---------|
| Operational (deploy process, env vars, tool config) | Agent memory | "Production deploy is Netlify" |
| Domain knowledge (ingredients, competitors, strategy) | KB wiki | "Geologie charges $45/mo for 3 products" |
| User preferences (communication style, workflow) | Agent memory | "User prefers parallel subagents" |
| Research findings (market data, customer insights) | KB wiki | "Reddit r/SkincareAddiction top objection is price" |
