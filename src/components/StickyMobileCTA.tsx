import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

/*
 * STICKY MOBILE CTA (homepage)
 *
 * Mirrors the proven `md:hidden fixed bottom-0` bar from
 * src/pages/FaceCream.tsx. It observes the homepage's primary CTA and
 * appears only after that button has moved above the viewport, preventing
 * two competing purchase controls from being visible at once.
 */
const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroCta = document.getElementById("hero-primary-cta");
    if (heroCta && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      });
      observer.observe(heroCta);
      return () => observer.disconnect();
    }

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > window.innerHeight);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] p-[12px_16px] flex items-center justify-between gap-3 transition-transform duration-300 pb-[calc(12px+env(safe-area-inset-bottom))] ${
        visible ? "translate-y-0 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]" : "translate-y-full pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <div className="flex flex-col leading-none">
        <span className="font-heading font-bold text-[20px] text-[#1A2F4C]">$38</span>
        {/* #6B7280 (4.83:1 on white), not #ABB3BB — that was 2.12:1 and failed AA. */}
        <span className="font-body text-[11px] text-[#6B7280] mt-1">Founding Price</span>
      </div>
      {/*
        Routes to the PDP for the same reason as the hero CTA: this bar is the
        persistent catcher for mobile cold traffic, which is where most paid
        clicks land. The offer query makes the PDP open on the same $38 single
        bottle promised by this button, while preserving the PDP view signal.
        bg-brand is the site-wide CTA orange (5.12:1 with white, AA pass). No
        hover shade — this component is md:hidden, so hover never fires.
      */}
      <Link
        to="/face-cream?offer=single"
        onClick={() => trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "home_sticky_mobile" })}
        aria-label="Get Base Layer Performance Daily Face Cream — founding price $38"
        tabIndex={visible ? 0 : -1}
        className="shrink-0 bg-brand text-white font-heading font-bold text-[13px] tracking-[0.1em] uppercase px-[24px] py-[14px] rounded-[4px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
      >
        GET BASE LAYER &middot; $38 &rarr;
      </Link>
    </div>
  );
};

export default StickyMobileCTA;
