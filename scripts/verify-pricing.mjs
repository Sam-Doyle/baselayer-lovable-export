#!/usr/bin/env node
/*
 * Fails loud when src/config/product.ts and Shopify disagree about money.
 *
 * The cart drawer reads its prices from Shopify at runtime, so it can't drift.
 * The PDP can't do the same: the buy tiles are baked into static HTML by the
 * Puppeteer prerender across 59 routes and feed the JSON-LD `offers.price` that
 * Google Merchant Center reconciles against checkout. Fetching those prices at
 * runtime would ship empty prices in the prerendered output and shift layout on
 * the highest-value element on the page.
 *
 * So the tiles stay declared, and this script is the thing that stops them
 * lying — the same job a runtime fetch would do, moved to a moment where a
 * wrong answer costs a failed check instead of a wrong order.
 *
 * Exit codes: 0 agree, 1 drift, 2 couldn't check (network, missing env). Drift
 * and can't-check are deliberately different — a Shopify outage is not a
 * pricing error and shouldn't read like one.
 *
 * Usage: npm run verify:pricing
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_VERSION = '2025-07';

/* ── env ─────────────────────────────────────────────────────────────── */

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* .env is optional — CI may inject the vars directly */ }
  return env;
}

/* ── what this repo claims ───────────────────────────────────────────── */

/*
 * Parsed out of the source rather than imported: product.ts imports a .webp,
 * which plain node can't resolve. The tiers are a flat literal array, so the
 * fields we need come out with three regexes and no build step.
 */
function readDeclaredPricing() {
  const src = readFileSync(resolve(ROOT, 'src/config/product.ts'), 'utf8');

  const gid = (name) => {
    const m = src.match(new RegExp(`const ${name}[^=]*=\\s*"([^"]+)"`));
    return m ? m[1] : null;
  };
  const subscribePrice = Number((src.match(/const SUBSCRIBE_PRICE\s*=\s*([\d.]+)/) || [])[1]);

  const tiers = [];
  for (const block of src.split(/\n\s*\{\s*\n?\s*id:/).slice(1)) {
    const price = Number((block.match(/price:\s*([\d.]+)/) || [])[1]);
    const label = (block.match(/label:\s*"([^"]+)"/) || [])[1];
    const bottles = Number((block.match(/bottles:\s*(\d+)/) || [])[1]);
    const kind = (block.match(/kind:\s*"([^"]+)"/) || [])[1];
    const variant = (block.match(/variantGid:\s*(\w+)/) || [])[1];
    const plan = (block.match(/sellingPlanGid:\s*(\w+)/) || [])[1];
    tiers.push({
      label,
      bottles,
      kind,
      price: kind === 'subscription' && Number.isNaN(price) ? subscribePrice : price,
      variantGid: variant ? gid(variant) : null,
      sellingPlanGid: plan ? gid(plan) : null,
    });
  }

  return {
    handle: (src.match(/PRODUCT_HANDLE\s*=\s*"([^"]+)"/) || [])[1],
    subscribePrice,
    tiers,
  };
}

/* ── what Shopify says ───────────────────────────────────────────────── */

const QUERY = `
  query verify($handle: String!) {
    product(handle: $handle) {
      title
      variants(first: 30) {
        edges {
          node {
            id title availableForSale price { amount currencyCode }
            sellingPlanAllocations(first: 10) {
              edges { node { sellingPlan { id name } } }
            }
          }
        }
      }
      sellingPlanGroups(first: 10) {
        edges {
          node {
            name
            sellingPlans(first: 10) {
              edges {
                node {
                  id
                  name
                  priceAdjustments {
                    orderCount
                    adjustmentValue {
                      __typename
                      ... on SellingPlanFixedPriceAdjustment { price { amount } }
                      ... on SellingPlanFixedAmountPriceAdjustment { adjustmentAmount { amount } }
                      ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchShopify(env, handle) {
  const domain = env.VITE_SHOPIFY_DOMAIN;
  const token = env.VITE_SHOPIFY_STOREFRONT_TOKEN;
  if (!domain || !token) {
    throw new Error('VITE_SHOPIFY_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN must be set (.env or environment).');
  }
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query: QUERY, variables: { handle } }),
  });
  if (!res.ok) throw new Error(`Storefront API returned HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors) throw new Error(body.errors.map(e => e.message).join('; '));
  if (!body.data?.product) throw new Error(`No product found for handle "${handle}"`);
  return body.data.product;
}

