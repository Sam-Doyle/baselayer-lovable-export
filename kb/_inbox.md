# KB Inbox — Capture Buffer

New findings go here. When 5+ items accumulate, compile them into wiki articles.

## Entry Format

```markdown
---
date: YYYY-MM-DD
category: product | brand | competitive | technical | marketing | conversion
source: where you learned it
confidence: high | medium | low
target_article: wiki/article-name.md (if known)
---
Finding text here.
```

---

<!-- New entries below this line -->

---
date: 2026-08-12
category: brand
source: code (src/config/product.ts) vs brand/references/audience/objection-bank.md
confidence: high
target_article: ad-strategy
---
Objection bank pricing is stale relative to the live build. `objection-bank.md` Objection 4
and Objection 10 both frame the offer as a one-time $38 single purchase. Live config
(`src/config/product.ts`) is: $38 single, $68 2-pack (MOST POPULAR, PDP default), $35
Subscribe & Save on every delivery every 6 weeks, free shipping on all orders. Any ad copy
generated from the objection bank without checking product.ts will quote the wrong offer.
Treat `src/config/product.ts` as the pricing source of truth for all ad and email copy.

---
date: 2026-08-12
category: technical
source: github.com/mikefutia/no-more-higgsfield
confidence: high
target_article: ad-strategy
---
Installed the `ad-creative-engine` skill (from no-more-higgsfield) at
`~/.claude/skills/ad-creative-engine/`. Pay-per-asset ad generation via fal.ai instead of
subscription tools. Statics via GPT Image 2 edit (~$0.061/image at quality medium, $0.219 at
high), video via Kling (cheap silent motion) or Seedance 2.0 (~$1.51 per 5s @720p, native
audio/UGC feel). Enforces a cost quote before firing, a hard budget cap (default $3/session),
and logs every job to `generations/log.jsonl`. Venv at `~/.config/ad-creative-engine/venv`.
Requires a FAL_KEY. Brand foundation files wired at `brand/brand-dna.md`,
`brand/brand-voice.md`, `brand/icp-cards.md` as routers into `brand/references/` and `kb/wiki/`.
