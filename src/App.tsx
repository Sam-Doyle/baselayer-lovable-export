import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EarlyAccessProvider } from "@/context/EarlyAccessContext";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import MetaRouterTracker from "@/analytics/MetaRouterTracker";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/SEO";
import { useCartSync } from "@/hooks/useCartSync";
import { fireInitialCapiPageView, initAnalyticsScripts, clearAnalyticsCookies } from "@/lib/analytics";
import { onConsentChange } from "@/lib/consent";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
const ShopifyCartDrawer = lazy(() => import("@/components/ShopifyCartDrawer"));

const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
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

// ── Deferred QueryClientProvider ──────────────────────────────────
// Dynamically imports @tanstack/react-query so the 36KB chunk is NOT
// in the synchronous ES module import chain. The homepage renders
// immediately without waiting for the chunk; react-query loads in the
// background. Pages that use useQuery are already behind Suspense/lazy
// boundaries so they naturally wait for the provider to be ready.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _rqModule: any = null;
const _rqPromise = import("@tanstack/react-query").then((m) => {
  _rqModule = m;
  return m;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _queryClient: any = null;

const DeferredQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(!!_rqModule);
  useEffect(() => {
    if (!ready) {
      _rqPromise.then(() => setReady(true));
    }
  }, [ready]);

  if (!ready || !_rqModule) {
    // react-query chunk not yet loaded — render children without the
    // provider. Safe because the homepage doesn't call useQuery, and
    // pages that do are behind lazy() boundaries that haven't loaded yet.
    return <>{children}</>;
  }

  if (!_queryClient) {
    _queryClient = new _rqModule.QueryClient();
  }

  return (
    <_rqModule.QueryClientProvider client={_queryClient}>
      {children}
    </_rqModule.QueryClientProvider>
  );
};

const PageFallback = () => <div style={{ minHeight: "100vh", background: "#0a0a0a" }} />;

// ErrorBoundary wraps Suspense (not the reverse) — see the doc comment in
// ErrorBoundary.tsx for why the boundary lives here, per-route, rather than
// around the whole app.
const Wrap = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageFallback />}>{children}</Suspense>
  </ErrorBoundary>
);

const App = () => {
  useCartSync();
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

    // Disable pixel tracking for bots and iframes
    const isBot = /Lighthouse|Chrome-Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent);
    const isEmbedded = window.top !== window.self;
    if (isBot || isEmbedded) {
      (window as any).__META_PIXEL_DISABLED__ = true;
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
      };
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadOnce);
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
      } else {
        clearAnalyticsCookies();
      }
    });
  }, []);

  return (
    <DeferredQueryProvider>
      <TooltipProvider>
        <Suspense fallback={null}><Toaster /></Suspense>
        <Suspense fallback={null}><Sonner /></Suspense>
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <EarlyAccessProvider>
          <BrowserRouter>
            <MetaRouterTracker />
            <Routes>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/face-cream" element={<Wrap><FaceCream /></Wrap>} />
              <Route path="/matte-moisturizer-for-men" element={<Wrap><MatteMoisturizer /></Wrap>} />
              <Route path="/non-greasy-moisturizer-for-men" element={<Wrap><NonGreasyMoisturizer /></Wrap>} />
              <Route path="/all-in-one-skincare-for-men" element={<Wrap><AllInOneSkincare /></Wrap>} />
              <Route path="/about" element={<Wrap><About /></Wrap>} />
              <Route path="/checkout" element={<Navigate to="/face-cream" replace />} />
              <Route path="/blog" element={<Navigate to="/articles" replace />} />
              <Route path="/blog/:slug" element={<Navigate to="/articles" replace />} />
              <Route path="/articles" element={<Wrap><Articles /></Wrap>} />
              <Route path="/articles/:slug" element={<Wrap><ArticleDetail /></Wrap>} />
              <Route path="/ingredients" element={<Wrap><Ingredients /></Wrap>} />
              <Route path="/ingredients/copper-peptide-ghk-cu" element={<Navigate to="/ingredients/copper-peptide" replace />} />
              <Route path="/ingredients/:slug" element={<Wrap><IngredientDetail /></Wrap>} />
              <Route path="/skin-concerns" element={<Wrap><SkinConcerns /></Wrap>} />
              <Route path="/skin-concerns/:slug" element={<Wrap><SkinConcernDetail /></Wrap>} />
              <Route path="/comparisons" element={<Wrap><Comparisons /></Wrap>} />
              <Route path="/comparisons/:slug" element={<Wrap><ComparisonDetail /></Wrap>} />
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
            <CookieConsentBanner />
          </BrowserRouter>
          <Suspense fallback={null}><ShopifyCartDrawer /></Suspense>
        </EarlyAccessProvider>
      </TooltipProvider>
    </DeferredQueryProvider>
  );
};

export default App;

