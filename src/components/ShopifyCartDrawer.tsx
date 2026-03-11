import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

const ShopifyCartDrawer = () => {
  const { items, isOpen, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart, toggleCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      toggleCart(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 transition-opacity" onClick={() => toggleCart(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-background z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
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
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    {item.product.node.images?.edges?.[0]?.node && (
                      <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold uppercase tracking-wide truncate">{item.product.node.title}</p>
                    <p className="text-xs text-muted-foreground">{item.selectedOptions.map(o => o.value).join(' · ')}</p>
                    <p className="font-body text-xs mt-0.5">${parseFloat(item.price.amount).toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeItem(item.variantId)} className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase tracking-wide">Subtotal</span>
                <span className="font-body text-sm">${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="w-full px-6 py-5 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90"
                onClick={handleCheckout}
                disabled={isLoading || isSyncing}
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
