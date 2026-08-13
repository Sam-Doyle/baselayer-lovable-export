import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

/*
 * STICKY MOBILE CTA (homepage)
 *
 * Mirrors the proven `md:hidden fixed bottom-0` bar from
 * src/pages/FaceCream.tsx. It observes the homepage's primary CTA and
 * appears whenever that button is not fully visible. This keeps a purchase
 * action available on short phone screens where the hero CTA starts just
 * below the fold, while preventing two competing controls when the complete
 * hero button is already on screen.
 */
const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroCta = document.getElementById("hero-primary-cta");
    if (!heroCta) return;

    let frameId: number | undefined;
    const updateVisibility = () => {
      // The production prerender runs at a desktop viewport. Keep its static
      // snapshot closed so desktop state cannot flash an active mobile bar
      // while React hands the page off on a phone.
      if (!window.matchMedia("(max-width: 767px)").matches) {
        setVisible(false);
        return;
      }

      const rect = heroCta.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const fullyVisible = rect.top >= viewportTop && rect.bottom <= viewportBottom;
      setVisible(!fullyVisible);
    };

    const scheduleUpdate = () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateVisibility);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("load", scheduleUpdate, { once: true });
    window.visualViewport?.addEventListener("resize", scheduleUpdate, { passive: true });
    window.visualViewport?.addEventListener("scroll", scheduleUpdate, { passive: true });
    void document.fonts?.ready.then(scheduleUpdate);
    scheduleUpdate();

    return () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("load", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
    };
  }, []);

  return (
    <div
      data-prerender-handoff-hide
      className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <div className="flex min-w-0 flex-col leading-none">
        <span className="font-heading font-bold text-[20px] text-[#1A2F4C]">$38</span>
        {/* #6B7280 (4.83:1 on white), not #ABB3BB — that was 2.12:1 and failed AA. */}
        <span className="mt-1 truncate font-body text-[11px] text-[#6B7280]">1 Bottle &middot; Free shipping</span>
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
        className="min-h-12 shrink-0 rounded-[4px] bg-brand px-5 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
      >
        GET 1 BOTTLE &middot; $38
      </Link>
    </div>
  );
};

export default StickyMobileCTA;
