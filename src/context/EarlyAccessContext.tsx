import { createContext, useContext, useCallback, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";
import { buildCartItem, DEFAULT_TIER } from "@/config/product";

// Historically this context gated CTAs behind an email-capture modal
// (waitlist era). The store is now live, so openModal() adds the real
// Shopify variant to the cart and opens the drawer. The name is kept so
// the ~10 CTA call sites don't churn; isOpen/closeModal are inert.
interface EarlyAccessContextType {
  isOpen: boolean;
  openModal: (source?: string) => void;
  closeModal: () => void;
}

const EarlyAccessContext = createContext<EarlyAccessContextType | undefined>(undefined);

export const EarlyAccessProvider = ({ children }: { children: ReactNode }) => {
  const openModal = useCallback((source?: string) => {
    // Mirrors the in-flight guard in cartStore.addItem. Without it a double-click would
    // be correctly blocked at the cart but still fire a second add_to_cart to GA4/Meta,
    // inflating the conversion metric. addItem flips isLoading synchronously before its
    // first await, so a second click in the same tick always sees true here.
    if (useCartStore.getState().isLoading) return;
    const { addItem } = useCartStore.getState();
    trackEvent("add_to_cart", {
      content_name: "Base Layer Face Cream",
      content_ids: ["base-layer-face-cream"],
      value: DEFAULT_TIER.price,
      currency: "USD",
      source: source || "unknown",
    });
    void addItem(buildCartItem(DEFAULT_TIER));
  }, []);

  const closeModal = useCallback(() => {}, []);

  return (
    <EarlyAccessContext.Provider value={{ isOpen: false, openModal, closeModal }}>
      {children}
    </EarlyAccessContext.Provider>
  );
};

export const useEarlyAccess = () => {
  const ctx = useContext(EarlyAccessContext);
  if (!ctx) throw new Error("useEarlyAccess must be used within EarlyAccessProvider");
  return ctx;
};
