import { useState } from "react";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";

const learnLinks = [
  { href: "/articles", label: "Articles" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/skin-concerns", label: "Skin Concerns" },
  { href: "/comparisons", label: "Compare" },
];

interface NavbarProps {
  /** Hide nav links — logo + CTA only. Use on paid-traffic landing pages. */
  minimal?: boolean;
}

const Navbar = ({ minimal = false }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const { openModal } = useEarlyAccess();
  const cartItems = useCartStore(state => state.items);
  const toggleCart = useCartStore(state => state.toggleCart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/" className="flex flex-col items-center gap-0.5">
          <span className="block w-full h-[1px] bg-white" />
          <span className="font-heading text-white text-lg md:text-xl font-bold tracking-wide uppercase leading-none py-0.5">
            Base Layer
          </span>
          <span className="block w-full h-[1px] bg-white" />
        </Link>

        {/* Desktop nav links — hidden in minimal mode */}
        {!minimal && (
          <div className="hidden md:flex items-center gap-8 font-body text-[11px] tracking-[0.2em] uppercase text-white/60">
            <Link to="/face-cream" className="hover:text-white transition-colors duration-300" onClick={() => trackEvent("nav_click", { label: "Performance Face Cream" })}>
              Performance Face Cream
            </Link>

            {/* Learn dropdown */}
            <div className="relative" onMouseEnter={() => setLearnOpen(true)} onMouseLeave={() => setLearnOpen(false)}>
              <button className="flex items-center gap-1 hover:text-white transition-colors duration-300" onClick={() => setLearnOpen(!learnOpen)}>
                Learn <ChevronDown className={`w-3 h-3 transition-transform ${learnOpen ? "rotate-180" : ""}`} />
              </button>
              {learnOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-black border border-white/10 rounded-lg py-2 min-w-[160px] shadow-xl">
                    {learnLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="block px-4 py-2 hover:bg-white/10 hover:text-white transition-colors text-white/60"
                        onClick={() => { setLearnOpen(false); trackEvent("nav_click", { label: link.label }); }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/blog" className="hover:text-white transition-colors duration-300" onClick={() => trackEvent("nav_click", { label: "Blog" })}>
              Blog
            </Link>
            <Link to="/about" className="hover:text-white transition-colors duration-300" onClick={() => trackEvent("nav_click", { label: "About" })}>
              About
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Cart icon hidden — commerce not live, all CTAs open waitlist modal */}
          <button onClick={() => toggleCart()} className="relative p-1 text-white hover:opacity-70 transition-opacity hidden" aria-label="Cart">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black rounded-full text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
            )}
          </button>
          <Button
            variant="hero"
            size="sm"
            className="inline-flex px-3 py-2 text-[9px] md:px-5 md:py-2 md:text-[10px] border-white text-white before:bg-white hover:text-black"
            onClick={() => openModal("navbar")}
          >
            RESERVE MINE
          </Button>

          {/* Hamburger — hidden in minimal mode */}
          {!minimal && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 -mr-2.5 text-white"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu — hidden in minimal mode */}
      {!minimal && mobileOpen && (
        <div className="md:hidden bg-black border-t border-white/10 px-6 py-4 space-y-1 font-body text-[11px] tracking-[0.2em] uppercase text-white/60">
          <Link to="/face-cream" className="block py-3 hover:text-white transition-colors" onClick={() => { setMobileOpen(false); trackEvent("nav_click", { label: "Performance Face Cream", device: "mobile" }); }}>
            Performance Face Cream
          </Link>

          {/* Mobile Learn expandable */}
          <button className="flex items-center gap-1 py-3 hover:text-white transition-colors w-full" onClick={() => setMobileLearnOpen(!mobileLearnOpen)}>
            Learn <ChevronDown className={`w-3 h-3 transition-transform ${mobileLearnOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileLearnOpen && (
            <div className="pl-4 space-y-2">
              {learnLinks.map((link) => (
                <Link key={link.href} to={link.href} className="block py-3 hover:text-white transition-colors" onClick={() => { setMobileOpen(false); trackEvent("nav_click", { label: link.label, device: "mobile" }); }}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <Link to="/blog" className="block py-3 hover:text-white transition-colors" onClick={() => { setMobileOpen(false); trackEvent("nav_click", { label: "Blog", device: "mobile" }); }}>
            Blog
          </Link>
          <Link to="/about" className="block py-3 hover:text-white transition-colors" onClick={() => { setMobileOpen(false); trackEvent("nav_click", { label: "About", device: "mobile" }); }}>
            About
          </Link>
          <button onClick={() => { openModal("navbar_mobile"); setMobileOpen(false); }} className="block py-3 text-white font-bold mt-2">RESERVE MINE</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
