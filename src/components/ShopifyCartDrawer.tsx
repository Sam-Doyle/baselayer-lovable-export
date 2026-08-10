import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";
import { BUY_TIERS, buildCartItem } from "@/config/product";

const ShopifyCartDrawer = () => {
  const { items, isOpen, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart, toggleCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      const total = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
      trackEvent("begin_checkout", {
        content_ids: ["base-layer-face-cream"],
        value: total,
        currency: "USD",
        num_items: items.reduce((n, i) => n + i.quantity, 0),
      });
      // Same-tab navigation: new tabs are unreliable inside the Instagram/TikTok in-app browsers
      window.location.href = checkoutUrl;
    }
  };

  // In-cart AOV upsell: only when the 2-bottle tier is live in Shopify and
  // the cart is exactly one single-bottle one-time line.
  const tier2 = BUY_TIERS.find(t => t.id === 2 && t.variantGid !== null);
  const singleBottleLine = items.length === 1 && items[0].quantity === 1 && !items[0].sellingPlanId && items[0].variantId === BUY_TIERS[0].variantGid ? items[0] : null;
  const upsellTier = tier2 && singleBottleLine ? tier2 : null;

  const handleUpsell = async () => {
    if (!upsellTier || !singleBottleLine) return;
    // Same in-flight guard as the other add paths: this fires remove-then-add, and a
    // second click before the first remove resolves would re-fire add_to_cart against
    // an already-consumed line. (The trailing addItem is safe on its own — removeItem's
    // finally clears isLoading before the await resumes.)
    if (useCartStore.getState().isLoading) return;
    trackEvent("add_to_cart", {
      content_name: "Base Layer Face Cream",
      content_ids: ["base-layer-face-cream"],
      value: upsellTier.price,
      currency: "USD",
      source: "cart_upsell",
    });
    await removeItem(singleBottleLine.variantId);
    await useCartStore.getState().addItem(buildCartItem(upsellTier));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => toggleCart(false)} />
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-background z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
        {...(!isOpen ? { inert: "true" } : {})}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-sm font-bold uppercase tracking-[0.15em]">Your Cart ({totalItems})</h2>
          <button onClick={() => toggleCart(false)} className="p-1 hover:opacity-70 transition-opacity" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <p className="font-body text-sm text-muted-foreground">Your cart is empty</p>
            <Button variant="hero" size="lg" className="px-10 py-4 text-xs" onClick={() => toggleCart(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                // Resolve the live tier so renewal copy tracks config, not the
                // price/cadence persisted in localStorage when the line was added.
                const subTier = item.sellingPlanId ? BUY_TIERS.find(t => t.sellingPlanGid === item.sellingPlanId) : null;
                return (
                <div key={item.variantId} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.product.node.images?.edges?.[0]?.node && (
                      <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold uppercase tracking-wide truncate">{item.product.node.title}</p>
                    <p className={`text-xs ${item.sellingPlanId ? "text-brand font-medium" : "text-muted-foreground"}`}>{item.variantTitle}</p>
                    {subTier && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Auto-renews {subTier.duration} at ${subTier.price}. Pause or cancel anytime.</p>
                    )}
                    <p className="font-body text-xs mt-0.5">${parseFloat(item.price.amount).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors" aria-label={`Decrease quantity of ${item.product.node.title}`}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors" aria-label={`Increase quantity of ${item.product.node.title}`}>
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.variantId)} className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label={`Remove ${item.product.node.title} from cart`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-border space-y-3">
              {upsellTier && (
                <button
                  onClick={handleUpsell}
                  disabled={isLoading || isSyncing}
                  className="w-full text-left border border-brand/40 bg-brand/5 rounded px-4 py-3 hover:bg-brand/10 transition-colors"
                >
                  <span className="font-heading text-xs font-bold uppercase tracking-wide text-brand">Upgrade to 2 bottles — save $8</span>
                  <span className="block font-body text-xs text-muted-foreground mt-0.5">12 weeks of coverage for $68 instead of $76</span>
                </button>
              )}
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase tracking-wide">Subtotal</span>
                <span className="font-body text-sm">${totalPrice.toFixed(2)}</span>
              </div>
              {items.some(i => i.sellingPlanId) && (
                <p className="font-body text-[11px] text-muted-foreground text-center">
                  Your cart includes a subscription. It renews automatically — pause or cancel anytime, no commitment.
                </p>
              )}
              {/*
                No hover:bg-* — variant="hero" wipes a white ::before across on hover and
                switches the label to black, so a hover background would never paint.
              */}
              <Button
                variant="hero"
                size="lg"
                className="w-full px-6 py-5 text-xs bg-brand text-white border-brand"
                onClick={handleCheckout}
                disabled={isLoading || isSyncing}
                aria-label="Checkout"
              >
                {isLoading || isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ExternalLink className="w-4 h-4 mr-2" />Checkout</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ShopifyCartDrawer;
