# Email Template Builder

**Generates Klaviyo/Mailchimp-compatible responsive HTML email templates for Base Layer Skin.**

Takes a campaign type and outputs production-ready HTML with inline CSS, subject line variants, preview text variants, and dark mode support — all in Base Layer brand voice for men 20-40.

## References — Auto-Load
Read and internalize before executing:
- `brand/references/visual/identity.md`
- `brand/references/product/catalog.md`
- `brand/references/channels/email-specs.md`

## When NOT to Use
- For email text copy only, no HTML needed (use `/email-copywriter`)
- For designing email automation flows and sequences (use `/email-strategist`)
- For analyzing existing email performance (use `/email-analyzer`)
- For building web landing pages (use `/landing-page-builder`)
- For ad creative production (use `/ad-creative-pipeline`)

---

## Inputs

The user provides a campaign type and optional customization:

```
CAMPAIGN TYPE:   welcome | promo | educational | product-launch | abandoned-cart | win-back | post-purchase
SUBJECT:         (optional) — specific topic or angle for the email
PRODUCT:         Performance Daily Face Cream (default — only SKU)
OFFER:           (optional) — discount, free shipping, gift, etc.
CTA URL:         https://baselayerskin.co (default)
VARIANT COUNT:   1-3 (default: 1) — number of template layout variants
```

If the user gives a loose brief ("make a welcome email"), default to:
- Campaign type: welcome
- Subject: General welcome / founding batch
- Product: Performance Daily Face Cream
- Offer: None (founding price $38)
- Variant count: 1

---

## ICP — Hardcoded

Every email targets:
- **Males 20-40** (skew 25-35)
- Active, time-conscious, performance-oriented
- Skeptical of traditional skincare marketing
- 0-1 products in current routine
- Responds to: efficiency, proof, directness
- Reading on mobile (70%+ of opens)
- Short attention span — scan first, read second

---

## Brand Voice — Non-Negotiable

Key rules for email:
- **Direct, confident, conversational.** Like a sharp friend who knows skincare but doesn't make it weird.
- **Short. Punchy.** No walls of text. Every paragraph earns its place.
- **No flowery/feminine language.** No "curated", "elevated", "artisanal", "miracle".
- **No exclamation marks in headlines.** No emojis anywhere.
- **Lead with benefits, not features.** Use real numbers ("15 seconds", "50 testers", "$38").
- **Tone: masculine but not aggressive.** Confident, not bro-ey.
- **CTA language:** Direct imperatives. "GET EARLY ACCESS", "RESERVE YOURS", "LOCK IN THE FOUNDING PRICE".

---

## Email Technical Constraints

These are non-negotiable for email HTML:

### Layout
- **Max width: 600px** — hardcoded on the wrapper table
- **Single column only** — no multi-column grids (breaks on mobile clients)
- **Table-based layout** — `<table>`, `<tr>`, `<td>` for structure. No `<div>` for layout.
- **Nested tables** for content sections within the 600px wrapper

