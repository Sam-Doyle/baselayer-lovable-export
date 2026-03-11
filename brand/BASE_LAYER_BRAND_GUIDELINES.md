# Base Layer — Brand Guidelines

**Version:** 1.0
**Date:** March 2026
**URL:** [baselayerskin.co](https://baselayerskin.co)
**Instagram:** [@baselayerskin](https://www.instagram.com/baselayerskin/)
**Contact:** contact@baselayerskin.co

---

## 1. Brand Overview

### Mission
Eliminate friction from men's skincare. One product. One step. Done.

### Positioning Statement
Base Layer is a performance men's skincare brand engineered in Breckenridge, Colorado. We make the face cream that absorbs in 15 seconds and replaces your entire routine — for men who want results without the ritual.

### Brand Essence
**Simplicity through superior formulation.**

### Origin Story
At 9,600 ft in Breckenridge, Colorado, dry air and UV break down your skin barrier fast. Base Layer was engineered to hydrate, repair, and defend — without grease or shine. The altitude isn't a gimmick. It's the proving ground.

---

## 2. Target Audience

### Primary
- **Men, 25–40**
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- Likely has 0–1 products in their routine (or 5+ unused ones under the sink)
- Responds to: efficiency, proof, directness

### Psychographic Profile
- Values: function over form, simplicity, credibility
- Pain points: greasy products, confusing multi-step routines, wasted money, "it all looks the same"
- Aspiration: look sharper without thinking about it

### Traffic Source
Instagram ads → cold traffic → email capture funnel

---

## 3. Color System

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
1. **The brand is monochrome.** Black/white/gray at all times. No brand color beyond the grayscale palette.
2. **Color is functional, not decorative.** Amber = ratings. Green = success. Red = friction/problem.
3. **High contrast is the aesthetic.** Near-black backgrounds with near-white text. No mid-gray-on-gray.
4. **Hero overlays** use gradient-to-right (desktop) or gradient-to-top (mobile) from `black/70` to `black/25` over photography.

---

## 4. Typography

### Typeface Stack

| Role | Family | Weights | Usage |
|---|---|---|---|
| **Headings** | DM Sans | 700, 800, 900 | All headings, brand name, CTAs |
| **Body** | Inter | 400, 500, 600 | Body copy, labels, inputs, UI |

### Heading Style
- **Transform:** UPPERCASE always
- **Tracking:** `tracking-tight` (tight letter spacing)
- **Leading:** `0.9–0.95` (very tight line height)
- **Weight:** `font-black` (900) for impact headings, `font-bold` (700) for sub-headings
- **Size range:** `text-2xl` to `text-8xl` depending on hierarchy

### Body Style
- **Transform:** Mixed case (sentence case for prose, UPPERCASE for labels/badges)
- **Labels/badges:** `text-[11px]`, `tracking-[0.2em]–[0.35em]`, `uppercase`
- **Body copy:** `text-sm` to `text-lg`, `leading-relaxed`
- **Color:** `text-muted-foreground` for secondary, `text-foreground` for emphasis

### Type Patterns

```
EYEBROW:     font-body text-xs tracking-[0.3em] text-muted-foreground uppercase
HEADLINE:    font-heading text-3xl–8xl font-black tracking-tight uppercase leading-[0.9]
SUBHEAD:     font-heading text-lg–xl font-bold uppercase tracking-wide
BODY:        font-body text-sm–lg text-muted-foreground leading-relaxed
LABEL:       font-body text-[11px] tracking-[0.2em] uppercase
CTA BUTTON:  font-body text-xs font-bold uppercase tracking-[0.15em]
BADGE:       font-body text-[11px] tracking-[0.25em] uppercase text-muted-foreground/60
```

### Typography Rules
1. **Headings are always uppercase.** No exceptions.
2. **Never use decorative or script fonts.** The brand is geometric sans-serif only.
3. **Tight leading on headlines** creates a stacked, impactful visual. Line heights of 0.9–0.95.
4. **Wide tracking on small labels** (0.2em–0.35em) for eyebrows, badges, and micro-copy.
5. **Font weight carries hierarchy.** 900 > 700 > 600 > 400. Don't use color for hierarchy; use weight and size.

---

## 5. Logo & Brand Mark

### Wordmark
The Base Layer logo is a typographic wordmark: **"Base Layer"** set in **DM Sans Bold**, uppercase, with tight tracking. It is enclosed between two horizontal rules (1px white lines above and below).

```
───────────────
  BASE LAYER
───────────────
```

### Logo Rules
1. Always uppercase
2. Always white on black (or black on white in light contexts)
3. Horizontal rules above and below are part of the mark — don't separate them
4. Minimum clear space: the height of the text on all sides
5. No gradients, shadows, or embellishments on the wordmark
6. Logo file: `src/assets/logo-white.png`

---

## 6. Photography & Imagery

### Image Assets

| Image | File | Description | Usage |
|---|---|---|---|
| Hero Product | `hero-product.jpg` + WebP variants | Product jar, dramatic studio lighting | Homepage hero, OG image |
| Skier Colorado | `skier-colorado.jpg` | Man skiing in Colorado mountains | Ingredients/origin story section |
| Guy Moisturizer | `guy-moisturizer.webp` | Man applying product to face | Payoff section, lifestyle |
| Clutter Blur | `clutter-blur.jpg` | Blurred bathroom with too many products | "Why Men Quit" section |
| Product on Rock | `product-hero-rock.png` + WebP | Jar on natural stone surface | Product page hero |
| Cream Texture | `cream-texture-macro.jpg` | Close-up macro of cream texture | Product detail |
| Absorption Proof | `absorption-proof.jpg` | Before/after absorption demo | Claims support |

### Photography Direction

**Primary style: Dramatic, high-contrast, editorial**
- Dark backgrounds or natural environments
- Dramatic side/rim lighting
- Masculine but not aggressive
- Colorado outdoor settings (mountains, altitude, natural light)
- Real men, real skin — no airbrushed perfection

**Product photography:**
- Clean, dark surfaces (stone, slate, concrete)
- Single product focus — no clutter
- Dramatic shadows, minimal props
- Studio lighting with warm accent

**Lifestyle photography:**
- Active, outdoor contexts (skiing, hiking, morning routine)
- Natural light preferred
- Candid > posed
- Men 25–40, diverse, athletic builds

### Image Treatment
- All hero/section images get a gradient overlay (`bg-gradient-to-r from-black/70 via-black/50 to-black/25` on desktop, `bg-gradient-to-t from-black/80 via-black/50 to-black/30` on mobile)
- Lazy loading for below-fold images
- WebP format with responsive srcSet (480w, 768w, 1200w, 1920w)

---

## 7. Voice & Tone

### Brand Voice: "Your Sharp Friend"
Direct, confident, conversational. Like a friend who happens to know about skincare but doesn't make it weird.

### Voice Characteristics

| Attribute | We are | We are NOT |
|---|---|---|
| Direct | "One step. Done." | "Explore our carefully curated range" |
| Confident | "The product works." | "We believe this could help" |
| Honest | "50 early testers. Zero refund requests." | "Clinically proven by dermatologists" |
| Conversational | "That greasy feeling? Gone." | "Eliminate excess sebum production" |
| Masculine-neutral | "Look sharper" | "Anti-aging miracle for him" |
| Anti-complexity | "Everything your skin needs. Nothing it doesn't." | "Advanced 6-step regimen" |

### Messaging Pillars

**1. Simplicity**
- "One step, zero shine"
- "The anti-routine: one product, 15 seconds, done"
- "Put it on. Forget about it."
- "I never wanted a 6-step routine"

**2. Performance**
- "Absorbs in 15 seconds"
- "Controls shine all day"
- "Zero residue, ever"
- "Replaces your entire routine"

**3. Credibility**
- "Formulated in Breckenridge, Colorado"
- "Built for altitude. Built for real life."
- "50 bottles. 50 guys. Here's what they said."
- "Clean, science-backed formula"

**4. Urgency (Founding Batch)**
- "Founding batch. Limited run."
- "Lock in the founding price"
- "$38 founding price — increases at launch"
- "First production run"

### Headline Formula
Short. Punchy. Stacked. Period-terminated or no punctuation.

```
ONE STEP.
ZERO SHINE.

BUILT FOR ALTITUDE.
BUILT FOR REAL LIFE.

PUT IT ON.
FORGET ABOUT IT.

MOST ROUTINES FAIL
FOR ONE REASON:
FRICTION

EVERYTHING YOUR SKIN NEEDS.
NOTHING IT DOESN'T.
```

### CTA Language

| Context | Primary CTA | Secondary CTA |
|---|---|---|
| Hero | `GET EARLY ACCESS` | `$38 Founding Price` |
| Section | `RESERVE YOURS — $38` | `Limited founding batch at $38.` |
| Ingredients | `GET EARLY ACCESS — $38` | `Founding batch. Limited run.` |
| Modal | `LOCK IN THE FOUNDING PRICE` | `No spam. No fluff. One launch email.` |
| Sticky Bar | `JOIN WAITLIST — $38` | `Founding Price $38` |
| Post-Signup | `FOLLOW ON INSTAGRAM` | — |

### Pain Point Copy
Speak to real frustrations. Be specific. Be empathetic but not soft.

```
"5 products your girlfriend told you to buy — 4 of them sitting unused under the sink"
"That greasy feeling 30 minutes after applying — like your face is coated in cooking oil"
"Spending $150 and looking exactly the same — zero visible difference"
```

### Negation Pills (What We're NOT)
```
No fragrance overload
No greasy residue
No unnecessary extras
```

---

## 8. UI & Layout Patterns

### Spacing & Grid
- Max content width: `1440px`
- Container padding: `2rem`
- Section padding: `py-20` to `py-32`
- Card padding: `p-8` to `p-10`
- Border radius: `0rem` (sharp corners everywhere — the brand is angular)

### Section Patterns

**Full-bleed hero** — Full-viewport image with gradient overlay, left-aligned text (desktop), centered (mobile)

**Split-screen** — 50/50 grid: image left or right, copy on opposite side. Used for WhyMenQuit and Payoff sections.

**Centered text** — Max-width centered copy block with CTA. Used for Guarantee and WhoWeAre.

**Card grid** — 2–3 column grid of testimonial or feature cards on dark background.

### Component Patterns

**Eyebrow → Headline → Body → CTA → Badge** (the standard section stack):
```
[EYEBROW]    font-body text-xs tracking-[0.3em] uppercase text-muted-foreground
[HEADLINE]   font-heading text-3xl–7xl font-black uppercase
[BODY]       font-body text-base–lg text-muted-foreground leading-relaxed
[CTA]        Button variant="hero" size="lg"
[BADGE]      font-body text-[11px] uppercase tracking-wider text-muted-foreground/60
```

**Trust strip** — Horizontal bar with icon + text badges (star rating, tested by 50, clean formula, guarantee)

**Sticky bar** — Fixed bottom bar, appears after 60% scroll. Dark background, white CTA.

**Subbanner** — Fixed bar below navbar. White background, dark text. `text-[11px] tracking-[0.2em] uppercase`.

### Animation Rules
1. **Subtle and fast.** All durations under 500ms.
2. **Fade-in-up** (`translateY(20-40px)` + opacity) for section reveals on scroll.
3. **IntersectionObserver** triggers at 15–20% threshold.
4. **Staggered delays** for card grids (150ms per card).
5. **Respect `prefers-reduced-motion`** — disable all animations.
6. **Input focus glow** — subtle white pulse on email inputs.
7. **Button press** — `scale(0.97)` on `:active` for tactile feedback.

---

## 9. Product Details

### Product
**Performance Daily Face Cream**

### SKU
BL-PDFC-50ML

### Size
50 mL

### Price
$38 (founding batch) / $48 (post-launch)

### Key Ingredients
| Ingredient | Benefit |
|---|---|
| Niacinamide | Oil control, pore refinement |
| Copper Peptide GHK-Cu | Anti-aging, collagen support |
| Panthenol | Barrier repair, soothing |
| Centella Asiatica | Calms irritation, sensitive skin |
| Squalane | Lightweight hydration |
| Hyaluronic Acid | Deep moisture retention |

### Key Claims
- Absorbs in 15 seconds
- Replaces serum + moisturizer + eye cream
- Matte finish, zero shine
- Fragrance-free
- One bottle lasts 6–8 weeks
- 30-day money-back guarantee (keep the bottle)

### Results Timeline
- **Immediate:** Hydration
- **1–2 weeks:** Oil control
- **4–8 weeks:** Visible anti-aging improvements

---

## 10. Social Proof Framework

### Review Template
All reviews follow the format:
```
★★★★★
"[Quote in first person, conversational]"
— [Name] [Last Initial].
  Verified Early Tester
  [Skin Type] · Age [##]
```

### Current Reviews
1. **Sean G.** (Oily Skin, Age 34): "One step, no shine — that's all I wanted."
2. **Matt M.** (Combination Skin, Age 36): "I never wanted a 6-step routine."
3. **Cooper S.** (Dry Skin, Age 27): "Everything else feels heavy now."

### Trust Signals
- "5.0 from 50 early testers"
- "Tested by 50 real guys"
- "Clean, science-backed formula"
- "30-day money-back guarantee"
- "50 early testers. Zero refund requests."
- "No paid endorsements. No influencers."

---

## 11. Conversion Architecture

### Page Section Order (Optimized for IG Ad → Email)
```
1. HERO         — Inline email capture (impulse signups)
2. SOCIAL PROOF — Trust badges strip
3. INGREDIENTS  — "Built for altitude" origin story
4. TESTIMONIALS — Social proof validates the story
5. WHY MEN QUIT — Agitate the pain point
6. PAYOFF       — "Put it on. Forget about it." Resolution
7. PRODUCT      — Specs for deep scrollers
8. GUARANTEE    — Risk reversal before final CTA
9. WHO WE ARE   — Brand story + final CTA
```

### CTA Density
9 trigger points across the page:
- Hero inline email
- Ingredients section CTA
- Testimonials CTA
- WhyMenQuit CTA
- Payoff CTA
- Product section
- Guarantee (implicit)
- WhoWeAre CTA
- Sticky bottom bar (persistent after 60% scroll)

### Email Capture Funnel (Modal)
3-screen flow:
1. **Email capture** → "Lock in the founding price"
2. **Confirmation + inline survey** → Reserve toggle + 3 quick questions
3. **Done** → Instagram follow CTA

---

## 12. Do's and Don'ts

### DO
- Use uppercase for all headings
- Keep copy short, punchy, declarative
- Lead with benefits, not features
- Use real numbers ("15 seconds", "50 testers", "$38")
- Reference Colorado/altitude as a credibility anchor
- Use monochrome palette — let photography bring warmth
- Sharp corners on everything (radius: 0)

### DON'T
- Use color for decoration
- Write long-form marketing copy in headings
- Say "we think" or "we believe" — state facts
- Use lifestyle buzzwords ("curated", "elevated", "artisanal")
- Use rounded corners, gradients, or soft aesthetics
- Add fragrance/scent language to copy
- Reference competitors by name
- Use stock photography of models
- Add emojis to any brand touchpoint
- Use exclamation marks in headlines

---

## 13. File Reference

```
src/index.css              — Color tokens, font-faces, animations
tailwind.config.ts         — Theme extensions, font families
src/components/Navbar.tsx   — Navigation, logo treatment
src/pages/Index.tsx         — Section order, JSON-LD schema
src/components/HeroSection.tsx         — Hero layout, inline capture
src/components/IngredientsSection.tsx   — Origin story section
src/components/TestimonialsSection.tsx  — Social proof cards
src/components/WhyMenQuitSection.tsx    — Pain point section
src/components/PayoffSection.tsx        — Resolution section
src/components/GuaranteeSection.tsx     — Risk reversal
src/components/WhoWeAreSection.tsx      — Brand close
src/components/EarlyAccessModal.tsx     — 3-screen funnel
src/components/StickyCartBar.tsx        — Persistent bottom CTA
src/components/SocialProofBar.tsx       — Trust badge strip
src/assets/                             — All imagery
```

---

*Base Layer. One step. Zero shine.*
