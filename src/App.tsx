import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { EarlyAccessProvider } from "@/context/EarlyAccessContext";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import MetaRouterTracker from "@/analytics/MetaRouterTracker";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/SEO";
import { useCartSync } from "@/hooks/useCartSync";
const ShopifyCartDrawer = lazy(() => import("@/components/ShopifyCartDrawer"));

const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const EarlyAccessModal = lazy(() => import("@/components/EarlyAccessModal"));
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));

const Checkout = lazy(() => import("./pages/Checkout"));
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

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
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
    if (!isBot && !isEmbedded) {
      const pageViewEventId = crypto.randomUUID();
      (window as any).__BL_PV_EID = pageViewEventId;

      const bl = (window as any).__BL || { u: location.href, q: location.search };
      const cookies = document.cookie.split(";").reduce((acc, c) => {
        const [k, v] = c.trim().split("=");
        if (k && v) acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

      // Immediate _fbp generation to bypass Race Condition
      let fbp = cookies._fbp || null;
      if (!fbp && !isBot) {
        // format: fb.subdomainIndex.creationTime.random
        fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 10000000000)}`;
        const domain = window.location.hostname.replace("www.", "");
        document.cookie = `_fbp=${fbp}; path=/; max-age=7776000; domain=${domain}`; // 90 days
      }

      const fbc = cookies._fbc || sessionStorage.getItem("_fbc") || null;

      // Upgrade bl_session to persistent cookie (max-age 30 days)
      let sessionId = cookies.bl_session;
      if (!sessionId) {
        sessionId = sessionStorage.getItem("bl_session") || crypto.randomUUID();
        sessionStorage.setItem("bl_session", sessionId);
        document.cookie = `bl_session=${sessionId}; path=/; max-age=2592000`; // 30 days
      }

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fb-capi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          event_name: "PageView",
          event_id: pageViewEventId,
          event_source_url: bl.u,
          user_data: {
            client_user_agent: navigator.userAgent,
            external_id: sessionId,
            ...(fbc && { fbc }),
            ...(fbp && { fbp }),
          },
          custom_data: {
            ...(sessionStorage.getItem("utm_source") && { utm_source: sessionStorage.getItem("utm_source") }),
            ...(sessionStorage.getItem("utm_medium") && { utm_medium: sessionStorage.getItem("utm_medium") }),
            ...(sessionStorage.getItem("utm_campaign") && { utm_campaign: sessionStorage.getItem("utm_campaign") }),
          },
        }),
      }).catch(() => { });
    }

    // ── Deferred Analytics Loader ──
    // Load GA4 + Meta Pixel after main content paints. Uses window.__BL
    // (set in index.html <head>) to recover the original landing URL with
    // UTMs, which React Router may have already consumed.
    if (!isBot && !isEmbedded) {
      const loadAnalytics = () => {
        const w = window as any;
        const bl = w.__BL || { u: location.href, q: location.search };
        const landingParams = new URLSearchParams(bl.q || "");

        // ── GA4 (gtag.js) ──
        if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
          const gtagScript = document.createElement("script");
          gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-E1GTL9RHY0";
          gtagScript.async = true;
          document.head.appendChild(gtagScript);

          w.dataLayer = w.dataLayer || [];
          w.gtag = function () { w.dataLayer.push(arguments); };
          w.gtag("js", new Date());
          w.gtag("config", "G-E1GTL9RHY0", {
            send_page_view: true,
            page_location: bl.u,
            // Pass UTMs explicitly so GA4 attributes correctly even if
            // the URL has already been rewritten by React Router
            ...(landingParams.get("utm_source") && { campaign_source: landingParams.get("utm_source") }),
            ...(landingParams.get("utm_medium") && { campaign_medium: landingParams.get("utm_medium") }),
            ...(landingParams.get("utm_campaign") && { campaign_name: landingParams.get("utm_campaign") }),
            ...(landingParams.get("utm_content") && { campaign_content: landingParams.get("utm_content") }),
            ...(landingParams.get("utm_term") && { campaign_term: landingParams.get("utm_term") }),
          });
        }

        // ── Meta Pixel ──
        if (!w.fbq) {
          const f = w;
          const n = (f.fbq = function () {
            // eslint-disable-next-line prefer-rest-params
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          });
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = "2.0";
          n.queue = [];

          const fbScript = document.createElement("script");
          fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
          fbScript.async = true;
          document.head.appendChild(fbScript);

          w.fbq("init", "916078074161719");
          // Use the same event_id as the CAPI PageView for deduplication
          w.fbq("track", "PageView", {}, { eventID: (window as any).__BL_PV_EID });
        }
      };

      // Defer analytics until after critical rendering completes.
      // requestIdleCallback fires when truly idle (no forced timeout);
      // setTimeout at 3s is the guaranteed fallback for slow connections.
      let analyticsLoaded = false;
      const loadOnce = () => {
        if (analyticsLoaded) return;
        analyticsLoaded = true;
        loadAnalytics();
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

  return (
    <DeferredQueryProvider>
      <TooltipProvider>
        <Suspense fallback={null}><Toaster /></Suspense>
        <Suspense fallback={null}><Sonner /></Suspense>
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <EarlyAccessProvider>
          <CartProvider>
            <BrowserRouter>
              <MetaRouterTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/face-cream" element={<Wrap><FaceCream /></Wrap>} />
                <Route path="/matte-moisturizer-for-men" element={<Wrap><MatteMoisturizer /></Wrap>} />
                <Route path="/non-greasy-moisturizer-for-men" element={<Wrap><NonGreasyMoisturizer /></Wrap>} />
                <Route path="/all-in-one-skincare-for-men" element={<Wrap><AllInOneSkincare /></Wrap>} />
                <Route path="/about" element={<Wrap><About /></Wrap>} />
                <Route path="/checkout" element={<Wrap><Checkout /></Wrap>} />
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
                <Route path="*" element={<Wrap><NotFound /></Wrap>} />
              </Routes>
            </BrowserRouter>
            <Suspense fallback={null}><ShopifyCartDrawer /></Suspense>
            <Suspense fallback={null}><EarlyAccessModal /></Suspense>
          </CartProvider>
        </EarlyAccessProvider>
      </TooltipProvider>
    </DeferredQueryProvider>
  );
};

export default App;

