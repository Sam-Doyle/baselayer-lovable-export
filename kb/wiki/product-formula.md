---
title: Product Formula & Ingredients
domain: product
created: 2026-04-03
last_compiled: 2026-08-12
revision: 3
sources: [catalog.md, ingredient-database.md, compliance.md, FaceCream.tsx, IngredientDetail.tsx, INGREDIENT_SCIENCE_AND_COMPLIANCE_RESEARCH.md, PubMed 36917520, aad.org]
codePaths:
  - ~/BaseLayer/product/catalog.md
  - ~/BaseLayer/product/ingredient-database.md
  - ~/BaseLayer/product/compliance.md
  - ~/BaseLayer/product/formulation/INGREDIENT_SCIENCE_AND_COMPLIANCE_RESEARCH.md
  - ~/baselayer-lovable-export/src/pages/FaceCream.tsx
  - ~/baselayer-lovable-export/src/pages/IngredientDetail.tsx
  - ~/baselayer-lovable-export/src/pages/Ingredients.tsx
---

## Product Overview

**Product Name:** Performance Daily Face Cream
**Brand:** Base Layer
**SKU:** BL-PDFC-50ML
**Size:** 50 mL
**Founding Price:** $38 (limited first production run)
**Post-Launch Retail Price:** $48
**Category:** All-in-one daily moisturizer
**Tagline:** "One step. Zero shine."
**Classification:** Cosmetic (no SPF -- see Regulatory section)
**Target Demographic:** Men, all skin types including sensitive and oily
**Availability:** Pre-order. Shipping Spring 2026.

**Key Claims:**
- Absorbs in 15 seconds with no greasy residue
- Matte finish, all-day shine control
- Fragrance-free
- One bottle lasts 6-8 weeks
- Non-comedogenic

**Positioning:** Replaces a multi-step routine with a single product. Not positioned as a beauty brand -- positioned as a performance product for men who want results without complexity.

**Pricing Tiers (as of 2026-04-03, from FaceCream.tsx):**

| Quantity | Duration | Price | Per Bottle | Savings vs MSRP |
|----------|----------|-------|------------|-----------------|
| 1 bottle | 6 weeks  | $38   | $38        | $10             |
| 2 bottles | 12 weeks | $68  | $34        | $28             |
| 3 bottles | 18 weeks | $89  | $29.67     | $55             |

**Staleness flag (2026-08-12, subagent code audit during advertorial drafting):** This pricing table predates a Subscribe & Save tier at $35/delivery that has since shipped (see `kb/wiki/conversion-learnings.md` and recent pricing commits). This article has not yet been re-compiled against the current live pricing/subscription structure — treat the table above as historical (2026-04-03) rather than current, and verify against `src/config/product.ts` before using these numbers in new work.

**MSRP basis:** $48/bottle post-launch retail.
**Guarantee:** 30-day money-back, keep the bottle.
**Shipping:** Free on orders $50+.
**Subscriptions:** None at launch.

---

## What It Replaces

**Directive:** One product replaces four separate products in a typical men's skincare routine.

| Replaced Product | How Base Layer Covers It |
|------------------|------------------------|
| Serum | Niacinamide 5% + Copper Peptide GHK-Cu deliver active treatment |
| Moisturizer | Squalane + Hyaluronic Acid provide layered hydration |
| Eye Cream | Copper Peptide targets fine lines and firmness around the eye area |
| Barrier Cream | Panthenol + Centella Asiatica support and rebuild moisture barrier |

Source: catalog.md, ingredient-database.md (synergy section). Date: 2026-04-03.

---

## Full Ingredient List

The formula contains 6 key active ingredients. Full INCI list is not yet public (formulation proprietary). Known concentrations are listed where disclosed.

### Ingredients with Known Concentrations

| # | Ingredient | Concentration | Source |
|---|-----------|---------------|--------|
| 1 | Niacinamide (Vitamin B3) | 5% | catalog.md, FaceCream.tsx, ingredient-database.md |
| 2 | Copper Peptide GHK-Cu | 0.03% | FaceCream.tsx PRODUCT_SCHEMA, IngredientDetail.tsx meta |
| 3 | Panthenol (Vitamin B5) | 2% | FaceCream.tsx ingredients array, IngredientDetail.tsx meta |

