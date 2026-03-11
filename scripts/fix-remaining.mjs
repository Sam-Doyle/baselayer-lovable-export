#!/usr/bin/env node
/**
 * Fix remaining issues in Cetaphil and Best Moisturizer articles.
 * Uses createOrReplace via HTTP API since MCP rejects patches to legacy fields.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const PROJECT_ID = "27quz10a";
const DATASET = "production";
const API_VERSION = "2024-01-01";
const TOKEN = JSON.parse(
  readFileSync(join(homedir(), ".config/sanity/config.json"), "utf-8")
).authToken;
const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}`;

async function fetchDoc(id) {
  const res = await fetch(`${BASE_URL}/data/doc/${DATASET}/${id}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return data.documents?.[0];
}

async function mutate(mutations) {
  const res = await fetch(`${BASE_URL}/data/mutate/${DATASET}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

async function main() {
  const mutations = [];

  // ── Cetaphil article ──────────────────────────────────────────────
  {
    const doc = await fetchDoc("1oqnqg4II3NrNQE9vz7KMh");
    console.log(`Cetaphil: ${doc.faqs?.length} FAQs before`);

    // Remove duplicate FAQ
    doc.faqs = doc.faqs.filter((f) => f._key !== "bd410828a646");
    console.log(`Cetaphil: ${doc.faqs.length} FAQs after`);

    // Fix "actually works" in body
    for (const block of doc.body || []) {
      if (block._key === "b48d340741c0" && block.children?.[0]) {
        const old = block.children[0].text;
        block.children[0].text = old.replace("actually works", "is effective");
        console.log(`Cetaphil: fixed "actually works" in testimonial block`);
      }
    }

    delete doc._rev;
    doc._id = `drafts.${doc._id}`;
    mutations.push({ createOrReplace: doc });
  }

  // ── Best Moisturizer article ──────────────────────────────────────
  {
    const doc = await fetchDoc("3XTaqpjUxCXtHrlt1n5kaI");
    console.log(`\nBest Moisturizer: ${doc.faqs?.length} FAQs before`);

    // Remove duplicate FAQ
    doc.faqs = doc.faqs.filter((f) => f._key !== "6bd7382f8a18");
    console.log(`Best Moisturizer: ${doc.faqs.length} FAQs after`);

    // Fix body blocks
    const fixes = {
      "ba30ae4a2e85": (t) =>
        t.replace(
          "Niacinamide is non-negotiable here\u2014it\u2019s the only ingredient that actually regulates",
          "Niacinamide is essential here\u2014it\u2019s the only ingredient that regulates"
        ),
      "eed7492133f0": (t) =>
        t.replace("Non-comedogenic is non-negotiable", "Non-comedogenic is essential"),
      "aa279ef2225f": (t) =>
        t.replace("actually look healthy", "look healthy"),
      "b8bc1e17837f": (t) =>
        t.replace("actually works with your skin", "works with your skin"),
      "e8594474dd44": (t) =>
        t.replace("what actually works", "what works"),
      "51fc0c20f891": (t) =>
        t.replace("what actually works", "what works"),
    };

    for (const block of doc.body || []) {
      if (fixes[block._key] && block.children?.[0]) {
        const old = block.children[0].text;
        block.children[0].text = fixes[block._key](old);
        if (old !== block.children[0].text) {
          console.log(`Best Moisturizer: fixed block [${block._key}]`);
        }
      }
    }

    delete doc._rev;
    doc._id = `drafts.${doc._id}`;
    mutations.push({ createOrReplace: doc });
  }

  console.log(`\nExecuting ${mutations.length} mutations...`);
  const result = await mutate(mutations);
  console.log(`Done! ${result.results?.length} drafts created.`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
