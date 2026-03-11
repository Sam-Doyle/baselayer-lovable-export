# Batch Asset Generator

**Generates all derivative image sizes for a Base Layer Skin campaign from a single hero image or prompt in one pass.**

Takes one hero image/prompt plus brand guidelines, generates ALL platform-ready sizes, maintains visual consistency across derivatives, and outputs to a dated campaign folder with manifest. Uses nano-banana-pro for image generation.

## When NOT to Use
- For full ad creative production with copy and strategy (use `/ad-creative-pipeline`)
- For social content with captions and scheduling (use `/social-content-batch`)
- For generating a single image (use `/nano-banana-pro` directly)
- For visual direction and creative strategy (use `/creative-strategist`)
- For email header images as part of a template (use `/email-template-builder`)

---

## Inputs

**Required:** One of the following:
- `$ARGUMENTS` — a prompt describing the hero image to generate, OR a path to an existing hero image file

**Optional flags:**
- `--text-overlay "HEADLINE TEXT"` — generate text overlay variants
- `--cta "CTA TEXT"` — add CTA button overlay to text variants
- `--name "campaign-name"` — override auto-derived campaign folder name

**Auto-loaded:**
- Brand guidelines from `brand/BASE_LAYER_BRAND_GUIDELINES.md`
- Image generation via `/Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py`

---

## ICP Context

Assets serve:
- **Males 20-40** (skew 25-35 for Meta)
- Primary traffic: Instagram/Facebook ads
- 85%+ mobile viewing
- High contrast for outdoor/mobile screen visibility

---

## Brand Visual Constraints — Non-Negotiable

Read and internalize: `/Users/samdoyle/baselayer-lovable-export/brand/BASE_LAYER_BRAND_GUIDELINES.md`

Applied to every generated image:

1. **Monochrome palette.** Black/white/gray dominant. No decorative color.
2. **High contrast.** Near-black backgrounds, near-white highlights. No muddy mid-tones.
3. **Dramatic lighting.** Side lighting, rim lighting, studio quality. No flat lighting.
4. **Angular composition.** Sharp edges, clean lines. No soft/rounded aesthetics.
5. **Minimal.** Single subject focus. No clutter, no busy backgrounds.
6. **Masculine-neutral.** Confident, not aggressive. No "bro" energy, no metrosexual styling.
7. **Colorado authentic.** If outdoor/lifestyle: mountains, altitude, natural environments. Not tropical, not urban luxury.
8. **No stock photo aesthetic.** Real, editorial, candid feel. Not posed catalog shots.
9. **No emojis.** Ever. On any asset.
10. **No rounded corners** on any overlay elements. Sharp corners only.

---

## Asset Matrix

All sizes generated from a single hero source in one pass:

| Asset | Dimensions | Aspect Ratio | Use Case |
|-------|-----------|--------------|----------|
| Meta Feed | 1080x1080 | 1:1 | Instagram/Facebook feed posts |
| Meta Portrait | 1080x1350 | 4:5 | Instagram portrait feed (highest engagement) |
| Meta Story/Reel | 1080x1920 | 9:16 | Instagram Stories, Reels, Facebook Stories |
| Facebook Link Preview | 1200x628 | ~1.91:1 | Facebook link share cards |
| Email Header | 600x200 | 3:1 | Klaviyo/Mailchimp email hero banner |
| Blog Hero / OG Image | 1200x630 | ~1.91:1 | Blog featured image + Open Graph social share |

---

## Workflow

### Step 1: Preflight

```bash
command -v uv || echo "MISSING: install uv first"
test -n "$GEMINI_API_KEY" || echo "MISSING: set GEMINI_API_KEY"
```

Determine mode from `$ARGUMENTS`:
- If it's a file path that exists on disk: **edit mode** (adapt existing image)
- If it's a text prompt: **generate mode** (create from scratch)

### Step 2: Create Campaign Folder

```bash
CAMPAIGN_DATE=$(date +%Y-%m-%d)
# Derive campaign name from the prompt (lowercase, hyphens, 2-4 words max)
CAMPAIGN_NAME="<derived-from-prompt>"
CAMPAIGN_DIR="assets/${CAMPAIGN_DATE}-${CAMPAIGN_NAME}"
mkdir -p "$CAMPAIGN_DIR"
```

### Step 3: Generate Hero Image (Highest Resolution First)

If in generate mode, create the hero at 4K as the source for all derivatives:

```bash
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<hero-prompt>" \
  --filename "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 4K
```

If in edit mode, the provided image IS the hero source.

**Hero Prompt Construction (for generate mode):**

