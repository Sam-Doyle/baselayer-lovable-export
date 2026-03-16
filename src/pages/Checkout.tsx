import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { trackEvent, setCapturedEmail } from "@/lib/analytics";
import { Lock, Shield, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import SoldOutModal from "@/components/SoldOutModal";
import CartDrawer from "@/components/CartDrawer";
import { useCanonical, useMetaTags } from "@/components/SEO";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function CheckoutForm() {
  const { items, total } = useCart();
  const navigate = useNavigate();
  const [showSoldOut, setShowSoldOut] = useState(true);
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", address1: "", address2: "", city: "", state: "", zip: "",
  });

  useCanonical();
  useMetaTags({
    title: "Checkout | Base Layer",
    description: "Complete your Base Layer order. Secure checkout for men's performance skincare.",
  });

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, []);

  const shippingCost = shipping === "express" ? 9.99 : (total >= 50 ? 0 : 5.99);
  const orderTotal = total + shippingCost;

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("purchase_intent", { items, total: orderTotal, email: form.email, shipping });
    setShowSoldOut(true);
  };

  if (items.length === 0 && !showSoldOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-20">
          <p className="font-heading text-lg uppercase tracking-wide">Your cart is empty</p>
          <Button variant="hero" size="lg" className="px-10 py-4 text-xs" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-10">Checkout</h1>

          <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-5 gap-10">
            {/* Left — form */}
            <div className="md:col-span-3 space-y-8">
              {/* Contact */}
              <fieldset className="space-y-3">
                <legend className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-3">Contact</legend>
                <input
                  type="email" required placeholder="Email address" value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  onBlur={() => {
                    if (form.email) {
                      setCapturedEmail(form.email);
                      trackEvent("checkout_email_entered", { email: form.email });
                    }
                  }}
                  className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                />
              </fieldset>

              {/* Shipping address */}
              <fieldset className="space-y-3">
                <legend className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-3">Shipping Address</legend>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                  <input required placeholder="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                </div>
                <input required placeholder="Address" value={form.address1} onChange={(e) => update("address1", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                <input placeholder="Apartment, suite, etc. (optional)" value={form.address2} onChange={(e) => update("address2", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                <div className="grid grid-cols-3 gap-3">
                  <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                  <select required value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body text-muted-foreground focus:outline-none focus:border-foreground transition-colors">
                    <option value="">State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input required placeholder="ZIP" value={form.zip} onChange={(e) => update("zip", e.target.value)} className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors" />
                </div>
              </fieldset>

              {/* Shipping method */}
              <fieldset className="space-y-3">
                <legend className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-3">Shipping Method</legend>
                <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shipping === "standard" ? "border-foreground" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shipping === "standard"} onChange={() => setShipping("standard")} className="accent-foreground" />
                    <span className="font-body text-sm">Standard</span>
                  </div>
                  <span className="font-body text-sm">{total >= 50 ? "Free" : "$5.99"}</span>
                </label>
                <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${shipping === "express" ? "border-foreground" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shipping === "express"} onChange={() => setShipping("express")} className="accent-foreground" />
                    <span className="font-body text-sm">Express (2-3 days)</span>
                  </div>
                  <span className="font-body text-sm">$9.99</span>
                </label>
              </fieldset>

              {/* Payment — visual only */}
              <fieldset className="space-y-3">
                <legend className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-3">Payment</legend>
                <input disabled placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 bg-muted/30 border border-border text-sm font-body text-muted-foreground cursor-not-allowed" />
                <div className="grid grid-cols-2 gap-3">
                  <input disabled placeholder="MM / YY" className="w-full px-4 py-3 bg-muted/30 border border-border text-sm font-body text-muted-foreground cursor-not-allowed" />
                  <input disabled placeholder="CVC" className="w-full px-4 py-3 bg-muted/30 border border-border text-sm font-body text-muted-foreground cursor-not-allowed" />
                </div>
              </fieldset>

              <Button type="submit" variant="hero" size="lg" className="w-full py-6 text-sm bg-foreground text-background border-foreground hover:bg-foreground/90">
                Place Order
              </Button>

              {/* Trust bar */}
              <div className="flex items-center justify-center gap-6 pt-2">
                <span className="flex items-center gap-1.5 font-body text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" /> Secure
                </span>
                <span className="flex items-center gap-1.5 font-body text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" /> 30-Day Guarantee
                </span>
                <span className="flex items-center gap-1.5 font-body text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Truck className="w-3.5 h-3.5" /> Free Shipping 50+
                </span>
              </div>
            </div>

            {/* Right — order summary */}
            <div className="md:col-span-2">
              <div className="border border-border p-6 md:p-8 sticky top-28 space-y-4">
                <h2 className="font-heading text-xs font-bold uppercase tracking-[0.2em] mb-4">Order Summary</h2>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3 border-b border-border/50 last:border-0">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded bg-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-xs font-bold uppercase tracking-wide truncate">{item.name}</p>
                      <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-body text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="pt-4 space-y-2 text-sm font-body">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span></div>
                  <div className="flex justify-between font-heading font-bold text-base pt-2 border-t border-border">
                    <span>Total</span><span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <SoldOutModal
        open={showSoldOut}
        email={form.email}
        checkoutData={{
          firstName: form.firstName,
          lastName: form.lastName,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
          cartItems: items,
          cartTotal: orderTotal,
          shippingMethod: shipping,
        }}
      />
      <CartDrawer />
    </>
  );
}

export default function Checkout() {
  return <CheckoutForm />;
}
