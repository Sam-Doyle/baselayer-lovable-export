import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EarlyAccessProvider } from "@/context/EarlyAccessContext";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import MetaRouterTracker from "@/analytics/MetaRouterTracker";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/SEO";
import { useCartSync } from "@/hooks/useCartSync";
import {
  clearAnalyticsCookies,
  fireInitialCapiPageView,
  initAnalyticsScripts,
  initWebVitalsReporting,
} from "@/lib/analytics";
import { onConsentChange } from "@/lib/consent";
import { clearLifecycleTracking, initLifecycleTracking } from "@/lib/lifecycle";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import PrerenderSnapshotRouteGuard from "@/components/PrerenderSnapshotRouteGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import ShopifyCartDrawer from "@/components/ShopifyCartDrawer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
const QueryRoute = lazy(() => import("@/components/QueryRoute"));
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));

// Blog + BlogPost pages removed — /blog and /blog/:slug redirect to /articles
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Ingredients = lazy(() => import("./pages/Ingredients"));
const IngredientDetail = lazy(() => import("./pages/IngredientDetail"));
const SkinConcerns = lazy(() => import("./pages/SkinConcerns"));
const SkinConcernDetail = lazy(() => import("./pages/SkinConcernDetail"));
const Comparisons = lazy(() => import("./pages/Comparisons"));
const ComparisonDetail = lazy(() => import("./pages/ComparisonDetail"));
const FaceCream = lazy(() => import("./pages/FaceCream"));
const MatteMoisturizer = lazy(() => import("./pages/MatteMoisturizer"));
const NonGreasyMoisturizer = lazy(() => import("./pages/NonGreasyMoisturizer"));
const AllInOneSkincare = lazy(() => import("./pages/AllInOneSkincare"));
const About = lazy(() => import("./pages/About"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Listicle = lazy(() => import("./pages/advertorials/Listicle"));
const ListicleGirlfriend = lazy(() => import("./pages/advertorials/ListicleGirlfriend"));
const OneBottleExperiment = lazy(() => import("./pages/advertorials/OneBottleExperiment"));
const PeptideStack = lazy(() => import("./pages/advertorials/PeptideStack"));
const ConcentrationTest = lazy(() => import("./pages/advertorials/ConcentrationTest"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const SkinConcernQuiz = lazy(() => import("@/components/SkinConcernQuiz"));

const PageFallback = () => <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;

// ErrorBoundary wraps Suspense (not the reverse) — see the doc comment in
// ErrorBoundary.tsx for why the boundary lives here, per-route, rather than
// around the whole app.
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>{children}</Suspense>
  </ErrorBoundary>
);

const QueryWrap = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>
      <QueryRoute>{children}</QueryRoute>
    </Suspense>
  </ErrorBoundary>
);

const App = () => {
  useCartSync();
  const [quizRuntimeReady, setQuizRuntimeReady] = useState(
    () => new URLSearchParams(window.location.search).get("quiz") === "preview",
  );

  // The quiz is intentionally absent from the initial/LCP path. Load its
  // dialog code only after the hero and purchase UI have had time to settle;
  // SkinConcernQuiz owns the remaining delay before it opens.
  useEffect(() => {
    if (quizRuntimeReady) return;
    const timer = window.setTimeout(() => setQuizRuntimeReady(true), 3_000);
    return () => window.clearTimeout(timer);
  }, [quizRuntimeReady]);

  useEffect(() => {
    // ── UTM + fbclid Capture ──
    // Persist UTMs to sessionStorage so downstream events (CAPI, analytics.ts)
    // can attach campaign data even after React Router consumes the URL.
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) sessionStorage.setItem(key, value);
    });
    const fbclid = params.get("fbclid");
    if (fbclid) {
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      sessionStorage.setItem("_fbc", fbc);
    }

    // Brevo lifecycle tracking is provider-isolated from GA4/Meta and only
    // initializes for a previously identified marketing subscriber. A new
    // visitor's product/cart events stay in memory until the opt-in succeeds.
    initLifecycleTracking();

    // Disable pixel tracking for bots and iframes
    const isBot = /Lighthouse|Chrome-Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent);
    const isEmbedded = window.top !== window.self;
    if (isBot || isEmbedded) {
      (window as Window & { __META_PIXEL_DISABLED__?: boolean }).__META_PIXEL_DISABLED__ = true;
    }

    // ── Immediate CAPI PageView ──
    // Fire a server-side PageView via Meta Conversions API right now.
    // This captures 100% of page views regardless of whether the browser
    // pixel loads in time. Uses raw fetch() — no Supabase SDK import.
    // The deferred browser pixel fires the same event_id for dedup.
    //
    // COOKIE-CONSENT GATE: the fetch above (and the bl_session/_fbp cookies
    // it writes) now lives in fireInitialCapiPageView() in src/lib/analytics.ts,
    // which no-ops until the visitor has accepted analytics cookies — see
    // src/lib/consent.ts. Calling it unconditionally here is safe. The
    // consent-change subscription effect further down calls it again (plus
    // initAnalyticsScripts() below) the moment consent is granted, so a
    // visitor who accepts mid-session still gets an initial page_view
    // instead of losing it.
    fireInitialCapiPageView();

    // ── Deferred Analytics Loader ──
    // Load GA4 + Meta Pixel after main content paints. Uses window.__BL
    // (set in index.html <head>) to recover the original landing URL with
    // UTMs, which React Router may have already consumed.
    //
    // COOKIE-CONSENT GATE: script injection now lives in
    // initAnalyticsScripts() in src/lib/analytics.ts, which no-ops until
    // consent is granted. Scheduling still happens here.
    if (!isBot && !isEmbedded) {
      // Defer analytics until after critical rendering completes.
      // requestIdleCallback fires when truly idle (no forced timeout);
      // setTimeout at 3s is the guaranteed fallback for slow connections.
      let analyticsLoaded = false;
      const loadOnce = () => {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        initAnalyticsScripts();
        initWebVitalsReporting();
      };
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (callback: IdleRequestCallback) => number }).requestIdleCallback(loadOnce);
      }
      setTimeout(loadOnce, 3000);
    }

    // Block CAPI Gateway (capig.datah04.com) — the FB pixel tries to reach a
    // Conversions API Gateway that is not configured. Server-side CAPI is
    // handled by the Supabase fb-capi edge function, so silently drop these.
    const blockedHost = "capig.datah04.com";
    const _origFetch = window.fetch;
    window.fetch = function (...args: Parameters<typeof fetch>) {
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : "";
      if (url.includes(blockedHost)) {
        return Promise.resolve(new Response("{}", { status: 200 }));
      }
      return _origFetch.apply(this, args);
    };
    const _origBeacon = navigator.sendBeacon?.bind(navigator);
    if (_origBeacon) {
      navigator.sendBeacon = function (url: string, data?: BodyInit | null) {
        if (url.includes(blockedHost)) return true;
        return _origBeacon(url, data);
      };
    }
  }, []);

  // ── Cookie-consent reaction ──
  // If the visitor accepts on the banner after this page has already
  // loaded, fire the page_view/PageView that the gated calls above skipped
  // and load GA4 + the Meta Pixel now. If they reject (including revoking
  // an earlier accept via the footer's "Cookie Preferences" link), drop the
  // first-party cookies this app controls directly — see the caveats in
  // clearAnalyticsCookies() in src/lib/analytics.ts.
  useEffect(() => {
    return onConsentChange((choice) => {
      if (choice === "accepted") {
        fireInitialCapiPageView();
        initAnalyticsScripts();
        initWebVitalsReporting();
        initLifecycleTracking();
      } else {
        clearAnalyticsCookies();
        // Removing a script tag cannot stop JavaScript that has already
        // executed. Reload only when the lifecycle SDK was active so Reject
        // takes full effect without burdening first-time rejections.
        if (clearLifecycleTracking()) window.location.reload();
      }
    });
  }, []);

  return (
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <EarlyAccessProvider>
          <BrowserRouter>
            <PrerenderSnapshotRouteGuard />
            <MetaRouterTracker />
            <Routes>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/face-cream" element={<Wrap><FaceCream /></Wrap>} />
              <Route path="/matte-moisturizer-for-men" element={<Wrap><MatteMoisturizer /></Wrap>} />
              <Route path="/non-greasy-moisturizer-for-men" element={<Wrap><NonGreasyMoisturizer /></Wrap>} />
              <Route path="/all-in-one-skincare-for-men" element={<Wrap><AllInOneSkincare /></Wrap>} />
              <Route path="/about" element={<QueryWrap><About /></QueryWrap>} />
              <Route path="/checkout" element={<Navigate to="/face-cream" replace />} />
              <Route path="/blog" element={<Navigate to="/articles" replace />} />
              <Route path="/blog/:slug" element={<Navigate to="/articles" replace />} />
              <Route path="/articles" element={<QueryWrap><Articles /></QueryWrap>} />
              <Route path="/articles/:slug" element={<QueryWrap><ArticleDetail /></QueryWrap>} />
              <Route path="/ingredients" element={<QueryWrap><Ingredients /></QueryWrap>} />
              <Route path="/ingredients/copper-peptide-ghk-cu" element={<Navigate to="/ingredients/copper-peptide" replace />} />
              <Route path="/ingredients/:slug" element={<QueryWrap><IngredientDetail /></QueryWrap>} />
              <Route path="/skin-concerns" element={<QueryWrap><SkinConcerns /></QueryWrap>} />
              <Route path="/skin-concerns/:slug" element={<QueryWrap><SkinConcernDetail /></QueryWrap>} />
              <Route path="/comparisons" element={<QueryWrap><Comparisons /></QueryWrap>} />
              <Route path="/comparisons/:slug" element={<QueryWrap><ComparisonDetail /></QueryWrap>} />
              <Route path="/product/:handle" element={<Wrap><ProductDetail /></Wrap>} />
              <Route path="/lp" element={<Wrap><LandingPage /></Wrap>} />
              <Route path="/article/5-reasons" element={<Wrap><Listicle /></Wrap>} />
              <Route path="/article/2-minute-routine" element={<Wrap><ListicleGirlfriend /></Wrap>} />
              <Route path="/article/one-bottle-experiment" element={<Wrap><OneBottleExperiment /></Wrap>} />
              <Route path="/article/peptide-stack" element={<Wrap><PeptideStack /></Wrap>} />
              <Route path="/article/concentration-test" element={<Wrap><ConcentrationTest /></Wrap>} />
              <Route path="/privacy-policy" element={<Wrap><PrivacyPolicy /></Wrap>} />
              <Route path="/terms-of-service" element={<Wrap><TermsOfService /></Wrap>} />
              <Route path="/refund-policy" element={<Wrap><RefundPolicy /></Wrap>} />
              <Route path="/shipping-policy" element={<Wrap><ShippingPolicy /></Wrap>} />
              <Route path="*" element={<Wrap><NotFound /></Wrap>} />
            </Routes>
            {quizRuntimeReady && (
              <Suspense fallback={null}>
                <SkinConcernQuiz />
              </Suspense>
            )}
            <CookieConsentBanner />
          </BrowserRouter>
          <ShopifyCartDrawer />
        </EarlyAccessProvider>
      </TooltipProvider>
  );
};

export default App;
