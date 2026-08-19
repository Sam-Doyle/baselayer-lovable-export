#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(repoRoot, "docs/email-program/email-link-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const failures = [];
const checkedContent = new Set();
const allowedAnchors = new Set(["", "offer", "formula", "results", "reviews"]);
const allowedConcerns = new Set(["dryness", "shine", "irritation", "texture"]);
const allowedOffers = new Set(["single", "two", "subscription"]);

function check(condition, message) {
  if (!condition) failures.push(message);
}

function inspectTracking(params, journey, label) {
  check(params.get("utm_source") === manifest.utm.source, `${label}: utm_source must be ${manifest.utm.source}`);
  check(params.get("utm_medium") === manifest.utm.medium, `${label}: utm_medium must be ${manifest.utm.medium}`);
  check(
    params.get("utm_campaign") === manifest.utm.campaign_by_journey[journey],
    `${label}: utm_campaign must match journey ${journey}`,
  );
  const content = params.get("utm_content") ?? "";
  check(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/u.test(content), `${label}: utm_content must be lowercase snake case`);
  check(!checkedContent.has(content), `${label}: duplicate utm_content ${content}`);
  checkedContent.add(content);
}

function inspectStaticUrl(rawUrl, journey, label) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    failures.push(`${label}: invalid URL`);
    return;
  }
  check(url.protocol === "https:", `${label}: URL must use HTTPS`);
  check(url.origin === manifest.storefront_origin, `${label}: URL must use ${manifest.storefront_origin}`);
  check(allowedAnchors.has(url.hash.slice(1)), `${label}: unsupported landing anchor ${url.hash}`);
  inspectTracking(url.searchParams, journey, label);

  const concern = url.searchParams.get("concern");
  if (concern) check(allowedConcerns.has(concern), `${label}: unsupported concern ${concern}`);
  const offer = url.searchParams.get("offer");
  if (offer) check(allowedOffers.has(offer), `${label}: unsupported offer ${offer}`);
  const discount = url.searchParams.get("discount");
  if (discount) {
    check(discount === "SKIN15", `${label}: only SKIN15 may be activated from email`);
    check(journey === "welcome", `${label}: SKIN15 is restricted to the welcome journey`);
  }
}

function inspectDynamicUrl(link, journey, label) {
  check(link.url === "{{ params.url }}", `${label}: dynamic cart URL must remain the exact event-owned params.url`);
  check(
    link.measurement?.method === "brevo_unique_click_plus_shopify_restored_cart",
    `${label}: dynamic cart URL must declare click-plus-restored-cart measurement`,
  );
  check(
    link.measurement?.exception === "event_owned_exact_cart_url",
    `${label}: dynamic cart URL must declare the exact-cart attribution exception`,
  );
  const content = link.measurement?.content_id ?? "";
  check(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/u.test(content), `${label}: measurement content_id must be lowercase snake case`);
  check(!checkedContent.has(content), `${label}: duplicate measurement content_id ${content}`);
  checkedContent.add(content);
  const preserve = new Set(link.preserve ?? []);
  for (const field of ["checkout_key", "cart_lines", "selling_plan", "discount_codes"]) {
    check(preserve.has(field), `${label}: missing restoration invariant ${field}`);
  }
  inspectStaticUrl(link.fallback_url, journey, `${label}.fallback`);
}

check(manifest.schema_version === 1, "manifest schema_version must be 1");
check(manifest.storefront_origin === "https://baselayerskin.co", "storefront origin must be production Base Layer");
check(Array.isArray(manifest.messages) && manifest.messages.length > 0, "manifest must define messages");

