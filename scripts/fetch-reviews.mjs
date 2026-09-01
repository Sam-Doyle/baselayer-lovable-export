#!/usr/bin/env node
/*
 * Pull published Judge.me reviews into src/data/reviews.json at build time.
 *
 * Why a build step rather than a runtime fetch: the PDP is baked into static
 * HTML by the Puppeteer prerender, and review text is the whole point — a
 * runtime fetch would ship an empty block to crawlers and shift layout under
 * the buy box. A synchronous JSON import gets captured by the prerender for
 * free. Same reasoning as verify-pricing.mjs: move the network call to a
 * moment where a wrong answer costs a failed build, not a wrong page.
 *
 * This script never fails the build. Judge.me being down is not a reason for
 * baselayerskin.co to stop deploying, and src/data/reviews.json is committed,
 * so a failed fetch just serves the last good copy. It exits 0 and says so.
 * The one thing it will not do is write a file it isn't sure about.
 *
 * Env (put these in .env, which is gitignored):
 *   JUDGEME_SHOP_DOMAIN  — kpfzdg-kw.myshopify.com. Judge.me registered the
 *                          shop under Shopify's original auto-generated handle,
 *                          NOT base-layer-skin.myshopify.com (the alias the rest
 *                          of this repo uses for the Storefront API) and not the
 *                          shop.baselayerskin.co primary domain. Both handles
 *                          reach the same store; only this one authenticates here.
 *   JUDGEME_PRIVATE_TOKEN — the *private* token, despite this being a read.
 *                          Judge.me's public token 403s on /api/v1/reviews:
 *                          "You are using a public token which does not have
 *                          enough permissions." The public token is scoped to the
 *                          widget API only. This is precisely why the fetch has to
 *                          happen at build time — a browser-side call could never
 *                          hold this credential. Netlify env var, never VITE_*,
 *                          never committed, never imported by src/.
 *
 * Usage: npm run build:reviews
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/data/reviews.json');
const API = 'https://api.judge.me/api/v1/reviews';

/*
 * Display cap. Full review bodies land in the JS bundle, so this is a payload
 * ceiling, not an editorial one — the aggregate below is computed across every
 * review, not just these.
 */
const DISPLAY_CAP = 50;
const PER_PAGE = 100;
const MAX_PAGES = 20; // 2,000 reviews. A runaway-pagination backstop, not a limit we expect to hit.

class JudgeMeAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JudgeMeAuthenticationError';
  }
}

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

/* ── fetch ───────────────────────────────────────────────────────────── */

async function fetchAllReviews(shopDomain, apiToken) {
  const all = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${API}?${new URLSearchParams({
      api_token: apiToken,
      shop_domain: shopDomain,
      published: 'true',
      per_page: String(PER_PAGE),
      page: String(page),
    })}`;

    const res = await fetch(url);

    if (res.status === 401) {
      /*
       * Judge.me returns one 401 for both a wrong token and an unrecognised
       * shop_domain, so name both. The domain is the likelier culprit: Judge.me
       * keys off the original myshopify handle, which here is neither the
       * primary domain nor the alias the rest of this repo uses.
       */
      throw new JudgeMeAuthenticationError(
        `401 from Judge.me. Check JUDGEME_SHOP_DOMAIN and JUDGEME_PRIVATE_TOKEN against ` +
        `Settings > Integrations > View API tokens — the shop domain is printed on that ` +
        `same page and is the usual culprit. Tried shop_domain="${shopDomain}".`
      );
    }
    if (res.status === 403) {
      throw new JudgeMeAuthenticationError(
        `403 from Judge.me — this is what the *public* token returns for /api/v1/reviews. ` +
        `JUDGEME_PRIVATE_TOKEN must hold the private token.`
      );
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} from Judge.me`);

    const batch = (await res.json()).reviews ?? [];
    all.push(...batch);
    if (batch.length < PER_PAGE) return all;
  }

  console.warn(`⚠️  Hit the ${MAX_PAGES}-page ceiling; aggregate covers the first ${all.length} reviews only.`);
  return all;
}

/* ── shape ───────────────────────────────────────────────────────────── */

/*
 * Judge.me's `verified` field is an enum, not a boolean, and five of its values
 * mean "this person bought it":
 *
 *   buyer                   — came from a Judge.me review request email
 *   confirmed-buyer         — web review, email matched an order, link clicked
 *   verified-purchase       — buyer tied to the specific order being reviewed
 *   semi-verified-purchase  — resubmission of the same purchase
 *   admin                   — verified by hand by a Judge.me agent
 *
 * Three mean it isn't: `nothing`, `not-yet`, `unconfirmed-buyer`.
 *
 * This accepted only 'buyer' until 2026-08-12, which is why the first real
 * verified review showed a tick in the Judge.me dashboard and no badge on the
 * site — hers came back `confirmed-buyer`. The bug was invisible for exactly as
 * long as there were no verified reviews to render, which is the worst shape a
 * bug can have: it looked like "we have no verified buyers yet."
 *
 * Deliberately an allowlist rather than "anything not in the unverified set". A
 * status Judge.me adds later should default to *no* badge. Claiming a
 * verification that doesn't exist is the 16 CFR 465 failure; missing one that
 * does is a smaller, self-correcting problem.
 */
const VERIFIED_STATUSES = new Set([
  'buyer',
  'confirmed-buyer',
  'verified-purchase',
  'semi-verified-purchase',
  'admin',
]);

