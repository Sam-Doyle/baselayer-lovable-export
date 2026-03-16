import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import compression from "vite-plugin-compression";
import * as fs from "fs";
import * as http from "http";

// ── Prerender plugin (closeBundle) ────────────────────────────────

const BASE_URL = "https://baselayerskin.co";

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
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Base Layer",
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        description: "Advanced men's skincare engineered for active lifestyles. Formulated in Breckenridge, Colorado.",
        sameAs: ["https://www.instagram.com/baselayerskin/"],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Base Layer",
        url: BASE_URL,
        description: "Men's skincare engineered for active lifestyles.",
        publisher: { "@type": "Organization", name: "Base Layer" },
      },
    ],
  },
  {
    path: "/face-cream",
    title: "Best Men's Face Moisturizer 2026 | Base Layer Face Cream | $38",
    description: "Lightweight face moisturizer for men. Niacinamide 5%, copper peptide, hyaluronic acid. Absorbs in 15 seconds, stays matte all day. $38.",
    ogType: "product",
    ogImage: `${BASE_URL}/og-face-cream.jpg`,
    changefreq: "weekly",
    priority: "1.0",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Base Layer Performance Face Moisturizer",
        description: "Advanced men's face moisturizer with niacinamide, copper peptide GHK-Cu, panthenol, centella asiatica, squalane, and hyaluronic acid.",
        brand: { "@type": "Brand", name: "Base Layer" },
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/PreOrder", url: `${BASE_URL}/face-cream`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-image.jpg`,
        url: `${BASE_URL}/face-cream`,
        sku: "BL-PDFC-50ML",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "3", bestRating: "5" },
        review: [
          { "@type": "Review", author: { "@type": "Person", name: "Sean G." }, reviewBody: "One step, no shine — that's all I wanted. Base Layer nailed it.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, datePublished: "2025-12-01" },
          { "@type": "Review", author: { "@type": "Person", name: "Matt M." }, reviewBody: "I never wanted a 6-step routine. Base Layer gave me one thing that just works.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, datePublished: "2025-12-15" },
          { "@type": "Review", author: { "@type": "Person", name: "Cooper S." }, reviewBody: "Everything else feels heavy now in comparison. Base Layer gives me clean hydration.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, datePublished: "2026-01-05" },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Face Cream" },
        ],
      },
      // FAQPage schema removed — restricted to gov/healthcare since Aug 2023.
    ],
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
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/PreOrder", url: `${BASE_URL}/matte-moisturizer-for-men`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-face-cream.jpg`,
        url: `${BASE_URL}/matte-moisturizer-for-men`,
        sku: "BL-PDFC-50ML",
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
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/PreOrder", url: `${BASE_URL}/non-greasy-moisturizer-for-men`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-face-cream.jpg`,
        url: `${BASE_URL}/non-greasy-moisturizer-for-men`,
        sku: "BL-PDFC-50ML",
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
        offers: { "@type": "Offer", price: "38.00", priceCurrency: "USD", availability: "https://schema.org/PreOrder", url: `${BASE_URL}/all-in-one-skincare-for-men`, priceValidUntil: "2026-12-31" },
        image: `${BASE_URL}/og-face-cream.jpg`,
        url: `${BASE_URL}/all-in-one-skincare-for-men`,
        sku: "BL-PDFC-50ML",
      },
    ],
  },
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function injectMeta(html: string, page: PageMeta): string {
  const ogImage = page.ogImage || `${BASE_URL}/og-image.jpg`;
  const ogType = page.ogType || "website";
  const canonicalUrl = `${BASE_URL}${page.path}`;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeAttr(page.description)}">`
  );
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeAttr(page.title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeAttr(page.description)}">`);
  html = html.replace(/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${escapeAttr(ogType)}">`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeAttr(ogImage)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeAttr(page.title)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeAttr(page.description)}">`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${escapeAttr(ogImage)}">`);

  // Update og:image:alt and og:site_name for social crawlers
  html = html.replace(/<meta property="og:image:alt" content="[^"]*">/, `<meta property="og:image:alt" content="${escapeAttr(page.title)} - Base Layer Men's Skincare">`);

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

      let baseHtml = fs.readFileSync(indexPath, "utf-8");

      // ── LCP Optimization 1: Per-page hero image preloads ───────
      // Scan built assets for hero image variants so each page gets
      // the correct preload (homepage vs face-cream vs none).
      const distAssetsDir = path.join(distDir, "assets");
      const builtFiles = fs.existsSync(distAssetsDir) ? fs.readdirSync(distAssetsDir) : [];
      const findBuilt = (re: RegExp) => builtFiles.find(f => re.test(f));

      function heroSrcset(prefix: string): string {
        const variants = [
          { f: findBuilt(new RegExp(`^${prefix}-480w[^.]*\\.webp$`)), w: 480 },
          { f: findBuilt(new RegExp(`^${prefix}-768w[^.]*\\.webp$`)), w: 768 },
          { f: findBuilt(new RegExp(`^${prefix}-1200w[^.]*\\.webp$`)), w: 1200 },
        ].filter(v => v.f) as { f: string; w: number }[];
        if (!variants.length) return "";
        return variants.map(v => `/assets/${v.f} ${v.w}w`).join(", ");
      }

      function preloadTag(srcset: string): string {
        if (!srcset) return "";
        return `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high">`;
      }

      const homeSrcset = heroSrcset("hero-product");
      const fcSrcset = heroSrcset("product-hero-rock");

      const heroPreloadForPage: Record<string, string> = {
        "/": preloadTag(homeSrcset),
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

      const homeHeroPicture = heroPictureTag("hero-product", "Base Layer face cream");
      const fcHeroPicture = heroPictureTag("product-hero-rock", "Base Layer face cream");

      // ── LCP Optimization 3: Above-the-fold skeletons ───────────
      // Bake real hero content into the HTML so LCP paints with FCP,
      // before React hydrates. Saves ~500-1000ms on mobile.
      const homeSkeleton = `<div style="min-height:100svh;background:#0a0a0a;position:relative;display:flex;align-items:center;overflow:hidden;padding-top:80px">${homeHeroPicture}<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,.65),rgba(0,0,0,.3))"></div><div style="position:relative;z-index:10;width:100%;max-width:36rem;padding:0 1.5rem;margin:0 auto"><p style="font-family:Inter,sans-serif;font-size:.6875rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.7);margin:0 0 .75rem;text-align:center">Better skin for men who don't want a routine.</p><h1 style="font-family:'DM Sans',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;line-height:.9;letter-spacing:-.025em;margin:0 0 1.25rem;color:#fff;text-align:center">ONE FACE CREAM.<br>15 SECONDS.<br>NO SHINE.</h1><p style="font-family:Inter,sans-serif;font-size:.9375rem;color:rgba(255,255,255,.8);line-height:1.6;margin:0 auto;max-width:28rem;text-align:center">You don't need a shelf full of products. One pump, 15 seconds, and you're out the door — hydrated, matte, no greasy residue.</p></div></div>`;

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
      let dynamicPages: PageMeta[] = [];
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

        // Inject correct hero image preload for this page
        const hPreload = heroPreloadForPage[page.path] || "";
        if (hPreload) {
          html = html.replace("</head>", `  ${hPreload}\n  </head>`);
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
                pageInstance.on("request", (req: any) => {
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

      redirectLines.push("");
      redirectLines.push("# SPA fallback — must be last");
      redirectLines.push("/*  /__shell.html  200");

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
          query: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"],
          sanity: ["@sanity/client", "@sanity/image-url"],
        },
      },
    },
  },
}));
