#!/usr/bin/env node
/**
 * Skin Concern Editorial Cleanup — Targeted Fixes
 *
 * Uses Sanity HTTP API because `body` is a legacy field not in the current schema.
 * MCP patch tools reject these patches due to schema validation.
 *
 * Fixes:
 *   Aging & Wrinkles (P0fNr6wYnfWZCVquynRge6):
 *     - Remove redundant "Overview" h2 heading [2676850fdd88]
 *     - Rewrite "What Actually Works for Men's Aging Skin" → "What Works for Aging Skin" [e89c38dde1d2]
 *     - Rewrite "Use SPF Daily (Non-Negotiable)" → "Use SPF Daily" [cddb99261a4d]
 *     - Remove duplicate FAQ [1f612c302b7a]
 *
 *   Dark Circles (P0fNr6wYnfWZCVquynRj8C):
 *     - Remove keyword-stuffed heading "Overview: Dark Circles Men Want to Fix" [fc52bfa400a8]
 *     - Rewrite keyword-stuffed intro paragraph [ec529fcc6f7b]
 *     - Remove duplicate FAQ [3efe56c82dcd]
 *
 *   Acne-Prone (bNKZj4hxI3qs1eUORpTOXp):
 *     - Fix "This is non-negotiable." [ffdd0f408cdd]
 */

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const PROJECT_ID = "27quz10a";
const DATASET = "production";
const API_VERSION = "2024-01-01";
const sanityConfig = JSON.parse(
  readFileSync(join(homedir(), ".config/sanity/config.json"), "utf-8")
);
const TOKEN = sanityConfig.authToken;
const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`;

async function sanityFetch(docId) {
  const url = `${BASE_URL}/data/doc/${DATASET}/${docId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();
  return data.documents?.[0];
}

async function sanityMutate(mutations) {
  const url = `${BASE_URL}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mutation failed: ${res.status} ${text}`);
  }
  return res.json();
}

function getBlockText(block) {
  return (block.children || []).map((c) => c.text || "").join("");
}

function setBlockText(block, newText) {
  if (block.children?.length >= 1) {
    block.children = [{ ...block.children[0], text: newText }];
  }
}

async function fixDocument(docId, fixes) {
  console.log(`\nFetching ${docId}...`);
  const doc = await sanityFetch(docId);
  if (!doc) {
    console.error(`  Document ${docId} not found!`);
    return null;
  }
  console.log(`  Got: ${doc.name || doc._id}`);

  let body = doc.body ? [...doc.body] : [];
  let faqs = doc.faqs ? [...doc.faqs] : [];
  let changed = false;

  // Remove blocks by _key
  if (fixes.removeBlocks?.length) {
    const before = body.length;
    body = body.filter((b) => !fixes.removeBlocks.includes(b._key));
    if (body.length !== before) {
      console.log(`  Removed ${before - body.length} body block(s)`);
      changed = true;
    }
  }

  // Rewrite specific blocks
  if (fixes.rewriteBlocks) {
    for (const [key, newText] of Object.entries(fixes.rewriteBlocks)) {
      const block = body.find((b) => b._key === key);
      if (block) {
        const oldText = getBlockText(block);
        setBlockText(block, newText);
        console.log(`  Rewrite [${key}]: "${oldText.substring(0, 50)}..." → "${newText.substring(0, 50)}..."`);
        changed = true;
      } else {
        console.warn(`  Block ${key} not found, skipping`);
      }
    }
  }

  // Fix banned phrases in all blocks
  if (fixes.replacePhrases) {
    for (const block of body) {
      if (block._type !== "block" || !block.children) continue;
      for (const child of block.children) {
        if (!child.text) continue;
        let newText = child.text;
        for (const { pattern, replacement } of fixes.replacePhrases) {
          newText = newText.replace(pattern, replacement);
        }
        if (newText !== child.text) {
          console.log(`  Phrase fix [${block._key}]: "${child.text.substring(0, 50)}..." → "${newText.substring(0, 50)}..."`);
          child.text = newText;
          changed = true;
        }
      }
    }
  }

  // Remove duplicate FAQs
  if (fixes.removeFaqs?.length) {
    const before = faqs.length;
    faqs = faqs.filter((f) => !fixes.removeFaqs.includes(f._key));
    if (faqs.length !== before) {
      console.log(`  Removed ${before - faqs.length} duplicate FAQ(s)`);
      changed = true;
    }
  }

  if (!changed) {
    console.log(`  No changes needed`);
    return null;
  }

  // Create draft via createOrReplace
  const draft = {
    ...doc,
    _id: `drafts.${docId}`,
    body,
    faqs,
  };
  delete draft._rev; // Let Sanity manage revisions

  return { createOrReplace: draft };
}

async function main() {
  const mutations = [];

  // ── Aging & Wrinkles ──────────────────────────────────────────────
  const agingFix = await fixDocument("P0fNr6wYnfWZCVquynRge6", {
    removeBlocks: ["2676850fdd88"], // redundant "Overview" heading
    rewriteBlocks: {
      "e89c38dde1d2": "What Works for Aging Skin",
      "cddb99261a4d": "Use SPF Daily",
    },
    removeFaqs: ["1f612c302b7a"], // duplicate "What if I've been in the sun a lot already?"
  });
  if (agingFix) mutations.push(agingFix);

  // ── Dark Circles ──────────────────────────────────────────────────
  const darkCirclesFix = await fixDocument("P0fNr6wYnfWZCVquynRj8C", {
    removeBlocks: ["fc52bfa400a8"], // keyword-stuffed "Overview: Dark Circles Men Want to Fix"
    rewriteBlocks: {
      "ec529fcc6f7b":
        "Dark circles and tired-looking eyes are among the most visible signs of fatigue, stress, and aging. Under-eye darkness stems from multiple factors: blood vessel visibility beneath thin skin, melanin deposits, volume loss, and chronic dehydration. Understanding the biology of under-eye skin\u2014and applying the right ingredients consistently\u2014is the most reliable way to reduce them.",
    },
    removeFaqs: ["3efe56c82dcd"], // duplicate "Does blue light from screens actually cause dark circles?"
  });
  if (darkCirclesFix) mutations.push(darkCirclesFix);

  // ── Acne-Prone ────────────────────────────────────────────────────
  const acneFix = await fixDocument("bNKZj4hxI3qs1eUORpTOXp", {
    rewriteBlocks: {
      "ffdd0f408cdd": "Always follow treatment with moisturizer.",
    },
  });
  if (acneFix) mutations.push(acneFix);

  // ── All documents: scan for remaining banned phrases ──────────────
  // (Oily Skin, Post-Shave, Dry & Dehydrated already checked — no banned phrases found)

  if (mutations.length === 0) {
    console.log("\nNo mutations needed.");
    return;
  }

  console.log(`\nExecuting ${mutations.length} mutations...`);
  const result = await sanityMutate(mutations);
  console.log(`Done! ${result.results?.length || 0} drafts created.\n`);

  const draftIds = mutations
    .map((m) => m.createOrReplace?._id?.replace("drafts.", ""))
    .filter(Boolean);

  console.log("Draft IDs created (need publishing):");
  for (const id of draftIds) {
    console.log(`  ${id}`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
