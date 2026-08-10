import { useEffect, useRef } from "react";
import { analyticsBlocked } from "@/lib/analytics";

const THRESHOLDS = [25, 50, 75, 100] as const;

export default function ScrollDepthTracker() {
  const firedRef = useRef(new Set<number>());

  useEffect(() => {
    const handler = () => {
      /*
        This fires gtag/fbq directly rather than going through trackEvent(),
        so it does not inherit trackEvent's consent gate. It was previously
        safe only by accident: both globals are defined solely inside
        initAnalyticsScripts(), which is itself gated, so a denied visitor
        had no gtag to call. That is an implicit guarantee held together by
        load order — anything that defines gtag earlier (GTM snippet, a
        consent-mode default, a tag manager) would turn this into a live
        leak with no code change here. Checked per event rather than once
        per mount so revoking consent mid-session stops it immediately.
      */
      if (analyticsBlocked()) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const t of THRESHOLDS) {
        if (pct >= t && !firedRef.current.has(t)) {
          firedRef.current.add(t);

          // GA4 via gtag
          if (typeof (window as any).gtag === "function") {
            (window as any).gtag("event", "scroll_depth", {
              scroll_percentage: t,
              page_path: window.location.pathname,
            });
          }

          // Meta Pixel custom event
          (window as any).fbq?.("trackCustom", "ScrollDepth", {
            percentage: t,
            page_path: window.location.pathname,
          });
        }
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return null;
}
