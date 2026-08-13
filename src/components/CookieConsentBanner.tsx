import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStoredConsent, requiresOptIn, setConsent, onConsentReviewRequest, type ConsentChoice } from "@/lib/consent";

/*
 * COOKIE CONSENT BANNER
 *
 * Strictly-necessary cookies (Shopify checkout, bl_session's cart/session
 * role if any) run regardless. See src/lib/consent.ts for the storage and
 * versioning rules and src/lib/analytics.ts for what each choice gates.
 *
 * The banner is shown unprompted only where prior consent is legally
 * required — the EEA, UK and Switzerland, per requiresOptIn(). US visitors,
 * which is effectively all of this store's traffic, get notice plus opt-out
 * instead: the privacy policy explains what runs, and the footer's Cookie
 * Preferences link opens this same banner so Reject is always one click
 * away. That link is the opt-out, so it has to keep working — do not gate
 * it on region.
 *
 * Accept and Reject are the same size, same weight, same one click. A
 * de-emphasized "Reject" (grey text link next to a bold Accept button) is
 * the dark pattern the EDPB guidance on cookie banners calls out — don't
 * reintroduce that asymmetry here.
 *
 * Mounted once in App.tsx. The initial state is computed synchronously so
 * the first client render matches the prerendered HTML for the common case
 * (no banner) and avoids a full-root hydration fallback. An EEA visitor
 * mismatches and re-renders; that's the rarer path here and the right one
 * to spend the cost on.
 */
const CookieConsentBanner = () => {
  // Apply an existing choice during the first client render. Starting at true
  // and correcting in an effect flashes the banner for returning visitors
  // before React has a chance to hide it.
  const [visible, setVisible] = useState(() => getStoredConsent() === null && requiresOptIn());

  useEffect(() => {
    return onConsentReviewRequest(() => setVisible(true));
  }, []);

  if (!visible) return null;

  const handleChoice = (choice: ConsentChoice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#1A2F4C]/15 bg-[#F7F4EE] shadow-[0_-6px_24px_rgba(26,47,76,0.10)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-stretch gap-1.5 px-4 py-2 md:flex-row md:items-center md:gap-6 md:px-8 md:py-3">
        <p className="flex-1 font-body text-[12px] leading-[1.45] text-[#1A2F4C]/80 md:text-[13px]">
          Optional cookies measure site performance. Required cookies stay on.{" "}
          <Link to="/privacy-policy" className="font-semibold text-[#1A2F4C] underline underline-offset-3 hover:no-underline">
            Privacy details
          </Link>
          .
        </p>
        <div className="grid w-full shrink-0 grid-cols-2 gap-2 md:w-auto">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="min-h-11 border-2 border-[#1A2F4C] bg-[#F7F4EE] px-5 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-[#1A2F4C] transition-colors hover:bg-[#E9E5DD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="min-h-11 border-2 border-brand bg-brand px-5 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-brand-hover hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
