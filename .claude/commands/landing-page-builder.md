# Landing Page Builder

**Generates complete React/TypeScript landing page components for Meta ad campaigns, optimized for Base Layer Skin's DTC funnel.**

Takes a campaign brief and outputs a production-ready, mobile-first landing page with Tailwind CSS, Meta Pixel integration, UTM tracking, and A/B test variant support — wired for Vite + React + TypeScript on Netlify.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/voice/tone-rules.md`
- `brand/references/voice/copy-patterns.md`
- `brand/references/visual/identity.md`
- `brand/references/product/catalog.md`
- `brand/references/product/ingredient-database.md`
- `brand/references/audience/icp-core.md`
- `brand/references/audience/objection-bank.md`

## When NOT to Use
- For product page copy without a dedicated landing page (use `/product-description-writer`)
- For schema markup deployment only (use `/schema-deployer`)
- For ad creative images and copy (use `/ad-creative-pipeline`)
- For HTML email templates (use `/email-template-builder`)
- For social content (use `/social-content-batch`)

---

## Inputs

The user provides a campaign brief. Extract or ask for:

```
CAMPAIGN NAME:    Short identifier (e.g., "spring-launch", "simplicity-angle")
ANGLE:            Core message/hook (e.g., "simplicity", "anti-grease", "altitude")
AUDIENCE SEGMENT: Subset of ICP (e.g., "gym guys", "professionals", "skeptics")
OFFER:            What to present (e.g., "$38 founding price", "free shipping", "10% off")
HERO IMAGE:       Path to hero image or prompt for generation
AD MATCH:         (optional) Description of the ad creative this LP connects to
UTM SOURCE:       facebook | instagram (default: facebook)
VARIANT:          A | B (default: A) — for A/B test variant
```

If the user gives a loose brief ("make a landing page for the face cream"), default to:
- Angle: Simplicity — "One step. Zero shine."
- Segment: General ICP (men 25-40, skincare-curious)
- Offer: $38 founding price
- UTM Source: facebook
- Variant: A

---

## ICP — Hardcoded

Every landing page targets:
- **Males 20-40** (skew 25-35 for Meta ads)
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- 0-1 products in current routine
- **85%+ mobile traffic** from Meta ads
- Average time on page: 45-90 seconds before decision
- Scroll depth: 60% average, 30% reach bottom

---

## Brand Voice — Non-Negotiable

Key rules for landing pages:
- **Direct, confident, conversational.** Like a sharp friend who knows skincare but doesn't make it weird.
- **UPPERCASE for all headings.** No exceptions.
- **Short. Punchy. Stacked.** Period-terminated or no punctuation.
- **No flowery/feminine language.** No "curated", "elevated", "artisanal", "miracle".
- **No exclamation marks in headlines.** No emojis anywhere.
- **Lead with benefits, not features.** Use real numbers ("15 seconds", "50 testers", "$38").
- **Monochrome palette.** Color is functional only.
- **Sharp corners everywhere.** `rounded-none` on all elements.

---

## Landing Page Structure

Every LP follows this conversion-optimized section order:

```
1. HERO              — Hook + CTA (capture impulse buyers within 5 seconds)
2. SOCIAL PROOF BAR  — Trust strip (validate before they scroll)
3. PROBLEM/AGITATE   — Pain point identification (make them nod)
4. SOLUTION          — Introduce the product as the answer
5. BENEFITS          — 3-4 key benefits with icons
6. INGREDIENTS       — Science credibility without complexity
7. TESTIMONIALS      — Social proof deepening
8. COMPARISON        — Before/after or us vs. them
9. FAQ               — Objection handling (collapsible)
10. FINAL CTA        — Last chance conversion with guarantee
```

The sticky bottom bar appears after 40% scroll depth on mobile.

---

## Pipeline

```
1. BRIEF       → Lock inputs, confirm with user
2. SCAFFOLD    → Generate component file structure
3. SECTIONS    → Build each section component
4. TRACKING    → Wire Meta Pixel + UTM capture
5. VARIANTS    → Generate A/B test variant props
6. STYLES      → Apply Tailwind + brand tokens
7. DELIVER     → Output to src/pages/landing/
```

---

## Phase 1: Brief Lock

Confirm the brief back to the user:

```
LANDING PAGE BRIEF
------------------
Campaign:    [name]
Angle:       [angle]
Segment:     [audience segment]
Offer:       [offer details]
Ad Match:    [description of ad creative being linked to]
UTM:         utm_source=[source]&utm_medium=cpc&utm_campaign=[campaign-name]
Output:      src/pages/landing/[campaign-name]/
Variant:     [A|B]
```

Get explicit approval before proceeding.

---

## Phase 2: Component Architecture

### File Structure

```
src/pages/landing/[campaign-name]/
  index.tsx                    — Main landing page component + route
  LandingHero.tsx              — Hero section
  SocialProofBar.tsx           — Trust badges strip
  ProblemSection.tsx           — Pain point / agitation
  SolutionSection.tsx          — Product as the answer
  BenefitsSection.tsx          — Key benefits grid
  IngredientsSection.tsx       — Ingredient highlights
  TestimonialsSection.tsx      — Review cards
  ComparisonSection.tsx        — Before/after or vs. comparison
  FAQSection.tsx               — Collapsible FAQ
  FinalCTASection.tsx          — Closing CTA + guarantee
  StickyBar.tsx                — Fixed bottom CTA bar
  types.ts                     — Shared types + variant props
  tracking.ts                  — Meta Pixel + UTM utilities
  content.ts                   — All copy in one file (easy to swap for A/B)
