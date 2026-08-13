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

// ── Prerender plugin (closeBundle) ────────────────────────────────

const BASE_URL = "https://baselayerskin.co";

/*
 * Judge.me aggregate for the Product schemas below, read from the same snapshot
 * scripts/fetch-reviews.mjs writes and src/lib/reviews.ts imports — the number is
 * never typed by hand in either place.
 *
 * The gate must stay in sync with REVIEW_GATE in src/lib/reviews.ts (see the note
 * there on why it dropped from 5 to 1). Below it the spread is empty, which is the
 * point: Google's Rich Results Test errors on aggregateRating with reviewCount 0,
 * and an erroring Product schema can cost the rich result for the whole page.
 */
const REVIEW_GATE = 1;
const readReviewAggregate = () => {
  try {
    const snapshot = JSON.parse(fs.readFileSync(path.resolve(__dirname, "src/data/reviews.json"), "utf-8"));
    if (!snapshot || snapshot.count < REVIEW_GATE) return {};
    return {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(snapshot.rating).toFixed(1),
        reviewCount: snapshot.count,
      },
    };
  } catch {
    return {};
  }
};
const REVIEW_AGGREGATE = readReviewAggregate();

interface PageMeta {
  path: string;
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>[];
  changefreq?: string;
  priority?: string;
}

const STATIC_PAGES: PageMeta[] = [
  {
    path: "/",
    title: "Base Layer — Men's Skincare | Face Moisturizer for Men | $38",
    description: "Men's face moisturizer with niacinamide, copper peptide & hyaluronic acid. One step, zero shine. Absorbs in 15 seconds. $38, no subscription.",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/face-cream",
    title: "Best Men's Face Moisturizer 2026 | Base Layer Face Cream | $38",
    description: "Lightweight face moisturizer for men. Niacinamide 5%, copper peptide, hyaluronic acid. Absorbs in 15 seconds, stays matte all day. $38.",
    ogType: "product",
    ogImage: `${BASE_URL}/og-face-cream.jpg`,
    changefreq: "weekly",
    priority: "1.0",
    // jsonLd handled by React FaceCream.tsx component during Puppeteer SSR
  },
  {
    path: "/about",
    title: "About Base Layer | Men's Skincare, Simplified",
    description: "We built one product that replaces your entire skincare routine. Science-backed formula, no subscriptions, formulated in Colorado.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/articles",
    title: "Men's Skincare Articles & Guides | Base Layer",
    description: "Evidence-based skincare articles for men. Learn about ingredients, routines, and how to build better skin.",
    ogImage: `${BASE_URL}/og-articles.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/ingredients",
    title: "Skincare Ingredients Guide for Men | Base Layer",
    description: "Learn what's in your skincare. Detailed guides on niacinamide, copper peptide, hyaluronic acid, and more.",
    ogImage: `${BASE_URL}/og-ingredients.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/skin-concerns",
    title: "Men's Skin Concerns Guide | Base Layer",
    description: "Solutions for oily skin, acne, post-shave irritation, dry skin, aging, and dark circles. Built for men's skin.",
    ogImage: `${BASE_URL}/og-skin-concerns.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/comparisons",
    title: "Best Men's Moisturizers Compared | Base Layer",
    description: "Side-by-side comparison of the best men's face moisturizers. Ingredients, price, and performance reviewed.",
    ogImage: `${BASE_URL}/og-comparisons.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/matte-moisturizer-for-men",
    title: "Matte Moisturizer for Men — Zero Shine, All Day | Base Layer",
    description: "The best matte moisturizer for men. Niacinamide 5% controls oil, squalane absorbs in 15 seconds. No shine, no grease, no fragrance. $38.",
    ogType: "product",
    ogImage: `${BASE_URL}/og-face-cream.jpg`,
    changefreq: "weekly",
    priority: "0.9",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Base Layer Performance Face Moisturizer — Matte Moisturizer for Men",
        description: "Matte-finish men's face moisturizer with niacinamide 5% and squalane. Controls shine all day without drying your skin. Fragrance-free. $38.",
        brand: { "@type": "Brand", name: "Base Layer" },
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${BASE_URL}/matte-moisturizer-for-men`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-face-cream.jpg`,
        url: `${BASE_URL}/matte-moisturizer-for-men`,
        sku: "BL-PDFC-50ML",
        ...REVIEW_AGGREGATE,
      },
    ],
  },
  {
    path: "/non-greasy-moisturizer-for-men",
    title: "Non-Greasy Moisturizer for Men — Absorbs in 15 Seconds | Base Layer",
    description: "The best non-greasy moisturizer for men. Squalane absorbs in 15 seconds. Niacinamide 5% controls oil. No residue, no fragrance, no subscriptions. $38.",
    ogType: "product",
    ogImage: `${BASE_URL}/og-face-cream.jpg`,
    changefreq: "weekly",
    priority: "0.9",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Base Layer Performance Face Moisturizer — Non-Greasy Moisturizer for Men",
        description: "Non-greasy men's face moisturizer that absorbs in 15 seconds. Squalane-based formula with niacinamide 5%, copper peptide, and hyaluronic acid. $38.",
        brand: { "@type": "Brand", name: "Base Layer" },
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${BASE_URL}/non-greasy-moisturizer-for-men`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-face-cream.jpg`,
        url: `${BASE_URL}/non-greasy-moisturizer-for-men`,
        sku: "BL-PDFC-50ML",
        ...REVIEW_AGGREGATE,
      },
    ],
  },
  {
    path: "/all-in-one-skincare-for-men",
    title: "All-in-One Skincare for Men — One Product. Done. | Base Layer",
    description: "Replace your serum, moisturizer, and eye cream with one product. 6 active ingredients, $38, absorbs in 15 seconds. The simplest men's skincare routine.",
    ogType: "product",
    ogImage: `${BASE_URL}/og-face-cream.jpg`,
    changefreq: "weekly",
    priority: "0.9",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Base Layer Performance Face Moisturizer — All-in-One Skincare for Men",
        description: "All-in-one men's skincare product with 6 active ingredients. Replaces moisturizer, serum, and eye cream. $38.",
        brand: { "@type": "Brand", name: "Base Layer" },
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${BASE_URL}/all-in-one-skincare-for-men`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-face-cream.jpg`,
        url: `${BASE_URL}/all-in-one-skincare-for-men`,
        sku: "BL-PDFC-50ML",
        ...REVIEW_AGGREGATE,
      },
    ],
  },
  // Legal/policy pages. These must be prerendered, not left as client-only SPA routes:
  // ad-platform review crawlers (Meta in particular) fetch the privacy policy URL
  // directly and do not reliably execute JS — an un-prerendered route reads as an empty
  // page and stalls ad account approval.
  {
    path: "/privacy-policy",
    title: "Privacy Policy | Base Layer",
    description: "How Base Layer collects, uses, and protects your personal information.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/terms-of-service",
    title: "Terms of Service | Base Layer",
    description: "The terms governing your use of the Base Layer website and purchases.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/refund-policy",
    title: "Refund Policy | Base Layer",
    description: "Base Layer's 30-day money-back guarantee, returns, and refund process.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/shipping-policy",
    title: "Shipping Policy | Base Layer",
    description: "Shipping options, processing times, and delivery information for Base Layer orders.",
    changefreq: "yearly",
    priority: "0.3",
  },
];

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
  const ogImage = page.ogImage || `${BASE_URL}/og-image.jpg`;
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
  html = replaceMetaTag(html, "property", "og:image:alt", `${escapeAttr(page.title)} - Base Layer Men's Skincare`);

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

