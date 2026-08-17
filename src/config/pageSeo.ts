import { FREE_SHIPPING_CODE, LEGAL } from "./legal";

/**
 * Title and description for every prerendered static route. One definition,
 * two consumers.
 *
 * Before this file existed there were two: vite.config.ts baked one title into
 * the prerendered HTML, and each page component set a different one through
 * useMetaTags on hydration. Ten of the fourteen static routes disagreed with
 * themselves, including the homepage and the PDP. Google renders JS so the
 * component's title usually won for ranking, which meant the keyword-loaded
 * titles someone deliberately wrote into the build config were being silently
 * overwritten. Social scrapers and non-rendering crawlers saw the other half.
 *
 * Imported by vite.config.ts with a RELATIVE path, because the "@/" alias the
 * app uses is defined by that config and isn't available while it loads. Keep
 * this module free of anything but plain data and relative imports for the same
 * reason: it gets bundled into the Vite config at build time, where React,
 * browser globals and path aliases don't exist.
 *
 * Titles are kept at or under ~60 characters. Google truncates on pixel width
 * rather than character count, so this is a guideline, but a title that gets
 * cut loses whatever sits at the end — which is why the brand goes last on
 * pages competing for a head term, and is dropped entirely where the keyword
 * phrase already fills the line.
 */

export const BASE_URL = "https://baselayerskin.co";
export const PRODUCT_OG_IMAGE = `${BASE_URL}/og-mountain-product-v2.jpg`;

export interface PageSeo {
  title: string;
  description: string;
  /** schema.org/OpenGraph type. Defaults to "website" in both consumers. */
  ogType?: string;
  /** Defaults to PRODUCT_OG_IMAGE in both consumers. */
  ogImage?: string;
  changefreq: string;
  priority: string;
}

export const PAGE_SEO = {
  "/": {
    title: "Face Moisturizer for Men | One Step, Zero Shine | Base Layer",
    description:
      "Men's face moisturizer with niacinamide, copper peptide & hyaluronic acid. One step, zero shine. Absorbs in 15 seconds. $38, no subscription.",
    changefreq: "weekly",
    priority: "1.0",
  },
  "/face-cream": {
    title: "Best Men's Face Moisturizer 2026 | Base Layer Face Cream $38",
    description:
      "The fast-absorbing, one-step daily face cream for men. Niacinamide 5% + Copper Peptides. $38 a bottle, 2-pack $68, 30-day guarantee.",
    ogType: "product",
    ogImage: PRODUCT_OG_IMAGE,
    changefreq: "weekly",
    priority: "1.0",
  },
  "/about": {
    title: "About Base Layer | Men's Skincare Built Around Performance",
    description:
      "Base Layer: men's skincare engineered in Breckenridge, Colorado. One product, six active ingredients, zero complexity. Learn our story.",
    changefreq: "monthly",
    priority: "0.6",
  },
  "/articles": {
    title: "Men's Skincare Articles & Guides | Base Layer",
    description:
      "Expert men's skincare guides covering ingredients, routines, and product comparisons. Science-backed advice from Base Layer.",
    ogImage: `${BASE_URL}/og-articles.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  "/ingredients": {
    title: "Skincare Ingredients Guide for Men | Base Layer",
    description:
      "Learn what's in your skincare. Detailed guides on niacinamide, copper peptide, hyaluronic acid, and more.",
    ogImage: `${BASE_URL}/og-ingredients.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  "/skin-concerns": {
    title: "Men's Skin Concerns | Oily Skin, Acne, Dryness | Base Layer",
    description:
      "Solutions for oily skin, acne, post-shave irritation, dry skin, aging, and dark circles. Built for men's skin.",
    ogImage: `${BASE_URL}/og-skin-concerns.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  "/comparisons": {
    title: "Men's Moisturizer Comparisons | Base Layer vs CeraVe, Kiehl's",
    description:
      "See how Base Layer stacks up against Cetaphil, Neutrogena, CeraVe, and Kiehl's in side-by-side comparisons.",
    ogImage: `${BASE_URL}/og-comparisons.jpg`,
    changefreq: "weekly",
    priority: "0.8",
  },
  "/matte-moisturizer-for-men": {
    title: "Matte Moisturizer for Men | Zero Shine, All Day | Base Layer",
    description:
      "The best matte moisturizer for men. Niacinamide 5% controls oil, squalane absorbs in 15 seconds. No shine, no grease, no fragrance. $38.",
    ogType: "product",
    ogImage: PRODUCT_OG_IMAGE,
    changefreq: "weekly",
    priority: "0.9",
  },
  "/non-greasy-moisturizer-for-men": {
    title: "Non-Greasy Moisturizer for Men | Absorbs in 15 Seconds",
    description:
      "The best non-greasy moisturizer for men. Squalane absorbs in 15 seconds. Niacinamide 5% controls oil. No residue, no fragrance, no subscriptions. $38.",
    ogType: "product",
    ogImage: PRODUCT_OG_IMAGE,
    changefreq: "weekly",
    priority: "0.9",
  },
  "/all-in-one-skincare-for-men": {
    title: "All-in-One Skincare for Men | One Product, Done | Base Layer",
    description:
      "Replace your serum, moisturizer, and eye cream with one product. 6 active ingredients, $38, absorbs in 15 seconds. The simplest men's skincare routine.",
    ogType: "product",
    ogImage: PRODUCT_OG_IMAGE,
    changefreq: "weekly",
    priority: "0.9",
  },
  /*
   * Legal/policy pages. These must be prerendered, not left as client-only SPA
   * routes: ad-platform review crawlers (Meta in particular) fetch the privacy
   * policy URL directly and do not reliably execute JS — an un-prerendered
   * route reads as an empty page and stalls ad account approval.
   */
  "/privacy-policy": {
    title: "Privacy Policy | Base Layer",
    description: "How Base Layer collects, uses, and protects your personal information.",
    changefreq: "yearly",
    priority: "0.3",
  },
  "/terms-of-service": {
    title: "Terms of Service | Base Layer",
    description: "The terms governing your use of the Base Layer website and purchases.",
    changefreq: "yearly",
    priority: "0.3",
  },
  "/refund-policy": {
    title: "Refund Policy | Base Layer",
    description: "Our 30-day money-back guarantee. Keep the bottle, get a full refund.",
    changefreq: "yearly",
    priority: "0.3",
  },
  "/shipping-policy": {
    title: "Shipping Policy | Base Layer",
    description: `Free US standard shipping with code ${FREE_SHIPPING_CODE} or on orders $${LEGAL.freeShippingThresholdUsd}+, plus processing times and tracking.`,
    changefreq: "yearly",
    priority: "0.3",
  },
} satisfies Record<string, PageSeo>;

export type StaticRoute = keyof typeof PAGE_SEO;

/**
 * Props for useMetaTags. Field names differ from PageSeo (`type`/`image` rather
 * than `ogType`/`ogImage`), so the mapping lives here rather than at 14 call
 * sites. changefreq and priority are sitemap-only and deliberately dropped.
 */
export function metaFor(route: StaticRoute) {
  const page = PAGE_SEO[route];
  return {
    title: page.title,
    description: page.description,
    type: "ogType" in page ? page.ogType : undefined,
    image: "ogImage" in page ? page.ogImage : undefined,
  };
}