const messageIds = new Set();
for (const message of manifest.messages ?? []) {
  const label = message.id ?? "unknown-message";
  check(/^[wcpr][0-9]{2}(?:_[a-z0-9]+)+$/u.test(label), `${label}: invalid message id`);
  check(!messageIds.has(label), `${label}: duplicate message id`);
  messageIds.add(label);
  check(Boolean(manifest.utm.campaign_by_journey[message.journey]), `${label}: unknown journey`);
  check(["alpine_editorial", "commerce_utility", "founder_field_note"].includes(message.format), `${label}: unknown format`);
  const required = new Set([...(manifest.required_marketing_elements ?? []), ...(message.required_elements ?? [])]);
  for (const element of manifest.required_marketing_elements ?? []) {
    check(required.has(element), `${label}: missing global required element ${element}`);
  }
  check(Array.isArray(message.links) && message.links.length > 0, `${label}: no links defined`);
  for (const link of message.links ?? []) {
    const linkLabel = `${label}.${link.name ?? "unknown-link"}`;
    if (link.kind === "static") inspectStaticUrl(link.url, message.journey, linkLabel);
    else if (link.kind === "dynamic_shopify") inspectDynamicUrl(link, message.journey, linkLabel);
    else failures.push(`${linkLabel}: unsupported link kind ${link.kind}`);
  }
}

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory)) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await htmlFiles(fullPath));
    else if (entry.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function inspectTemplate(html, filename) {
  const size = Buffer.byteLength(html);
  check(size < 90_000, `${filename}: HTML is ${size} bytes and risks Gmail clipping`);
  check(/BASE\s*LAYER/iu.test(html), `${filename}: missing Base Layer brand name`);
  check(/955\s+Harrison\s+St/iu.test(html), `${filename}: missing legal postal address`);
  check(/unsubscribe/iu.test(html), `${filename}: missing visible unsubscribe content`);
  check(/preheader/iu.test(html) || /display\s*:\s*none/iu.test(html), `${filename}: missing preheader`);
  check(/data-bl-primary-cta/iu.test(html), `${filename}: primary CTA must be marked data-bl-primary-cta`);
  check((html.match(/<h1\b/giu) ?? []).length === 1, `${filename}: template must contain exactly one h1`);

  const templateRequirements = new Map([
    ["alpine-editorial.html", ["SKIN15", "30-day money-back guarantee"]],
    ["commerce-utility.html", ["{{ params.url }}", "SHIP26", "30-day money-back guarantee"]],
    ["founder-field-note.html", ["one to two pumps", "15 seconds", "reply to this email"]],
  ]);
  for (const requiredText of templateRequirements.get(path.basename(filename)) ?? []) {
    check(html.toLowerCase().includes(requiredText.toLowerCase()), `${filename}: missing required content ${requiredText}`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/giu)) {
    const tag = match[0];
    check(/\balt\s*=\s*(["'])[^"']+\1/iu.test(tag), `${filename}: image missing non-empty alt text`);
  }

  for (const match of html.matchAll(/href\s*=\s*(["'])(.*?)\1/giu)) {
    const href = match[2].replaceAll("&amp;", "&");
    if (/^(?:mailto:|tel:|#)/iu.test(href) || /unsubscribe/iu.test(href)) continue;
    if (href === "https://baselayerskin.co/privacy-policy") continue;
    const manifestLink = [...(manifest.messages ?? [])].flatMap((message) => message.links.map((link) => link.url))
      .includes(href);
    check(manifestLink, `${filename}: href is not in the canonical link manifest: ${href.slice(0, 120)}`);
  }
}

const templatesFlag = process.argv.indexOf("--templates");
let templateCount = 0;
if (templatesFlag !== -1) {
  const rawDirectory = process.argv[templatesFlag + 1];
  assert(rawDirectory, "--templates requires a directory");
  const directory = path.resolve(repoRoot, rawDirectory);
  const files = await htmlFiles(directory);
  check(files.length > 0, `no HTML templates found in ${directory}`);
  for (const file of files) {
    inspectTemplate(await readFile(file, "utf8"), path.relative(repoRoot, file));
  }
  templateCount = files.length;
}

if (failures.length > 0) {
  console.error(JSON.stringify({ success: false, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    success: true,
    messages: manifest.messages.length,
    uniqueUtmContentValues: checkedContent.size,
    templatesChecked: templateCount,
  }));
}
