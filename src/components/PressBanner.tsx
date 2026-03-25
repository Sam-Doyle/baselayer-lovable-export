import { useEffect, useState, useRef } from "react";

/*
 * PRESS / INGREDIENT BANNER
 *
 * Scrolling marquee of publication logos where Base Layer's
 * active ingredients have been featured.
 *
 * Copy: "Ingredients Featured In:"
 * Background: Alpine navy (#1A2F4C)
 * Logos: White SVG wordmarks rendered inline
 *
 * Uses pure CSS animation (no JS timers). Duplicates the
 * logo strip for seamless infinite scroll.
 */

const publications = [
  { name: "Men's Health", wordmark: "MEN'S HEALTH" },
  { name: "GQ", wordmark: "GQ" },
  { name: "Forbes", wordmark: "FORBES" },
  { name: "Gear Patrol", wordmark: "GEAR PATROL" },
  { name: "Healthline", wordmark: "HEALTHLINE" },
  { name: "Cleveland Clinic", wordmark: "CLEVELAND CLINIC" },
  { name: "Men's Journal", wordmark: "MEN'S JOURNAL" },
  { name: "Esquire", wordmark: "ESQUIRE" },
];

/** Renders each publication as a humble text mention */
const LogoWordmark = ({ name, wordmark }: { name: string; wordmark: string }) => {
  return (
    <span
      className="font-body font-semibold text-[12px] text-[#ABB3BB] whitespace-nowrap select-none tracking-[0.05em]"
      aria-label={name}
    >
      {wordmark}
    </span>
  );
};

const PressBanner = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const logoStrip = publications.map((pub, i) => (
    <div key={i} className="flex items-center shrink-0 px-6 md:px-10">
      <LogoWordmark name={pub.name} wordmark={pub.wordmark} />
    </div>
  ));

  return (
    <div
      ref={ref}
      className="bg-[#1A2F4C] overflow-hidden transition-all duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Label */}
      <div className="text-center pt-5 pb-2">
        <span className="font-body text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/50">
          Ingredients Featured In
        </span>
      </div>

      {/* Scrolling marquee */}
      <div className="relative py-4 pb-5">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-[#1A2F4C] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-[#1A2F4C] to-transparent z-10 pointer-events-none" />

        {/* Animated strip — duplicated for seamless loop */}
        <div className="flex animate-marquee">
          <div className="flex shrink-0 items-center">
            {logoStrip}
          </div>
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {logoStrip}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressBanner;
