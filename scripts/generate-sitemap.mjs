#!/usr/bin/env node
/**
 * Generate sitemap.xml at build time by fetching all published slugs from Sanity.
 * Run: node scripts/generate-sitemap.mjs
 * Called automatically via: "build": "node scripts/generate-sitemap.mjs && vite build"
 */

import { createClient } from "@sanity/client";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://baselayerskin.co";

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || "27quz10a",
  dataset: process.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

async function fetchSlugs() {
  const [articles, ingredients, skinConcerns, comparisons] = await Promise.all([
    client.fetch(
      `*[_type == "article" && defined(body)]{"slug": slug.current, "updated": coalesce(updatedAt, publishedAt, publishDate)}`
    ),
    client.fetch(
      `*[_type == "ingredient" && (defined(body) || defined(description)) && !(slug.current in ["retinol", "vitamin-c"])]{"slug": slug.current}`
    ),
    client.fetch(
      `*[_type == "skinConcern" && defined(overview)]{"slug": slug.current}`
    ),
    client.fetch(
      `*[_type == "comparison" && defined(body)]{"slug": slug.current}`
    ),
  ]);

  return { articles, ingredients, skinConcerns, comparisons };
}

function buildSitemap({ articles, ingredients, skinConcerns, comparisons }) {
  const staticPages = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/articles", changefreq: "weekly", priority: "0.8" },
    { loc: "/ingredients", changefreq: "monthly", priority: "0.7" },
    { loc: "/skin-concerns", changefreq: "monthly", priority: "0.7" },
    { loc: "/comparisons", changefreq: "monthly", priority: "0.7" },
    { loc: "/about", changefreq: "monthly", priority: "0.5" },
    { loc: "/face-cream", changefreq: "monthly", priority: "0.9" },
    { loc: "/matte-moisturizer-for-men", changefreq: "monthly", priority: "0.9" },
    { loc: "/non-greasy-moisturizer-for-men", changefreq: "monthly", priority: "0.9" },
    { loc: "/all-in-one-skincare-for-men", changefreq: "monthly", priority: "0.9" },
  ];

  const urls = [];

  for (const page of staticPages) {
    urls.push(makeUrl(page.loc, page.changefreq, page.priority));
  }

  for (const a of articles) {
    urls.push(
      makeUrl(`/articles/${a.slug}`, "weekly", "0.7", a.updated)
    );
  }

  for (const i of ingredients) {
    urls.push(makeUrl(`/ingredients/${i.slug}`, "monthly", "0.6"));
  }

  for (const sc of skinConcerns) {
    urls.push(makeUrl(`/skin-concerns/${sc.slug}`, "monthly", "0.6"));
  }

  for (const c of comparisons) {
    urls.push(makeUrl(`/comparisons/${c.slug}`, "monthly", "0.6"));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
  ].join("\n");
}

function makeUrl(path, changefreq, priority, lastmod) {
  let xml = `  <url>\n    <loc>${BASE_URL}${path}</loc>`;
  if (lastmod) {
    xml += `\n    <lastmod>${lastmod.split("T")[0]}</lastmod>`;
  }
  xml += `\n    <changefreq>${changefreq}</changefreq>`;
  xml += `\n    <priority>${priority}</priority>`;
  xml += `\n  </url>`;
  return xml;
}

async function main() {
  console.log("[sitemap] Fetching slugs from Sanity...");
  const data = await fetchSlugs();

  const totalUrls =
    10 +
    data.articles.length +
    data.ingredients.length +
    data.skinConcerns.length +
    data.comparisons.length;

  console.log(
    `[sitemap] Found: ${data.articles.length} articles, ${data.ingredients.length} ingredients, ${data.skinConcerns.length} skin concerns, ${data.comparisons.length} comparisons`
  );

  const xml = buildSitemap(data);
  const outPath = resolve(__dirname, "../public/sitemap.xml");
  writeFileSync(outPath, xml, "utf-8");
  console.log(`[sitemap] Written ${totalUrls} URLs to ${outPath}`);
}

main().catch((err) => {
  console.error("[sitemap] Error:", err);
  process.exit(1);
});
