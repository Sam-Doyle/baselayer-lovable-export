import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://baselayerskin.co";
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/baselayer-carton.jpeg`;

// ── Canonical Tag ──────────────────────────────────────────────────

export function useCanonical() {
  const { pathname } = useLocation();
  useEffect(() => {
    const url = `${BASE_URL}${pathname.replace(/\/+$/, "") || "/"}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
    return () => { link?.remove(); };
  }, [pathname]);
}

// ── Dynamic OG + Meta ──────────────────────────────────────────────

interface MetaTagsProps {
  title: string;
  description: string;
  type?: string;
  image?: string;
  url?: string;
}

export function useMetaTags({ title, description, type = "website", image, url }: MetaTagsProps) {
  const { pathname } = useLocation();
  const pageUrl = url || `${BASE_URL}${pathname.replace(/\/+$/, "") || "/"}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:alt", `${title} - Base Layer Men's Skincare`);
    setMeta("property", "og:site_name", "Base Layer");
    setMeta("property", "og:locale", "en_US");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:site", "@baselayerskin");
    setMeta("name", "twitter:creator", "@baselayerskin");
  }, [title, description, type, pageUrl, ogImage]);
}

// ── JSON-LD ────────────────────────────────────────────────────────

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}

// ── Organization Schema (global) ──────────────────────────────────

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Base Layer",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: "Advanced men's skincare engineered for active lifestyles. Formulated in Breckenridge, Colorado.",
  sameAs: ["https://www.instagram.com/baselayerskin/"],
  foundingLocation: { "@type": "Place", name: "Breckenridge, Colorado" },
};

// ── Breadcrumb Schema builder ──────────────────────────────────────

export function buildBreadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${BASE_URL}${item.path}` } : {}),
    })),
  };
}

// ── FAQ Schema builder (DISABLED) ───────────────────────────────────
// FAQPage rich results restricted to gov/healthcare since Aug 2023.
// Returns null — FAQ content still renders on-page for users and AI.

export function buildFaqSchema(_faqs: { question: string; answer: string }[]) {
  return null;
}

// ── Article Schema builder ──────────────────────────────────────────

export function buildArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  authorCredentials?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.authorName || "Base Layer",
      ...(article.authorCredentials ? { jobTitle: article.authorCredentials } : {}),
      url: `${BASE_URL}/about`,
    },
    publisher: { "@type": "Organization", name: "Base Layer", url: BASE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/articles/${article.slug}` },
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
  };
}

// ── ItemList Schema builder ──────────────────────────────────────

export function buildItemListSchema(
  name: string,
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: item.url,
      name: item.name,
    })),
  };
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Base Layer",
  url: "https://baselayerskin.co",
  description: "Men's skincare engineered for active lifestyles.",
  publisher: { "@type": "Organization", name: "Base Layer" },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://baselayerskin.co/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export { BASE_URL, DEFAULT_OG_IMAGE };