```

### Main Component Structure

```typescript
// index.tsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingHero } from './LandingHero';
import { SocialProofBar } from './SocialProofBar';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { BenefitsSection } from './BenefitsSection';
import { IngredientsSection } from './IngredientsSection';
import { TestimonialsSection } from './TestimonialsSection';
import { ComparisonSection } from './ComparisonSection';
import { FAQSection } from './FAQSection';
import { FinalCTASection } from './FinalCTASection';
import { StickyBar } from './StickyBar';
import { trackPageView, trackViewContent, captureUTM } from './tracking';
import { getContent } from './content';
import type { LandingVariant } from './types';

interface Props {
  variant?: LandingVariant;
}

export default function LandingPage({ variant = 'A' }: Props) {
  const [searchParams] = useSearchParams();
  const content = getContent(variant);

  useEffect(() => {
    captureUTM(searchParams);
    trackPageView();
    trackViewContent({
      content_name: '<campaign-name>',
      content_category: 'landing_page',
      content_type: 'product',
      value: <price>,
      currency: 'USD',
    });
  }, []);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <LandingHero content={content.hero} />
      <SocialProofBar content={content.socialProof} />
      <ProblemSection content={content.problem} />
      <SolutionSection content={content.solution} />
      <BenefitsSection content={content.benefits} />
      <IngredientsSection content={content.ingredients} />
      <TestimonialsSection content={content.testimonials} />
      <ComparisonSection content={content.comparison} />
      <FAQSection content={content.faq} />
      <FinalCTASection content={content.finalCTA} />
      <StickyBar content={content.stickyBar} />
    </main>
  );
}
```

---

## Phase 3: Section Specifications

### 1. Hero Section

**Purpose:** Stop the scroll. Match the ad creative. Convert impulse buyers in 5 seconds.

```
Layout:
  - Mobile: Full-width image with gradient overlay (bottom-to-top), text centered
  - Desktop: Split — image right, copy left (or full-bleed with gradient-to-right overlay)

Content:
  - Eyebrow: campaign-specific (e.g., "ENGINEERED IN COLORADO" or "FOUNDING BATCH")
  - Headline: 3-7 words, UPPERCASE, stacked lines
  - Subhead: 1 sentence, benefit-focused
  - CTA Button: Primary action (e.g., "GET EARLY ACCESS — $38")
  - Badge: Trust signal below CTA (e.g., "30-day money-back guarantee")

Visual:
  - Background image must visually match the ad creative that drove the click
  - Gradient overlay: bg-gradient-to-t from-black/80 via-black/50 to-black/30 (mobile)
  - Gradient overlay: bg-gradient-to-r from-black/70 via-black/50 to-black/25 (desktop)

Animation:
  - Fade-in-up on headline (300ms delay)
  - Fade-in-up on subhead (450ms delay)
  - Fade-in-up on CTA (600ms delay)
  - Respect prefers-reduced-motion
```

**Ad-to-LP Visual Match Rules:**
- If the ad shows the product jar: hero must feature the product jar
- If the ad uses mountain imagery: hero must use mountain imagery
- Color temperature must match (warm ad → warm hero, cool ad → cool hero)
- The headline on the LP should echo or expand the ad hook (not contradict it)

### 2. Social Proof Bar

**Purpose:** Immediate validation. Before they have time to doubt.

```
Layout: Horizontal scroll on mobile, flex row on desktop
Content: 4-5 trust badges
  - "5.0 from 50 early testers" (with star icons)
  - "Absorbs in 15 seconds"
  - "Clean, science-backed formula"
  - "30-day money-back guarantee"
  - "Free shipping"

