import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import IngredientsShowcase from "@/components/IngredientsShowcase";
import MidPageCTA from "@/components/MidPageCTA";
import OurOriginSection from "@/components/OurOriginSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import WhyMensSkinSection from "@/components/WhyMensSkinSection";

/**
 * The homepage content below the proof strip is intentionally bundled as one
 * deferred chunk. The prerenderer still captures the complete page for SEO,
 * while real visitors avoid downloading this code until the initial window
 * has loaded or they signal scroll/touch intent.
 */
const HomeBelowFold = () => (
  <>
    <WhyMensSkinSection />
    <IngredientsShowcase />
    <MidPageCTA
      headline="EVERYTHING YOUR SKIN NEEDS. NOTHING IT DOESN'T."
      subhead="6 active ingredients. Clinical concentrations. Limited founding batch at $38."
      ctaLabel="GET BASE LAYER · $38 →"
      source="home_mid_ingredients"
      theme="dark"
    />
    <TestimonialsSection />
    <div className="content-auto">
      <FAQSection />
    </div>
    <div className="content-auto">
      <OurOriginSection />
    </div>
    <Footer />
  </>
);

export default HomeBelowFold;
