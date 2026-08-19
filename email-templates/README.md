# Base Layer email design system

Three provider-portable, table-based master templates for Brevo lifecycle email.
They use the production Base Layer wordmark and approved mountain/product assets,
but all customer-facing copy remains live HTML text.

## Master formats

| Template | Use it for | Sample content included |
| --- | --- | --- |
| `alpine-editorial.html` | Welcome education, proof, launches | Immediate `SKIN15` welcome |
| `commerce-utility.html` | Cart recovery and replenishment | Exact-cart recovery |
| `founder-field-note.html` | Post-purchase education and selective winback | Founder quick-start note |

Do not create a fourth visual format for an individual automation. Assemble new
emails from the labelled modules inside the closest master: preheader, header,
hero or product summary, proof, primary action, reassurance, and legal footer.

## Import into Brevo

1. In **Campaigns > Templates**, create a template and choose **Paste your code**.
2. Paste one complete HTML file. Brevo must receive the complete document, not
   only the table inside `<body>`.
3. Replace the sample subject and preheader in Brevo. Keep them complementary.
4. Replace only the sample copy, URLs, and optional modules. Keep the outer
   600px table, inline styles, mobile classes, legal footer, and CTA construction.
5. For cart automation, keep the `{% for item in params.items %}` product loop
   and `{{ params.url }}` CTA intact. Preview against a real `cart_updated`
   event for one bottle, two bottles, and a subscription before activation so
   the email displays the actual items and never exposes a raw template variable.
6. Send inbox tests to Gmail mobile/desktop, Apple Mail, and Outlook. Check light
   mode, dark mode, image blocking, and a 320px-wide viewport.

The templates use the Brevo unsubscribe token `{{ unsubscribe }}`. If exported
to another provider, replace it with that provider's required unsubscribe token
before sending. The commerce template also uses Brevo event data through
`params.items`, each `item` field, `params.currency`, and `params.url`.

## Content rules

- Headings are uppercase, direct, and period-terminated.
- One message job and one primary action per email.
- Keep body copy at 16px or larger and buttons at least 48px high.
- Use Alpine Editorial when Colorado context advances the story. Cart and
  replenishment emails should keep the merchandise and action visually dominant.
- Founder Field Note should read like a useful note, not a disguised campaign.
- Never embed essential copy, prices, codes, or calls to action inside an image.
- Do not claim that Base Layer is clinically proven or that it treats a disease.

## Brand tokens

| Role | Value |
| --- | --- |
| Alpine navy | `#1A2F4C` |
| Warm ivory | `#F7F4EE` |
| Paper white | `#FFFDFC` |
| CTA orange | `#C04510` |
| CTA hover/fallback | `#A83C0E` |
| Orange accent on light | `#C4470E` |
| Orange accent on navy | `#FF7034` |
| Muted copy | `#596779` |
| Rule | `#D8D3CA` |

The CTA color clears WCAG AA with white text. Do not substitute the brighter
website orange for button backgrounds without rechecking contrast.

## Production assets

- Wordmark: `https://baselayerskin.co/logo.png`
- Mountain product hero: `https://baselayerskin.co/og-mountain-product-v2.jpg`
- High-resolution product/mountain image:
  `https://baselayerskin.co/images/hero-product-mountain.png`

These are stable files in `public/`. Email markup intentionally avoids SVG and
WebP because desktop email-client support is less reliable than PNG/JPEG.

## Verification

Run the deterministic static gate before importing or after editing:

```bash
node scripts/verify-email-templates.mjs
npm run test:email-program -- --templates email-templates
```

The gate enforces exactly three masters, the Gmail clipping budget, HTTPS image
sources, non-empty alt text, unsubscribe/legal content, a 600px container,
48px CTA construction, approved palette tokens, and the absence of unsupported
layout primitives or banned marketing language. The second command reconciles
template CTAs and attribution against the canonical journey link manifest in
`docs/email-program/email-link-manifest.json`. These checks supplement inbox
rendering; they do not replace it.
