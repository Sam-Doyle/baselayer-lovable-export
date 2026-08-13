import { createContext, useContext, useCallback, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";
import { buildCartItem, DEFAULT_TIER, metaContentId } from "@/config/product";

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
    // trackEvent only fires once addItem confirms the line actually landed in
    // Shopify's cart — a rejected/failed add (out of stock, expired cart,
    // network error) must not report a successful add_to_cart to GA4/Meta.
    // addItem's own in-flight guard also means a second call in the same tick
    // resolves { success: false } without hitting the network, so this can't
    // double-fire either.
    void addItem(buildCartItem(DEFAULT_TIER)).then((result) => {
      if (!result.success) return;
      trackEvent("add_to_cart", {
        content_name: "Base Layer Face Cream",
        content_ids: [metaContentId(DEFAULT_TIER.variantGid as string)],
        value: DEFAULT_TIER.price,
        currency: "USD",
        source: source || "unknown",
      });
    });
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
