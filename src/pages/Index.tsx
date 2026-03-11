import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScrollDepthTracker from "@/analytics/ScrollDepthTracker";
import SectionViewTracker from "@/analytics/SectionViewTracker";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";

const WhyMenQuitSection = lazy(() => import("@/components/WhyMenQuitSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const ProductSection = lazy(() => import("@/components/ProductSection"));
const GuaranteeSection = lazy(() => import("@/components/GuaranteeSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const WhoWeAreSection = lazy(() => import("@/components/WhoWeAreSection"));
const FinalCTASection = lazy(() => import("@/components/FinalCTASection"));
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

/*
 * LANDING PAGE — Optimized for cold Instagram ad traffic
 *
 * Section order (wireframe spec):
 * 1. Sticky top bar (offer + CTA)
 * 2. Hero (instant clarity + primary CTA)
 * 3. Trust strip (quick credibility)
 * 4. Problem / Solution (pain → fix)
 * 5. Testimonials / Proof (social proof)
 * 6. Product Benefits (outcomes + ingredients)
 * 7. Offer + Guarantee (risk reversal)
 * 8. FAQ (objection handling)
 * 9. Founder / Brand (human layer)
 * 10. Final CTA (close)
 *
 * Navigation: Minimal for paid traffic — no blog, about, learn links.
 */

const Index = () => {
  useCanonical();
  useMetaTags({
    title: "Base Layer Skin | Fast-Absorbing Face Moisturizer for Men",
    description:
      "One lightweight face moisturizer for men that hydrates, calms post-shave irritation, controls shine, and helps improve texture. Absorbs fast. No greasy finish.",
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
      <div className="bg-foreground text-background text-center py-1.5 font-body text-[10px] tracking-[0.2em] uppercase fixed top-14 left-0 right-0 z-40">
        $38 prelaunch &middot; free shipping &middot; 30-day guarantee
      </div>
      <Navbar minimal />

      <HeroSection />

      <Suspense fallback={null}>
        <SocialProofBar />
        <WhyMenQuitSection />
        <TestimonialsSection />
        <div className="content-auto">
          <ProductSection />
        </div>
        <div className="content-auto">
          <GuaranteeSection />
        </div>
        <div className="content-auto">
          <FAQSection />
        </div>
        <div className="content-auto">
          <WhoWeAreSection />
        </div>
        <div className="content-auto">
          <FinalCTASection />
        </div>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
