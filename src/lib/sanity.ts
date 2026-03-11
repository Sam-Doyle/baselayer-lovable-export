import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "27quz10a",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true, // `false` for server-side rendering or when you need fresh data
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// ---------- Shared TypeScript types ----------

export interface SanitySlug {
  current: string;
}

export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
}

export interface SanityReference {
  _ref: string;
  _type: "reference";
}

export interface FAQ {
  _key: string;
  question: string;
  answer: string;
}

export interface SEO {
  title?: string;
  description?: string;
  image?: SanityImage;
  noIndex?: boolean;
}

// Portable Text block (simplified — full type comes from @portabletext/types)
export type BlockContent = Array<Record<string, unknown>>;

// ---------- Document types ----------

export interface Author {
  _id: string;
  _type: "author";
  name: string;
  slug: SanitySlug;
  credentials?: string;
  image?: SanityImage;
  bio?: BlockContent;
  linkedin?: string;
}

export interface Ingredient {
  _id: string;
  _type: "ingredient";
  name: string;
  inciName?: string;
  slug: SanitySlug;
  extractableSummary: string;
  description?: BlockContent;
  benefits?: Array<{
    _key: string;
    benefit: string;
    efficacy?: string;
    studyLink?: string;
  }>;
  concentrationMin?: number;
  concentrationMax?: number;
  maleSpecificBenefits?: string[];
  contraindications?: string;
  products?: Product[];
  faqs?: FAQ[];
  seo?: SEO;
}

export interface SkinConcern {
  _id: string;
  _type: "skinConcern";
  title: string;
  slug: SanitySlug;
  extractableSummary: string;
  overview?: BlockContent;
  rootCauses?: BlockContent;
  preventionTips?: BlockContent;
  recommendedIngredients?: Ingredient[];
  recommendedProducts?: Product[];
  faqs?: FAQ[];
  seo?: SEO;
}

export interface RoutineStep {
  _key: string;
  stepName: string;
  description: string;
  product?: Product;
  duration?: string;
}

export interface RoutineGuide {
  _id: string;
  _type: "routineGuide";
  title: string;
  slug: SanitySlug;
  extractableSummary: string;
  skinType?: string;
  concern?: SkinConcern;
  timeOfDay?: string;
  steps?: RoutineStep[];
  commonMistakes?: BlockContent;
  faqs?: FAQ[];
  seo?: SEO;
}

export interface Product {
  _id: string;
  _type: "product";
  name: string;
  slug: SanitySlug;
  description?: string;
  price?: number;
  inStock?: boolean;
  image?: SanityImage;
  ingredients?: Ingredient[];
  skinTypes?: string[];
  concernsAddressed?: SkinConcern[];
  rating?: number;
  reviewCount?: number;
  seo?: SEO;
}

export interface ComparisonItem {
  _key: string;
  name: string;
  description?: string;
  pros?: string[];
  cons?: string[];
}

export interface Comparison {
  _id: string;
  _type: "comparison";
  title: string;
  slug: SanitySlug;
  extractableSummary: string;
  comparisonType: string;
  itemsCompared?: ComparisonItem[];
  verdict?: BlockContent;
  body?: BlockContent;
  faqs?: FAQ[];
  seo?: SEO;
}

export interface Article {
  _id: string;
  _type: "article";
  title: string;
  slug: SanitySlug;
  author?: Author;
  mainImage?: SanityImage;
  contentPillar: string;
  extractableSummary: string;
  body?: BlockContent;
  relatedIngredients?: Ingredient[];
  relatedConcerns?: SkinConcern[];
  relatedProducts?: Product[];
  faqs?: FAQ[];
  publishedAt?: string;
  updatedAt?: string;
  seo?: SEO;
}
