# Ad Creative Engine — Base Layer run notes

Setup is done. This file holds the project-specific bits so a run doesn't have to
rediscover them.

## Drop reference ads here

`ads/reference/` — put the winning static in as an image file and paste its ad copy
(primary text, headline, description) into the request. Matrix mode is a remix machine; it
will not generate from scratch without a reference, a hook, or a brief.

## Run command

```bash
~/.config/ad-creative-engine/venv/bin/python3 ~/.claude/skills/ad-creative-engine/scripts/generate.py --manifest ads/manifest.json --budget 3.00
```

Gallery refresh (stdlib, plain python3 is fine):

```bash
python3 ~/.claude/skills/ad-creative-engine/scripts/gallery.py --log generations/log.jsonl --out generations/gallery.html
```

## Image sizes — the gpt-image-2 gotcha

`fal-ai/gpt-image-2/*` takes **presets** or a `{width, height}` object. A raw string like
`"1080x1350"` fails validation. Base Layer's Meta placements map like this:

| Placement | Meta spec | Manifest `image_size` |
|---|---|---|
| Feed portrait (best CTR, default) | 1080×1350, 4:5 | `{"width": 1080, "height": 1350}` — **no preset exists for 4:5** |
| Feed square | 1080×1080, 1:1 | `"square_hd"` |
| Stories / Reels | 1080×1920, 9:16 | `"portrait_16_9"` |

Default to 4:5 unless the reference is square. `portrait_4_3` is **not** 4:5 — don't
substitute it.

## Copy limits (Meta)

Primary text <125 chars visible · Headline ≤40 chars, ideal <25 · Link description ≤30
chars, ideal <20. Full table in `brand/references/channels/meta-ad-specs.md`.

## Cost math at current prices

| Job | Model | Each | 5-batch |
|---|---|---|---|
| Static, exploration | gpt-image-2 edit, `quality: "medium"` | $0.061 | $0.31 |
| Static, final | gpt-image-2 edit, `quality: "high"` | $0.219 | $1.10 |
| Video, silent motion | Kling 2.5 turbo pro, 5s | ~$0.35–0.50 | — |
| Video, native audio / UGC | Seedance 2.0 i2v, 5s @720p | $1.51 | — |

Always set `quality` explicitly — the endpoint defaults to `high`, which is 3.6× the cost.

Default session budget is $3.00. A full matrix plus video runs ~$5 and needs explicit
approval. Anything over 12 jobs or $5 needs confirmation even when under budget.

## Before any price goes on an image

`src/config/product.ts` is the source of truth: $38 single · **$68 2-pack, MOST POPULAR and
the PDP default** · $35 Subscribe & Save every delivery (6 weeks, no lock-in) · free shipping
on all orders. `brand/references/audience/objection-bank.md` still says one-time $38 in two
places and is stale — don't quote from it.

## Foundation files the skill reads

`brand/brand-dna.md` · `brand/brand-voice.md` · `brand/icp-cards.md` — these are routers into
`brand/references/` and `kb/wiki/`, so edit the underlying sources, not the routers.