function generateSitemap(pages: PageMeta[]): string {
  const today = new Date().toISOString().split("T")[0];
  const urls = pages
    .filter((p) => p.path !== "/checkout")
    .map(
      (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
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

      const fcSrcset = heroSrcset("product-hero-rock");

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
        "/face-cream": preloadTag(fcSrcset),
        "/matte-moisturizer-for-men": preloadTag(fcSrcset),
        "/non-greasy-moisturizer-for-men": preloadTag(fcSrcset),
        "/all-in-one-skincare-for-men": preloadTag(fcSrcset),
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
      const fcHeroPicture = heroPictureTag("product-hero-rock", "Base Layer face cream");

      // ── LCP Optimization 3: Above-the-fold skeletons ───────────
      // Bake real hero content into the HTML so LCP paints with FCP,
      // before React hydrates. Saves ~500-1000ms on mobile.
      const homeSkeleton = `<style>#bl-home-skeleton{min-height:100svh;background:#F2EFE8;padding-top:96px;display:flex;flex-direction:column;overflow:hidden}#bl-home-visual{height:226px;position:relative;overflow:hidden;order:1;background:#D8D3CA}#bl-home-visual img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 51%}#bl-home-copy{order:2;padding:28px 20px;color:#1A2F4C}#bl-home-copy p{font-family:Inter,sans-serif}#bl-home-copy h1{font-family:Montserrat,sans-serif;font-size:clamp(40px,10.8vw,60px);font-weight:900;text-transform:uppercase;line-height:.91;letter-spacing:-.05em;word-spacing:.1em;margin:0;color:#1A2F4C}@media(min-width:769px){#bl-home-skeleton{display:grid;grid-template-columns:1.02fr .98fr;min-height:100svh}#bl-home-visual{order:2;height:calc(100svh - 96px)}#bl-home-visual img{object-position:center}#bl-home-copy{order:1;padding:64px 80px;display:flex;flex-direction:column;justify-content:center}#bl-home-copy h1{font-size:clamp(60px,5.2vw,82px)}}</style><div id="bl-home-skeleton"><div id="bl-home-visual">${homeHeroPicture}</div><div id="bl-home-copy"><p style="font-size:11px;font-weight:600;letter-spacing:.25em;text-transform:uppercase;color:rgba(26,47,76,.65);margin:0 0 12px">Daily Face Moisturizer</p><h1>ONE STEP.<br>ZERO SHINE.</h1><p style="font-size:16px;line-height:1.55;color:rgba(26,47,76,.78);max-width:560px;margin:20px 0 0">Fast-absorbing hydration for dry air, sun, wind, and bad sleep. Put it on in 15 seconds. Forget it's there.</p></div></div>`;

      const fcSkeleton = `<div style="min-height:100vh;background:#0a0a0a;position:relative;overflow:hidden;padding-top:88px">${fcHeroPicture}<div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.7))"></div><div style="position:relative;z-index:10;max-width:80rem;margin:0 auto;padding:2rem 1.5rem;text-align:center"><h1 style="font-family:'DM Sans',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em;color:#ebebeb;margin:0 0 1rem">Best Men's Face Moisturizer</h1><p style="font-family:Inter,sans-serif;font-size:1.5rem;font-weight:700;color:#ebebeb;margin:0">$38</p></div></div>`;

      const skeletonForPage: Record<string, string> = {
        "/": homeSkeleton,
        "/face-cream": fcSkeleton,
        "/matte-moisturizer-for-men": fcSkeleton,
        "/non-greasy-moisturizer-for-men": fcSkeleton,
        "/all-in-one-skincare-for-men": fcSkeleton,
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
          sanity.fetch(`*[_type == "article" && defined(body)]{ title, "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), excerpt }`),
          sanity.fetch(`*[_type == "ingredient" && (defined(body) || defined(description)) && !(slug.current in ["retinol", "vitamin-c"])]{ name, "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), "overview": coalesce(overview, extractableSummary) }`),
          sanity.fetch(`*[_type == "skinConcern" && (defined(body) || defined(overview))]{ "name": coalesce(name, title), "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), "overview": coalesce(overview[0].children[0].text, extractableSummary) }`),
          sanity.fetch(`*[_type == "comparison"]{ title, "slug": slug.current, "metaTitle": coalesce(metaTitle, seo.title), "metaDescription": coalesce(metaDescription, seo.description), intro }`),
        ]);

        for (const a of articles) {
          const articleTitle = a.metaTitle || `${a.title} | Base Layer`;
          const articleDesc = a.metaDescription || a.excerpt || "";
          dynamicPages.push({
            path: `/articles/${a.slug}`,
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

      const allPages = [...STATIC_PAGES, ...dynamicPages];
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
                await pageInstance.waitForFunction(
                  () => {
                    const root = document.getElementById("root");
                    if (!root) return false;
                    const hasNav = root.querySelector("nav") !== null;
                    const hasFooter = root.querySelector("footer") !== null;
                    // Basic structure is ready when nav + footer exist
                    return hasNav && hasFooter;
                  },
                  { timeout: PAGE_TIMEOUT }
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
                  { timeout: 10_000 }
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
        // desktop, then make the full homepage stylesheet non-render-blocking.
        // Other prerendered routes intentionally retain their normal blocking
        // stylesheet until they receive the same visual-regression coverage.
        try {
          const criticalRules = new Set<string>();
          const criticalViewports = [
            { width: 375, height: 812, deviceScaleFactor: 2 },
            { width: 1440, height: 900, deviceScaleFactor: 1 },
          ];

          for (const viewport of criticalViewports) {
            const criticalPage = await browser.newPage();
            try {
              await criticalPage.setViewport(viewport);
              await criticalPage.goto(`http://127.0.0.1:${PORT}/`, {
                waitUntil: "networkidle0",
                timeout: PAGE_TIMEOUT,
              });
              await criticalPage.waitForSelector("#hero-primary-cta", { timeout: PAGE_TIMEOUT });

              const viewportRules = await criticalPage.evaluate(() => {
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
                const criticalContainers = [
                  document.querySelector("nav"),
                  document.querySelector("#hero-primary-cta")?.closest("section"),
                  document.querySelector('[aria-label="Cookie consent"]'),
                ].filter((element): element is Element => element !== null && element !== undefined);

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
              });

              viewportRules.forEach((rule) => criticalRules.add(rule));
            } finally {
              await criticalPage.close().catch(() => {});
            }
          }

          console.log(`  🔎 / critical CSS scan found ${criticalRules.size} rules`);

          if (criticalRules.size > 0) {
            let homepageHtml = fs.readFileSync(indexPath, "utf-8");
            const stylesheetPattern = /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/;
            const stylesheetMatch = homepageHtml.match(stylesheetPattern);

            if (stylesheetMatch) {
              const stylesheetHref = stylesheetMatch[1];
              const criticalCss = Array.from(criticalRules).join("");
              const deferredStyles = [
                `<style id="bl-critical-css">${criticalCss}</style>`,
                `<link rel="stylesheet" href="${stylesheetHref}" media="print" onload="this.onload=null;this.media='all'">`,
                `<noscript><link rel="stylesheet" href="${stylesheetHref}"></noscript>`,
              ].join("\n  ");

              homepageHtml = homepageHtml.replace(stylesheetPattern, deferredStyles);
              fs.writeFileSync(indexPath, homepageHtml);
              console.log(`  ⚡ / critical CSS (${Math.round(Buffer.byteLength(criticalCss) / 1024)}KB, ${criticalRules.size} rules)`);
            }
          }
        } catch (err) {
          console.warn("  ⚠️  Homepage critical CSS extraction failed; keeping blocking CSS:", (err as Error).message);
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
