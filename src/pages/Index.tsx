import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MidPageCTA from "@/components/MidPageCTA";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import ScrollDepthTracker from "@/analytics/ScrollDepthTracker";
import SectionViewTracker from "@/analytics/SectionViewTracker";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";

const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const WhyMensSkinSection = lazy(() => import("@/components/WhyMensSkinSection"));
const OurOriginSection = lazy(() => import("@/components/OurOriginSection"));
const Footer = lazy(() => import("@/components/Footer"));
const PressBanner = lazy(() => import("@/components/PressBanner"));
const IngredientsShowcase = lazy(() => import("@/components/IngredientsShowcase"));
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
    availability: "https://schema.org/InStock",
    url: "https://baselayerskin.co/face-cream",
    priceValidUntil: "2026-12-31",
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
      <StickyMobileCTA />

      <Suspense fallback={null}>
        <PressBanner />
        <WhyMensSkinSection />
        <IngredientsShowcase />
        <MidPageCTA
          headline="EVERYTHING YOUR SKIN NEEDS. NOTHING IT DOESN'T."
          subhead="6 active ingredients. Clinical concentrations. Limited founding batch at $38."
          ctaLabel="RESERVE YOURS · $38 →"
          source="home_mid_ingredients"
          theme="dark"
        />
        <TestimonialsSection />
        <div className="content-auto">
          <FAQSection />
        </div>
        {/*
          Sits after the FAQ and before OurOriginSection, not at the page end:
          OurOriginSection already closes with its own "GRAB YOURS · $38" button,
          so putting this last would stack two near-identical $38 asks back to
          back with no persuasion content between them. Here it fills the real
          gap — the long testimonials-through-FAQ stretch with no CTA.
        */}
        <MidPageCTA
          headline="FOUNDING BATCH. LIMITED RUN."
          subhead="30-day guarantee. Hate it? Keep the bottle."
          ctaLabel="RESERVE MINE · $38 →"
          source="home_post_faq"
          theme="light"
        />
        <div className="content-auto">
          <OurOriginSection />
        </div>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
