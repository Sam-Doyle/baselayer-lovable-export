import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { LEGAL } from "@/config/legal";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  /*
    The bar is transparent until scroll, so its text has to match whatever is
    behind it. Of the 19 pages that render this component, exactly one has a
    dark above-the-fold: "/" , where HeroSection is a photo over #1A2F4C. The
    other 18 inherit the near-white body background, where the dark text below
    is already correct. So this is a single-route exception, not a system —
    hence a pathname check rather than a prop threaded through every page.

    If you add another page with a dark hero, add it here or its nav goes
    invisible. That failure is silent, so it is worth a look on any new
    full-bleed hero.
  */
  const onDarkHero = pathname === "/" && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-transform duration-300 ${isScrolled ? "-translate-y-[36px]" : "translate-y-0"}`}>
      {/* Universal Offer Banner */}
      <div className="bg-[#1A2F4C] text-[#FFFFFF] text-center h-[36px] font-body uppercase w-full flex items-center justify-center px-4 shadow-sm relative z-50">
        {/*
          Threshold interpolated from LEGAL, not typed inline. This bar is the
          most-seen shipping claim on the site — if it and checkout disagree,
          this is the line a customer screenshots.
        */}
        <span className="font-heading font-semibold text-white tracking-[0.12em] text-[12px] uppercase hidden sm:inline leading-none mt-[1px]">FREE SHIPPING OVER ${LEGAL.freeShippingThreshold} · 30-DAY KEEP-THE-BOTTLE GUARANTEE · $38 FOUNDING PRICE</span>
        <span className="font-heading font-semibold text-white tracking-[0.12em] text-[12px] uppercase sm:hidden leading-none mt-[1px]">$38 FOUNDING PRICE · FREE SHIPPING OVER ${LEGAL.freeShippingThreshold}</span>
      </div>

      {/*
        The scrim on the dark-hero state is load-bearing, not styling. The hero
        photo under this bar is a bright sky (~rgb(120,150,165) at the 90th
        percentile) and HeroSection's own scrim runs to_right on md+, decaying
        to fully transparent past 60% — which is exactly where the nav links
        sit. Measured on the real asset, plain white links land at 3.33-4.13:1
        over that stretch and fail AA; navy is no better at 3.3-4.1:1, because
        a mid-tone sky is roughly equidistant from both. Nothing readable
        exists without adding ground here.

        This gradient reads ~0.55-0.6 alpha at the text band and fades to zero
        by the bar's lower edge, which puts the worst link at 7.6:1 while
        keeping the hero full-bleed rather than capping it with a solid bar.
      */}
      <nav
        className={`w-full transition-all duration-300 border-b ${isScrolled
          ? "bg-white/95 backdrop-blur-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-transparent py-3"
          : onDarkHero
            ? "bg-[linear-gradient(to_bottom,rgba(26,47,76,0.90)_0%,rgba(26,47,76,0.55)_60%,rgba(26,47,76,0)_100%)] border-transparent py-5"
            : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* LOGO: Industrial Typography + Alpine Accent Dot */}
          <Link to="/" className="flex items-center gap-0 group">
            <span className={`font-heading text-[22px] md:text-[26px] font-black tracking-normal uppercase leading-none transition-colors duration-300 ${onDarkHero ? "text-white" : "text-[#1A2F4C]"}`}>
              {/*
                The dot swaps token by ground, it is not two shades of the same
                idea: brand-accent (#C4470E) is 2.74:1 on navy and
                brand-accent-on-dark (#FF7034) is 2.76:1 on white. Neither hex
                passes AA on both, so the ground picks the token.
              */}
              BASE LAYER<span className={onDarkHero ? "text-brand-accent-on-dark" : "text-brand-accent"}>.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className={`hidden md:flex items-center gap-10 font-body text-[12px] lg:text-[13px] tracking-[0.2em] font-bold uppercase transition-colors duration-300 ${onDarkHero ? "text-white" : "text-[#1E201E]/70"}`}>
            <Link to="/face-cream" className={`transition-colors duration-300 ${onDarkHero ? "hover:text-brand-accent-on-dark" : "hover:text-brand-accent"}`}>
              The Gear
            </Link>
            <Link to="/ingredients" className={`transition-colors duration-300 ${onDarkHero ? "hover:text-brand-accent-on-dark" : "hover:text-brand-accent"}`}>
              Specs
            </Link>
            <Link to="/about" className={`transition-colors duration-300 ${onDarkHero ? "hover:text-brand-accent-on-dark" : "hover:text-brand-accent"}`}>
              Origin
            </Link>
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 md:gap-6">
            {/*
              Routes to the PDP, not straight to cart. This bar is on all 19
              pages including the ones cold traffic lands on, so a direct add
              would lock the buyer to the $38 default tier and skip the
              view_item/ViewContent signal entirely. select_item is the right
              event here — nothing has been added to a cart yet.
            */}
            <Link
              to="/face-cream"
              onClick={() => trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "navbar" })}
              className="hidden md:flex items-center justify-center px-[24px] py-[10px] bg-brand text-white font-heading text-[13px] tracking-[0.1em] font-bold rounded-[4px] border-none hover:bg-[#1A2F4C] transition-colors duration-300"
            >
              GET STARTED
            </Link>

            {/* Hamburger (Sharp industrial styling, 44x44 touch target) */}
            {/*
              The dropdown opens at top-full, i.e. below the bar, so this icon
              stays over the scrim whether the menu is open or shut — it tracks
              onDarkHero alone, not mobileOpen.
            */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden w-11 h-11 flex items-center justify-center transition-colors duration-300 ${onDarkHero ? "text-white" : "text-[#1E201E]"}`}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-[#F4F4F0] border-b border-[#1E201E]/10 transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-6 py-6 flex flex-col gap-6 font-body text-[14px] tracking-[0.2em] font-bold uppercase text-[#1E201E]/70">
            <Link to="/face-cream" onClick={() => setMobileOpen(false)} className="hover:text-brand-accent transition-colors py-1">
              The Gear
            </Link>
            <Link to="/ingredients" onClick={() => setMobileOpen(false)} className="hover:text-brand-accent transition-colors py-1">
              Specs
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="hover:text-brand-accent transition-colors py-1">
              Origin
            </Link>
            <Link
              to="/face-cream"
              onClick={() => {
                trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "navbar_mobile" });
                setMobileOpen(false);
              }}
              className="w-full mt-4 flex items-center justify-center px-6 py-[10px] bg-brand text-white hover:bg-[#1A2F4C] transition-colors font-heading text-[13px] tracking-[0.1em] font-bold rounded-[4px] border-none"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
