import { useEffect, useRef } from "react";

const THRESHOLDS = [25, 50, 75, 100] as const;

export default function ScrollDepthTracker() {
  const firedRef = useRef(new Set<number>());

  useEffect(() => {
    const handler = () => {
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