### Ingredients with Proprietary Concentrations

| # | Ingredient | Effective Range (Literature) | Source |
|---|-----------|------------------------------|--------|
| 4 | Centella Asiatica | 0.1-1% effective range | ingredient-database.md |
| 5 | Squalane | 2-10% typical | ingredient-database.md |
| 6 | Hyaluronic Acid | 0.1-2% effective range | ingredient-database.md |

**Note on concentration discrepancy (2026-04-03):** FaceCream.tsx FAQ section states "Copper peptide at 1% stimulates collagen synthesis" but the PRODUCT_SCHEMA and IngredientDetail.tsx meta descriptions consistently state 0.03%. The 0.03% figure appears canonical; the FAQ text may be a copy error that should be reviewed.

---

## Key Active Ingredients -- Efficacy Data

### 1. Niacinamide (Vitamin B3) -- 5%

**Role in formula:** Oil control, pore refinement, tone evening, barrier strengthening
**Synergy group:** CORRECT (tone, texture, pores, oil control)

**Mechanism:** Precursor to NAD+/NADP+. Strengthens barrier via ceramide/keratin production. Reduces sebum at 2-5%. Inhibits melanosome transfer (35-68% at 5%). Inhibits NFkB inflammatory signaling.

**Clinical evidence:**
- Bissett et al. (2005): Improved fine lines, hyperpigmentation, elasticity. Published in Dermatologic Surgery.
- Hakozaki et al. (2002): 35-68% melanosome transfer inhibition at 5%. Published in British Journal of Dermatology.
- 12-week study: 21% fine line improvement, 14% tone clarity, 15% radiance.
- Draelos et al. (2006): 2% niacinamide significantly reduced sebum excretion over 4 weeks.

**Results timeline:**
- 1-2 weeks: Improved hydration, skin feels smoother
- 4-6 weeks: Oil control, pore refinement
- 8-12 weeks: Tone evening, fine line reduction
- 12+ weeks: Cumulative brightening, sustained barrier health

**Why 5%:** Most-studied clinical concentration. Effective without sensitization risk. Higher concentrations may cause irritation without proportional benefit.

Source: ingredient-database.md, INGREDIENT_SCIENCE_AND_COMPLIANCE_RESEARCH.md. Date: March 2026.

### 2. Copper Peptide GHK-Cu -- 0.03%

**Role in formula:** Anti-aging, collagen support, firmness
**Synergy group:** CORRECT (firmer-looking skin, visible aging signs)

**Mechanism:** Naturally occurring copper-binding tripeptide in human plasma that declines with age. Signals increased collagen, elastin, and glycosaminoglycan production. Antioxidant via copper ion binding. Promotes tissue remodeling.

**Clinical evidence:**
- Pickart et al.: Promotes skin remodeling and tightening.
- Studies show improved density, thickness, and firmness over 12 weeks.
- Effective range in literature: 0.01-1%.

**Results timeline:**
- 2-4 weeks: Smoother texture
- 4-8 weeks: Visible firmness
- 12+ weeks: Density and fine line improvements

Source: ingredient-database.md. Date: 2026-04-03.

### 3. Panthenol (Vitamin B5) -- 2%

**Role in formula:** Barrier support, soothing, post-shave recovery
**Synergy group:** HYDRATE (soothing humectant, barrier support)

**Mechanism:** Provitamin B5 converts to pantothenic acid in skin. Essential for coenzyme A synthesis. Attracts/holds moisture. Supports barrier integrity via lipid synthesis. Especially effective post-shave.

**Clinical evidence:**
- Decades of use. Proven improved hydration, reduced TEWL, accelerated barrier recovery.
- Effective for irritated/compromised skin.

**Results timeline:**
- Immediate: Soothing, reduced tightness
- 1-2 weeks: Hydration, less flaking
- 4+ weeks: Sustained barrier support

**Marketing angle (from FaceCream.tsx):** "Calms razor burn within 24 hours without leaving a film."

Source: ingredient-database.md, FaceCream.tsx. Date: 2026-04-03.

