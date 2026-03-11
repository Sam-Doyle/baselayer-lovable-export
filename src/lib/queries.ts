import { sanityClient } from "./sanity";
import type {
  Article,
  Ingredient,
  SkinConcern,
  RoutineGuide,
  Product,
  Comparison,
} from "./sanity";

// ── Shared fragments ──────────────────────────────────────────────

const faqsFragment = `
  faqs[] {
    _key,
    question,
    answer
  }
`;

const authorFragment = `
  author-> {
    _id,
    name,
    slug,
    credentials,
    image,
    linkedin
  }
`;

// ── Articles ──────────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  return sanityClient.fetch(`
    *[_type == "article" && defined(body)] | order(coalesce(publishedAt, publishDate) desc) {
      _id,
      title,
      "slug": slug,
      excerpt,
      extractableSummary,
      "publishDate": coalesce(publishedAt, publishDate),
      readingTime,
      categories,
      "heroImage": coalesce(
        heroImage{asset->{url}, alt},
        mainImage{asset->{url}, alt}
      ),
      ${authorFragment}
    }
  `);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return sanityClient.fetch(
    `
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug,
      excerpt,
      extractableSummary,
      body[] {
        ...,
        markDefs[] {
          ...,
          _type == "ingredientRef" => {
            "ingredient": ingredient-> { _id, name, slug }
          },
          _type == "productRef" => {
            "product": product-> { _id, name, slug }
          }
        }
      },
      "publishDate": coalesce(publishedAt, publishDate),
      "updatedAt": coalesce(updatedAt, _updatedAt),
      readingTime,
      categories,
      contentPillar,
      "heroImage": coalesce(
        heroImage{asset->{url}, alt},
        mainImage{asset->{url}, alt}
      ),
      ${authorFragment},
      "relatedIngredients": relatedIngredients[]->{name, "slug": slug.current},
      "relatedConcerns": relatedConcerns[]->{
        "name": coalesce(title, name),
        "slug": slug.current
      },
      ${faqsFragment},
      "metaTitle": coalesce(seo.title, metaTitle),
      "metaDescription": coalesce(seo.description, metaDescription)
    }
  `,
    { slug }
  );
}

// ── Ingredients ───────────────────────────────────────────────────

export async function getIngredients(): Promise<Ingredient[]> {
  return sanityClient.fetch(`
    *[_type == "ingredient" && (defined(body) || defined(description)) && !(slug.current in ["retinol", "vitamin-c"])] | order(name asc) {
      _id,
      name,
      "slug": slug,
      tagline,
      overview,
      extractableSummary,
      heroImage{asset->{url}, alt}
    }
  `);
}

export async function getIngredientBySlug(
  slug: string
): Promise<Ingredient | null> {
  return sanityClient.fetch(
    `
    *[_type == "ingredient" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug,
      tagline,
      "overview": coalesce(overview, extractableSummary),
      // New schema uses "description" (blockContent); legacy used "body"
      "body": coalesce(
        body[] {
          ...,
          markDefs[] {
            ...,
            _type == "ingredientRef" => {
              "ingredient": ingredient-> { _id, name, slug }
            },
            _type == "productRef" => {
              "product": product-> { _id, name, slug }
            }
          }
        },
        description[] {
          ...,
          markDefs[] {
            ...,
            _type == "ingredientRef" => {
              "ingredient": ingredient-> { _id, name, slug }
            },
            _type == "productRef" => {
              "product": product-> { _id, name, slug }
            }
          }
        }
      ),
      scientificName,
      howItWorks,
      benefits[] {
        _key,
        benefit,
        "description": coalesce(description, efficacy),
        efficacy,
        studyLink
      },
      researchCitations[] {
        _key,
        title,
        journal,
        year,
        url
      },
      ${faqsFragment},
      "metaTitle": coalesce(seo.title, metaTitle),
      "metaDescription": coalesce(seo.description, metaDescription),
      heroImage{asset->{url}, alt},
      "relatedConcerns": relatedConcerns[]->{
        "name": coalesce(title, name),
        "slug": slug.current,
        tagline
      },
      "relatedArticles": relatedArticles[]->{title, "slug": slug.current, excerpt}
    }
  `,
    { slug }
  );
}

// ── Skin Concerns ─────────────────────────────────────────────────

export async function getSkinConcerns(): Promise<SkinConcern[]> {
  return sanityClient.fetch(`
    *[_type == "skinConcern"] | order(coalesce(title, name) asc) {
      _id,
      "name": coalesce(title, name),
      "slug": slug,
      tagline,
      overview,
      heroImage{asset->{url}, alt}
    }
  `);
}

export async function getSkinConcernBySlug(
  slug: string
): Promise<SkinConcern | null> {
  return sanityClient.fetch(
    `
    *[_type == "skinConcern" && slug.current == $slug][0] {
      _id,
      "slug": slug,
      // Prefer new schema field "title", fall back to legacy "name"
      "name": coalesce(title, name),
      tagline,
      overview,
      // New schema uses blockContent fields; legacy used body/causes/symptoms/routineTips
      body[] {
        ...,
        markDefs[] {
          ...,
          _type == "ingredientRef" => {
            "ingredient": ingredient-> { _id, name, slug }
          },
          _type == "productRef" => {
            "product": product-> { _id, name, slug }
          }
        }
      },
      rootCauses,
      preventionTips,
      causes,
      symptoms,
      routineTips,
      ${faqsFragment},
      // SEO: prefer nested seo object, fall back to top-level legacy fields
      "metaTitle": coalesce(seo.title, metaTitle),
      "metaDescription": coalesce(seo.description, metaDescription),
      heroImage{asset->{url}, alt},
      "recommendedIngredients": recommendedIngredients[]->{name, "slug": slug.current, tagline, overview},
      "relatedArticles": relatedArticles[]->{title, "slug": slug.current, excerpt}
    }
  `,
    { slug }
  );
}

// ── Routine Guides ────────────────────────────────────────────────

export async function getRoutineGuides(): Promise<RoutineGuide[]> {
  return sanityClient.fetch(`
    *[_type == "routineGuide"] | order(title asc) {
      _id,
      title,
      slug,
      extractableSummary,
      skinType,
      timeOfDay,
      concern-> { _id, title, slug }
    }
  `);
}

export async function getRoutineGuideBySlug(
  slug: string
): Promise<RoutineGuide | null> {
  return sanityClient.fetch(
    `
    *[_type == "routineGuide" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      extractableSummary,
      skinType,
      timeOfDay,
      concern-> { _id, title, slug },
      steps[] {
        _key,
        stepName,
        description,
        duration,
        product-> { _id, name, slug, description, price, inStock, image, rating, reviewCount, skinTypes }
      },
      commonMistakes,
      ${faqsFragment}
    }
  `,
    { slug }
  );
}

// ── Products ──────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return sanityClient.fetch(`
    *[_type == "product"] | order(name asc) {
      _id,
      name,
      slug,
      description,
      price,
      inStock,
      image,
      rating,
      reviewCount,
      skinTypes,
      ingredients[]-> { _id, name, slug },
      concernsAddressed[]-> { _id, title, slug }
    }
  `);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return sanityClient.fetch(
    `
    *[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      price,
      inStock,
      image,
      rating,
      reviewCount,
      skinTypes,
      ingredients[]-> { _id, name, slug },
      concernsAddressed[]-> { _id, title, slug, extractableSummary }
    }
  `,
    { slug }
  );
}

// ── Comparisons ───────────────────────────────────────────────────

export async function getComparisons(): Promise<Comparison[]> {
  return sanityClient.fetch(`
    *[_type == "comparison"] | order(title asc) {
      _id,
      title,
      slug,
      extractableSummary,
      comparisonType
    }
  `);
}

export async function getComparisonBySlug(
  slug: string
): Promise<Comparison | null> {
  return sanityClient.fetch(
    `
    *[_type == "comparison" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug,
      "intro": coalesce(intro, extractableSummary),
      body[] {
        ...,
        markDefs[] {
          ...,
          _type == "ingredientRef" => {
            "ingredient": ingredient-> { _id, name, slug }
          },
          _type == "productRef" => {
            "product": product-> { _id, name, slug }
          }
        }
      },
      verdict,
      // Support both legacy comparisonTable and new itemsCompared schema
      "comparisonTable": coalesce(
        comparisonTable[] {
          _key,
          productName,
          brand,
          price,
          keyIngredients,
          prosText,
          consText,
          rating,
          bestFor
        },
        itemsCompared[] {
          _key,
          "productName": name,
          "brand": null,
          "price": null,
          "keyIngredients": null,
          "prosText": array::join(pros, "\n"),
          "consText": array::join(cons, "\n"),
          "rating": null,
          "bestFor": description
        }
      ),
      ${faqsFragment},
      "metaTitle": coalesce(seo.title, metaTitle),
      "metaDescription": coalesce(seo.description, metaDescription),
      heroImage{asset->{url}, alt}
    }
  `,
    { slug }
  );
}
