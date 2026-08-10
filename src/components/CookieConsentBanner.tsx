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
 * Mounted once in App.tsx. Renders nothing until an effect confirms there's
 * no stored decision (or the footer's "Cookie Preferences" link asks to
 * reopen it) — no localStorage read happens during the initial render, so
 * this is safe under the Puppeteer prerender in vite.config.ts.
 */
const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getStoredConsent() === null);
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
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background"
    >
      <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
        <p className="font-body text-sm text-foreground leading-relaxed flex-1">
          We use cookies required to run the Site, and — only with your permission — cookies for analytics and
          advertising (Google Analytics, Meta Pixel). "Reject" keeps only the required cookies. See our{" "}
          <Link to="/privacy-policy" className="text-foreground underline underline-offset-4 hover:no-underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="flex-1 md:flex-none font-heading text-xs font-bold uppercase tracking-[0.1em] px-6 py-3 rounded-[4px] border-2 border-foreground text-foreground bg-background hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="flex-1 md:flex-none font-heading text-xs font-bold uppercase tracking-[0.1em] px-6 py-3 rounded-[4px] bg-brand text-white hover:bg-brand-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