### 4. Centella Asiatica

**Role in formula:** Calms irritation, sensitive skin support, barrier rebuild
**Synergy group:** PROTECT (antioxidant and calming protection)

**Mechanism:** Medicinal herb rich in four triterpenoid saponins: asiaticoside, madecassoside, asiatic acid, madecassic acid. Asiaticoside stimulates type I collagen in fibroblasts. Madecassoside inhibits inflammatory cytokines.

**Clinical evidence:**
- Extensively studied in Asian dermatology.
- Improved wound healing markers, reduced redness, improved hydration.
- Effective for sensitive skin.

**Results timeline:**
- 1-2 weeks: Reduced redness
- 4 weeks: Improved texture
- 8+ weeks: Sustained calming benefits

Source: ingredient-database.md. Date: 2026-04-03.

### 5. Squalane

**Role in formula:** Lightweight hydration, barrier reinforcement, penetration enhancer
**Synergy group:** HYDRATE (barrier-sealing emollient) + PROTECT (antioxidant singlet oxygen quencher)

**Mechanism:** Fully saturated, plant-derived oil identical to ~13% of human sebum. Reinforces lipid bilayer barrier. Increases moisture up to 40%, reduces TEWL. Penetration enhancer for other actives. Non-comedogenic (comedogenicity rating: 0).

**Clinical evidence:**
- J. Cosmetic Dermatology: +40% moisture, significant TEWL reduction.
- Confirmed non-comedogenic and antioxidant (singlet oxygen quencher).

**Results timeline:**
- Immediate: Soft skin, no grease
- 1-2 weeks: Hydration improvement
- 2-4 weeks: Normalized oil production
- 4-8 weeks: Barrier improvement

**Marketing angle (from FaceCream.tsx):** "Your skin already produces squalane naturally, which is why it absorbs in seconds instead of sitting on top. No residue on your phone."

Source: ingredient-database.md, FaceCream.tsx. Date: 2026-04-03.

### 6. Hyaluronic Acid

**Role in formula:** Deep moisture retention, plumping, fine line reduction
**Synergy group:** HYDRATE (deep water-binding humectant)

**Mechanism:** Naturally occurring glycosaminoglycan holding 1,000x its weight in water. Binds water from environment and deeper layers to surface. Multi-weight formulations (high MW: surface film, low MW: deeper penetration) deliver best results.

**Clinical evidence:**
- RCT (n=40): Significant wrinkle improvement at 30 days with topical HA.
- RCT (n=65): Hydration + elasticity vs. placebo at 60 days.
- Pavicic et al. (2011): Multi-weight HA superior for wrinkle depth reduction.
- Bravo et al. (2022): Systematic review confirmed hydration, elasticity, and wrinkle appearance benefits.

**Results timeline:**
- Immediate: Plumped, hydrated appearance
- 1-2 weeks: Improved texture
- 2-4 weeks: Fine line reduction begins
- 8-12 weeks: Elasticity improvements

Source: ingredient-database.md. Date: 2026-04-03.

---

## Ingredient Synergy Framework

The 6 ingredients operate as an integrated system across three functional groups:

**PROTECT -- Daily shield against environmental stressors:**
- Squalane: Antioxidant singlet oxygen quencher
- Centella Asiatica: Antioxidant and calming protection

**CORRECT -- Address existing visible concerns:**
- Niacinamide 5%: Tone, texture, pores, oil control
- Copper Peptide GHK-Cu: Firmer-looking skin, visible aging signs

**HYDRATE -- Moisture that lasts without heaviness:**
- Hyaluronic Acid: Deep water-binding humectant
- Squalane: Barrier-sealing emollient, penetration enhancer for other actives
- Panthenol: Soothing humectant, barrier support

Source: ingredient-database.md (synergy section). Date: 2026-04-03.

---

## Results Timeline (Composite)

| Timeframe | Expected User Experience |
|-----------|------------------------|
| Immediate | Hydration, skin feels smoother, no greasy residue, 15-second absorption |
| 1-2 weeks | Oil control, improved skin texture, reduced post-shave irritation |
| 4-8 weeks | Visible improvements in tone, texture, fine lines, firmness |
| 12+ weeks | Cumulative brightening, sustained barrier health, texture improvement |

