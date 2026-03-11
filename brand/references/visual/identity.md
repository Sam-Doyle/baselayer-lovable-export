# Base Layer — Visual Identity

**Source:** BASE_LAYER_BRAND_GUIDELINES.md Sections 3, 4, 5, 8
**Use:** Skills that generate visual assets, HTML, or UI components.

---

## Color System

### Primary Palette (Dark Mode — Default)

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--background` | `0 0% 4%` | `#0A0A0A` | Page background |
| `--foreground` | `0 0% 92%` | `#EBEBEB` | Primary text, CTAs |
| `--card` | `0 0% 7%` | `#121212` | Card backgrounds |
| `--secondary` | `0 0% 10%` | `#1A1A1A` | Section alternation |
| `--muted` | `0 0% 14%` | `#242424` | Muted surfaces |
| `--muted-foreground` | `0 0% 50%` | `#808080` | Secondary text |
| `--border` | `0 0% 16%` | `#292929` | Borders, dividers |
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` | "FRICTION" accent (red) |

### Light Surface (Contrast Sections)

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--surface-light` | `0 0% 96%` | `#F5F5F5` | Light section bg |
| `--surface-light-foreground` | `0 0% 8%` | `#141414` | Text on light |
| `--surface-light-muted` | `0 0% 40%` | `#666666` | Muted text on light |

### Accent Colors

| Color | Hex | Usage |
|---|---|---|
| Amber/Gold | `#FBBF24` | Star ratings, highlight badges |
| Green | `#22C55E` | Success states (checkmarks, confirmations) |
| White | `#FFFFFF` | Hero CTA buttons, accent text |

### Color Rules
1. The brand is monochrome. Black/white/gray at all times. No brand color beyond grayscale.
2. Color is functional, not decorative. Amber = ratings. Green = success. Red = friction/problem.
3. High contrast is the aesthetic. Near-black backgrounds with near-white text. No mid-gray-on-gray.
4. Hero overlays use `gradient-to-right from-black/70 via-black/50 to-black/25` (desktop) or `gradient-to-top from-black/80 via-black/50 to-black/30` (mobile).

## Typography

### Typeface Stack

| Role | Family | Weights | Usage |
|---|---|---|---|
| Headings | DM Sans | 700, 800, 900 | All headings, brand name, CTAs |
| Body | Inter | 400, 500, 600 | Body copy, labels, inputs, UI |

### Type Patterns

```
EYEBROW:     font-body text-xs tracking-[0.3em] text-muted-foreground uppercase
HEADLINE:    font-heading text-3xl-8xl font-black tracking-tight uppercase leading-[0.9]
SUBHEAD:     font-heading text-lg-xl font-bold uppercase tracking-wide
BODY:        font-body text-sm-lg text-muted-foreground leading-relaxed
LABEL:       font-body text-[11px] tracking-[0.2em] uppercase
CTA BUTTON:  font-body text-xs font-bold uppercase tracking-[0.15em]
BADGE:       font-body text-[11px] tracking-[0.25em] uppercase text-muted-foreground/60
```

### Typography Rules
1. Headings are always uppercase. No exceptions.
2. Never use decorative or script fonts. Geometric sans-serif only.
3. Tight leading on headlines (0.9-0.95) for stacked, impactful visual.
4. Wide tracking on small labels (0.2em-0.35em) for eyebrows, badges, micro-copy.
5. Font weight carries hierarchy: 900 > 700 > 600 > 400. Don't use color for hierarchy.

## Logo Rules
1. Always uppercase.
2. Always white on black (or black on white in light contexts).
3. Horizontal rules above and below are part of the mark — don't separate them.
4. Minimum clear space: the height of the text on all sides.
5. No gradients, shadows, or embellishments on the wordmark.
6. Logo file: `src/assets/logo-white.png`

## Border Radius
`0rem` — sharp corners everywhere. The brand is angular.
