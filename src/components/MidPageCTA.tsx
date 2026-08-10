import { useEarlyAccess } from "@/context/EarlyAccessContext";

/*
 * MID-PAGE CTA
 *
 * Reusable band-style CTA for closing conversion gaps between
 * persuasion sections (ingredients, testimonials, etc).
 *
 * Adds to cart directly via useEarlyAccess().openModal(source). This is
 * deliberate and differs from the hero and sticky-mobile CTAs, which link
 * to /face-cream instead: by the time a visitor reaches one of these bands
 * they've scrolled past the ingredient and testimonial sections, so they've
 * already consumed the education the PDP would provide. The hero has not
 * earned that assumption, which is why it routes to the PDP.
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
  const { openModal } = useEarlyAccess();
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
          #C04510 is the site-wide CTA orange: 5.12:1 with white, AA pass.
          hover:#A83C0E is 6.33:1. Don't lighten either toward the old #D94E12
          (4.16:1) — the rest state is what mobile sees, since hover never fires
          on touch.
        */}
        <button
          type="button"
          onClick={() => openModal(source)}
          className="shrink-0 px-8 py-4 bg-[#C04510] text-white font-heading font-bold text-[13px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-[#A83C0E] transition-colors duration-300 w-full sm:w-auto whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C04510]"
        >
          {ctaLabel}
        </button>
      </div>
    </section>
  );
};

export default MidPageCTA;
