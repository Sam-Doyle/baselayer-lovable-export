import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEarlyAccess } from "@/context/EarlyAccessContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal } = useEarlyAccess();

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
        <div className="flex items-center gap-1 text-[#F35D1A] text-[14px]">
          <span className="leading-none tracking-[1px]">★★★★</span>
          <span className="relative inline-block text-[14px] leading-none text-[#F35D1A]/30">
            ★
            <span className="absolute left-0 top-0 overflow-hidden w-[80%] text-[#F35D1A]">★</span>
          </span>
        </div>
        <span className="font-heading font-bold text-white ml-2 text-[12px] leading-none mt-[1px]">4.8/5</span>
        <span className="mx-2 opacity-50 hidden sm:inline text-[12px]">—</span>
        <span className="font-heading font-semibold text-white tracking-[0.12em] text-[12px] uppercase hidden sm:inline leading-none mt-[1px]">TRUSTED BY 1,000+ MEN</span>
        <span className="mx-2 opacity-50 sm:hidden text-[12px]">—</span>
        <span className="font-heading font-semibold text-white tracking-[0.12em] text-[12px] uppercase sm:hidden leading-none mt-[1px]">1,000+ MEN TRUST US</span>
      </div>

      <nav
        className={`w-full transition-all duration-300 border-b ${isScrolled
          ? "bg-white/95 backdrop-blur-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-transparent py-3"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* LOGO: Industrial Typography + Alpine Accent Dot */}
          <Link to="/" className="flex items-center gap-0 group">
            <span className="font-heading text-[#1A2F4C] text-[22px] md:text-[26px] font-black tracking-normal uppercase leading-none">
              BASE LAYER<span className="text-[#F35D1A]">.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10 font-body text-[12px] lg:text-[13px] tracking-[0.2em] font-bold uppercase text-[#1E201E]/70">
            <Link to="/face-cream" className="hover:text-[#F35D1A] transition-colors duration-300">
              The Gear
            </Link>
            <Link to="/ingredients" className="hover:text-[#F35D1A] transition-colors duration-300">
              Specs
            </Link>
            <Link to="/about" className="hover:text-[#F35D1A] transition-colors duration-300">
              Origin
            </Link>
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => openModal("navbar")}
              className="hidden md:flex items-center justify-center px-[24px] py-[10px] bg-[#F35D1A] text-white font-heading text-[13px] tracking-[0.1em] font-bold rounded-[4px] border-none hover:bg-[#1A2F4C] transition-colors duration-300"
            >
              GET STARTED
            </button>

            {/* Hamburger (Sharp industrial styling, 44x44 touch target) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[#1E201E] w-11 h-11 flex items-center justify-center"
              aria-label="Toggle menu"
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
            <Link to="/face-cream" onClick={() => setMobileOpen(false)} className="hover:text-[#F35D1A] transition-colors py-1">
              The Gear
            </Link>
            <Link to="/ingredients" onClick={() => setMobileOpen(false)} className="hover:text-[#F35D1A] transition-colors py-1">
              Specs
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="hover:text-[#F35D1A] transition-colors py-1">
              Origin
            </Link>
            <button
              onClick={() => {
                openModal("navbar_mobile");
                setMobileOpen(false);
              }}
              className="w-full mt-4 flex items-center justify-center px-6 py-[10px] bg-[#F35D1A] text-white hover:bg-[#1A2F4C] transition-colors font-heading text-[13px] tracking-[0.1em] font-bold rounded-[4px] border-none"
            >
              GET STARTED
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
