import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { X } from "lucide-react";
import type { CartItem } from "@/context/CartContext";

interface SoldOutModalProps {
  open: boolean;
  onClose?: () => void;
  email: string;
  checkoutData: {
    firstName: string;
    lastName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    cartItems: CartItem[];
    cartTotal: number;
    shippingMethod: string;
  };
}

const SoldOutModal = ({ open, onClose, email: prefillEmail, checkoutData }: SoldOutModalProps) => {
  const [email, setEmail] = useState(prefillEmail || "");
  const [submitted, setSubmitted] = useState(false);
  const counter = 387;
  const [loading, setLoading] = useState(false);

  // Fix 1: Body scroll lock when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  // Keep email in sync with prefill
  useEffect(() => {
    if (prefillEmail && !submitted && email === "") {
      setEmail(prefillEmail);
    }
  }, [prefillEmail, submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);

    try {
      await supabase.from("waitlist").insert({
        email: email.trim(),
        source: "checkout",
        first_name: checkoutData.firstName || null,
        last_name: checkoutData.lastName || null,
        address1: checkoutData.address1 || null,
        address2: checkoutData.address2 || null,
        city: checkoutData.city || null,
        state: checkoutData.state || null,
        zip: checkoutData.zip || null,
        cart_items: checkoutData.cartItems as any,
        cart_total: checkoutData.cartTotal,
        shipping_method: checkoutData.shippingMethod || null,
      });

      trackEvent("waitlist_signup", { source: "checkout", email: email.trim() });
      supabase.functions.invoke("email-subscribe", { body: { email: email.trim(), source: "checkout_waitlist" } }).catch(() => {});
      setSubmitted(true);
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-background border border-border max-w-md w-full p-6 sm:p-8 md:p-10 text-center relative max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-t-none">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <>
            <h2 className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
              You're on the list!
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Check your inbox for your 15% off code. We'll notify you the moment we restock.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-6 uppercase tracking-wider">
              {counter + 1} people on the waitlist
            </p>
          </>
        ) : (
          <>
            <h2 className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight leading-[0.95] mb-4">
              WE SOLD OUT
              <br />
              FASTER THAN EXPECTED.
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
              You're clearly someone who knows what they want. Join the waitlist and be first in line when we restock — plus get 15% off your order.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                inputMode="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
              />
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={loading}
                className="w-full py-5 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90"
              >
                {loading ? "Joining..." : "GET EARLY ACCESS — GET 15% OFF"}
              </Button>
            </form>
            <p className="font-body text-xs text-muted-foreground mt-4 uppercase tracking-wider">
              {counter} people already waiting
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="font-body text-xs text-muted-foreground underline underline-offset-4 mt-4 hover:text-foreground transition-colors py-3 inline-block"
            >
              ← Back to shopping
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SoldOutModal;
