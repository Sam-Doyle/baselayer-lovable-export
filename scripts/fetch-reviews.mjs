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
 * A transient Judge.me outage does not fail the build: reviews.json is
 * committed, so the storefront can serve its last-known-good snapshot. Invalid
 * credentials or unsafe/malformed data do fail the build, keeping the previous
 * production deploy live instead of silently publishing a bad snapshot.
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
import {
  JudgeMeAuthenticationError,
  JudgeMeDataValidationError,
  assertSafeSnapshotReplacement,
  buildReviewSnapshot,
  fetchAllReviews,
} from './lib/judgeme-reviews.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'src/data/reviews.json');

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

/* ── main ────────────────────────────────────────────────────────────── */

const env = loadEnv();
const shopDomain = env.JUDGEME_SHOP_DOMAIN;
const apiToken = env.JUDGEME_PRIVATE_TOKEN;

if (!shopDomain || !apiToken) {
  console.warn('⚠️  JUDGEME_SHOP_DOMAIN / JUDGEME_PRIVATE_TOKEN not set — keeping existing src/data/reviews.json.');
  process.exit(0);
}

try {
  const raw = await fetchAllReviews({
    shopDomain,
    apiToken,
    timeoutMs: Number(env.JUDGEME_REQUEST_TIMEOUT_MS) || 15_000,
  });
  const data = buildReviewSnapshot(raw);
  const existing = JSON.parse(readFileSync(OUT, 'utf8'));
  assertSafeSnapshotReplacement(existing, data, env.JUDGEME_ALLOW_EMPTY_SNAPSHOT === 'true');

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');

  console.log(`✅ ${data.count} published product reviews, ${data.rating || 'no'} average.`);
} catch (err) {
  /*
   * A transient Judge.me outage should not take the storefront down, but an
   * invalid credential will never self-heal. Silently accepting 401/403 here
   * left production pinned to an old snapshot until somebody noticed the
   * review count. Refuse that deployment so Netlify raises a visible build
   * failure while the last known-good production deploy remains online.
   */
  if (err instanceof JudgeMeAuthenticationError || err instanceof JudgeMeDataValidationError) {
    console.error('❌ Judge.me review refresh is unsafe; refusing to replace the last-known-good snapshot:', err.message);
    process.exit(1);
  }
  console.warn('⚠️  Judge.me fetch failed, proceeding with the committed reviews.json:', err.message);
  process.exit(0);
}