Source: catalog.md. Date: 2026-04-03.

---

## Formulation Notes

**Texture:** Lightweight gel-cream. Absorbs in 15 seconds.
**Finish:** Matte. All-day shine control. No greasy residue.
**Fragrance:** Fragrance-free.
**Application:** Morning and night. Clean face. One pump.
**Comedogenicity:** Non-comedogenic (squalane comedogenicity rating: 0; all ingredients selected for non-comedogenic profile).
**Post-Shave Safe:** Yes. Panthenol calms razor burn and micro-irritation within 24 hours.
**SPF:** Not included. Recommend separate SPF product after application.

**Trust badges displayed on product page (FaceCream.tsx):**
- Breckenridge-Formulated
- Lab Tested
- Cruelty-Free
- Clean Ingredients

Source: FaceCream.tsx, catalog.md, compliance.md. Date: 2026-04-03.

---

## Fragrance-Free Claim Substantiation

**Reusable citation for all fragrance-free claims (2026-08-12, PubMed 36917520 — NACDG 2019-2020 patch test results, Dermatitis 2023 — + aad.org fragrance-free guidance page, both verified via live fetch):** NACDG 2019-2020 patch-test data shows fragrance mix I positive in 12.8% of patients tested, the third most common allergen identified. The American Academy of Dermatology explicitly advises "fragrance-free" (not "unscented") language for reactive skin. This citation is now used in the Caldera Lab comparison article's scienceNote block (see `kb/wiki/competitor-landscape.md`) and should be the default source for any fragrance-free claim substantiation going forward.

---

## Regulatory & Compliance Notes

### FDA Classification

**Classification:** Cosmetic (NOT a drug)
**Directive:** The product does NOT contain SPF. It is classified as a cosmetic only, not as an OTC drug.

Source: compliance.md ("Our product does NOT contain SPF"). Date: 2026-04-03.

**Important discrepancy (2026-04-03):** The early formulation research document (`INGREDIENT_SCIENCE_AND_COMPLIANCE_RESEARCH.md`, dated March 2026) lists SPF 30, Vitamin C, and Green Tea Extract as active ingredients. These were NOT carried forward into the final product. The canonical ingredient list (catalog.md, ingredient-database.md, FaceCream.tsx, compliance.md) contains 6 ingredients: Niacinamide, Copper Peptide GHK-Cu, Panthenol, Centella Asiatica, Squalane, and Hyaluronic Acid. The formulation research doc should be treated as superseded for ingredient composition but remains valid for regulatory guidance and safe-claim language patterns.

### Marketing Claim Rules

**Golden rule:** Appearance-based claims are safe. Structure/function claims cross into drug territory.

**Banned words (never use in any content):** treats, cures, heals, repairs, regenerates, eliminates, restores, reverses, rebuilds, prevents, stimulates, increases (collagen/elastin), penetrates (dermis/deep layers), anti-inflammatory, kills bacteria, detoxifies, clinically proven (unless finished product tested), dermatologist recommended (unless formally documented)

**Safe qualifier words:** helps, appearance of, look of, visible, -looking, feels, promotes, supports, designed to, with continued use

**Default claim pattern:** "Helps [verb] the appearance of [noun]"

**Claim strength hierarchy (safest to riskiest):**
1. "Helps reduce the appearance of fine lines" (hedged + appearance-based)
2. "Reduces the appearance of fine lines" (appearance-based, no hedge)
3. "Helps reduce fine lines" (hedged but no "appearance" qualifier)
4. "Reduces fine lines" (no hedge, no "appearance" -- implies structural change)
5. "Eliminates fine lines" (DRUG CLAIM -- never use)

**Recommendation:** Default to levels 1 or 2 for all marketing copy.

### "Clinically Proven" Guidance

**Directive:** Do NOT use "clinically proven" unless the finished product (not just ingredients) has been tested in a clinical trial.
**Safe alternative:** "Formulated with clinically studied ingredients" or "Contains ingredients backed by clinical research."

### Before/After Photo Rules

