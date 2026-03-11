import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScrollDepthTracker from "@/analytics/ScrollDepthTracker";
import SectionViewTracker from "@/analytics/SectionViewTracker";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";

const PerformanceSpecsSection = lazy(() => import("@/components/PerformanceSpecsSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const TheGearSection = lazy(() => import("@/components/TheGearSection"));
const GuaranteeSection = lazy(() => import("@/components/GuaranteeSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const OurOriginSection = lazy(() => import("@/components/OurOriginSection"));
const Footer = lazy(() => import("@/components/Footer"));
const SocialProofBar = lazy(() => import("@/components/SocialProofBar"));
const ScrollProgressBar = lazy(() => import("@/components/ScrollProgressBar"));

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
    availability: "https://schema.org/PreOrder",
    url: "https://baselayerskin.co/face-cream",
    priceValidUntil: "2026-12-31",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Sean G." },
      reviewBody:
        "I used to blot my forehead before every afternoon meeting. One week on Base Layer and I stopped.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      datePublished: "2025-12-01",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Matt M." },
      reviewBody:
        "Everything I tried after shaving either stung or left a film. This absorbs fast and feels calm.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      datePublished: "2025-12-15",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Cooper S." },
      reviewBody:
        "Hotel air usually wrecks my skin. This is the one bottle I pack every trip.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
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
      <JsonLd data={[REVIEW_SCHEMA, buildBreadcrumbSchema([{ name: "Home", path: "/" }])]} />
      <ScrollDepthTracker />
      <SectionViewTracker />
      <Suspense fallback={null}>
        <ScrollProgressBar />
      </Suspense>

      {/* Offer strip below navbar */}
      <div className="bg-[#1B231D] text-[#E8EAE6] text-center py-2 font-body text-[11px] sm:text-[12px] tracking-[0.05em] uppercase fixed top-14 left-0 right-0 z-40 border-b border-[#2C3E2D]/50 flex items-center justify-center gap-2 px-4 shadow-sm">
        <span className="text-yellow-500/90 hidden sm:inline-block">⚠️</span>
        <span>Batch 01 (April 2026) is strictly limited to 500 bottles.</span>
      </div>
      <Navbar />

      <HeroSection />

      <Suspense fallback={null}>
        <SocialProofBar />
        <PerformanceSpecsSection />
        <TestimonialsSection />
        <div className="content-auto">
          <TheGearSection />
        </div>
        <div className="content-auto">
          <GuaranteeSection />
        </div>
        <div className="content-auto">
          <FAQSection />
        </div>
        <div className="content-auto">
          <OurOriginSection />
        </div>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