Apply brand visual guidelines to the user's prompt:
- Style: Dramatic, high-contrast, editorial. Dark backgrounds or natural environments.
- Lighting: Dramatic side/rim lighting, studio quality with warm accent.
- Color: Monochrome palette — black, white, gray tones. No decorative color.
- Product: Clean, minimal composition. Single product focus if product shot.
- Lifestyle: Active, outdoor Colorado settings if lifestyle shot. Men 25-40.
- Avoid: Rounded/soft aesthetics, stock photo look, cluttered compositions, text overlays (unless requested), emojis, bright colors.

### Step 4: Generate All Derivative Sizes

For each size in the asset matrix, generate using nano-banana-pro with the hero as input.

**Adaptation prompt template per size:**

```
"Adapt this image to [WIDTH]x[HEIGHT] ([RATIO]) for [USE CASE].
Maintain the exact same subject, lighting, mood, and brand aesthetic.
Recompose for the new aspect ratio — [SPECIFIC INSTRUCTIONS PER SIZE].
Keep monochrome/dark brand palette. No text unless specified."
```

**Size-specific adaptation instructions:**

| Asset | Adaptation Notes |
|-------|-----------------|
| **Meta Feed (1:1)** | Center-crop the subject. Ensure key visual fills the square frame. |
| **Meta Portrait (4:5)** | Slight vertical crop from hero. Subject remains prominent. Best performing Instagram format. |
| **Meta Story (9:16)** | Vertical composition. Subject in upper-center third. Leave bottom 20% clear for CTA overlay space. Avoid top 14% (profile pic area). |
| **FB Link Preview (1.91:1)** | Wide horizontal crop. Subject left-of-center, negative space right for potential text. |
| **Email Header (3:1)** | Ultra-wide banner crop. Simplify composition — hero subject only, clean background. |
| **Blog Hero / OG (1.91:1)** | Same ratio as FB Link Preview. Subject centered, editorial feel. Must be recognizable at social share thumbnail size. |

**Generation loop — run sequentially to maintain consistency:**

```bash
# Meta Feed 1:1
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<adaptation-prompt-for-1080x1080>" \
  --filename "${CAMPAIGN_DIR}/meta-feed-1080x1080.png" \
  --input-image "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 1K

# Meta Portrait 4:5
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<adaptation-prompt-for-1080x1350>" \
  --filename "${CAMPAIGN_DIR}/meta-portrait-1080x1350.png" \
  --input-image "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 1K

# Meta Story 9:16
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<adaptation-prompt-for-1080x1920>" \
  --filename "${CAMPAIGN_DIR}/meta-story-1080x1920.png" \
  --input-image "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 2K

# Facebook Link Preview
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<adaptation-prompt-for-1200x628>" \
  --filename "${CAMPAIGN_DIR}/fb-link-preview-1200x628.png" \
  --input-image "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 1K

# Email Header
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<adaptation-prompt-for-600x200>" \
  --filename "${CAMPAIGN_DIR}/email-header-600x200.png" \
  --input-image "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 1K

# Blog Hero / OG Image
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py \
  --prompt "<adaptation-prompt-for-1200x630>" \
  --filename "${CAMPAIGN_DIR}/blog-og-1200x630.png" \
  --input-image "${CAMPAIGN_DIR}/hero-source-4k.png" \
  --resolution 1K
```

### Step 5: Text Overlay Variants (Optional)

If the user requests text overlays via `--text-overlay` or mentions headline/CTA text:

**Sizes that get text overlay variants:** Meta Feed, Meta Story, Meta Portrait, Email Header

**Overlay types:**
- **Headline only:** Brand headline in bold uppercase white sans-serif font. White text on dark overlay gradient.
- **Headline + CTA:** Headline plus CTA button lockup (e.g., "GET EARLY ACCESS" or "RESERVE YOURS -- $38").
- **Clean (no text):** Already generated in Step 4.

For each overlay variant, use the clean version as `--input-image` and prompt:

```
"Add text overlay to this image. ONLY add text — do not change the underlying image at all.
Text: '<HEADLINE>' in bold uppercase white sans-serif font.
Position: [center/bottom-center/top-left per size].
Add a subtle dark gradient behind the text for legibility.
[If CTA variant: Add a white rectangular button below the headline with dark text reading '<CTA TEXT>'.]
Sharp corners on all elements. No rounded corners."
```

**Text overlay compliance:** Meta's rule is text should cover <20% of the image area. Keep overlays to headline only (3-5 words max). Use the ad platform's headline/description fields for copy — not baked-in text.

**Naming convention for text variants:**
- `meta-feed-1080x1080-headline.png`
- `meta-feed-1080x1080-headline-cta.png`
- `meta-story-1080x1920-headline.png`
- `meta-story-1080x1920-headline-cta.png`

### Step 6: Brand Treatment Verification