Style:
  - bg-card (dark surface)
  - py-4, full width
  - text-[11px] tracking-[0.2em] uppercase text-muted-foreground
  - Dividers between badges on desktop
```

### 3. Problem / Agitation Section

**Purpose:** Make the reader feel understood. Name their frustration.

```
Layout: Centered text block or split with "cluttered bathroom" image

Content options by angle:
  SIMPLICITY:
    Eyebrow: "THE PROBLEM"
    Headline: "MOST ROUTINES FAIL FOR ONE REASON: FRICTION"
    Body: Name the pain — too many products, too many steps, greasy feel,
          wasted money, products sitting unused under the sink.
    Stats: "The average man quits his skincare routine in 14 days."

  ANTI-GREASE:
    Headline: "THAT GREASY FEELING 30 MINUTES LATER"
    Body: Every moisturizer promises "lightweight" — then coats your face
          in shine by lunch.

  ALTITUDE:
    Headline: "YOUR SKIN WASN'T BUILT FOR THIS"
    Body: UV, dry air, wind. Your current routine was designed for sea level.

Style:
  - bg-secondary or bg-background
  - Large headline, muted body text
  - Optional red accent (#EF4444) on the "friction" or "problem" word
```

### 4. Solution Section

**Purpose:** Introduce Base Layer as the direct answer to the problem.

```
Layout: Product image + copy. Split on desktop, stacked on mobile.

Content:
  Eyebrow: "THE SOLUTION"
  Headline: "ONE STEP. ZERO SHINE."
  Body: What the product is, what it replaces, how fast it works.
  Key line: "Replaces your serum, moisturizer, and eye cream. Absorbs in 15 seconds."
  CTA: "RESERVE YOURS — $38"

Style:
  - Product image: dramatic lighting, dark background
  - Sharp corners on image container
```

### 5. Benefits Section

**Purpose:** Scannable value props. Benefits, not features.

```
Layout: 2-column grid on desktop, stacked on mobile. Icon + text per benefit.

Content (3-4 benefits):
  1. "ABSORBS IN 15 SECONDS" — No waiting. No greasy residue. Put it on and go.
  2. "REPLACES YOUR ENTIRE ROUTINE" — Serum + moisturizer + eye cream. One product.
  3. "MATTE FINISH ALL DAY" — Controls shine without drying your skin out.
  4. "6-8 WEEKS PER BOTTLE" — One jar. Two months. $38.

Style:
  - Icon: simple line icon or checkmark, text-foreground
  - Headline: font-heading font-bold uppercase text-lg
  - Body: text-muted-foreground text-sm leading-relaxed
```

### 6. Ingredients Section

**Purpose:** Build credibility with ingredient transparency. Not a chemistry lecture.

```
Layout: Grid of 3-4 ingredient cards or icon+text rows.

Content:
  Eyebrow: "WHAT'S INSIDE"
  Headline: "BUILT FOR ALTITUDE. BUILT FOR REAL LIFE."
  Ingredients to highlight:
    - Niacinamide — "Controls oil. Refines pores."
    - Copper Peptide GHK-Cu — "Rebuilds collagen. Fights aging."
    - Panthenol — "Repairs your skin barrier."
    - Squalane — "Lightweight hydration. Zero grease."

Style:
  - Clean, minimal cards on bg-card
  - No molecular diagrams or lab imagery (keep it accessible)
  - Colorado/altitude reference in the section intro
```

### 7. Testimonials Section

**Purpose:** Social proof from real users.

```
Layout: Card grid. 2-column desktop, single column mobile, or horizontal scroll.

Content: 3 review cards minimum
  Format per card:
    - 5 star icons (amber #FBBF24)
    - Quote in quotes
    - Name, last initial
    - "Verified Early Tester"
    - Skin type, age

  Reviews:
    Sean G. (Oily, 34): "One step, no shine — that's all I wanted."
    Matt M. (Combination, 36): "I never wanted a 6-step routine."
    Cooper S. (Dry, 27): "Everything else feels heavy now."

Style:
  - bg-card cards with border border-border
  - Sharp corners
  - Star color: #FBBF24
```

### 8. Comparison Section

**Purpose:** Make the value proposition concrete through comparison.

```
Layout: Two-column comparison table or before/after split.

Options:
  A) "YOUR ROUTINE vs. BASE LAYER"
     Left: Cleanser + Toner + Serum + Moisturizer + Eye Cream = $150+/month, 10 minutes
     Right: Base Layer = $38, 15 seconds

  B) "BEFORE / AFTER"
     Before: Greasy by noon, 5 products unused, confusing routine
     After: Matte all day, one product, 15 seconds

