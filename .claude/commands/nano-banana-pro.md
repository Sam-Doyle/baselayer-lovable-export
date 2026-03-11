# Nano Banana Pro Image Generation & Editing

Generate new images or edit existing ones using Google's Nano Banana Pro API (Gemini 3 Pro Image).

## Usage

Run the script using absolute path (do NOT cd to skill directory first):

**Generate new image:**
```bash
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py --prompt "your image description" --filename "output-name.png" [--resolution 1K|2K|4K] [--api-key KEY]
```

**Edit existing image:**
```bash
uv run /Users/samdoyle/baselayer-lovable-export/.claude/skills/nano-banana-pro/scripts/generate_image.py --prompt "editing instructions" --filename "output-name.png" --input-image "path/to/input.png" [--resolution 1K|2K|4K] [--api-key KEY]
```

**Important:** Always run from the user's current working directory so images are saved where the user is working, not in the skill directory.

## Default Workflow (draft > iterate > final)

Goal: fast iteration without burning time on 4K until the prompt is correct.

- Draft (1K): quick feedback loop
- Iterate: adjust prompt in small diffs; keep filename new per run. If editing: keep the same --input-image for every iteration until happy.
- Final (4K): only when prompt is locked

## Resolution Options

- **1K** (default) - ~1024px resolution
- **2K** - ~2048px resolution
- **4K** - ~4096px resolution

Map user requests:
- No mention of resolution -> 1K
- "low resolution", "1080", "1080p", "1K" -> 1K
- "2K", "2048", "normal", "medium resolution" -> 2K
- "high resolution", "high-res", "hi-res", "4K", "ultra" -> 4K

## API Key

The script checks for API key in this order:
1. `--api-key` argument
2. `GEMINI_API_KEY` environment variable

Get a free API key at https://aistudio.google.com/apikey

## Preflight

Before running, verify:
- `command -v uv` (must exist — install with `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- `test -n "$GEMINI_API_KEY"` (or pass --api-key)
- If editing: `test -f "path/to/input.png"`

## Filename Generation

Pattern: `yyyy-mm-dd-hh-mm-ss-name.png`
- Timestamp: Current date/time (24-hour)
- Name: Descriptive lowercase text with hyphens (1-5 words)

## Prompt Handling

**For generation:** Pass user's image description as-is to --prompt. Only rework if clearly insufficient.

**For editing:** Pass editing instructions in --prompt (e.g., "add a rainbow in the sky")

Preserve user's creative intent in both cases.

## Prompt Templates (high hit-rate)

- Generation: "Create an image of: <subject>. Style: <style>. Composition: <camera/shot>. Lighting: <lighting>. Background: <background>. Color palette: <palette>. Avoid: <list>."
- Editing (preserve everything else): "Change ONLY: <single change>. Keep identical: subject, composition/crop, pose, lighting, color palette, background, text, and overall style."

## Output

- Saves PNG to current directory
- Script outputs the full path to the generated image
- Do not read the image back - just inform the user of the saved path
