import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStoredConsent, setConsent, onConsentReviewRequest, type ConsentChoice } from "@/lib/consent";

/*
 * COOKIE CONSENT BANNER
 *
 * Strictly-necessary cookies (Shopify checkout, bl_session's cart/session
 * role if any) run regardless. Everything else — GA4, the Meta Pixel, Meta
 * CAPI, and the bl_session analytics cookie — stays off until the visitor
 * clicks Accept here. See src/lib/consent.ts for the storage/versioning
 * rules and src/lib/analytics.ts for what each choice actually gates.
 *
 * Accept and Reject are the same size, same weight, same one click. A
 * de-emphasized "Reject" (grey text link next to a bold Accept button) is
 * the dark pattern the EDPB guidance on cookie banners calls out — don't
 * reintroduce that asymmetry here.
 *
 * Mounted once in App.tsx. The prerendered HTML includes the banner, so the
 * first client render does too; the effect immediately hides it for a
 * returning visitor with a stored decision. Matching the prerender avoids a
 * full-root hydration fallback (and its large layout shift) for new visitors.
 */
const CookieConsentBanner = () => {
  // Apply an existing choice during the first client render. Starting at true
  // and correcting in an effect flashes the prerendered banner for returning
  // visitors before React has a chance to hide it.
  const [visible, setVisible] = useState(() => getStoredConsent() === null);

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
