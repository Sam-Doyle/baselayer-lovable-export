import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * SPA route-change tracker for GA4 + Meta Pixel + CAPI.
 *
 * Analytics scripts are loaded deferred via requestIdleCallback in App.tsx,
 * so gtag/fbq may not be available on the first route change. We poll briefly
 * (up to 3s) before giving up on any single navigation.
 *
 * Also fires a CAPI PageView for every route change so server-side coverage
 * matches the browser pixel 1:1 (improves Event Match Quality).
 *
 * Skips the initial mount — the deferred loader already fires the first
 * page_view and PageView, and App.tsx fires the initial CAPI PageView.
 */
export default function MetaRouterTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if ((window as any).__META_PIXEL_DISABLED__) return;

    const url = window.location.origin + location.pathname + location.search;
    const eventId = crypto.randomUUID();

    // ── CAPI PageView (fires immediately, no SDK dependency) ──
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fb-capi`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        event_name: "PageView",
        event_id: eventId,
        event_source_url: url,
        user_data: {
          client_user_agent: navigator.userAgent,
          external_id: sessionStorage.getItem("bl_session") || "",
          ...(cookies._fbc || sessionStorage.getItem("_fbc") ? { fbc: cookies._fbc || sessionStorage.getItem("_fbc") } : {}),
          ...(cookies._fbp ? { fbp: cookies._fbp } : {}),
        },
        custom_data: {},
      }),
    }).catch(() => {});

    // ── Browser-side GA4 + Pixel (poll until available) ──
    const fire = () => {
      let fired = false;

      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "page_view", {
          page_path: location.pathname + location.search,
          page_location: url,
          page_title: document.title,
        });
        fired = true;
      }

      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "PageView", {}, { eventID: eventId });
        fired = true;
      }

      return fired;
    };

    if (fire()) return;

    let attempts = 0;
    const maxAttempts = 15;
    const timer = setInterval(() => {
      attempts++;
      if (fire() || attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [location.pathname, location.search]);

  return null;
}
