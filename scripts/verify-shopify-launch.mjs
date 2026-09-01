#!/usr/bin/env node

/**
 * Regression check for the hosted Shopify surface at shop.baselayerskin.co.
 *
 * Shopify owns checkout and policy delivery; the React/Netlify app owns the
 * public storefront. This script checks that the two surfaces do not compete
 * in search, while keeping the policy, contact, FAQ, and privacy-choice pages
 * usable on Shopify. It makes no orders and creates no carts.
 *
 * Exit codes: 0 = pass, 1 = a launch requirement regressed, 2 = the audit
 * could not complete because Shopify or the network was unavailable.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SHOP_BASE = process.env.SHOPIFY_AUDIT_BASE_URL ?? "https://shop.baselayerskin.co";
const MAIN_BASE = process.env.STOREFRONT_AUDIT_BASE_URL ?? "https://baselayerskin.co";
const AGENT = "BaseLayerLaunchVerifier/1.0";

const problems = [];
const checks = [];

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(ROOT, ".env"), "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/u);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^["']|["']$/gu, "");
    }
  } catch {
    // CI and launch-audit runs may inject credentials instead.
  }
  return env;
}

function record(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  if (!ok) problems.push(`${name}${detail ? `: ${detail}` : ""}`);
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        ...options,
        headers: { "user-agent": AGENT, ...options.headers },
      });
      if (response.status < 500 || attempt === 3) return response;
    } catch (error) {
      lastError = error;
    }
    await new Promise((done) => setTimeout(done, 250 * attempt));
  }
  throw lastError ?? new Error(`Unable to fetch ${url}`);
}

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&ndash;", "–")
    .replaceAll("&mdash;", "—")
    .replaceAll("&times;", "×");
}

function tagAttribute(tag, attribute) {
  const match = tag.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, "iu"));
  return match ? decodeHtml(match[2].trim()) : null;
}

function pageMeta(html) {
  const title = decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] ?? "")
    .replace(/\s+/gu, " ")
    .trim();
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/giu)].map((match) => match[0]);
  const linkTags = [...html.matchAll(/<link\b[^>]*>/giu)].map((match) => match[0]);
  const named = (name) => {
    const tag = metaTags.find((candidate) =>
      tagAttribute(candidate, "name")?.toLowerCase() === name.toLowerCase()
    );
    return tag ? tagAttribute(tag, "content") : null;
  };
  const property = (name) => {
    const tag = metaTags.find((candidate) =>
      tagAttribute(candidate, "property")?.toLowerCase() === name.toLowerCase()
    );
    return tag ? tagAttribute(tag, "content") : null;
  };
  const linked = (relation) => {
    const tag = linkTags.find((candidate) =>
      tagAttribute(candidate, "rel")?.toLowerCase().split(/\s+/u).includes(relation)
    );
    return tag ? tagAttribute(tag, "href") : null;
  };
  return {
    title,
    description: named("description"),
    canonical: linked("canonical"),
    favicon: linked("icon"),
    robots: named("robots"),
    ogTitle: property("og:title"),
    ogDescription: property("og:description"),
  };
}

async function readPage(path) {
  const response = await fetchWithRetry(`${SHOP_BASE}${path}`);
  return { response, html: await response.text() };
}

async function readShopifySitemap() {
  const visited = new Set();
  const contentUrls = new Set();
  const queue = [`${SHOP_BASE}/sitemap.xml`];
  while (queue.length) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    const response = await fetchWithRetry(url);
    if (!response.ok) throw new Error(`Sitemap returned HTTP ${response.status}: ${url}`);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => decodeHtml(match[1]));
    for (const child of urls) {
      if (/\/sitemap[^/]*\.xml(?:\?|$)/u.test(child)) queue.push(child);
      else contentUrls.add(child);
    }
  }
  return contentUrls;
}

async function verifyPublicHtml() {
  const sitemap = await readShopifySitemap();
  const productPaths = [
    "/products/performance-daily-face-cream",
    "/products/performance-daily-face-cream-2-pack",
  ];
  record(
    "Shopify products are absent from the Online Store sitemap",
    productPaths.every((path) => !sitemap.has(`${SHOP_BASE}${path}`)),
    [...sitemap].filter((url) => url.includes("/products/")).join(", "),
  );

  const servicePages = [
    "/policies/privacy-policy",
    "/policies/terms-of-service",
    "/pages/contact",
    "/pages/faq",
    "/pages/data-sharing-opt-out",
  ];
  let faviconUrl = null;
  for (const path of servicePages) {
    const { response, html } = await readPage(path);
    const meta = pageMeta(html);
    record(`${path} returns 200`, response.status === 200, `HTTP ${response.status}`);
    record(`${path} is self-canonical`, meta.canonical === `${SHOP_BASE}${path}`, meta.canonical ?? "missing");
    if (meta.favicon) faviconUrl ??= new URL(meta.favicon, SHOP_BASE).toString();
  }

  record("Shopify theme declares a favicon", Boolean(faviconUrl));
  if (faviconUrl) {
    const icon = await fetchWithRetry(faviconUrl);
    record("Shopify favicon asset loads", icon.ok, `${icon.status} ${faviconUrl}`);
  }

  const terms = await readPage("/policies/terms-of-service");
  record("Terms contain no [LINK] placeholders", !terms.html.includes("[LINK]"));
  record("Terms contain no merchant template notes", !/\[(?:INSERT|NOTE TO MERCHANT)\b/iu.test(terms.html));

  const privacy = await readPage("/policies/privacy-policy");
  record("Privacy contact copy does not promise a missing phone number", !/please call\s+or email/iu.test(privacy.html));

  const faq = await readPage("/pages/faq");
  record("FAQ contains the approved product questions", /Will it feel greasy/iu.test(faq.html) && /How long does one bottle last/iu.test(faq.html));

  for (const path of ["/pages/contact"]) {
    const { response, html } = await readPage(path);
    const meta = pageMeta(html);
    record(`${path} has a meta description`, Boolean(meta.description), `HTTP ${response.status}`);
    record(`${path} has Open Graph title and description`, Boolean(meta.ogTitle && meta.ogDescription));
  }
}

async function verifyBrowserRouting() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    const cases = [
      ["/", `${MAIN_BASE}/`],
      ["/products/performance-daily-face-cream", `${MAIN_BASE}/face-cream`],
      ["/products/performance-daily-face-cream-2-pack", `${MAIN_BASE}/face-cream`],
      ["/policies/privacy-policy", `${SHOP_BASE}/policies/privacy-policy`],
      ["/pages/contact", `${SHOP_BASE}/pages/contact`],
      ["/pages/faq", `${SHOP_BASE}/pages/faq`],
      ["/pages/data-sharing-opt-out", `${SHOP_BASE}/pages/data-sharing-opt-out`],
    ];
    for (const [path, expected] of cases) {
      const page = await browser.newPage();
      await page.setUserAgent(AGENT);
      try {
        await page.goto(`${SHOP_BASE}${path}`, { waitUntil: "networkidle2", timeout: 30_000 });
        await new Promise((done) => setTimeout(done, 500));
        record(`${path} browser destination`, page.url() === expected, `${page.url()} (expected ${expected})`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

async function verifyStorefrontApi() {
  const env = loadEnv();
  const domain = env.VITE_SHOPIFY_DOMAIN;
  const token = env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) {
    checks.push({ name: "Storefront API availability", ok: true, detail: "skipped: credentials not configured" });
    return;
  }
  const query = `
    query LaunchProducts {
      product(handle: "performance-daily-face-cream") {
        id
        seo { title description }
        variants(first: 10) { nodes { id availableForSale } }
      }
      pack: product(handle: "performance-daily-face-cream-2-pack") {
        id
        seo { title description }
      }
      collection(handle: "frontpage") { seo { title description } }
      blog(handle: "news") { seo { title description } }
    }
  `;
  const response = await fetchWithRetry(`https://${domain}/api/2025-07/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-storefront-access-token": token,
    },
    body: JSON.stringify({ query }),
  });
  const payload = await response.json();
  record("Storefront API returns the main product", payload.data?.product?.id === "gid://shopify/Product/7469557612615");
  const variants = payload.data?.product?.variants?.nodes ?? [];
  record(
    "Storefront API retains both live variants",
    ["42940461023303", "42940461056071"].every((id) =>
      variants.some((variant) => variant.id.endsWith(`/${id}`) && variant.availableForSale)
    ),
  );
  record("Storefront API retains the catalog two-pack product", payload.data?.pack?.id === "gid://shopify/Product/7633968496711");
  record("Collection has a search description", Boolean(payload.data?.collection?.seo?.description));
  record("Blog has a search description", Boolean(payload.data?.blog?.seo?.description));
  record(
    "Product share titles are unique",
    Boolean(payload.data?.product?.seo?.title) && payload.data.product.seo.title !== payload.data?.pack?.seo?.title,
  );
  record(
    "Product share descriptions are unique",
    Boolean(payload.data?.product?.seo?.description) && payload.data.product.seo.description !== payload.data?.pack?.seo?.description,
  );
}

async function main() {
  try {
    await verifyPublicHtml();
    await verifyBrowserRouting();
    await verifyStorefrontApi();
  } catch (error) {
    console.error(`\nUnable to complete Shopify launch verification: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
    return;
  }

  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }
  console.log(`\n${checks.length - problems.length}/${checks.length} Shopify launch checks passed.`);
  if (problems.length) {
    console.error("\nBlocking problems:\n" + problems.map((problem) => `- ${problem}`).join("\n"));
    process.exitCode = 1;
  }
}

main();