function normalize(raw) {
  return {
    id: raw.id,
    rating: raw.rating,
    title: raw.title ?? '',
    body: raw.body ?? '',
    reviewer: raw.reviewer?.name ?? 'Anonymous',
    verified: raw.verified === true || VERIFIED_STATUSES.has(raw.verified),
    createdAt: (raw.created_at ?? '').slice(0, 10),
    pictures: (raw.pictures ?? []).map(p => p.urls?.huge ?? p.urls?.original).filter(Boolean).map(sizePhoto),
  };
}

/*
 * Judge.me hands back `?width=1024` images. They render in a 160px box on the
 * PDP, so the default costs ~200 KB apiece to draw a thumbnail — with three
 * photographed reviews that is 600 KB of wasted mobile payload below the buy box.
 * 320 covers 160px at 2x DPR. Only rewrite a width that is already there, so a
 * change to Judge.me's URL shape degrades to the original URL rather than a 404.
 */
const PHOTO_WIDTH = 320;
function sizePhoto(url) {
  try {
    const u = new URL(url);
    if (!u.searchParams.has('width')) return url;
    u.searchParams.set('width', String(PHOTO_WIDTH));
    return u.toString();
  } catch {
    return url;
  }
}

/*
 * Judge.me serves the shop's *store* reviews from the same endpoint as product
 * reviews, tagged product_external_id 0 / "Judge.me Shop Reviews". They are real
 * reviews, but they are about the brand, and rendering them under "Customer
 * Reviews" on a product page attributes them to the product — a
 * misattribution 16 CFR 465 covers directly. It also double-counts anyone who
 * left both, which is what put the same reviewer on the PDP twice.
 *
 * Filtering client-side rather than passing product_id to the API: one request
 * either way at this volume, and the drop count gets logged, which a
 * server-side filter would hide.
 *
 * Must match PRODUCT_GID in src/config/product.ts. There is one SKU; when there
 * are two, this becomes a parameter and the snapshot becomes per-product.
 */
const PRODUCT_EXTERNAL_ID = 7469557612615;

function build(rawReviews) {
  const forProduct = rawReviews.filter(r => Number(r.product_external_id) === PRODUCT_EXTERNAL_ID);
  const dropped = rawReviews.length - forProduct.length;
  if (dropped > 0) {
    console.log(`   ${dropped} review(s) excluded — store reviews or another product, not this PDP.`);
  }

  const reviews = forProduct.map(normalize);
  const count = reviews.length;

  /*
   * Averaged across every review, then displayed to one decimal. Never round
   * up to a friendlier number: kb/wiki/customer-insights.md records a false
   * "4.8/5 · 1,000+ customers" claim that had to be pulled, and the point of
   * sourcing this from the API is that it can't happen twice. Anything above
   * 4.7 reads as fake to shoppers anyway.
   */
  const rating = count
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
    : 0;

  /*
   * Photo reviews first, then newest. 62% of shoppers are likelier to buy when
   * they can see the product on a real face. Deliberately NOT sorted by rating
   * in either direction — 82% of shoppers go looking for the critical ones, and
   * reordering to bury them is an FTC 16 CFR 465 problem on top of a conversion
   * one.
   */
  const sorted = [...reviews].sort((a, b) => {
    const photos = (b.pictures.length > 0) - (a.pictures.length > 0);
    return photos || b.createdAt.localeCompare(a.createdAt);
  });

  /*
   * Star counts for the breakdown bars, index 0 = 1-star.
   *
   * Computed across every review, not the DISPLAY_CAP slice, for the same
   * reason `rating` is: the bars sit directly under "Based on N reviews" and
   * have to sum to that N. Deriving them client-side from the capped array
   * would quietly undercount the moment the 51st review lands.
   */
  const histogram = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) histogram[r.rating - 1] += 1;
  }

  return {
    fetchedAt: new Date().toISOString().slice(0, 10),
    rating,
    count,
    histogram,
    reviews: sorted.slice(0, DISPLAY_CAP),
  };
}

/* ── main ────────────────────────────────────────────────────────────── */

const env = loadEnv();
const shopDomain = env.JUDGEME_SHOP_DOMAIN;
const apiToken = env.JUDGEME_PRIVATE_TOKEN;

if (!shopDomain || !apiToken) {
  console.warn('⚠️  JUDGEME_SHOP_DOMAIN / JUDGEME_PRIVATE_TOKEN not set — keeping existing src/data/reviews.json.');
  process.exit(0);
}

try {
  const raw = await fetchAllReviews(shopDomain, apiToken);
  const data = build(raw);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');

  // Keep REVIEW_GATE in sync with src/lib/reviews.ts and vite.config.ts.
  const REVIEW_GATE = 1;
  const gated = data.count >= REVIEW_GATE ? '' : ` — below the ${REVIEW_GATE}-review gate, the PDP block stays hidden`;
  console.log(`✅ ${data.count} reviews, ${data.rating || 'no'} average${gated}.`);
} catch (err) {
  /*
   * A transient Judge.me outage should not take the storefront down, but an
   * invalid credential will never self-heal. Silently accepting 401/403 here
   * left production pinned to an old snapshot until somebody noticed the
   * review count. Refuse that deployment so Netlify raises a visible build
   * failure while the last known-good production deploy remains online.
   */
  if (err instanceof JudgeMeAuthenticationError) {
    console.error('❌ Judge.me authentication failed; refusing to deploy stale review data:', err.message);
    process.exit(1);
  }
  console.warn('⚠️  Judge.me fetch failed, proceeding with the committed reviews.json:', err.message);
  process.exit(0);
}
