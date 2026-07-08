#!/usr/bin/env bash
# KB Health Check — generates kb/_health.md
# Run: bash kb/scripts/health-check.sh (from repo root)

set -euo pipefail

KB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WIKI_DIR="$KB_DIR/wiki"
INBOX="$KB_DIR/_inbox.md"
INDEX="$KB_DIR/_index.md"
RAW_DIR="$KB_DIR/raw"
HEALTH="$KB_DIR/_health.md"
TODAY=$(date +%Y-%m-%d)
STALE_DAYS=30

echo "# KB Health Report — $TODAY" > "$HEALTH"
echo "" >> "$HEALTH"

# --- Inbox backlog ---
INBOX_COUNT=0
if [ -f "$INBOX" ]; then
  INBOX_COUNT=$(grep -c '^---$' "$INBOX" 2>/dev/null || echo 0)
  # Each entry has 2 --- markers (open + close), subtract the template's pair
  INBOX_COUNT=$(( (INBOX_COUNT - 2) / 2 ))
  if [ "$INBOX_COUNT" -lt 0 ]; then INBOX_COUNT=0; fi
fi

if [ "$INBOX_COUNT" -ge 10 ]; then
  echo "## Inbox: CRITICAL — $INBOX_COUNT items (compile now)" >> "$HEALTH"
elif [ "$INBOX_COUNT" -ge 5 ]; then
  echo "## Inbox: WARNING — $INBOX_COUNT items (compile soon)" >> "$HEALTH"
else
  echo "## Inbox: OK — $INBOX_COUNT items" >> "$HEALTH"
fi
echo "" >> "$HEALTH"

# --- Article staleness ---
echo "## Article Freshness" >> "$HEALTH"
echo "" >> "$HEALTH"
STALE_COUNT=0
ARTICLE_COUNT=0

if [ -d "$WIKI_DIR" ]; then
  for article in "$WIKI_DIR"/*.md; do
    [ -f "$article" ] || continue
    ARTICLE_COUNT=$((ARTICLE_COUNT + 1))
    name=$(basename "$article")
    last_compiled=$(grep -m1 '^last_compiled:' "$article" 2>/dev/null | sed 's/last_compiled: *//' || echo "unknown")

    if [ "$last_compiled" = "unknown" ]; then
      echo "- **$name**: NO COMPILE DATE" >> "$HEALTH"
      STALE_COUNT=$((STALE_COUNT + 1))
    else
      # Calculate days since last compile (macOS compatible)
      if command -v gdate &>/dev/null; then
        DATE_CMD="gdate"
      else
        DATE_CMD="date"
      fi

      compiled_epoch=$($DATE_CMD -d "$last_compiled" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$last_compiled" +%s 2>/dev/null || echo 0)
      today_epoch=$($DATE_CMD -d "$TODAY" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$TODAY" +%s 2>/dev/null || echo 0)

      if [ "$compiled_epoch" -gt 0 ] && [ "$today_epoch" -gt 0 ]; then
        days_old=$(( (today_epoch - compiled_epoch) / 86400 ))
        if [ "$days_old" -gt "$STALE_DAYS" ]; then
          echo "- **$name**: STALE ($days_old days since compile)" >> "$HEALTH"
          STALE_COUNT=$((STALE_COUNT + 1))
        else
          echo "- **$name**: OK ($days_old days)" >> "$HEALTH"
        fi
      else
        echo "- **$name**: PARSE ERROR ($last_compiled)" >> "$HEALTH"
      fi
    fi
  done
fi

if [ "$ARTICLE_COUNT" -eq 0 ]; then
  echo "- _No wiki articles found_" >> "$HEALTH"
fi
echo "" >> "$HEALTH"

# --- Unprocessed raw research ---
echo "## Unprocessed Raw Research" >> "$HEALTH"
echo "" >> "$HEALTH"
RAW_COUNT=0
if [ -d "$RAW_DIR/research" ]; then
  for raw in "$RAW_DIR/research"/*.md; do
    [ -f "$raw" ] || continue
    name=$(basename "$raw")
    [ "$name" = ".gitkeep" ] && continue
    RAW_COUNT=$((RAW_COUNT + 1))
    echo "- $name" >> "$HEALTH"
  done
fi
if [ "$RAW_COUNT" -eq 0 ]; then
  echo "- _None_" >> "$HEALTH"
fi
echo "" >> "$HEALTH"

# --- Cross-reference check ---
echo "## Cross-References" >> "$HEALTH"
echo "" >> "$HEALTH"
MISSING_REFS=0
if [ -d "$WIKI_DIR" ]; then
  for article in "$WIKI_DIR"/*.md; do
    [ -f "$article" ] || continue
    name=$(basename "$article")
    # Check if article is listed in index
    if ! grep -q "$name" "$INDEX" 2>/dev/null; then
      echo "- **$name**: NOT IN INDEX" >> "$HEALTH"
      MISSING_REFS=$((MISSING_REFS + 1))
    fi
  done
fi
if [ "$MISSING_REFS" -eq 0 ]; then
  echo "- _All articles indexed_" >> "$HEALTH"
fi
echo "" >> "$HEALTH"

# --- Summary ---
echo "## Summary" >> "$HEALTH"
echo "" >> "$HEALTH"
echo "- **Articles**: $ARTICLE_COUNT" >> "$HEALTH"
echo "- **Inbox backlog**: $INBOX_COUNT" >> "$HEALTH"
echo "- **Stale articles**: $STALE_COUNT" >> "$HEALTH"
echo "- **Unprocessed research**: $RAW_COUNT" >> "$HEALTH"
echo "- **Missing from index**: $MISSING_REFS" >> "$HEALTH"

# Overall status
if [ "$INBOX_COUNT" -ge 10 ] || [ "$STALE_COUNT" -gt 0 ] || [ "$MISSING_REFS" -gt 0 ]; then
  echo "- **Status**: NEEDS ATTENTION" >> "$HEALTH"
elif [ "$INBOX_COUNT" -ge 5 ]; then
  echo "- **Status**: FAIR" >> "$HEALTH"
else
  echo "- **Status**: HEALTHY" >> "$HEALTH"
fi

echo ""
echo "Health report written to $HEALTH"
cat "$HEALTH"
