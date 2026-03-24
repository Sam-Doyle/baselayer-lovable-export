import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScrollDepthTracker from "@/analytics/ScrollDepthTracker";
import SectionViewTracker from "@/analytics/SectionViewTracker";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";

const PerformanceSpecsSection = lazy(() => import("@/components/PerformanceSpecsSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const TheGearSection = lazy(() => import("@/components/TheGearSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const WhyMensSkinSection = lazy(() => import("@/components/WhyMensSkinSection"));
const OurOriginSection = lazy(() => import("@/components/OurOriginSection"));
const Footer = lazy(() => import("@/components/Footer"));
const SocialProofBar = lazy(() => import("@/components/SocialProofBar"));
const PressBanner = lazy(() => import("@/components/PressBanner"));
const ScrollProgressBar = lazy(() => import("@/components/ScrollProgressBar"));

const FEATURED_ARTICLES = [
  {
    title: "The 3-Step Skincare Routine for Active Men",
    slug: "/articles/3-step-skincare-routine",
    description: "A no-BS daily routine built around three products. Cleanse, treat, protect — in under two minutes.",
  },
  {
    title: "Best Moisturizer for Oily Skin",
    slug: "/articles/best-moisturizer-oily-skin-men",
    description: "Why heavyweight creams make oily skin worse, and what to look for in a matte-finish moisturizer.",
  },
  {
    title: "CeraVe vs Base Layer",
    slug: "/comparisons/cerave-vs-base-layer",
    description: "A head-to-head comparison of ingredients, texture, and performance between two popular moisturizers.",
  },
  {
    title: "Best Moisturizer for Outdoor Workers",
    slug: "/articles/best-moisturizer-outdoor-workers",
    description: "Sun, wind, and dry air all day — here's what to look for in a face cream that can keep up.",
  },
];

const REVIEW_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream",
  brand: { "@type": "Brand", name: "Base Layer" },
  sku: "BL-PDFC-50ML",
  description:
    "Advanced men's face moisturizer with niacinamide, copper peptide GHK-Cu, panthenol, centella asiatica, squalane, and hyaluronic acid. Fragrance-free. 50mL.",
  image: "https://baselayerskin.co/og-face-cream.jpg",
  url: "https://baselayerskin.co/face-cream",
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://baselayerskin.co/face-cream",
    priceValidUntil: "2026-12-31",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Sean G." },
      reviewBody:
        "I used to blot my forehead before every afternoon meeting. One week on Base Layer and I stopped.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      datePublished: "2025-12-01",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Matt M." },
      reviewBody:
        "Everything I tried after shaving either stung or left a film. This absorbs fast and feels calm.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      datePublished: "2025-12-15",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Cooper S." },
      reviewBody:
        "Hotel air usually wrecks my skin. This is the one bottle I pack every trip.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5", worstRating: "1" },
      datePublished: "2026-01-05",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: "3",
    bestRating: "5",
  },
};

const Index = () => {
  useCanonical();
  useMetaTags({
    title: "Base Layer Skin | Built in CO for Harsh Elements",
    description: "One lightweight face moisturizer for men that hydrates, calms post-shave irritation, controls shine, and helps improve texture. Absorbs fast. No greasy finish.",
  });

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <JsonLd data={[REVIEW_SCHEMA]} />
      <ScrollDepthTracker />
      <SectionViewTracker />
      <Suspense fallback={null}>
        <ScrollProgressBar />
      </Suspense>

      <Navbar />

      <HeroSection />

      <Suspense fallback={null}>
        <SocialProofBar />
        <PressBanner />
        <WhyMensSkinSection />
        <PerformanceSpecsSection />
        <TestimonialsSection />
        <div className="content-auto">
          <TheGearSection />
        </div>
        <div className="content-auto">
          <FAQSection />
        </div>
        <section className="py-20 px-8 bg-background">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              THE INTEL.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURED_ARTICLES.map((article) => (
                <Link
                  key={article.slug}
                  to={article.slug}
                  className="block bg-card/50 border border-border rounded-lg p-6 hover:bg-card transition-colors group"
                >
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mt-2">
                    {article.description}
                  </p>
                  <span className="font-body text-xs text-primary mt-4 inline-block">
                    Read →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <div className="content-auto">
          <OurOriginSection />
        </div>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
