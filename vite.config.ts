/// <reference lib="dom" />

import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import compression from "vite-plugin-compression";
import type { HTTPRequest } from "puppeteer";
import * as fs from "fs";
import * as http from "http";
import { execFileSync } from "child_process";
// Relative, not "@/config/pageSeo" — the alias is defined by this file and
// isn't resolvable while it loads.
import { PAGE_SEO, BASE_URL, PRODUCT_OG_IMAGE } from "./src/config/pageSeo";

// ── Prerender plugin (closeBundle) ────────────────────────────────

const PRODUCT_OG_IMAGE_ALT = "Base Layer Daily Face Cream bottle and carton in the Colorado mountains";

/*
 * This file used to read src/data/reviews.json and inject an aggregateRating
 * into Product schemas for /matte-moisturizer-for-men,
 * /non-greasy-moisturizer-for-men and /all-in-one-skincare-for-men. Removed on
 * 2026-08-17 for two reasons, both found by reading the served HTML.
 *
 * First, each of those routes is a React page that already emits its own
 * Product block, so every one of them shipped two Product entities with the
 * same sku (BL-PDFC-50ML) and *different* names — the injected one said
 * "Base Layer Performance Face Moisturizer — …", the component said
 * "Base Layer Performance Daily Face Cream — …". Google picks one of a pair
 * like that on its own and the rated half was the one with the weaker offer
 * (no shippingDetails, no hasMerchantReturnPolicy, no priceSpecification).
 *
 * Second and more seriously: none of those three pages renders a star rating
 * anywhere in its UI. Google requires the rating in aggregateRating markup to
 * be visible to the user on the same page, so this was marked-up-but-unshown
 * proof — the shape of thing that costs rich results site-wide, not just on
 * the offending URL. /face-cream is the only route that displays the Judge.me
 * aggregate, and it is now the only route that claims one.
 *
 * If a landing page ever gets a visible <StarRating>, import reviewAggregate
 * from src/lib/reviews.ts in that component rather than reviving this — one
 * source, and it can't drift from what the page actually shows.
 */

interface PageMeta {
  path: string;
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>[];
  changefreq?: string;
  priority?: string;
  /** YYYY-MM-DD. Omitted when we can't establish one honestly — see gitLastModified. */
  lastmod?: string;
}

/*
 * Source file behind each prerendered static route, used to date its sitemap
 * entry. Sanity-backed routes don't appear here; they carry _updatedAt.
 *
 * This dates a page by its own component, not by its whole import graph, so a
 * change confined to a shared child (Footer, merchantSchema) won't move it.
 * That under-reports rather than over-reports, which is the safe direction:
 * Google punishes sitemaps that claim freshness they can't back up, and
 * ignores lastmod wholesale once it decides a site inflates it.
 */
const STATIC_PAGE_SOURCES: Record<string, string> = {
  "/": "src/pages/Index.tsx",
  "/face-cream": "src/pages/FaceCream.tsx",
  "/about": "src/pages/About.tsx",
  "/articles": "src/pages/Articles.tsx",
  "/ingredients": "src/pages/Ingredients.tsx",
  "/skin-concerns": "src/pages/SkinConcerns.tsx",
  "/comparisons": "src/pages/Comparisons.tsx",
  "/matte-moisturizer-for-men": "src/pages/MatteMoisturizer.tsx",
  "/non-greasy-moisturizer-for-men": "src/pages/NonGreasyMoisturizer.tsx",
  "/all-in-one-skincare-for-men": "src/pages/AllInOneSkincare.tsx",
  "/privacy-policy": "src/pages/PrivacyPolicy.tsx",
  "/terms-of-service": "src/pages/TermsOfService.tsx",
  "/refund-policy": "src/pages/RefundPolicy.tsx",
  "/shipping-policy": "src/pages/ShippingPolicy.tsx",
};

/**
 * Author date of the last commit to touch `file`, as YYYY-MM-DD, or undefined.
 *
 * Undefined is a real outcome, not just an error path. An absent lastmod is a
 * normal sitemap; a wrong one is a lie Google can catch by comparing it against
 * what actually changed, and the penalty is that it stops trusting the field
 * for the whole site.
 *
 * The shallow check is not paranoia. In a --depth=1 clone `git log -1 -- <path>`
 * does not fail and does not return empty: it returns the one commit it has,
 * which is the deploy commit, so every static route would claim it changed
 * today on every deploy — the exact inflation this function exists to prevent,
 * and silent, because a valid-looking date comes back. Netlify's checkout has
 * full history today (verified against the live sitemap on 2026-08-17, which
 * carried eleven distinct dates back to March), so this is a guard against that
 * changing, not a live workaround. If the warning ever fires, the sitemap stays
 * honest and the fix is to restore history in the build, not to loosen this.
 */
function gitHistoryIsShallow(): boolean {
  try {
    return (
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === "true"
    );
  } catch {
    return true; // no git at all — same conclusion, no dates to be had
  }
}

function gitLastModified(file: string, shallow: boolean): string | undefined {
  if (shallow) return undefined;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
  } catch {
    return undefined;
  }
}

/** Sanity's _updatedAt ISO timestamp narrowed to the YYYY-MM-DD sitemap wants. */
function sanityDate(updatedAt?: string): string | undefined {
  const day = updatedAt?.split("T")[0];
  return day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined;
}