### CSS
- **All CSS must be inline** — no `<style>` blocks in `<head>` (Gmail strips them)
- **Exception:** Dark mode media queries go in a `<style>` block (clients that strip it don't support dark mode anyway)
- **No shorthand properties** — use `padding-top`, `padding-right`, etc. Not `padding: 10px 20px`.
- **System fonts only** — `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;`
- **No web fonts** — DM Sans and Inter won't load in most email clients. Use system stack.
- **No CSS Grid, no Flexbox** — tables only
- **No `background-image`** on anything except VML fallback for Outlook

### Images
- **All images must have `alt` text, `width`, `height`, and `border="0"`**
- **Images are supplementary, not structural** — email must make sense with images blocked
- **Host images on CDN** — use placeholder URLs like `https://cdn.baselayerskin.co/email/<filename>`
- **Retina: serve 2x images** at display dimensions (e.g., 1200px wide image displayed at 600px)

### CTAs
- **Buttons are table-based, not image-based** — bulletproof buttons using `<td>` with background color
- **Button pattern:**
  ```html
  <table border="0" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="border-radius: 0; background-color: #FFFFFF;">
        <a href="<URL>" target="_blank" style="display: inline-block; padding: 16px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #0A0A0A; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em;">
          CTA TEXT HERE
        </a>
      </td>
    </tr>
  </table>
  ```
- **Sharp corners (border-radius: 0)** — matches brand guidelines
- **White button on dark background** (primary) or **dark button on light background** (secondary)

### Dark Mode
- Add dark mode overrides in `<style>` block:
  ```css
  @media (prefers-color-scheme: dark) {
    .email-body { background-color: #0A0A0A !important; }
    .email-content { background-color: #121212 !important; }
    .text-primary { color: #EBEBEB !important; }
    .text-secondary { color: #808080 !important; }
    .button-primary { background-color: #FFFFFF !important; }
    .button-primary a { color: #0A0A0A !important; }
  }
  ```
- Use `data-ogsc` classes for Outlook dark mode compatibility
- Test that both light and dark versions are readable

---

## Base Template Structure

Every email follows this skeleton:

```html
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>{{email_subject}}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Dark mode styles */
    @media (prefers-color-scheme: dark) { /* ... */ }
    /* Reset for email clients */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    /* Mobile responsive */
    @media only screen and (max-width: 620px) {
      .email-wrapper { width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- PREHEADER (hidden preview text) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    {{preview_text}}
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- WRAPPER -->
  <table class="email-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0A0A0A;">
    <tr>
      <td align="center" style="padding: 20px 0;">

        <!-- CONTENT TABLE (600px max) -->
        <table class="email-content" role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #121212; max-width: 600px; width: 100%;">

          <!-- HEADER: Logo -->
          <tr>
            <td align="center" style="padding: 30px 40px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #FFFFFF; padding-top: 12px; padding-bottom: 12px; border-bottom: 1px solid #FFFFFF;">
                    <a href="https://baselayerskin.co" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; color: #FFFFFF; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em;">
                      BASE LAYER
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY CONTENT (varies by campaign type) -->
          {{email_body}}

          <!-- FOOTER -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #292929;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <a href="https://www.instagram.com/baselayerskin/" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: #808080; text-decoration: none; text-transform: uppercase; letter-spacing: 0.2em;">
                      INSTAGRAM
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #808080; line-height: 1.6;">
                    Base Layer Skin &middot; Breckenridge, CO<br>
                    <a href="{{unsubscribe_url}}" style="color: #808080; text-decoration: underline;">Unsubscribe</a> &middot;
                    <a href="{{preferences_url}}" style="color: #808080; text-decoration: underline;">Email Preferences</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Campaign Type Templates

### Welcome Email

**Purpose:** First touchpoint after email capture. Set expectations. Deliver the brand story.

**Structure:**
1. Hero image — product on dark background
2. Headline — "YOU'RE IN."
3. Body — 2-3 short paragraphs: what Base Layer is, why it exists, what to expect
4. Product highlight — key claims (absorbs in 15 seconds, replaces your routine)
5. CTA — "EXPLORE THE FORMULA" or "LOCK IN THE FOUNDING PRICE"
6. Social proof — "5.0 from 50 early testers"

**Tone:** Confident welcome. No "thanks for signing up" fluff. Get to the point.

### Promo Email

**Purpose:** Drive a purchase with a specific offer or urgency trigger.

**Structure:**
1. Headline — Offer-first ("$10 OFF YOUR FIRST ORDER" or "FOUNDING PRICE ENDS FRIDAY")
2. Product image
3. Body — 1-2 sentences on the offer. Why now.
4. CTA — "CLAIM YOUR [OFFER]"
5. Urgency element — countdown language, "ends [date]", or quantity remaining
6. Fine print — offer terms, one line

**Tone:** Direct urgency. No hype. State the offer, state the deadline.

### Educational Email

**Purpose:** Build authority. Teach something useful about skincare for men.

**Structure:**
1. Headline — Topic-driven ("WHY YOUR SKIN LOOKS WORSE IN WINTER")
2. Body — 3-4 short paragraphs of actionable content. Real science, no fluff.
3. Base Layer tie-in — 1 paragraph connecting the topic to the product (not a hard sell)
4. CTA — "READ MORE" (to blog) or soft product CTA

**Tone:** Informative, credible, slightly casual. Think men's health article, not textbook.

### Product Launch Email

**Purpose:** Announce new product availability or batch drop.

**Structure:**
1. Hero image — dramatic product shot
2. Headline — "IT'S HERE." or product name in large type
3. Body — What it is, what it does, why it matters. 3-4 bullet points.
4. Key claims — icon + text rows (absorbs in 15 seconds, matte finish, etc.)
5. Price — clearly stated
6. CTA — "ORDER NOW" or "GET EARLY ACCESS"
7. Guarantee — "30-day money-back. Keep the bottle."

**Tone:** Controlled excitement. Confident launch, not desperate sell.

### Abandoned Cart Email

**Purpose:** Recover the sale. Remove friction.

**Structure:**
1. Headline — "STILL THINKING IT OVER?" or "YOU LEFT SOMETHING BEHIND"
2. Product image + name + price
3. Body — 1-2 sentences. Address the hesitation, don't guilt.
4. Social proof — one review quote
5. CTA — "COMPLETE YOUR ORDER"
6. Guarantee reminder — "30-day money-back guarantee"

**Tone:** No pressure. Helpful reminder. Address objections subtly.

### Win-Back Email

**Purpose:** Re-engage lapsed subscribers or customers.

**Structure:**
1. Headline — "BEEN A WHILE." or "WE SAVED YOUR SPOT"
2. Body — 1-2 sentences. What's new or what they're missing.
3. Offer (if applicable) — incentive to return
4. CTA — "COME BACK" or offer-specific
5. Unsubscribe nudge — "Not interested anymore? No hard feelings." (reduces spam complaints)

**Tone:** Casual, zero guilt. Respect their time.

### Post-Purchase Email

**Purpose:** Confirm value. Reduce buyer's remorse. Set up for review/referral.

**Structure:**
1. Headline — "GOOD CALL." or "YOUR ORDER IS CONFIRMED"
2. Order summary — product, price, shipping estimate
3. What to expect — results timeline (immediate hydration, 1-2 weeks oil control, 4-8 weeks anti-aging)
4. Usage tips — "Apply to clean, dry skin. One pump. 15 seconds. Done."
5. CTA — "TRACK YOUR ORDER" (email 1) or "LEAVE A REVIEW" (email 2)

**Tone:** Reassuring, helpful. Reinforce they made the right choice.

---

## Subject Lines and Preview Text

For every template, generate:

### 5 Subject Line Variants

Map each to a different psychological trigger:

| # | Trigger | Pattern | Example |
|---|---------|---------|---------|
| 1 | Curiosity | Open loop, unanswered question | "The one thing every routine gets wrong" |
| 2 | Benefit | Direct value statement | "15 seconds. Your whole routine. Done." |
| 3 | Social proof | Numbers and validation | "50 guys tested this. Here's the verdict." |
| 4 | Urgency | Time or scarcity pressure | "Founding batch closes Friday" |
| 5 | Contrarian | Challenge assumptions | "Stop buying skincare products" |

**Subject line rules:**
- Max 50 characters (mobile truncation at ~40 chars on iPhone)
- No ALL CAPS in subject lines (triggers spam filters)
- No emojis
- No exclamation marks
- Lowercase preferred, sentence case acceptable
- Personalization token optional: `{{first_name}}` at start or end only

### 3 Preview Text Variants

Preview text = the gray text after the subject line in inbox view (40-90 characters).

| # | Strategy | Example |
|---|----------|---------|
| 1 | Extend the subject | Subject: "15 seconds" → Preview: "That's all it takes to replace your entire routine." |
| 2 | Create contrast | Subject: "Stop buying products" → Preview: "One is all you need." |
| 3 | Add proof point | Subject: "The founding batch" → Preview: "50 early testers. Zero refund requests." |

**Preview text rules:**
- 40-90 characters (sweet spot for mobile)
- Must complement, not repeat, the subject line
- Include padding characters (`&zwnj;&nbsp;` x20) after the preview text to prevent email body text from leaking into preview

---

## Output

### File Structure

```
email-templates/
  <campaign-type>/
    <campaign-type>-v1.html
    <campaign-type>-v2.html  (if variant count > 1)
    <campaign-type>-v3.html  (if variant count > 1)
    <campaign-type>-copy.md
```

### Copy Document

`<campaign-type>-copy.md` contains all subject lines and preview text variants:

```markdown
# <Campaign Type> Email — Copy Variants
Generated: <date>

## Subject Lines
1. [Curiosity] "<subject>"
2. [Benefit] "<subject>"
3. [Social Proof] "<subject>"
4. [Urgency] "<subject>"
5. [Contrarian] "<subject>"

## Preview Text
1. "<preview text>"
2. "<preview text>"
3. "<preview text>"

## Recommended A/B Test
- Test: Subject line 1 vs. Subject line 2
- Split: 50/50
- Winner criteria: Open rate after 4 hours
- Send winner to remaining list
```

---

## Klaviyo/Mailchimp Compatibility

### Klaviyo Template Variables
Replace dynamic content with Klaviyo tags:
- `{{ first_name|default:"there" }}` — personalization
- `{{ organization.url }}/manage-preferences/{{ email }}` — preference center
- `{% unsubscribe %}` — unsubscribe link
- `{{ event.extra.line_items.0.product.title }}` — abandoned cart product
- `{{ event.extra.line_items.0.product.image_url }}` — cart product image

### Mailchimp Merge Tags
If Mailchimp target:
- `*|FNAME|*` — first name
- `*|UNSUB|*` — unsubscribe
- `*|UPDATE_PROFILE|*` — preferences
- `*|ARCHIVE|*` — view in browser

### ESP Selection
Default to Klaviyo syntax (DTC standard). If user specifies Mailchimp, swap tags accordingly.

---

## Quality Gate

Before delivering email templates:

- [ ] HTML validates (no unclosed tags, no malformed tables)
- [ ] Max width 600px on wrapper table
- [ ] All CSS is inline (except dark mode media queries)
- [ ] System fonts only — no web font references
- [ ] All CTAs are table-based buttons, not image buttons
- [ ] Sharp corners (border-radius: 0) on all elements
- [ ] Dark mode media queries included and tested
- [ ] Hidden preheader div present with padding characters
- [ ] Outlook MSO conditionals present in `<head>`
- [ ] All images have alt text, width, height, border="0"
- [ ] 5 subject line variants generated per template
- [ ] 3 preview text variants generated per template
- [ ] Brand voice check: no flowery language, no exclamation marks, no emojis
- [ ] Unsubscribe link present in footer
- [ ] Mobile responsive (`@media max-width: 620px` rules)
- [ ] Color palette matches brand: `#0A0A0A`, `#121212`, `#EBEBEB`, `#808080`, `#292929`, `#FFFFFF`
- [ ] All links have `target="_blank"` and are absolute URLs
- [ ] ESP-specific merge tags/variables correctly placed

---

## Example Usage

**Welcome email:**
```
/email-template-builder welcome
```

**Promo with specific offer:**
```
/email-template-builder promo --offer "Free shipping on founding batch" --subject "Last chance: free shipping"
```

**Abandoned cart for Klaviyo:**
```
/email-template-builder abandoned-cart
```

**All campaign types at once:**
```
/email-template-builder all
```

**Educational with custom topic:**
```
/email-template-builder educational --subject "Why altitude destroys your skin barrier"
```