- Consistent lighting, angles, no filters between before/after
- "Individual results may vary" prominently near all before/after content
- No misleading edits or atypical outlier results without disclosure

### MoCRA Compliance

**Modernization of Cosmetics Regulation Act (2022):**
- Facility registration and product listing: Required since July 1, 2024
- Contact information on labels: Required since December 29, 2024
- Adverse event reporting: Serious events must be reported to FDA within 15 business days
- Safety substantiation: Must document and keep evidence of product safety

Source: compliance.md, INGREDIENT_SCIENCE_AND_COMPLIANCE_RESEARCH.md. Date: 2026-04-03.

### Per-Ingredient Claim Restrictions

| Ingredient | NEVER Say | Safe Alternative |
|-----------|-----------|-----------------|
| Niacinamide | "Treats acne," "reduces inflammation," "stimulates collagen," "repairs skin barrier" | "Clinically studied form of Vitamin B3," "Helps visibly improve skin tone and texture" |
| Copper Peptide | "Regenerates cells," "rebuilds collagen," "reverses aging," "repairs at cellular level" | "For firmer-looking skin," "Helps diminish the visible signs of aging" |
| Panthenol | "Heals skin," "repairs damaged tissue," "treats eczema or dermatitis" | "Helps soothe and condition skin," "Supports skin's natural moisture barrier" |
| Centella Asiatica | "Anti-inflammatory," "treats rosacea," "heals irritation," "repairs damaged skin" | "Calms and soothes even sensitive skin," "Helps reduce the visible appearance of redness" |
| Squalane | "Repairs skin barrier," "penetrates deep into skin," "cures dryness" | "Biomimetic moisturizer that mirrors your skin's natural oils," "Non-comedogenic" |
| Hyaluronic Acid | "Eliminates wrinkles," "restores youthful skin," "penetrates the dermis" | "Holds up to 1,000x its weight in water," "Helps plump and smooth the appearance of fine lines" |

Source: ingredient-database.md. Date: 2026-04-03.

---

## Skin Concerns Addressed

The product page (FaceCream.tsx) links to 7 skin concern pages:

| Concern | URL Slug |
|---------|----------|
| Oily Skin | oily-skin-men |
| Acne-Prone Skin | acne-prone-skin-men |
| Post-Shave Irritation | post-shave-irritation |
| Dry & Dehydrated Skin | dry-dehydrated-skin-men |
| Aging & Wrinkles | aging-wrinkles-men |
| Dark Circles | dark-circles-men |
| Sensitive Skin | sensitive-skin-men |

Source: FaceCream.tsx concerns array. Date: 2026-04-03.


---

## Live Banned-Claim Violations Found by Grep (2026-08-12, compliance sweep across live advertorial + PDP components, confidence: high)

Two violations were live in production, **both missed by earlier reviews because the sweep was done by eye rather than by grep.**

1. `src/pages/advertorials/PeptideStack.tsx:248` — **"Rebuilds the moisture barrier."** "Rebuilds" is banned in this article's claim-restriction section.
2. `src/components/IngredientsShowcase.tsx:28` — **"Signals fibroblasts to produce collagen and elastin. Shown to increase collagen synthesis by up to 70% in clinical studies."** This is a drug-structure/function claim for a cosmetic, plus an unattributed figure.

**Process lesson (the durable part):** run the banned-verb check as a build-adjacent script rather than a manual read. A scripted sweep for claim verbs, `increases` + collagen/elastin, brand banned words, AI vocabulary, `!`/`?` in headings, and Meta second-person attributes catches these in seconds and is worth wiring into CI. Manual review has now demonstrably missed them twice.

---

## See Also

- `~/BaseLayer/product/catalog.md` -- canonical product catalog
- `~/BaseLayer/product/ingredient-database.md` -- full ingredient science and synergy framework
- `~/BaseLayer/product/compliance.md` -- marketing compliance quick-reference
- `~/BaseLayer/product/formulation/INGREDIENT_SCIENCE_AND_COMPLIANCE_RESEARCH.md` -- early formulation research (partially superseded; regulatory guidance still valid)
- `~/baselayer-lovable-export/src/pages/FaceCream.tsx` -- live product page component