/*
 * Titles and descriptions live in src/config/pageSeo.ts, which the page
 * components read too. They used to be declared here as well, and the two
 * copies had drifted apart on ten of the fourteen routes — this file wrote one
 * title into the prerendered HTML and useMetaTags replaced it with a different
 * one the moment React hydrated.
 *
 * No jsonLd is declared for any static route: every one of these paths is a
 * React page that emits its own Product/Article/FAQ blocks, and Puppeteer runs
 * them during prerender, so declaring schema here would ship a second, rival
 * entity for the same URL (see the aggregateRating note at the top of this
 * file for what that cost us). jsonLd stays on PageMeta only for dynamic
 * Sanity-backed routes, which have no component-level schema of their own.
 */
const STATIC_PAGES: PageMeta[] = Object.entries(PAGE_SEO).map(([path, seo]) => ({
  path,
  ...seo,
}));

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Replace a meta tag's content, tolerating attribute wrapping across lines
// and self-closing " />" endings — index.html has both, and a rigid regex
// silently no-ops (every page then ships the homepage default).
function replaceMetaTag(html: string, attr: "name" | "property", key: string, content: string): string {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);
  return html.replace(re, `<meta ${attr}="${key}" content="${content}">`);
}

function injectMeta(html: string, page: PageMeta): string {
  const ogImage = page.ogImage || PRODUCT_OG_IMAGE;
  const ogType = page.ogType || "website";
  const canonicalUrl = `${BASE_URL}${page.path}`;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceMetaTag(html, "name", "description", escapeAttr(page.description));
  html = replaceMetaTag(html, "property", "og:title", escapeAttr(page.title));
  html = replaceMetaTag(html, "property", "og:description", escapeAttr(page.description));
  html = replaceMetaTag(html, "property", "og:type", escapeAttr(ogType));
  html = replaceMetaTag(html, "property", "og:image", escapeAttr(ogImage));
  html = replaceMetaTag(html, "name", "twitter:title", escapeAttr(page.title));
  html = replaceMetaTag(html, "name", "twitter:description", escapeAttr(page.description));
  html = replaceMetaTag(html, "name", "twitter:image", escapeAttr(ogImage));

  // Update og:image:alt and og:site_name for social crawlers
  html = replaceMetaTag(html, "property", "og:image:alt", PRODUCT_OG_IMAGE_ALT);
  html = replaceMetaTag(html, "name", "twitter:image:alt", PRODUCT_OG_IMAGE_ALT);

  // Add canonical URL
  if (!html.includes('rel="canonical"')) {
    html = html.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}">\n  </head>`);
  }

  // Fix og:url to match the actual page
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonicalUrl}">`
  );

  // Inject JSON-LD
  if (page.jsonLd && page.jsonLd.length > 0) {
    const jsonLdTags = page.jsonLd
      .map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`)
      .join("\n  ");
    html = html.replace("</head>", `  ${jsonLdTags}\n  </head>`);
  }

  return html;
}

/*
 * lastmod is per-page and omitted when unknown. It used to be `today` on every
 * entry, which meant all 60 URLs claimed to change on every deploy. Google
 * explicitly discounts lastmod when a sitemap's values don't track real content
 * changes, and a whole file sharing one build timestamp is the clearest version
 * of that signal, so the field was worth nothing while it looked complete. Two
 * of the paid landing pages sat un-recrawled from May to August under it.
 *
 * Static routes date from their component's last commit, Sanity routes from
 * _updatedAt. Anything we can't date gets no lastmod at all, which is valid and
 * is what Google asks for when an accurate value isn't available.
 */
function generateSitemap(pages: PageMeta[]): string {
  const urls = pages
    .filter((p) => p.path !== "/checkout")
    .map(
      (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ""}
    <changefreq>${p.changefreq || "monthly"}</changefreq>
    <priority>${p.priority || "0.5"}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function prerenderPlugin(): Plugin {
  return {
    name: "prerender-seo",
    apply: "build",
    async closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");
      const indexPath = path.join(distDir, "index.html");

      if (!fs.existsSync(indexPath)) {
        console.log("⚠️  dist/index.html not found — skipping prerender.");
        return;
      }

      const baseHtml = fs.readFileSync(indexPath, "utf-8");

      // Keep Vite's generated stylesheet render-blocking. The prerendered DOM
      // uses the full Tailwind utility set, so applying that CSS asynchronously
      // produces a flash of unstyled layout and a near-1.0 CLS. The compressed
      // stylesheet is small enough that visual stability is the better trade.

      // ── LCP Optimization 1: Per-page hero image preloads ───────
      // Scan built assets for hero image variants so each page gets
      // the correct preload (homepage vs face-cream vs none).
      const distAssetsDir = path.join(distDir, "assets");
      const builtFiles = fs.existsSync(distAssetsDir) ? fs.readdirSync(distAssetsDir) : [];
      const findBuilt = (re: RegExp) => builtFiles.find(f => re.test(f));

      function heroSrcset(prefix: string): string {
        const variants = [480, 768, 824, 1200]
          .map((w) => ({ f: findBuilt(new RegExp(`^${prefix}-${w}w[^.]*\\.webp$`)), w }))
          .filter(v => v.f) as { f: string; w: number }[];
        if (!variants.length) return "";
        return variants.map(v => `/assets/${v.f} ${v.w}w`).join(", ");
      }

      function preloadTag(srcset: string, sizes = "100vw", media?: string): string {
        if (!srcset) return "";
        const mediaAttribute = media ? ` media="${media}"` : "";
        return `<link rel="preload" as="image" type="image/webp"${mediaAttribute} imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high">`;
      }

      // /face-cream now opens on the first product-carousel image. Keep its
      // preload in lockstep with that actual LCP resource; preloading the old
      // product-on-rock creative caused an avoidable second image transfer.
      const productGallerySrcset = heroSrcset("base-layer-carousel-01-primary");
      const legacyLandingSrcset = heroSrcset("product-hero-rock");

      const homeProductImage = findBuilt(/^hero-mountain-packshot-v2-(?!480w-|768w-|1200w-|mobile-)[^.]+\.webp$/);
      const homeResponsiveSrcset = heroSrcset("hero-mountain-packshot-v2");
      const homeMobileSrcset = heroSrcset("hero-mountain-packshot-v2-mobile");
      const homeProductSrcset = [
        homeResponsiveSrcset,
        homeProductImage ? `/assets/${homeProductImage} 1536w` : "",
      ].filter(Boolean).join(", ");
      const homeProductPreload = [
        preloadTag(homeMobileSrcset, "100vw", "(max-width: 768px)"),
        preloadTag(homeProductSrcset, "min(49vw, 706px)", "(min-width: 769px)"),
      ].filter(Boolean).join("\n  ");

      const heroPreloadForPage: Record<string, string> = {
        "/": homeProductPreload,
        "/face-cream": preloadTag(
          productGallerySrcset,
          "(max-width: 768px) 100vw, min(50vw, 576px)",
        ),
        "/matte-moisturizer-for-men": preloadTag(legacyLandingSrcset),
        "/non-greasy-moisturizer-for-men": preloadTag(legacyLandingSrcset),
        "/all-in-one-skincare-for-men": preloadTag(legacyLandingSrcset),
      };

      // ── LCP Optimization 2: Hero image in HTML skeleton ───────
      // Bake the hero <picture> directly into the skeleton so the
      // browser can paint the LCP image at FCP, without waiting
      // for React to hydrate.
      function heroPictureTag(prefix: string, altText: string): string {
        const srcset = heroSrcset(prefix);
        const fallback = findBuilt(new RegExp(`^${prefix}-(?!\\d+w)[^.]+\\.(jpg|png)$`));
        if (!srcset || !fallback) return "";
        return `<picture><source type="image/webp" srcset="${srcset}" sizes="100vw"><img src="/assets/${fallback}" alt="${altText}" width="1200" height="800" fetchpriority="high" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></picture>`;
      }

      const homeHeroPicture = homeProductImage
        ? `<picture><source media="(max-width: 768px)" srcset="${homeMobileSrcset}" sizes="100vw"><img src="/assets/${homeProductImage}" srcset="${homeProductSrcset}" sizes="min(49vw, 706px)" alt="Base Layer Daily Face Cream bottle and carton on Colorado alpine granite" width="1536" height="1536" fetchpriority="high"></picture>`
        : "";
      const productGalleryFallback = findBuilt(/^base-layer-carousel-01-primary-768w[^.]*\.webp$/);
      const productGalleryPicture = productGallerySrcset && productGalleryFallback
        ? `<picture><img src="/assets/${productGalleryFallback}" srcset="${productGallerySrcset}" sizes="(max-width: 768px) 100vw, min(50vw, 576px)" alt="Base Layer Daily Face Cream bottle and carton" width="1254" height="1254" fetchpriority="high" style="display:block;width:100%;height:100%;object-fit:cover"></picture>`
        : "";
      const legacyLandingHeroPicture = heroPictureTag("product-hero-rock", "Base Layer face cream");

      // ── LCP Optimization 3: Above-the-fold skeletons ───────────
      // Bake real hero content into the HTML so LCP paints with FCP,
      // before React hydrates. Saves ~500-1000ms on mobile.
      const homeSkeleton = `<style>#bl-home-skeleton{min-height:100svh;background:#F2EFE8;padding-top:96px;display:flex;flex-direction:column;overflow:hidden}#bl-home-visual{height:226px;position:relative;overflow:hidden;order:1;background:#D8D3CA}#bl-home-visual img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 51%}#bl-home-copy{order:2;padding:28px 20px;color:#1A2F4C}#bl-home-copy p{font-family:Inter,sans-serif}#bl-home-copy h1{font-family:Montserrat,sans-serif;font-size:clamp(40px,10.8vw,60px);font-weight:900;text-transform:uppercase;line-height:.91;letter-spacing:-.05em;word-spacing:.1em;margin:0;color:#1A2F4C}@media(min-width:769px){#bl-home-skeleton{display:grid;grid-template-columns:1.02fr .98fr;min-height:100svh}#bl-home-visual{order:2;height:calc(100svh - 96px)}#bl-home-visual img{object-position:center}#bl-home-copy{order:1;padding:64px 80px;display:flex;flex-direction:column;justify-content:center}#bl-home-copy h1{font-size:clamp(60px,5.2vw,82px)}}</style><div id="bl-home-skeleton"><div id="bl-home-visual">${homeHeroPicture}</div><div id="bl-home-copy"><p style="font-size:11px;font-weight:600;letter-spacing:.25em;text-transform:uppercase;color:rgba(26,47,76,.65);margin:0 0 12px">Daily Face Moisturizer</p><h1>ONE STEP.<br>ZERO SHINE.</h1><p style="font-size:16px;line-height:1.55;color:rgba(26,47,76,.78);max-width:560px;margin:20px 0 0">Fast-absorbing hydration for dry air, sun, wind, and bad sleep. Put it on in 15 seconds. Forget it's there.</p></div></div>`;

      const productGallerySkeleton = `<div style="min-height:100vh;background:#fff;padding-top:96px"><div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;padding:32px 48px"><div style="aspect-ratio:1;background:#e2e8f0">${productGalleryPicture}</div><div style="padding-top:8px;color:#1a2f4c"><p style="font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;margin:0 0 12px">Founding Offer</p><h1 style="font-family:Montserrat,sans-serif;font-size:28px;line-height:1.2;margin:0 0 20px">Performance Daily Face Cream</h1><p style="font-family:Montserrat,sans-serif;font-size:32px;font-weight:700;margin:0">$68</p></div></div><style>@media(max-width:768px){#root>div>div{display:block!important;padding:0!important}#root>div>div>div:nth-child(2){padding:24px 20px!important}}</style></div>`;
      const legacyLandingSkeleton = `<div style="min-height:100vh;background:#0a0a0a;position:relative;overflow:hidden;padding-top:88px">${legacyLandingHeroPicture}<div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.7))"></div><div style="position:relative;z-index:10;max-width:80rem;margin:0 auto;padding:2rem 1.5rem;text-align:center"><h1 style="font-family:'DM Sans',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#ebebeb;margin:0 0 1rem">Best Men's Face Moisturizer</h1><p style="font-family:Inter,sans-serif;font-size:1.5rem;font-weight:700;color:#ebebeb;margin:0">$38</p></div></div>`;

      const skeletonForPage: Record<string, string> = {
        "/": homeSkeleton,
        "/face-cream": productGallerySkeleton,
        "/matte-moisturizer-for-men": legacyLandingSkeleton,
        "/non-greasy-moisturizer-for-men": legacyLandingSkeleton,
        "/all-in-one-skincare-for-men": legacyLandingSkeleton,
      };

      // Save generic shell (SPA fallback for unknown routes)
      const shellHtml = baseHtml;

      // ── Fetch dynamic pages from Sanity ─────────────────────────
      const dynamicPages: PageMeta[] = [];
      try {
        const { createClient } = await import("@sanity/client");
        const sanity = createClient({
          projectId: "27quz10a",
          dataset: "production",
          apiVersion: "2024-01-01",
          useCdn: false,
        });

        const [articles, ingredients, concerns, comparisons] = await Promise.all([
          sanity.fetch(`*[_type == "article" && defined(body)]{ _updatedAt, title, "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), excerpt }`),
          sanity.fetch(`*[_type == "ingredient" && (defined(body) || defined(description)) && !(slug.current in ["retinol", "vitamin-c"])]{ _updatedAt, name, "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), "overview": coalesce(overview, extractableSummary) }`),
          sanity.fetch(`*[_type == "skinConcern" && (defined(body) || defined(overview))]{ _updatedAt, "name": coalesce(name, title), "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), "overview": coalesce(overview[0].children[0].text, extractableSummary) }`),
          sanity.fetch(`*[_type == "comparison"]{ _updatedAt, title, "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), intro }`),
        ]);

        for (const a of articles) {
          const articleTitle = a.metaTitle || `${a.title} | Base Layer`;
          const articleDesc = a.metaDescription || a.excerpt || "";
          dynamicPages.push({
            path: `/articles/${a.slug}`,
            lastmod: sanityDate(a._updatedAt),
            title: articleTitle,
            description: articleDesc,
            ogType: "article",
            ogImage: `${BASE_URL}/og-articles.jpg`,
            changefreq: "monthly",
            priority: "0.7",
            jsonLd: [
              {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: a.title,
                description: articleDesc,
                author: { "@type": "Organization", name: "Base Layer" },
                publisher: { "@type": "Organization", name: "Base Layer", url: BASE_URL },
                mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/articles/${a.slug}` },
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
                  { "@type": "ListItem", position: 2, name: "Articles", item: `${BASE_URL}/articles` },
                  { "@type": "ListItem", position: 3, name: a.title },
                ],
              },
            ],
          });
        }
        for (const i of ingredients) {
          dynamicPages.push({
            path: `/ingredients/${i.slug}`,
            lastmod: sanityDate(i._updatedAt),
            title: i.metaTitle || `${i.name} — Skincare Ingredient Guide | Base Layer`,
            description: i.metaDescription || i.overview || "",
            ogImage: `${BASE_URL}/og-ingredients.jpg`,
            changefreq: "monthly",
            priority: "0.7",
            jsonLd: [
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
                  { "@type": "ListItem", position: 2, name: "Ingredients", item: `${BASE_URL}/ingredients` },
                  { "@type": "ListItem", position: 3, name: i.name },
                ],
              },
            ],
          });
        }
        for (const c of concerns) {
          dynamicPages.push({
            path: `/skin-concerns/${c.slug}`,
            lastmod: sanityDate(c._updatedAt),
            title: c.metaTitle || `${c.name} — Men's Skin Guide | Base Layer`,
            description: c.metaDescription || c.overview || "",
            ogImage: `${BASE_URL}/og-skin-concerns.jpg`,
            changefreq: "monthly",
            priority: "0.7",
            jsonLd: [
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
                  { "@type": "ListItem", position: 2, name: "Skin Concerns", item: `${BASE_URL}/skin-concerns` },
                  { "@type": "ListItem", position: 3, name: c.name },
                ],
              },
            ],
          });
        }
        for (const comp of comparisons) {
          dynamicPages.push({
            path: `/comparisons/${comp.slug}`,
            lastmod: sanityDate(comp._updatedAt),
            title: comp.metaTitle || `${comp.title} | Base Layer`,
            description: comp.metaDescription || comp.intro || "",
            ogImage: `${BASE_URL}/og-comparisons.jpg`,
            changefreq: "monthly",
            priority: "0.7",
            jsonLd: [
              {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: comp.title,
                description: comp.metaDescription || comp.intro || "",
                author: { "@type": "Organization", name: "Base Layer" },
                publisher: { "@type": "Organization", name: "Base Layer", url: BASE_URL },
                mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/comparisons/${comp.slug}` },
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
                  { "@type": "ListItem", position: 2, name: "Comparisons", item: `${BASE_URL}/comparisons` },
                  { "@type": "ListItem", position: 3, name: comp.title },
                ],
              },
            ],
          });
        }

        console.log(`📡 Fetched ${dynamicPages.length} dynamic pages from Sanity`);
      } catch (err) {
        console.warn("⚠️  Sanity fetch failed, proceeding with static pages only:", err);
      }

      const shallow = gitHistoryIsShallow();
      const staticPages = STATIC_PAGES.map((p) => ({
        ...p,
        lastmod: gitLastModified(STATIC_PAGE_SOURCES[p.path] ?? "", shallow),
      }));
      const undatedStatic = staticPages.filter((p) => !p.lastmod).length;
      if (undatedStatic > 0) {
        console.warn(
          `\u26a0\ufe0f  ${undatedStatic}/${staticPages.length} static routes have no git date` +
            `${shallow ? " (shallow clone \u2014 the build needs full history)" : ""}` +
            ` \u2014 shipping those sitemap entries without lastmod.`
        );
      }

      const allPages = [...staticPages, ...dynamicPages];
      console.log(`📄 Generating ${allPages.length} pre-rendered HTML files...`);

      // Track non-root paths for _redirects generation
      const prerenderedPaths: string[] = [];

      for (const page of allPages) {
        let html = injectMeta(baseHtml, page);

        // Inject correct hero image preload for this page — early in <head>
        // so the browser discovers it before render-blocking CSS/JS.
        // First, strip any generic hero preload from the source template.
        html = html.replace(/\s*<link rel="preload" as="image"[^>]*(?:hero-guy-orange|hero-product-mountain|product-in-hand|hero-mountain-packshot-v2)[^>]*>\n?/g, "");
        const hPreload = heroPreloadForPage[page.path] || "";
        if (hPreload) {
          html = html.replace(
            /<meta name="viewport"[^>]*>/,
            (match) => `${match}\n  ${hPreload}`
          );
        }

        // Inject page-specific above-the-fold skeleton
        const skeleton = skeletonForPage[page.path];
        if (skeleton) {
          html = html.replace(
            /<!--SKELETON-->[\s\S]*?<!--\/SKELETON-->/,
            `<!--SKELETON-->${skeleton}<!--/SKELETON-->`
          );
        }

        if (page.path === "/") {
          fs.writeFileSync(indexPath, html);
        } else {
          // Write as directory index (e.g. dist/face-cream/index.html)
          // Most hosting platforms auto-serve index.html from directories
          const dirPath = path.join(distDir, page.path.replace(/^\//, ""));
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(path.join(dirPath, "index.html"), html);
          prerenderedPaths.push(page.path);
        }
        console.log(`  ✅ ${page.path}`);
      }

      // ── Puppeteer SSR: render full page content into HTML ──────────
      // Serve dist/ locally, open each route in headless Chrome,
      // wait for React to render, then capture the #root innerHTML.
      // This gives crawlers the full page content instead of just a skeleton.
      const PUPPETEER_CONCURRENCY = 4;
      const PAGE_TIMEOUT = 20_000;
      const SKIP_PRERENDER_PATHS = ["/checkout"];

      const pagesToRender = allPages.filter(
        (p) => !SKIP_PRERENDER_PATHS.includes(p.path)
      );

      try {
        const puppeteer = await import("puppeteer");

        // Spin up a static file server for dist/
        const server = http.createServer((req, res) => {
          let url = req.url || "/";
          // Strip query strings
          url = url.split("?")[0];
          // For SPA routing: if a file exists serve it, otherwise fall back to the route's index.html or dist/index.html
          let filePath = path.join(distDir, url);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, "index.html");
          }
          if (!fs.existsSync(filePath)) {
            // SPA fallback
            filePath = indexPath;
          }
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            ".html": "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".woff2": "font/woff2",
            ".woff": "font/woff",
            ".ico": "image/x-icon",
          };
          res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
          fs.createReadStream(filePath).pipe(res);
        });

        const PORT = 54321 + Math.floor(Math.random() * 1000);
        await new Promise<void>((resolve) => server.listen(PORT, "127.0.0.1", resolve));
        console.log(`\n🌐 Prerender server listening on http://127.0.0.1:${PORT}`);

        const browser = await puppeteer.default.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            // Allow cross-origin Sanity API requests from localhost
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
          ],
        });

        let rendered = 0;
        let failed = 0;

        // Process pages in batches for concurrency control
        for (let i = 0; i < pagesToRender.length; i += PUPPETEER_CONCURRENCY) {
          const batch = pagesToRender.slice(i, i + PUPPETEER_CONCURRENCY);
          await Promise.all(
            batch.map(async (page) => {
              const pageUrl = `http://127.0.0.1:${PORT}${page.path}`;
              let pageInstance;
              try {
                pageInstance = await browser.newPage();
                // Block analytics / tracking scripts to speed up rendering
                await pageInstance.setRequestInterception(true);
                pageInstance.on("request", (req: HTTPRequest) => {
                  const reqUrl = req.url();
                  if (
                    reqUrl.includes("googletagmanager.com") ||
                    reqUrl.includes("google-analytics.com") ||
                    reqUrl.includes("facebook.net") ||
                    reqUrl.includes("facebook.com/tr") ||
                    reqUrl.includes("supabase.co/functions")
                  ) {
                    req.abort();
                  } else {
                    req.continue();
                  }
                });

                await pageInstance.goto(pageUrl, {
                  waitUntil: "networkidle0",
                  timeout: PAGE_TIMEOUT,
                });

                // Wait for React to mount and render meaningful content.
                // Two-phase wait: first for basic structure, then for
                // dynamic content from Sanity API calls to load.
                //
                // `polling` is load-bearing on both waits. Puppeteer's default
                // is requestAnimationFrame, and a headless page stops painting
                // once it settles, so the predicate stops being re-evaluated
                // and anything that mounts after that first paint is invisible
                // to it. The homepage is exactly that case: HomeBelowFold (and
                // with it the <footer>) is deliberately deferred ~3s to keep it
                // off the LCP path, so `/` timed out at 20s while the footer
                // sat in the DOM the whole time, and shipped as a skeleton.
                await pageInstance.waitForFunction(
                  () => {
                    const root = document.getElementById("root");
                    if (!root) return false;
                    const hasNav = root.querySelector("nav") !== null;
                    const hasFooter = root.querySelector("footer") !== null;
                    // Basic structure is ready when nav + footer exist
                    return hasNav && hasFooter;
                  },
                  { timeout: PAGE_TIMEOUT, polling: 500 }
                );

                // Wait for dynamic content (Sanity API) to render.
                // Detail pages show a loading skeleton while fetching;
                // we wait until either:
                //  - A <main> with substantial text content appears, OR
                //  - No Skeleton loading indicators remain, OR
                //  - The h1 from the fetched data appears
                // Timeout after a few extra seconds (not a failure).
                await pageInstance.waitForFunction(
                  () => {
                    const root = document.getElementById("root");
                    if (!root) return false;
                    // Check that loading skeletons are gone
                    const skeletons = root.querySelectorAll('[class*="skeleton"], [class*="Skeleton"], [data-slot="skeleton"]');
                    if (skeletons.length > 0) return false;
                    // Check for substantial content in <main>
                    const main = root.querySelector("main");
                    if (main) {
                      const textLen = (main.textContent || "").trim().length;
                      if (textLen > 200) return true;
                    }
                    // For pages without <main>, check overall text content
                    const bodyText = (root.textContent || "").trim().length;
                    return bodyText > 500;
                  },
                  { timeout: 10_000, polling: 500 }
                ).catch(() => {
                  // Dynamic content timeout is non-fatal — page still has
                  // nav, footer, headings, etc. from static rendering
                });

                // Brief extra wait for any final lazy renders
                await new Promise((r) => setTimeout(r, 500));

                // Capture the rendered #root innerHTML
                const rootHtml = await pageInstance.evaluate(() => {
                  const root = document.getElementById("root");
                  return root ? root.innerHTML : null;
                });

                if (rootHtml && rootHtml.length > 200) {
                  // Determine the HTML file path for this route
                  let htmlFilePath: string;
                  if (page.path === "/") {
                    htmlFilePath = indexPath;
                  } else {
                    htmlFilePath = path.join(
                      distDir,
                      page.path.replace(/^\//, ""),
                      "index.html"
                    );
                  }

                  if (fs.existsSync(htmlFilePath)) {
                    let existingHtml = fs.readFileSync(htmlFilePath, "utf-8");
                    // Replace the skeleton content between the markers with rendered content
                    existingHtml = existingHtml.replace(
                      /<!--SKELETON-->[\s\S]*?<!--\/SKELETON-->/,
                      `<!--SSR-->${rootHtml}<!--/SSR-->`
                    );
                    fs.writeFileSync(htmlFilePath, existingHtml);
                    rendered++;
                    console.log(`  🖨️  ${page.path} (${Math.round(rootHtml.length / 1024)}KB)`);
                  }
                } else {
                  failed++;
                  console.warn(`  ⚠️  ${page.path} — rendered content too small, keeping skeleton`);
                }
              } catch (err) {
                failed++;
                console.warn(`  ⚠️  ${page.path} — render failed:`, (err as Error).message);
              } finally {
                if (pageInstance) await pageInstance.close().catch(() => {});
              }
            })
          );
        }

        // Extract the exact CSS rules used in the first viewport on mobile and
        // desktop, then make the full stylesheet non-render-blocking on the two
        // paid-traffic entry routes. Both routes receive mobile + desktop
        // browser coverage below before their blocking stylesheet is deferred.
        try {
          const criticalViewports = [
            { width: 375, height: 812, deviceScaleFactor: 2 },
            { width: 1440, height: 900, deviceScaleFactor: 1 },
          ];
          const criticalTargets = [
            {
              route: "/",
              htmlPath: indexPath,
              readySelector: "#hero-primary-cta",
              containerSelectors: [
                "nav",
                "#hero-primary-cta",
                '[aria-label="Cookie consent"]',
              ],
            },
            {
              route: "/face-cream",
              htmlPath: path.join(distDir, "face-cream", "index.html"),
              readySelector: "#purchase-options",
              containerSelectors: [
                "nav",
                "#offer",
                '[aria-label="Cookie consent"]',
              ],
            },
          ];

          for (const target of criticalTargets) {
            const criticalRules = new Set<string>();

            for (const viewport of criticalViewports) {
              const criticalPage = await browser.newPage();
              try {
                await criticalPage.setViewport(viewport);
                await criticalPage.goto(`http://127.0.0.1:${PORT}${target.route}`, {
                  waitUntil: "networkidle0",
                  timeout: PAGE_TIMEOUT,
                });
                await criticalPage.waitForSelector(target.readySelector, { timeout: PAGE_TIMEOUT });

                const viewportRules = await criticalPage.evaluate((containerSelectors) => {
                const visibleElements = new Set<Element>();
                const viewportBottom = window.innerHeight;
                const viewportRight = window.innerWidth;

                for (const element of Array.from(document.querySelectorAll("*"))) {
                  const rect = element.getBoundingClientRect();
                  if (
                    rect.width <= 0 ||
                    rect.height <= 0 ||
                    rect.bottom <= 0 ||
                    rect.top >= viewportBottom ||
                    rect.right <= 0 ||
                    rect.left >= viewportRight
                  ) continue;

                  let current: Element | null = element;
                  while (current) {
                    visibleElements.add(current);
                    current = current.parentElement;
                  }
                }

                // Responsive navigation controls can be display:none in one
                // extraction viewport, which gives them no bounding box. Keep
                // the entire first-viewport component subtree so md:hidden and
                // the closed mobile-menu rules are present before full CSS.
                const criticalContainers = containerSelectors
                  .map((selector) => {
                    const element = document.querySelector(selector);
                    return selector === "#hero-primary-cta" ? element?.closest("section") : element;
                  })
                  .filter((element): element is Element => element !== null && element !== undefined);

                for (const container of criticalContainers) {
                  visibleElements.add(container);
                  for (const descendant of Array.from(container.querySelectorAll("*"))) {
                    visibleElements.add(descendant);
                  }
                }

                const selectorMatches = (selector: string) => {
                  for (const element of visibleElements) {
                    try {
                      if (element.matches(selector)) return true;
                    } catch {
                      // Ignore selectors unsupported by Element.matches().
                    }

                    // Preserve interaction styles for critical controls even
                    // though the extraction page is not actively hovering or
                    // focusing them.
                    try {
                      const restingSelector = selector.replace(
                        /:(hover|active|focus|focus-visible|focus-within|visited)\b/g,
                        ""
                      );
                      if (restingSelector !== selector && element.matches(restingSelector)) return true;
                    } catch {
                      // Invalid after pseudo-class removal; skip it safely.
                    }
                  }
                  return false;
                };

                const collectRules = (rules: CSSRuleList): string[] => {
                  const collected: string[] = [];

                  for (const rule of Array.from(rules)) {
                    if (rule instanceof CSSStyleRule) {
                      if (selectorMatches(rule.selectorText)) collected.push(rule.cssText);
                      continue;
                    }

                    if (rule instanceof CSSMediaRule) {
                      if (!window.matchMedia(rule.conditionText).matches) continue;
                      const nested = collectRules(rule.cssRules);
                      if (nested.length) collected.push(`@media ${rule.conditionText}{${nested.join("")}}`);
                      continue;
                    }

                    if (typeof CSSSupportsRule !== "undefined" && rule instanceof CSSSupportsRule) {
                      const nested = collectRules(rule.cssRules);
                      if (nested.length) collected.push(`@supports ${rule.conditionText}{${nested.join("")}}`);
                    }
                  }

                  return collected;
                };

                const collected: string[] = [];
                for (const sheet of Array.from(document.styleSheets)) {
                  if (!sheet.href?.includes("/assets/index-")) continue;
                  try {
                    collected.push(...collectRules(sheet.cssRules));
                  } catch {
                    // A stylesheet that cannot expose rules is not same-origin
                    // and therefore not part of this build's critical CSS.
                  }
                }
                  return collected;
                }, target.containerSelectors);

                viewportRules.forEach((rule) => criticalRules.add(rule));
              } finally {
                await criticalPage.close().catch(() => {});
              }
            }

            console.log(`  🔎 ${target.route} critical CSS scan found ${criticalRules.size} rules`);

            if (criticalRules.size > 0 && fs.existsSync(target.htmlPath)) {
              let routeHtml = fs.readFileSync(target.htmlPath, "utf-8");
              const stylesheetPattern = /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/;
              const stylesheetMatch = routeHtml.match(stylesheetPattern);

              if (stylesheetMatch) {
                const stylesheetHref = stylesheetMatch[1];
                const criticalCss = Array.from(criticalRules).join("");
                const deferredStyles = [
                  `<style id="bl-critical-css">${criticalCss}</style>`,
                  `<link rel="stylesheet" href="${stylesheetHref}" media="print" onload="this.onload=null;this.media='all'">`,
                  `<noscript><link rel="stylesheet" href="${stylesheetHref}"></noscript>`,
                ].join("\n  ");

                routeHtml = routeHtml.replace(stylesheetPattern, deferredStyles);
                fs.writeFileSync(target.htmlPath, routeHtml);
                console.log(`  ⚡ ${target.route} critical CSS (${Math.round(Buffer.byteLength(criticalCss) / 1024)}KB, ${criticalRules.size} rules)`);
              }
            }
          }
        } catch (err) {
          console.warn("  ⚠️  Critical CSS extraction failed; keeping blocking CSS:", (err as Error).message);
        }

        await browser.close();
        server.close();
        console.log(`\n🖨️  Puppeteer SSR complete: ${rendered} rendered, ${failed} failed\n`);
      } catch (err) {
        console.warn("⚠️  Puppeteer SSR skipped:", (err as Error).message);
        console.warn("   HTML files still have meta tags, JSON-LD, and skeletons.");
      }

      // Generate _redirects — preserve public/_redirects rules, then add prerendered paths
      let existingRedirects = "";
      const publicRedirectsPath = path.resolve(process.cwd(), "public/_redirects");
      if (fs.existsSync(publicRedirectsPath)) {
        existingRedirects = fs.readFileSync(publicRedirectsPath, "utf-8")
          // Strip the SPA fallback line — we'll add our own at the end
          .replace(/^\s*\/\*\s+\/index\.html\s+200\s*$/m, "")
          // Strip trailing blank lines
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }

      const redirectLines: string[] = [];
      if (existingRedirects) {
        redirectLines.push(existingRedirects);
        redirectLines.push("");
      }

      redirectLines.push("# Prerendered SEO pages — forced rewrites to avoid trailing-slash 301");
      for (const p of prerenderedPaths) {
        redirectLines.push(`${p}  ${p}/index.html  200!`);
      }

      // Write SPA fallback shell (generic skeleton, no page-specific content)
      fs.writeFileSync(path.join(distDir, "__shell.html"), shellHtml);

      // 404 shell: same SPA boot (React renders the NotFound route client-side)
      // but served with a 404 status + noindex, so unknown URLs don't become
      // soft-404s / indexable homepage duplicates.
      const notFoundHtml = shellHtml
        .replace(/<title>[\s\S]*?<\/title>/, "<title>Page Not Found | Base Layer</title>")
        .replace(
          /<meta name="viewport"([^>]*)>/,
          '<meta name="viewport"$1>\n    <meta name="robots" content="noindex">'
        );
      fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml);

      redirectLines.push("");
      redirectLines.push("# Client-only routes (ad landing pages, dynamic product URLs) — not");
      redirectLines.push("# prerendered, must keep serving the SPA shell with a 200 status.");
      redirectLines.push("/lp  /__shell.html  200");
      redirectLines.push("/article/*  /__shell.html  200");
      redirectLines.push("/product/*  /__shell.html  200");
      redirectLines.push("");
      redirectLines.push("# Unknown routes — real 404 status (React still renders the NotFound UI)");
      redirectLines.push("/*  /404.html  404");

      fs.writeFileSync(path.join(distDir, "_redirects"), redirectLines.join("\n"));
      console.log(`  ✅ _redirects (${prerenderedPaths.length} prerendered routes)`);

      // Generate sitemap
      const sitemap = generateSitemap(allPages);
      fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
      console.log(`  ✅ sitemap.xml (${allPages.length} URLs)`);

      console.log("✅ Prerender + sitemap complete.");
    },
  };
}

// ── Vite config ───────────────────────────────────────────────────

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      png: { quality: 75 },
      jpeg: { quality: 75, progressive: true },
      jpg: { quality: 75, progressive: true },
      webp: { quality: 75 },
    }),
    prerenderPlugin(),
    compression({ algorithm: "brotliCompress" }),
    compression({ algorithm: "gzip" }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        return deps.filter(dep =>
          !dep.includes('query-') &&
          !dep.includes('supabase-') &&
          !dep.includes('queries-') &&
          !dep.includes('format-') &&
          !dep.includes('browser-') &&
          !dep.includes('sanity-')
        );
      },
    },
    target: "es2020",
    cssMinify: true,
    minify: "terser",
    terserOptions: {
      compress: { pure_funcs: ["console.log", "console.warn", "console.debug", "console.info"] },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
}));
