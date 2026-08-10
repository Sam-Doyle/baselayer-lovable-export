import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

/*
 * MID-PAGE CTA
 *
 * Reusable band-style CTA for closing conversion gaps between
 * persuasion sections (ingredients, testimonials, etc).
 *
 * Routes to /face-cream via trackEvent("select_item", { source }) on click,
 * same as the hero and sticky-mobile CTAs. Every GRAB YOURS CTA on the site
 * sends visitors to the PDP rather than adding to cart directly — a direct
 * add locks the conversion to the $38 default tier and skips the PDP's
 * view_item / Meta ViewContent signal.
 *
 * `theme` flips the band's contrast so instances on the same page don't
 * read as identical stacked duplicates.
 */

interface MidPageCTAProps {
  headline: string;
  subhead: string;
  ctaLabel: string;
  source: string;
  theme?: "dark" | "light";
}

const MidPageCTA = ({ headline, subhead, ctaLabel, source, theme = "dark" }: MidPageCTAProps) => {
  const isDark = theme === "dark";

  return (
    <section
      className={`py-12 md:py-14 px-6 md:px-12 border-t border-b ${
        isDark ? "bg-[#1A2F4C] border-white/10" : "bg-[#F5F5F5] border-[#1A2F4C]/10"
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 text-center md:text-left">
        <div>
          <h2
            className={`font-heading text-xl md:text-[28px] font-bold uppercase tracking-tight leading-[1.15] mb-2 ${
              isDark ? "text-white" : "text-[#1A2F4C]"
            }`}
          >
            {headline}
          </h2>
          {/*
            Light theme needs /80, not /60: #1A2F4C at 60% over #F5F5F5 composites
            to 3.77:1 and fails AA for 14-16px text. /80 is 6.76:1. Dark theme's
            white/60 over #1A2F4C is already 5.88:1 and passes as-is.
          */}
          <p className={`font-body text-sm md:text-base ${isDark ? "text-white/60" : "text-[#1A2F4C]/80"}`}>
            {subhead}
          </p>
        </div>
        {/*
          bg-brand is the site-wide CTA orange: 5.12:1 with white, AA pass.
          brand-hover is 6.33:1. Both live in tailwind.config.ts — change them
          there, not here, and keep the rest state above 4.5:1, since that is
          what mobile sees when hover never fires.
        */}
        <Link
          to="/face-cream"
          onClick={() => trackEvent("select_item", { content_name: "Base Layer Face Cream", source })}
          className="inline-block text-center shrink-0 px-8 py-4 bg-brand text-white font-heading font-bold text-[13px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-brand-hover transition-colors duration-300 w-full sm:w-auto whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
};

export default MidPageCTA;