Style:
  - Clear visual distinction between columns
  - Red (#EF4444) for the "before"/competitor side
  - Green (#22C55E) checkmarks for Base Layer side
  - bg-secondary background
```

### 9. FAQ Section

**Purpose:** Handle objections. Remove friction before the final CTA.

```
Layout: Collapsible accordion. Single column, max-width: 640px, centered.

Content (6-8 questions):
  Q: "What skin types does this work for?"
  A: "All of them. Oily, dry, combination — the formula adapts."

  Q: "Will it make my face greasy?"
  A: "Zero grease. Matte finish. Absorbs in 15 seconds."

  Q: "What does it replace?"
  A: "Your serum, moisturizer, and eye cream. One product."

  Q: "How long does a bottle last?"
  A: "6-8 weeks with daily use."

  Q: "What if it doesn't work for me?"
  A: "30-day money-back guarantee. Keep the bottle."

  Q: "Is it fragrance-free?"
  A: "Completely. No fragrance, no dyes."

  Q: "Where is it made?"
  A: "Formulated in Breckenridge, Colorado."

  Q: "What's the founding price?"
  A: "$38 now. Goes to $48 after the founding batch."

Implementation:
  - useState for open/close per item
  - Smooth height transition (max-height + overflow-hidden)
  - Plus/minus icon toggle
  - Only one open at a time (accordion behavior)
```

### 10. Final CTA Section

**Purpose:** Last conversion opportunity. Combine offer + guarantee + urgency.

```
Layout: Centered text block with CTA button. Clean, high-contrast.

Content:
  Eyebrow: "LIMITED FOUNDING BATCH"
  Headline: "ONE STEP. ZERO SHINE. $38."
  Body: "30-day money-back guarantee. Free shipping. Keep the bottle even if you return it."
  CTA: "GET EARLY ACCESS"
  Badge: "Founding price — increases to $48 at launch"

Style:
  - bg-background (full dark)
  - Large headline, white CTA button
  - Maximum contrast
```

### Sticky Bottom Bar

**Purpose:** Persistent CTA for users who are scrolling but haven't converted.

```
Implementation:
  - Fixed bottom, full width
  - Appears after 40% scroll depth (IntersectionObserver or scroll event)
  - Hides when hero CTA or final CTA is in viewport
  - z-50

Content:
  - Product name + price on left
  - CTA button on right
  - Single row, compact (py-3)

Style:
  - bg-card/95 backdrop-blur-sm
  - border-t border-border
  - CTA: white button, dark text
```

---

## Phase 4: Tracking Integration

### Meta Pixel Events

```typescript
// tracking.ts
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export function trackPageView() {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
}

export function trackViewContent(params: {
  content_name: string;
  content_category: string;
  content_type: string;
  value: number;
  currency: string;
}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', params);
  }
}

export function trackAddToCart(params: {
  content_name: string;
  content_type: string;
  value: number;
  currency: string;
}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', params);
  }
}

export function trackInitiateCheckout(params: {
  content_name: string;
  value: number;
  currency: string;
  num_items: number;
}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', params);
  }
}

export function trackLead(params: {
  content_name: string;
  content_category: string;
}) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', params);
  }
}
```

### Event Trigger Points

| Section | Event | Trigger |
|---------|-------|---------|
| Page load | `PageView` | Automatic on mount |
| Page load | `ViewContent` | Automatic on mount with product data |
| Hero CTA click | `AddToCart` or `Lead` | onClick handler |
| Any CTA click | `AddToCart` | onClick handler |
| Email capture submit | `Lead` | onSubmit handler |
| Sticky bar CTA click | `InitiateCheckout` | onClick handler |
| Scroll 75% | Custom: `ScrollDepth75` | IntersectionObserver |

### UTM Capture

```typescript
export function captureUTM(searchParams: URLSearchParams) {
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const utm: Record<string, string> = {};

  utmParams.forEach(param => {
    const value = searchParams.get(param);
    if (value) {
      utm[param] = value;
      sessionStorage.setItem(param, value);
    }
  });

  // Also capture fbclid for Meta attribution
  const fbclid = searchParams.get('fbclid');
  if (fbclid) {
    sessionStorage.setItem('fbclid', fbclid);
  }

  return utm;
}