/* ── compare ─────────────────────────────────────────────────────────── */

const money = (n) => `$${Number(n).toFixed(2)}`;

/**
 * The price Shopify will charge for one delivery on a selling plan, given the
 * variant it applies to. Only a fixed-price adjustment yields a number that is
 * independent of the variant; the other two are derived from it.
 */
function planPrice(plan, variantPrice) {
  const adjustments = plan.priceAdjustments || [];
  if (adjustments.length === 0) return { price: variantPrice, note: 'no adjustment (charges the variant price)' };
  if (adjustments.length > 1) {
    return { price: null, note: `${adjustments.length} staged price adjustments — this script only checks flat plans` };
  }
  const { orderCount, adjustmentValue: v } = adjustments[0];
  const scope = orderCount === null ? 'every delivery' : `first ${orderCount} deliver${orderCount === 1 ? 'y' : 'ies'} only`;
  switch (v.__typename) {
    case 'SellingPlanFixedPriceAdjustment':
      return { price: Number(v.price.amount), note: `fixed price, ${scope}` };
    case 'SellingPlanFixedAmountPriceAdjustment':
      return { price: variantPrice - Number(v.adjustmentAmount.amount), note: `${money(v.adjustmentAmount.amount)} off, ${scope}` };
    case 'SellingPlanPercentagePriceAdjustment':
      return { price: variantPrice * (1 - Number(v.adjustmentPercentage) / 100), note: `${v.adjustmentPercentage}% off, ${scope}` };
    default:
      return { price: null, note: `unrecognized adjustment type ${v.__typename}` };
  }
}

