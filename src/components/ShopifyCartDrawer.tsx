import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";
import { BUY_TIERS, buildCartItem, metaContentId } from "@/config/product";
import { FREE_SHIPPING_CODE } from "@/config/legal";

/** "$35" for a round number, "$34.50" otherwise. For prices sitting inside a sentence. */
const inlinePrice = (amount: string) => `$${parseFloat(amount).toFixed(2).replace(/\.00$/, "")}`;

const ShopifyCartDrawer = () => {
  const { items, cost, isOpen, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart, toggleCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  /*
   * Shopify's own subtotal, not a sum we computed. The fallback only covers the
   * blink between an optimistic add and the cart response landing — once a cart
   * exists, `cost` is whatever the checkout page will charge.
   */
  const totalPrice = cost
    ? parseFloat(cost.subtotalAmount.amount)
    : items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  /*
   * Hands off to Shopify checkout through a real anchor click rather than a
   * `window.location.href` assignment.
   *
   * GA4's cross-domain linker works by listening for clicks on anchors and
   * forms and rewriting the href to carry a `_gl` parameter, which is how the
   * client id survives the hop to another domain. A programmatic location
   * assignment produces no click for that listener to see, so the linker never
   * ran and shop.baselayerskin.co opened a fresh session that attributed
   * itself to baselayerskin.co as a referral — the ad click stopped tying to
   * the order. Listing both hostnames under GA4 Admin → Data Streams →
   * Configure tag settings → Configure your domains is the other half of this
   * and neither half works alone: without the domains configured gtag has no
   * reason to decorate, and without a click there is nothing to decorate.
   *
   * Deliberately same-tab, i.e. no `target` — new tabs are unreliable inside
   * the Instagram and TikTok in-app browsers this traffic lands in. That was
   * the reason for the original location assignment and it still holds; a
   * bare anchor navigates the current tab exactly the same way. Nothing here
   * is popup-gated, so the in-app webview concern doesn't transfer.
   *
   * The anchor has to be in the document for the click to bubble as far as
   * gtag's listener, and it's removed straight after because the navigation is
   * already queued by the time `click()` returns.
   */
  const goToCheckout = (checkoutUrl: string) => {
    const link = document.createElement("a");
    link.href = checkoutUrl;
    link.style.position = "absolute";
    link.style.left = "-9999px";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      const total = totalPrice;
      trackEvent("begin_checkout", {
        content_ids: items.map(i => metaContentId(i.variantId)),
        value: total,
        currency: "USD",
        num_items: items.reduce((n, i) => n + i.quantity, 0),
      });
      goToCheckout(checkoutUrl);
    }
  };

  // In-cart AOV upsell: only when the 2-bottle tier is live in Shopify and
  // the cart is exactly one single-bottle one-time line.
  //
  // This fires less often now that the 2-pack is the PDP default — a single
  // bottle is a deliberate downgrade, not the path of least resistance. It's
  // kept because the shopper who took that downgrade is the one with the most
  // contribution left on the table ($21.10 vs $38.73), and $8 off a second
  // bottle is the cheapest way to close the gap.
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
    if (!singleBottleLine.lineId) return;
    const removeResult = await removeItem(singleBottleLine.lineId);
    // If the remove failed (removeItem already surfaced its own toast), don't
    // chase it with an add — that would leave the shopper with both the old
    // single-bottle line AND the 2-bottle line instead of a clean swap.
    if (!removeResult.success) return;
    const addResult = await useCartStore.getState().addItem(buildCartItem(upsellTier));
    // Only report the upsell as a successful add once Shopify actually
    // confirms the 2-bottle line landed — a failed add must not fire a
    // successful add_to_cart event to GA4/Meta.
    if (!addResult.success) return;
    trackEvent("add_to_cart", {
      content_name: "Base Layer Face Cream",
      content_ids: [metaContentId(upsellTier.variantGid as string)],
      value: upsellTier.price,
      currency: "USD",
      source: "cart_upsell",
    });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => toggleCart(false)} />
      )}
      <div 
        data-prerender-handoff-hide
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
                <div key={item.lineId ?? `${item.variantId}:${item.sellingPlanId ?? "one-time"}`} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.product.node.images?.edges?.[0]?.node && (
                      <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold uppercase tracking-wide truncate">{item.product.node.title}</p>
                    <p className={`text-xs ${item.sellingPlanId ? "text-brand font-medium" : "text-muted-foreground"}`}>{item.variantTitle}</p>
                    {/*
                      The plan bills the same amount every delivery, so the
                      renewal price is the line price — and the line price is
                      Shopify's, so this sentence can't promise a renewal figure
                      the subscription won't actually charge. Cadence still comes
                      from config; the storefront cart doesn't expose it.

                      Stating it at all rather than leaving it implied: an
                      auto-renewing charge has to be disclosed before checkout,
                      not discovered on the bank statement.
                    */}
                    {subTier && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Auto-renews {subTier.duration} at {inlinePrice(item.price.amount)}. Pause or cancel anytime.</p>
                    )}
                    <p className="font-body text-xs mt-0.5">${parseFloat(item.price.amount).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.lineId, item.quantity - 1)} disabled={!item.lineId || isLoading || isSyncing} className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Decrease quantity of ${item.product.node.title}`}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} disabled={!item.lineId || isLoading || isSyncing} className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Increase quantity of ${item.product.node.title}`}>
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.lineId)} disabled={!item.lineId || isLoading || isSyncing} className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Remove ${item.product.node.title} from cart`}>
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
                  <span className="font-heading text-xs font-bold uppercase tracking-wide text-brand">Add a second bottle — save $8</span>
                  <span className="block font-body text-xs text-muted-foreground mt-0.5">
                    12 weeks for $68 instead of $76. Same free shipping either way.
                  </span>
                </button>
              )}
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase tracking-wide">Subtotal</span>
                <span className="font-body text-sm">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 font-body text-[11px] text-[#2F7D3C]">
                <span>U.S. standard shipping</span>
                <span className="font-semibold">FREE · {FREE_SHIPPING_CODE}</span>
              </div>
              <p className="font-body text-[10px] text-muted-foreground text-center">
                {FREE_SHIPPING_CODE} is applied automatically at Shopify checkout.
              </p>
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
