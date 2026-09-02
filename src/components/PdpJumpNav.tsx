import { useEffect, useState } from "react";

const PDP_SECTIONS = [
  { id: "offer", label: "Offer" },
  { id: "results", label: "Results" },
  { id: "formula", label: "Formula" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
] as const;
const PDP_SECTIONS_WITHOUT_REVIEWS = PDP_SECTIONS.filter(({ id }) => id !== "reviews");

const DEFAULT_SECTION = PDP_SECTIONS[0].id;
const HEADER_COLLAPSE_SCROLL_Y = 100;

interface PdpJumpNavProps {
  showReviews?: boolean;
}

/**
 * In-page navigation for the face-cream PDP.
 *
 * The global header is 96px on mobile / 112px on desktop at the top of the page
 * and collapses to 68px after 100px of scroll. The matching offsets keep this
 * bar from hiding under it in either state. Target sections should use a scroll
 * margin of at least 160px so anchor jumps clear both fixed bars.
 */
const PdpJumpNav = ({ showReviews = true }: PdpJumpNavProps) => {
  const sections = showReviews ? PDP_SECTIONS : PDP_SECTIONS_WITHOUT_REVIEWS;
  const [activeSection, setActiveSection] = useState<string>(DEFAULT_SECTION);
  const [headerCollapsed, setHeaderCollapsed] = useState(
    () => typeof window !== "undefined" && window.scrollY > HEADER_COLLAPSE_SCROLL_Y,
  );

  useEffect(() => {
    const updateHeaderState = () => setHeaderCollapsed(window.scrollY > HEADER_COLLAPSE_SCROLL_Y);
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = sections.map(({ id }) => document.getElementById(id)).filter(
      (target): target is HTMLElement => target !== null,
    );
    if (targets.length === 0) return;

    const visible = new Map<Element, IntersectionObserverEntry>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target, entry);
          else visible.delete(entry.target);
        }

        const nearest = [...visible.values()].sort(
          (a, b) => Math.abs(a.boundingClientRect.top - 124) - Math.abs(b.boundingClientRect.top - 124),
        )[0];

        if (nearest?.target instanceof HTMLElement) {
          setActiveSection(nearest.target.id);
        }
      },
      {
        // The active band begins below the 68px global header and this 48px nav.
        rootMargin: "-116px 0px -60% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Product page sections"
      className={`sticky z-40 border-y border-[#E2E8F0] bg-white/95 shadow-[0_1px_3px_rgba(26,47,76,0.06)] backdrop-blur-[8px] transition-[top] duration-300 ${
        headerCollapsed ? "top-[68px]" : "top-[96px] md:top-[112px]"
      }`}
    >
      <div className="hide-scrollbar mx-auto max-w-[1200px] overflow-x-auto px-1 sm:px-6">
        <ul className="flex min-w-max items-center justify-start md:justify-center">
          {sections.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActiveSection(id)}
                  className={`relative flex min-h-12 items-center px-2.5 font-heading text-[10.5px] font-bold uppercase tracking-[0.08em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1A2F4C] sm:px-5 sm:text-[12px] sm:tracking-[0.14em] ${
                    isActive ? "text-[#1A2F4C]" : "text-[#6B7280] hover:text-[#1A2F4C]"
                  }`}
                >
                  {label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-2.5 bottom-0 h-[2px] bg-[#1A2F4C] transition-transform duration-200 sm:inset-x-4 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default PdpJumpNav;
