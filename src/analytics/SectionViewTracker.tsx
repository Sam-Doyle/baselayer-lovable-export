import { useEffect } from "react";

/** Sections to observe — maps DOM id → readable name */
const SECTION_IDS: Record<string, string> = {
  hero: "Hero",
  ingredients: "Ingredients",
  "why-men-quit": "Why Men Quit",
  payoff: "Payoff",
  testimonials: "Testimonials",
  guarantee: "Guarantee",
  product: "Product",
  "who-we-are": "Who We Are",
};

export default function SectionViewTracker() {
  useEffect(() => {
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !seen.has(entry.target.id)) {
            seen.add(entry.target.id);
            const sectionName = SECTION_IDS[entry.target.id] || entry.target.id;

            // GA4 via gtag
            if (typeof (window as any).gtag === "function") {
              (window as any).gtag("event", "section_view", {
                section_name: sectionName,
                page_path: window.location.pathname,
              });
            }

            // Meta Pixel custom event
            (window as any).fbq?.("trackCustom", "SectionView", {
              section_name: sectionName,
              page_path: window.location.pathname,
            });
          }
        }
      },
      { threshold: 0.3 }
    );

    // Observe all sections with matching IDs
    for (const id of Object.keys(SECTION_IDS)) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
