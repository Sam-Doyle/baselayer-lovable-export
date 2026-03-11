import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface EarlyAccessContextType {
  isOpen: boolean;
  openModal: (source?: string) => void;
  closeModal: () => void;
}

const EarlyAccessContext = createContext<EarlyAccessContextType | undefined>(undefined);

export const EarlyAccessProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((source?: string) => {
    setIsOpen(true);
    trackEvent("cta_click", {
      content_name: "Early Access Modal",
      source: source || "unknown",
    });
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  // Exit-intent: Desktop mouseleave + Mobile hybrid (scroll depth AND time)
  useEffect(() => {
    const shouldSkip = () => {
      return (
        sessionStorage.getItem("bl_exit_shown") === "true" ||
        localStorage.getItem("bl_email_captured") === "true"
      );
    };

    // ---- DESKTOP: mouseleave exit-intent (unchanged) ----
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !shouldSkip()) {
        sessionStorage.setItem("bl_exit_shown", "true");
        openModal("exit_intent");
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // ---- MOBILE: Hybrid scroll-depth + time trigger ----
    // Requirements: user must have BOTH scrolled 50% AND spent 15s on page.
    // This prevents triggering on fast scrollers (bouncing) and idle visitors
    // who haven't engaged with content yet.
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    let mobileCleanup: (() => void) | null = null;

    if (isMobile) {
      let hasReachedScrollDepth = false;
      let hasReachedTimeThreshold = false;
      let fired = false;

      const tryFire = () => {
        if (fired || !hasReachedScrollDepth || !hasReachedTimeThreshold) return;
        if (shouldSkip()) return;
        fired = true;
        sessionStorage.setItem("bl_exit_shown", "true");
        trackEvent("exit_intent_trigger", {
          device: "mobile",
          trigger: "hybrid_scroll_time",
          scroll_depth: 50,
          time_on_page_min: 15,
        });
        openModal("exit_intent_mobile");
      };

      // Track scroll depth
      const handleScroll = () => {
        if (hasReachedScrollDepth) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const pct = (scrollTop / docHeight) * 100;
        if (pct >= 50) {
          hasReachedScrollDepth = true;
          tryFire();
        }
      };

      // Track time on page (15s minimum)
      const timeTimer = setTimeout(() => {
        hasReachedTimeThreshold = true;
        tryFire();
      }, 15000);

      window.addEventListener("scroll", handleScroll, { passive: true });

      mobileCleanup = () => {
        clearTimeout(timeTimer);
        window.removeEventListener("scroll", handleScroll);
      };
    }

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (mobileCleanup) mobileCleanup();
    };
  }, [openModal]);

  return (
    <EarlyAccessContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </EarlyAccessContext.Provider>
  );
};

export const useEarlyAccess = () => {
  const ctx = useContext(EarlyAccessContext);
  if (!ctx) throw new Error("useEarlyAccess must be used within EarlyAccessProvider");
  return ctx;
};
