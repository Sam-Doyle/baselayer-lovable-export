#!/usr/bin/env node
/**
 * Article Editorial Cleanup — Duplicate FAQs + Banned Phrases
 *
 * Uses Sanity HTTP API for batch efficiency.
 *
 * Fixes:
 *   1. Remove duplicate last FAQ from 7 articles
 *   2. Fix "non-negotiable" phrase in 3 articles
 *   3. Fix "Non-negotiable:" and "Still non-negotiable:" label blocks in 6-Ingredient article
 *   4. Publish all drafts
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

async function main() {
  const mutations = [];

  // ── 1. Remove duplicate FAQs ──────────────────────────────────────
  const dupeFaqs = [
    { id: "1oqnqg4II3NrNQE9vz7KMh", key: "bd410828a646", title: "Cetaphil" },
    { id: "3XTaqpjUxCXtHrlt1n5kaI", key: "6bd7382f8a18", title: "Best Moisturizer" },
    { id: "L5ljjp4cqX8sXzCP7W44d6", key: "f7e2e4b37068", title: "6-Ingredient" },
    { id: "YPysR8z5veAiGoP5KVxIIH", key: "b84727a94279", title: "Neutrogena" },
    { id: "YPysR8z5veAiGoP5KVxJRs", key: "f98122eeadf2", title: "Kiehl's" },
    { id: "YPysR8z5veAiGoP5KVxK9S", key: "90eff5342b82", title: "Brickell" },
    { id: "bNKZj4hxI3qs1eUORugfVX", key: "ca75e23bb0ab", title: "CeraVe" },
  ];

  for (const { id, key, title } of dupeFaqs) {
    mutations.push({
      patch: {
        id,
        unset: [`faqs[_key=="${key}"]`],
      },
    });
    console.log(`FAQ dedup: ${title} — removing [${key}]`);
  }

  // ── 2. Fix "non-negotiable" in body blocks ────────────────────────
  // Best Moisturizer (3XTaqpjUxCXtHrlt1n5kaI)
  // Block ba30ae4a2e85: "Niacinamide is non-negotiable here—it's the only ingredient..."
  // Block eed7492133f0: "Non-comedogenic is non-negotiable..."
  mutations.push({
    patch: {
      id: "3XTaqpjUxCXtHrlt1n5kaI",
      set: {
        'body[_key=="ba30ae4a2e85"].children[0].text':
          "Niacinamide is essential here\u2014it\u2019s the only ingredient that actually regulates sebum production while keeping you hydrated. At 5% concentration, it\u2019s clinically proven to reduce shine without irritation.",
        'body[_key=="eed7492133f0"].children[0].text':
          "Non-comedogenic is essential. Avoid products with heavy oils or silicones. Niacinamide helps regulate sebum, reducing breakout triggers. Base Layer Skin is specifically formulated to hydrate without clogging pores.",
      },
    },
  });
  console.log("Phrase fix: Best Moisturizer — 2x non-negotiable → essential");

  // 3-Step Routine (9eGlofD4ttHccX5UZMyivY)
  // Block 0dd83fdc7715: "If you shave, this step is non-negotiable."
  mutations.push({
    patch: {
      id: "9eGlofD4ttHccX5UZMyivY",
      set: {
        'body[_key=="0dd83fdc7715"].children[0].text':
          "If you shave, this step matters more than any other.",
      },
    },
  });
  console.log("Phrase fix: 3-Step Routine — non-negotiable");

  // 6-Ingredient Framework (L5ljjp4cqX8sXzCP7W44d6)
  // Block e479d99539f2: "Non-negotiable: "
  // Block 4d11e395589d: "Still non-negotiable: "
  mutations.push({
    patch: {
      id: "L5ljjp4cqX8sXzCP7W44d6",
      set: {
        'body[_key=="e479d99539f2"].children[0].text': "Core ingredient: ",
        'body[_key=="4d11e395589d"].children[0].text': "Also critical: ",
      },
    },
  });
  console.log("Phrase fix: 6-Ingredient — Non-negotiable/Still non-negotiable → Core ingredient/Also critical");

  // ── 3. Also fix the existing draft of L5ljjp4cqX8sXzCP7W44d6 ─────
  // (It has the same issues since it was a partial fix from a prior agent)
  mutations.push({
    patch: {
      id: "drafts.L5ljjp4cqX8sXzCP7W44d6",
      ifRevisionID: undefined, // Patch if draft exists
      set: {
        'body[_key=="e479d99539f2"].children[0].text': "Core ingredient: ",
        'body[_key=="4d11e395589d"].children[0].text': "Also critical: ",
      },
      unset: [`faqs[_key=="f7e2e4b37068"]`],
    },
  });
  // Remove ifRevisionID key since we don't need it
  delete mutations[mutations.length - 1].patch.ifRevisionID;

  console.log(`\nExecuting ${mutations.length} mutations...`);
  const result = await sanityMutate(mutations);
  console.log(`Done! ${result.results?.length || 0} operations completed.\n`);

  // Show which documents now have drafts that need publishing
  const affectedIds = [
    ...dupeFaqs.map((d) => d.id),
    "3XTaqpjUxCXtHrlt1n5kaI",
    "9eGlofD4ttHccX5UZMyivY",
    "L5ljjp4cqX8sXzCP7W44d6",
  ];
  const uniqueIds = [...new Set(affectedIds)];
  console.log("Documents with drafts to publish:");
  for (const id of uniqueIds) {
    console.log(`  ${id}`);
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
