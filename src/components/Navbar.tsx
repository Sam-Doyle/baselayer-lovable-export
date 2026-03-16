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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Universal Offer Banner */}
      <div className="bg-[#1A2F4C] text-[#FFFFFF] text-center py-2.5 font-body text-[11px] sm:text-[12px] tracking-[0.05em] uppercase w-full flex items-center justify-center gap-2 px-4 shadow-sm">
        <span className="text-[#F95D1A] hidden sm:inline-block">▲</span>
        <span>Batch 01 (June 2026) is strictly limited to 500 bottles.</span>
      </div>

      <nav
        className={`w-full transition-all duration-300 border-b ${isScrolled
          ? "bg-[#F4F4F0]/90 backdrop-blur-xl border-[#1E201E]/10 py-3"
          : "bg-transparent border-transparent py-5"
          }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* LOGO: Industrial Typography + Alpine Accent Dot */}
          <Link to="/" className="flex items-center gap-0 group">
            <span className="font-heading text-[#1A2F4C] text-[22px] md:text-[26px] font-black tracking-normal uppercase leading-none">
              BASE LAYER<span className="text-[#F95D1A]">.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10 font-body text-[12px] lg:text-[13px] tracking-[0.2em] font-bold uppercase text-[#1E201E]/70">
            <Link to="/face-cream" className="hover:text-[#F95D1A] transition-colors duration-300">
              The Gear
            </Link>
            <Link to="/ingredients" className="hover:text-[#F95D1A] transition-colors duration-300">
              Specs
            </Link>
            <Link to="/about" className="hover:text-[#F95D1A] transition-colors duration-300">
              Origin
            </Link>
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => openModal("navbar")}
              className="hidden md:flex items-center justify-center px-6 py-3 border border-[#1E201E]/20 text-[#1A2F4C] font-heading text-[12px] tracking-widest uppercase font-bold rounded-none hover:bg-[#F95D1A] hover:text-[#F4F4F0] hover:border-[#F95D1A] transition-all duration-300"
            >
              Reserve Batch 01
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
            <Link to="/face-cream" onClick={() => setMobileOpen(false)} className="hover:text-[#F95D1A] transition-colors py-1">
              The Gear
            </Link>
            <Link to="/ingredients" onClick={() => setMobileOpen(false)} className="hover:text-[#F95D1A] transition-colors py-1">
              Specs
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="hover:text-[#F95D1A] transition-colors py-1">
              Origin
            </Link>
            <button
              onClick={() => {
                openModal("navbar_mobile");
                setMobileOpen(false);
              }}
              className="w-full mt-4 flex items-center justify-center px-6 py-5 bg-[#F95D1A] text-[#F4F4F0] hover:bg-[#1A2F4C] transition-colors font-heading text-[14px] tracking-widest uppercase font-black rounded-none"
            >
              Reserve Batch 01
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
