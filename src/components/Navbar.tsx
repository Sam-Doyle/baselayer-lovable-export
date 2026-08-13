import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { useCartStore } from "@/stores/cartStore";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroCtaPassed, setHeroCtaPassed] = useState(false);
  const { pathname } = useLocation();
  const cartCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const toggleCart = useCartStore((state) => state.toggleCart);

  const useNavyHeader = pathname === "/" && !isScrolled;
  const showDesktopCta = pathname !== "/" || heroCtaPassed;
  const productHref = pathname === "/" ? "/face-cream?offer=single" : "/face-cream";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setHeroCtaPassed(true);
      return;
    }

    setHeroCtaPassed(false);
    const heroCta = document.getElementById("hero-primary-cta");
    if (!heroCta) return;

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(([entry]) => {
        setHeroCtaPassed(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      });
      observer.observe(heroCta);
      return () => observer.disconnect();
    }

    const handleScroll = () => setHeroCtaPassed(heroCta.getBoundingClientRect().bottom < 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <div
      data-prerender-handoff-hide
      className={`fixed inset-x-0 top-0 z-50 flex flex-col transition-transform duration-300 ${isScrolled ? "-translate-y-[28px]" : "translate-y-0"}`}
    >
      <div className="relative z-50 flex h-[28px] w-full items-center justify-center bg-[#1A2F4C] px-4 text-center text-white shadow-sm">
        <span className="font-heading text-[10px] font-semibold uppercase leading-none tracking-[0.14em] sm:text-[11px]">
          {FREE_SHIPPING_PHRASE.toUpperCase()} ON EVERY U.S. ORDER
        </span>
      </div>

      <nav
        className={`w-full border-b py-3 transition-all duration-300 ${
          isScrolled
            ? "border-transparent bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.08)] backdrop-blur-[8px]"
            : useNavyHeader
              ? "border-white/10 bg-[#1A2F4C]"
              : "border-transparent bg-transparent md:py-5"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 md:px-12">
          <Link to="/" className="flex items-center gap-0">
            <span className={`font-heading text-[22px] font-black uppercase leading-none tracking-normal transition-colors duration-300 md:text-[26px] ${useNavyHeader ? "text-white" : "text-[#1A2F4C]"}`}>
              BASE LAYER<span className={useNavyHeader ? "text-brand-accent-on-dark" : "text-brand-accent"}>.</span>
            </span>
          </Link>

          <div className={`hidden items-center gap-10 font-body text-[12px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 md:flex lg:text-[13px] ${useNavyHeader ? "text-white" : "text-[#1E201E]/70"}`}>
            <Link to="/face-cream" className={useNavyHeader ? "hover:text-brand-accent-on-dark" : "hover:text-brand-accent"}>The Gear</Link>
            <Link to="/ingredients" className={useNavyHeader ? "hover:text-brand-accent-on-dark" : "hover:text-brand-accent"}>Specs</Link>
            <Link to="/about" className={useNavyHeader ? "hover:text-brand-accent-on-dark" : "hover:text-brand-accent"}>Origin</Link>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <Link
              to={productHref}
              onClick={() => trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "navbar" })}
              aria-hidden={!showDesktopCta}
              tabIndex={showDesktopCta ? 0 : -1}
              className={`hidden min-h-11 items-center justify-center bg-brand px-6 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:bg-brand-hover md:flex ${showDesktopCta ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              GET BASE LAYER
            </Link>

            <button
              type="button"
              onClick={() => toggleCart(true)}
              className={`relative flex h-11 w-11 items-center justify-center transition-colors duration-300 ${useNavyHeader ? "text-white hover:text-brand-accent-on-dark" : "text-[#1E201E] hover:text-brand-accent"}`}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
            >
              <ShoppingBag className="h-[22px] w-[22px]" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand px-1 font-body text-[9px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`flex h-11 w-11 items-center justify-center transition-colors duration-300 md:hidden ${useNavyHeader ? "text-white" : "text-[#1E201E]"}`}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div
          aria-hidden={!mobileOpen}
          className={`absolute inset-x-0 top-full overflow-hidden border-b border-[#1E201E]/10 bg-[#F4F4F0] transition-all duration-300 md:hidden ${mobileOpen ? "max-h-[400px] opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col gap-6 px-6 py-6 font-body text-[14px] font-bold uppercase tracking-[0.2em] text-[#1E201E]/70">
            <Link tabIndex={mobileOpen ? 0 : -1} to="/face-cream" onClick={() => setMobileOpen(false)} className="py-1 hover:text-brand-accent">The Gear</Link>
            <Link tabIndex={mobileOpen ? 0 : -1} to="/ingredients" onClick={() => setMobileOpen(false)} className="py-1 hover:text-brand-accent">Specs</Link>
            <Link tabIndex={mobileOpen ? 0 : -1} to="/about" onClick={() => setMobileOpen(false)} className="py-1 hover:text-brand-accent">Origin</Link>
            <Link
              tabIndex={mobileOpen ? 0 : -1}
              to={productHref}
              onClick={() => {
                trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "navbar_mobile" });
                setMobileOpen(false);
              }}
              className="mt-4 flex min-h-11 w-full items-center justify-center bg-brand px-6 font-heading text-[13px] font-bold uppercase tracking-[0.1em] text-white hover:bg-brand-hover"
            >
              GET BASE LAYER
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