After generating all assets, verify each one applies Base Layer brand treatment:
- Monochrome palette (black/white/gray dominant)
- High contrast aesthetic
- No decorative color (functional color only: amber for ratings, green for success, red for friction)
- Dramatic lighting
- Clean, angular composition (no soft/rounded aesthetics)

If any asset drifts from brand guidelines, regenerate with a more explicit brand-constraining prompt.

### Step 7: Generate Manifest

Create `${CAMPAIGN_DIR}/manifest.json`:

```json
{
  "campaign": "<campaign-name>",
  "date": "<YYYY-MM-DD>",
  "hero_prompt": "<original prompt or source image path>",
  "brand": "Base Layer Skin",
  "assets": [
    {
      "filename": "hero-source-4k.png",
      "width": 4096,
      "height": "auto",
      "aspect_ratio": "source",
      "use_case": "Hero source image (master)",
      "resolution": "4K",
      "has_text_overlay": false
    },
    {
      "filename": "meta-feed-1080x1080.png",
      "width": 1080,
      "height": 1080,
      "aspect_ratio": "1:1",
      "use_case": "Instagram/Facebook feed post",
      "resolution": "1K",
      "has_text_overlay": false
    },
    {
      "filename": "meta-portrait-1080x1350.png",
      "width": 1080,
      "height": 1350,
      "aspect_ratio": "4:5",
      "use_case": "Instagram portrait feed post",
      "resolution": "1K",
      "has_text_overlay": false
    },
    {
      "filename": "meta-story-1080x1920.png",
      "width": 1080,
      "height": 1920,
      "aspect_ratio": "9:16",
      "use_case": "Instagram Stories, Reels, Facebook Stories",
      "resolution": "2K",
      "has_text_overlay": false
    },
    {
      "filename": "fb-link-preview-1200x628.png",
      "width": 1200,
      "height": 628,
      "aspect_ratio": "1.91:1",
      "use_case": "Facebook link share card",
      "resolution": "1K",
      "has_text_overlay": false
    },
    {
      "filename": "email-header-600x200.png",
      "width": 600,
      "height": 200,
      "aspect_ratio": "3:1",
      "use_case": "Email campaign hero banner",
      "resolution": "1K",
      "has_text_overlay": false
    },
    {
      "filename": "blog-og-1200x630.png",
      "width": 1200,
      "height": 630,
      "aspect_ratio": "1.91:1",
      "use_case": "Blog featured image + OG social share",
      "resolution": "1K",
      "has_text_overlay": false
    }
  ],
  "text_overlay_variants": []
}
```

Populate `text_overlay_variants` array with entries for any headline/CTA variants generated in Step 5.

### Step 8: Summary Report

Print a summary table to the user:

```
CAMPAIGN ASSET BATCH COMPLETE
==============================

Campaign:  <name>
Folder:    assets/<YYYY-MM-DD-campaign-name>/
Assets:    <count> generated

| Asset | File | Dimensions | Status |
|-------|------|-----------|--------|
| Hero Source | hero-source-4k.png | 4096x auto | Done |
| Meta Feed | meta-feed-1080x1080.png | 1080x1080 | Done |
| Meta Portrait | meta-portrait-1080x1350.png | 1080x1350 | Done |
| Meta Story | meta-story-1080x1920.png | 1080x1920 | Done |
| FB Link Preview | fb-link-preview-1200x628.png | 1200x628 | Done |
| Email Header | email-header-600x200.png | 600x200 | Done |
| Blog/OG | blog-og-1200x630.png | 1200x630 | Done |

Manifest: assets/<YYYY-MM-DD-campaign-name>/manifest.json

Next steps:
  - Review each asset for brand consistency
  - Request text overlay variants if needed: --text-overlay "ONE STEP. ZERO SHINE."
  - Upload to Meta Ads Manager, Klaviyo, CMS as needed
```

---

## Error Handling

- If nano-banana-pro fails on a specific size, log the error and continue to the next size. Report failures in the summary.
- If the hero generation fails, stop immediately — all derivatives depend on it.
- If GEMINI_API_KEY is missing, stop with clear instructions to set it.
- If an adaptation produces an off-brand result (too colorful, wrong mood), retry once with a more constrained prompt before moving on.

---

## Example Usage

**From prompt:**
```
/asset-batch Base Layer Performance Daily Face Cream jar on dark slate surface, dramatic rim lighting, product hero shot
```

**From existing image:**
```
/asset-batch /path/to/existing-hero-photo.png
```

**With text overlays:**
```
/asset-batch Base Layer product on mountain rock at golden hour --text-overlay "ONE STEP. ZERO SHINE." --cta "GET EARLY ACCESS"
```

**With custom campaign name:**
```
/asset-batch dramatic product close-up on black marble --name "march-launch-hero"
```
