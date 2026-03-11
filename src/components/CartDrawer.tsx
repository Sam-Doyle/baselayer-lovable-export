import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useNavigate } from "react-router-dom";

const FREE_SHIPPING_THRESHOLD = 50;

const CartDrawer = () => {
  const { items, isOpen, total, toggleCart, removeItem, updateQuantity, itemCount } = useCart();
  const navigate = useNavigate();

  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  const handleCheckout = () => {
    trackEvent("begin_checkout", { items, total });
    toggleCart(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 transition-opacity"
          onClick={() => toggleCart(false)}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-background z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-sm font-bold uppercase tracking-[0.15em]">
            Your Cart ({itemCount})
          </h2>
          <button onClick={() => toggleCart(false)} className="p-1 hover:opacity-70 transition-opacity" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <p className="font-body text-sm text-muted-foreground">Your cart is empty</p>
            <Button variant="hero" size="lg" className="px-10 py-4 text-xs" onClick={() => toggleCart(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping bar */}
            <div className="px-6 py-3 border-b border-border">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
              <p className="font-body text-[10px] text-muted-foreground mt-1.5 tracking-wide uppercase">
                {amountToFreeShipping > 0
                  ? `$${amountToFreeShipping.toFixed(0)} away from free shipping`
                  : "You've unlocked free shipping!"}
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded bg-muted"
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-xs font-bold uppercase tracking-wide truncate">
                      {item.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      ${item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => { updateQuantity(item.id, item.quantity - 1); trackEvent("cart_update", { action: "decrease", item_name: item.name }); }}
                        className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-body text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => { updateQuantity(item.id, item.quantity + 1); trackEvent("cart_update", { action: "increase", item_name: item.name }); }}
                        className="w-6 h-6 border border-border rounded flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { removeItem(item.id); trackEvent("remove_from_cart", { item_name: item.name }); }}
                        className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm font-bold uppercase tracking-wide">Subtotal</span>
                <span className="font-body text-sm">${total.toFixed(2)}</span>
              </div>
              <Button
                variant="hero"
                size="lg"
                className="w-full px-6 py-5 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90"
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
