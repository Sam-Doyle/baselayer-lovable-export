import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import ProofStrip from "@/components/ProofStrip";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollDepthTracker from "@/analytics/ScrollDepthTracker";
import SectionViewTracker from "@/analytics/SectionViewTracker";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";
import { metaFor } from "@/config/pageSeo";
import { merchantOfferFields } from "@/config/merchantSchema";
import { completeHomepageFragmentHandoff, homepageFragmentId } from "@/lib/prerenderHandoff";

const HomeBelowFold = lazy(() => import("@/components/HomeBelowFold"));

// This shares the lazy boundary so its effect cannot run against a fallback
// or survive navigation away while the below-fold chunk is still pending.
const HomepageFragmentReady = () => {
  const { pathname, hash, key } = useLocation();
  useLayoutEffect(() => {
    completeHomepageFragmentHandoff(pathname, hash);
  }, [pathname, hash, key]);
  return null;
};

const REVIEW_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream",
  brand: { "@type": "Brand", name: "Base Layer" },
  sku: "BL-PDFC-50ML",
  description:
    "Advanced men's face moisturizer with niacinamide, copper peptide GHK-Cu, panthenol, centella asiatica, squalane, and hyaluronic acid. Fragrance-free. 50mL.",
  image: "https://baselayerskin.co/og-mountain-product-v2.jpg",
  url: "https://baselayerskin.co/face-cream",
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://baselayerskin.co/face-cream",
    priceValidUntil: "2026-12-31",
    ...merchantOfferFields("38.00"),
  },
};

const Index = () => {
  const { hash } = useLocation();
  const [showBelowFold, setShowBelowFold] = useState(() => homepageFragmentId(hash) !== null);

  useCanonical();
  useMetaTags(metaFor("/"));

  useEffect(() => {
    if (homepageFragmentId(hash)) setShowBelowFold(true);
  }, [hash]);

  useEffect(() => {
    let idleId: number | undefined;
    let fallbackId: number | undefined;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setShowBelowFold(true);
    };

    const scheduleAfterLoad = () => {
      // Keep this chunk out of the LCP window even when requestIdleCallback
      // fires eagerly on a quiet main thread. Immediate scroll/touch/pointer
      // intent still bypasses the delay through the listeners below.
      fallbackId = setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleId = (window as Window & {
            requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
          }).requestIdleCallback(reveal, { timeout: 1000 });
        } else {
          reveal();
        }
      }, 3000) as unknown as number;
    };

    const intentOptions: AddEventListenerOptions = { passive: true, once: true };
    window.addEventListener("scroll", reveal, intentOptions);
    window.addEventListener("touchstart", reveal, intentOptions);
    window.addEventListener("pointerdown", reveal, intentOptions);

    if (document.readyState === "complete") scheduleAfterLoad();
    else window.addEventListener("load", scheduleAfterLoad, { once: true });

    return () => {
      window.removeEventListener("load", scheduleAfterLoad);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("touchstart", reveal);
      window.removeEventListener("pointerdown", reveal);
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (fallbackId !== undefined) window.clearTimeout(fallbackId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <JsonLd data={[REVIEW_SCHEMA]} />
      <ScrollDepthTracker />
      <SectionViewTracker />
      <ScrollProgressBar />

      <Navbar />

      <HeroSection />
      <StickyMobileCTA />

      <ProofStrip />
      {showBelowFold && (
        <Suspense fallback={null}>
          <HomeBelowFold />
          <HomepageFragmentReady />
        </Suspense>
      )}
    </main>
  );
};

export default Index;
