import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";

const StickyCartBar = () => {
  const [show, setShow] = useState(false);
  const { openModal } = useEarlyAccess();

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-foreground/95 backdrop-blur-md border-t border-foreground/10 transition-transform duration-300 pb-[env(safe-area-inset-bottom)] ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="hidden md:flex items-center gap-4">
          <span className="font-heading text-sm font-bold text-background uppercase tracking-wide">
            Base Layer Face Cream
          </span>
          <span className="font-body text-sm text-background/60">$38 (21% off) · Ships Spring 2026</span>
        </div>
        <Button
          variant="hero"
          size="sm"
          className="md:px-8 px-6 py-2 text-xs border-background text-background before:bg-background hover:text-foreground w-full md:w-auto font-bold tracking-wider"
          onClick={() => openModal("sticky_bar")}
        >
          SAVE MY SPOT — $38
        </Button>
      </div>
    </div>
  );
};

export default StickyCartBar;
