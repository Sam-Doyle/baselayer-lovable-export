import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { activateSkinQuizDiscount } from "@/config/promotions";
import {
  captureEmailCampaignSession,
  emailLandingTarget,
  isEmailCampaignSession,
  promisedEmailDiscount,
} from "@/lib/emailCampaign";
import { useCartStore } from "@/stores/cartStore";

const TARGET_WAIT_MS = 3_000;
const TARGET_RETRY_MS = 50;

/** Storefront handoff for permissioned lifecycle-email links. */
const EmailCampaignLanding = () => {
  const { hash, pathname, search } = useLocation();
  const applyDiscountCode = useCartStore((state) => state.applyDiscountCode);

  useEffect(() => {
    if (!captureEmailCampaignSession(search)) return;
    const discount = promisedEmailDiscount(search);
    if (!discount) return;

    activateSkinQuizDiscount();
    void applyDiscountCode(discount);
  }, [applyDiscountCode, search]);

  useEffect(() => {
    if (!isEmailCampaignSession(search)) return;
    const targetId = emailLandingTarget(hash);
    if (!targetId) return;

    const startedAt = Date.now();
    let timer: number | undefined;
    const scrollWhenReady = () => {
      // The production handoff briefly retains a prerender root alongside the
      // hydrated app. Scope the lookup to #root so duplicate IDs in that inert
      // snapshot cannot steal the campaign anchor.
      const target = document.getElementById("root")?.querySelector<HTMLElement>(`#${targetId}`) ?? null;
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      if (Date.now() - startedAt < TARGET_WAIT_MS) {
        timer = window.setTimeout(scrollWhenReady, TARGET_RETRY_MS);
      }
    };

    // Let React commit the lazy route before the first lookup.
    timer = window.setTimeout(scrollWhenReady, 0);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [hash, pathname, search]);

  return null;
};

export default EmailCampaignLanding;