export function getStoredUTM(): Record<string, string> {
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  const utm: Record<string, string> = {};
  utmParams.forEach(param => {
    const value = sessionStorage.getItem(param);
    if (value) utm[param] = value;
  });
  return utm;
}
```

---

## Phase 5: A/B Test Variants

### Variant Architecture

```typescript
// types.ts
export type LandingVariant = 'A' | 'B';

export interface HeroContent {
  eyebrow: string;
  headline: string[];    // Array of lines for stacked display
  subhead: string;
  ctaText: string;
  ctaUrl: string;
  badge: string;
  heroImage: string;
}

export interface LandingContent {
  hero: HeroContent;
  socialProof: SocialProofContent;
  problem: ProblemContent;
  solution: SolutionContent;
  benefits: BenefitsContent;
  ingredients: IngredientsContent;
  testimonials: TestimonialsContent;
  comparison: ComparisonContent;
  faq: FAQContent;
  finalCTA: FinalCTAContent;
  stickyBar: StickyBarContent;
}
```

```typescript
// content.ts
import type { LandingContent, LandingVariant } from './types';

const variantA: LandingContent = {
  hero: {
    eyebrow: 'ENGINEERED IN BRECKENRIDGE, CO',
    headline: ['ONE STEP.', 'ZERO SHINE.'],
    subhead: 'The face cream that absorbs in 15 seconds and replaces your entire routine.',
    ctaText: 'GET EARLY ACCESS — $38',
    ctaUrl: '/checkout',
    badge: '30-day money-back guarantee',
    heroImage: '/images/hero-product.jpg',
  },
  // ... all section content
};

const variantB: LandingContent = {
  hero: {
    eyebrow: 'FOUNDING BATCH — LIMITED RUN',
    headline: ['PUT IT ON.', 'FORGET ABOUT IT.'],
    subhead: 'One product. 15 seconds. Done. The anti-routine for men who want results.',
    ctaText: 'LOCK IN THE FOUNDING PRICE',
    ctaUrl: '/checkout',
    badge: 'Free shipping on founding batch',
    heroImage: '/images/hero-product.jpg',
  },
  // ... all section content
};

export function getContent(variant: LandingVariant): LandingContent {
  return variant === 'B' ? variantB : variantA;
}
```

### What to Vary Between A/B

| Element | Variant A | Variant B | Variable Isolated |
|---------|-----------|-----------|-------------------|
| Headline | "ONE STEP. ZERO SHINE." | "PUT IT ON. FORGET ABOUT IT." | Hook messaging |
| CTA text | "GET EARLY ACCESS — $38" | "LOCK IN THE FOUNDING PRICE" | CTA urgency framing |
| Hero image | Product hero | Lifestyle/Colorado | Visual approach |
| Problem section | Clutter angle | Grease angle | Pain point resonance |
| Social proof position | After hero | Within hero | Trust signal placement |

### Variant Routing

```typescript
// In the route configuration or parent component:
// URL param: ?v=B
// Or server-side split via Netlify edge function

