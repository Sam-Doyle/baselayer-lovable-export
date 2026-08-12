# Base Layer — Brand DNA

Foundation file for the `ad-creative-engine` skill. This is a routing file — it points at
the canonical sources rather than duplicating them, so nothing drifts. **Read the linked
files, don't work from this summary alone.**

## Canonical sources (read these)

| What | File |
|---|---|
| Full brand guidelines (master) | `brand/BASE_LAYER_BRAND_GUIDELINES.md` |
| Visual identity — color, type, logo | `brand/references/visual/identity.md` |
| Photography direction | `brand/references/visual/photography.md` |
| Platform / ad sizes | `brand/references/visual/platform-sizes.md` |
| Meta ad specs | `brand/references/channels/meta-ad-specs.md` |
| Product catalog + claims | `brand/references/product/catalog.md` |
| Ingredient database | `brand/references/product/ingredient-database.md` |
| Compliance limits on claims | `brand/references/product/compliance.md` |
| Competitor positioning | `brand/references/competitors/positioning-map.md` |
| Ad strategy learnings (KB) | `kb/wiki/ad-strategy.md` |
| Conversion learnings (KB) | `kb/wiki/conversion-learnings.md` |

## The short version for image prompts

**Positioning:** One-step skincare for men. Anti-complexity. Colorado/altitude as the
credibility anchor.

**Palette — monochrome, high contrast:**
- Background `#0A0A0A` · Card `#121212` · Section `#1A1A1A` · Border `#292929`
- Text `#EBEBEB` · Muted text `#808080`
- Light surface `#F5F5F5` with `#141414` text
- Functional accents only: amber `#FBBF24` (ratings), green `#22C55E` (success),
  red `#EF4444` (friction/problem)

**Type:** DM Sans (700/800/900) for headings — **always uppercase**, tight leading (0.9).
Inter (400/500/600) for body. Wide tracking (0.2–0.3em) on small labels and eyebrows.
Geometric sans-serif only, never decorative or script.

**Form:** Border radius `0rem`. Sharp corners everywhere. The brand is angular.

**Color rule for generated statics:** grayscale unless the color is doing a job. No
decorative color. High contrast is the aesthetic — no mid-gray on mid-gray.

## Known tension to resolve before a logo lands in an ad

`brand/references/visual/identity.md` states the brand is monochrome ("no brand color
beyond grayscale") but the logo rules call for an orange period and an Alpine Navy variant.
Both are in the source file. For ad statics, default to the monochrome rule and use the
white-on-dark logo cut (`src/assets/logo-white.png`); raise it with Sam before shipping a
creative where the orange period is prominent.

## Compliance

Read `brand/references/product/compliance.md` before any claim goes on an image or into
copy. Never write "clinically proven" without an actual clinical trial behind it.