function compare(declared, product) {
  const problems = [];
  const rows = [];

  const variants = new Map(
    product.variants.edges.map(({ node }) => [node.id, node])
  );
  const plans = new Map(
    product.sellingPlanGroups.edges.flatMap(({ node: group }) =>
      group.sellingPlans.edges.map(({ node: plan }) => [plan.id, { ...plan, groupName: group.name }])
    )
  );

  for (const tier of declared.tiers) {
    if (!tier.variantGid) continue; // deliberately hidden tier — no button renders
    const variant = variants.get(tier.variantGid);
    if (!variant) {
      problems.push(`${tier.label}: variant ${tier.variantGid} does not exist on this product.`);
      continue;
    }
    const variantPrice = Number(variant.price.amount);

    if (!variant.availableForSale) {
      problems.push(`${tier.label}: variant is not available for sale in Shopify, but the tile renders a buy button.`);
    }

    if (tier.kind === 'subscription') {
      const plan = plans.get(tier.sellingPlanGid);
      if (!plan) {
        problems.push(`${tier.label}: selling plan ${tier.sellingPlanGid} is not on this product.`);
        continue;
      }
      const { price, note } = planPrice(plan, variantPrice);
      if (price === null) {
        problems.push(`${tier.label}: ${note}. Shopify's charge can't be verified against the declared ${money(tier.price)}.`);
        rows.push([tier.label, money(tier.price), '?', note]);
        continue;
      }
      rows.push([tier.label, money(tier.price), money(price), note]);
      if (Math.abs(price - tier.price) >= 0.005) {
        problems.push(`${tier.label}: site says ${money(tier.price)}, Shopify charges ${money(price)} (${note}).`);
      }
      // Shopify auto-names plans with the price in them and the name shows at
      // checkout, so a stale name contradicts the page even when the price is right.
      const named = (plan.name.match(/\$([\d.]+)/) || [])[1];
      if (named && Math.abs(Number(named) - tier.price) >= 0.005) {
        problems.push(`${tier.label}: selling plan is named "${plan.name}" — that ${money(named)} shows at checkout and contradicts ${money(tier.price)}.`);
      }
      continue;
    }

    // A multi-bottle tier is one variant priced for the pack, not N x single.
    rows.push([tier.label, money(tier.price), money(variantPrice), variant.title]);
    if (Math.abs(variantPrice - tier.price) >= 0.005) {
      problems.push(`${tier.label}: site says ${money(tier.price)}, Shopify charges ${money(variantPrice)}.`);
    }
  }

  /*
   * Everything above walks the tiers this repo declares and asks whether
   * Shopify agrees. That can only catch a wrong price on an offer we know
   * about — it is blind to an offer Shopify is making that we never declared.
   *
   * Which is a real failure mode, found live on 2026-08-13: the Subscribe &
   * Save plan was attached to the whole product rather than the 1-bottle
   * variant, so its fixed $35 policy also applied to the $68 2-pack. Two
   * bottles for $35 a delivery, forever, was the cheapest way to buy the
   * product and it never appeared on the PDP — the subscription tile hardcodes
   * the single-bottle variant. It surfaced on Instagram Shop, which renders
   * whatever the Storefront API offers.
   *
   * A fixed-price policy is the dangerous shape here because it ignores what
   * the variant costs. Percentage and fixed-amount policies scale with the
   * variant, so an accidental attachment is merely unintended, not ruinous.
   */
  const declaredPairs = new Set(
    declared.tiers
      .filter(t => t.variantGid && t.sellingPlanGid)
      .map(t => `${t.variantGid}::${t.sellingPlanGid}`)
  );

  for (const { node: variant } of product.variants.edges) {
    for (const { node: allocation } of variant.sellingPlanAllocations?.edges ?? []) {
      const planId = allocation.sellingPlan.id;
      if (declaredPairs.has(`${variant.id}::${planId}`)) continue;
      const plan = plans.get(planId);
      const variantPrice = Number(variant.price.amount);
      const { price, note } = plan
        ? planPrice(plan, variantPrice)
        : { price: null, note: 'plan not readable on this product' };
      const charge = price === null ? 'an unverifiable price' : money(price);
      problems.push(
        `"${variant.title}" (${money(variantPrice)}) is also sold on plan "${allocation.sellingPlan.name}" at ${charge} (${note}), which no tier in product.ts declares. Restrict the plan to its intended variants in Shopify admin.`
      );
    }
  }

  return { problems, rows };
}

/* ── run ─────────────────────────────────────────────────────────────── */

const env = loadEnv();
const declared = readDeclaredPricing();

let product;
try {
  product = await fetchShopify(env, declared.handle);
} catch (error) {
  console.error(`\n  Could not check pricing against Shopify: ${error.message}`);
  console.error('  This is not a pricing failure — nothing was verified either way.\n');
  process.exit(2);
}

const { problems, rows } = compare(declared, product);

const width = (i) => Math.max(...rows.map(r => r[i].length), 0);
console.log(`\n  ${product.title} — declared vs Shopify\n`);
for (const row of rows) {
  console.log(`  ${row[0].padEnd(width(0))}  site ${row[1].padStart(width(1))}  shopify ${row[2].padStart(width(2))}  ${row[3]}`);
}

if (problems.length === 0) {
  console.log('\n  Everything the site advertises is what Shopify will charge.\n');
  process.exit(0);
}

console.error(`\n  ${problems.length} pricing mismatch${problems.length === 1 ? '' : 'es'}:\n`);
for (const problem of problems) console.error(`  - ${problem}`);
console.error('\n  Fix Shopify admin or src/config/product.ts so they agree. The Storefront');
console.error('  token here is read-only, so a price change has to happen in admin.\n');
process.exit(1);