const variant = searchParams.get('v') as LandingVariant || 'A';
<LandingPage variant={variant} />
```

---

## Phase 6: Tailwind + Brand Styling

### Required Tailwind Classes (Brand Tokens)

```
Background:   bg-[#0A0A0A] (page), bg-[#121212] (cards), bg-[#1A1A1A] (sections)
Text:         text-[#EBEBEB] (primary), text-[#808080] (secondary)
Border:       border-[#292929]
Accent:       text-[#FBBF24] (stars), text-[#22C55E] (success), text-[#EF4444] (friction)
Corners:      rounded-none (everywhere)
```

### Typography Classes

```
Eyebrow:   text-xs tracking-[0.3em] text-[#808080] uppercase font-medium
Headline:  text-3xl md:text-5xl lg:text-7xl font-black tracking-tight uppercase leading-[0.9]
Subhead:   text-lg md:text-xl font-bold uppercase tracking-wide
Body:      text-sm md:text-base text-[#808080] leading-relaxed
Label:     text-[11px] tracking-[0.2em] uppercase
CTA:       text-xs font-bold uppercase tracking-[0.15em]
```

### Animation Utilities

```typescript
// Scroll-triggered fade-in-up
// Use IntersectionObserver with 15-20% threshold
// Duration: 300-500ms
// translateY: 20-40px
// Stagger: 150ms per element in groups
// Always check: window.matchMedia('(prefers-reduced-motion: reduce)')
```

### Mobile-First Requirements

Since 85%+ traffic is mobile from Meta:
- All layouts start mobile, enhance for desktop with `md:` and `lg:` breakpoints
- Touch targets minimum 44x44px
- No hover-dependent interactions (hover states are enhancements only)
- Text readable without zooming (minimum 16px body on mobile)
- Images lazy-loaded below the fold (`loading="lazy"`)
- Hero image uses `priority` loading (not lazy)
- CTA buttons full-width on mobile, auto-width on desktop

---

## Phase 7: Output and Delivery

### File Output

Write all files to `src/pages/landing/[campaign-name]/`.

### Route Registration

Provide the route to add to the app's router:

```typescript
// Add to src/App.tsx or router config:
import LandingPage from './pages/landing/[campaign-name]';

// Route:
<Route path="/lp/[campaign-name]" element={<LandingPage />} />
```

### Netlify Configuration

Provide any needed `_redirects` or `netlify.toml` additions:

```toml
# For SPA routing on Netlify
[[redirects]]
  from = "/lp/*"
  to = "/index.html"
  status = 200
```

### Summary Report

```
LANDING PAGE COMPLETE
=====================
Campaign:     [name]
Output:       src/pages/landing/[campaign-name]/
Files:        [count] components + tracking + content + types
Route:        /lp/[campaign-name]
Variant:      [A|B]
Pixel Events: PageView, ViewContent, AddToCart, Lead, InitiateCheckout
UTM Capture:  source, medium, campaign, content, term, fbclid

Section breakdown:
  1. Hero — [headline summary]
  2. Social Proof Bar — [badge count] trust signals
  3. Problem — [angle] approach
  4. Solution — product intro
  5. Benefits — [count] benefit cards
  6. Ingredients — [count] ingredient highlights
  7. Testimonials — [count] reviews
  8. Comparison — [type: table|split]
  9. FAQ — [count] questions
  10. Final CTA — [offer summary]
  + Sticky bar (appears at 40% scroll)

Next steps:
  - Review component code and customize copy in content.ts
  - Add hero image to public/images/
  - Register route in App.tsx
  - Verify Meta Pixel fires correctly (use Meta Pixel Helper extension)
  - Deploy to Netlify preview for QA
  - Set up A/B test: ?v=A vs ?v=B with equal traffic split
```

---

## Quality Gate

Before delivering the landing page:

- [ ] All sections present in correct order (hero → social proof → problem → solution → benefits → ingredients → testimonials → comparison → FAQ → final CTA)
- [ ] Mobile-first layout (starts mobile, enhances with `md:` / `lg:`)
- [ ] All headings UPPERCASE
- [ ] Sharp corners everywhere (rounded-none)
- [ ] Monochrome palette — no decorative color
- [ ] Brand color tokens used consistently
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Meta Pixel: PageView, ViewContent, AddToCart events wired
- [ ] UTM params captured from URL to sessionStorage
- [ ] fbclid captured for Meta attribution
- [ ] CTA buttons have minimum 44x44px touch targets
- [ ] Hero image loads with priority (not lazy)
- [ ] Below-fold images use `loading="lazy"`
- [ ] A/B variant props defined in types.ts
- [ ] All copy centralized in content.ts (not hardcoded in components)
- [ ] TypeScript strict mode — no `any` types
- [ ] Tailwind classes only — no inline styles
- [ ] No emojis, no exclamation marks in headlines
- [ ] Brand voice check: direct, confident, benefit-led copy
- [ ] Route configuration provided
- [ ] Netlify redirect rule provided

---

## Example Usage

**Basic landing page:**
```
/landing-page-builder spring launch campaign, simplicity angle, general ICP
```

**Specific ad match:**
```
/landing-page-builder anti-grease angle for gym guys, matching the "greasy feeling" ad creative with product jar on dark background
```

**A/B variant:**
```
/landing-page-builder spring-launch variant B — test "altitude credibility" angle vs variant A's "simplicity" angle
```

**With specific offer:**
```
/landing-page-builder founding batch launch, $38 price + free shipping, targeting skincare skeptics
```
