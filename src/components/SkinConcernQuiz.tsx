import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  SKIN_CONCERNS,
  SKIN_QUIZ_PROMOTION,
  activateSkinQuizDiscount,
  type SkinConcernId,
} from "@/config/promotions";
import {
  SKIN_QUIZ_CONSENT_VERSION,
  createSkinQuizSubmissionId,
  submitSkinQuizLead,
} from "@/lib/skinQuiz";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";
import { getStoredConsent, onConsentChange, requiresOptIn } from "@/lib/consent";
import { shouldSuppressQuizForEmailCampaign } from "@/lib/emailCampaign";

type QuizStep = "concern" | "email" | "success";

const COMPLETED_KEY = "bl_skin_quiz_completed";
const DISMISSED_UNTIL_KEY = "bl_skin_quiz_dismissed_until";
const SHOWN_THIS_SESSION_KEY = "bl_skin_quiz_shown";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;
const ENGAGEMENT_DELAY_MS = 15_000;
const ENGAGEMENT_SCROLL_RATIO = 0.4;
const COMMERCIAL_ROUTES = new Set([
  "/",
  "/face-cream",
  "/matte-moisturizer-for-men",
  "/non-greasy-moisturizer-for-men",
  "/all-in-one-skincare-for-men",
  "/lp",
]);

function canShowQuiz(pathname: string): boolean {
  if (!COMMERCIAL_ROUTES.has(pathname)) return false;
  try {
    if (localStorage.getItem(COMPLETED_KEY) === "true") return false;
    const dismissedUntil = Number(localStorage.getItem(DISMISSED_UNTIL_KEY) || 0);
    if (dismissedUntil > Date.now()) return false;
    if (sessionStorage.getItem(SHOWN_THIS_SESSION_KEY) === "true") return false;
  } catch {
    // Storage can be unavailable in privacy-restricted browsers. The quiz can
    // still work; it simply cannot remember the dismissal.
  }
  return true;
}

function hasActiveFormInteraction(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  return active.matches("input, textarea, select, [contenteditable='true']");
}

function hasMeaningfulScroll(): boolean {
  const scrollableHeight = Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    document.body.scrollHeight - window.innerHeight,
    0,
  );
  if (scrollableHeight === 0) return false;
  return window.scrollY / scrollableHeight >= ENGAGEMENT_SCROLL_RATIO;
}

const SkinConcernQuiz = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const applyDiscountCode = useCartStore((state) => state.applyDiscountCode);
  const cartOpen = useCartStore((state) => state.isOpen);
  const [open, setOpen] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [suppressedThisRender, setSuppressedThisRender] = useState(false);
  const [interactionBlocked, setInteractionBlocked] = useState(false);
  const [consentResolved, setConsentResolved] = useState(
    () => !requiresOptIn() || getStoredConsent() !== null,
  );
  const [step, setStep] = useState<QuizStep>("concern");
  const [concern, setConcern] = useState<SkinConcernId | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoApplied, setAutoApplied] = useState(true);
  const [website, setWebsite] = useState("");
  const formStartedAt = useRef<number | null>(null);
  const submissionAttempt = useRef<{ id: string; signature: string } | null>(null);

  const selectedConcern = useMemo(
    () => SKIN_CONCERNS.find((item) => item.id === concern) ?? null,
    [concern],
  );
  const forcePreview = new URLSearchParams(search).get("quiz") === "preview";

  useEffect(() => {
    if (forcePreview) {
      setEngaged(true);
      setConsentResolved(true);
      setOpen(true);
      return;
    }
    if (shouldSuppressQuizForEmailCampaign(search) || !canShowQuiz(pathname)) return;
    if (/Lighthouse|Chrome-Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent)) return;
    if (window.top !== window.self) return;

    // The component itself is lazy-loaded after the initial render. Anchor the
    // delay to navigation start so it remains a true 15-second dwell trigger
    // rather than silently becoming 18+ seconds as loading strategy changes.
    const elapsed = typeof performance !== "undefined" ? performance.now() : 0;
    const timer = window.setTimeout(
      () => setEngaged(true),
      Math.max(0, ENGAGEMENT_DELAY_MS - elapsed),
    );
    const onScroll = () => {
      if (hasMeaningfulScroll()) setEngaged(true);
    };
    const onFocusIn = () => setInteractionBlocked(hasActiveFormInteraction());
    const onFocusOut = () => setInteractionBlocked(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") setInteractionBlocked(hasActiveFormInteraction());
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibilityChange);
    onScroll();

    const unsubscribe = onConsentChange(() => setConsentResolved(true));
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [forcePreview, pathname, search]);

  useEffect(() => {
    if (forcePreview || open || suppressedThisRender || !engaged || !consentResolved || cartOpen || interactionBlocked) return;
    if (document.visibilityState === "hidden" || shouldSuppressQuizForEmailCampaign(search) || !canShowQuiz(pathname)) return;
    try {
      sessionStorage.setItem(SHOWN_THIS_SESSION_KEY, "true");
    } catch {
      // Non-blocking; the open state remains the source of truth.
    }
    setOpen(true);
    void trackEvent("skin_quiz_view", {
      source: SKIN_QUIZ_PROMOTION.source,
      trigger: hasMeaningfulScroll() ? "scroll_40" : "dwell_15s",
    });
  }, [cartOpen, consentResolved, engaged, forcePreview, interactionBlocked, open, pathname, search, suppressedThisRender]);

  const reset = () => {
    setStep("concern");
    setConcern(null);
    setEmail("");
    setSubmitting(false);
    setError("");
    setCopied(false);
    setAutoApplied(true);
    setWebsite("");
    formStartedAt.current = null;
    submissionAttempt.current = null;
  };

  const close = () => {
    setOpen(false);
    setSuppressedThisRender(true);
    if (step !== "success" && !forcePreview) {
      try {
        localStorage.setItem(DISMISSED_UNTIL_KEY, String(Date.now() + DISMISS_FOR_MS));
      } catch {
        // Dismissal still works for the current render.
      }
    }
    window.setTimeout(reset, 250);
  };

  const chooseConcern = (nextConcern: SkinConcernId) => {
    setConcern(nextConcern);
    setStep("email");
    setError("");
    formStartedAt.current = Date.now();
    void trackEvent("skin_quiz_answered", {
      source: SKIN_QUIZ_PROMOTION.source,
      skin_concern: nextConcern,
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!concern || !email.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const signature = `${email.trim().toLowerCase()}:${concern}`;
      if (!submissionAttempt.current || submissionAttempt.current.signature !== signature) {
        submissionAttempt.current = { id: createSkinQuizSubmissionId(), signature };
      }
      await submitSkinQuizLead({
        submissionId: submissionAttempt.current.id,
        email,
        concern,
        consent: {
          capturedAt: new Date().toISOString(),
          disclosureVersion: SKIN_QUIZ_CONSENT_VERSION,
        },
        botSignals: {
          website,
          formStartedAt: formStartedAt.current,
        },
      });
      activateSkinQuizDiscount();
      const discountResult = await applyDiscountCode(SKIN_QUIZ_PROMOTION.code);
      setAutoApplied(discountResult.success && discountResult.applicable !== false);
      try {
        localStorage.setItem(COMPLETED_KEY, "true");
      } catch {
        // The submitted state still prevents another popup this render.
      }
      setStep("success");
    } catch {
      setError("We couldn't finish that. Your code is still locked—check your connection and try again.");
      void trackEvent("skin_quiz_error", { source: SKIN_QUIZ_PROMOTION.source });
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(SKIN_QUIZ_PROMOTION.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shopWithDiscount = () => {
    setOpen(false);
    setSuppressedThisRender(true);
    if (pathname === "/face-cream") {
      document.getElementById("offer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/face-cream?offer=single");
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-[#0A0A0A]/72 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-[81] max-h-[92dvh] overflow-y-auto border-t-4 border-brand bg-[#F7F4EE] px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(92vw,520px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:border-t-4 sm:px-9 sm:py-8 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95"
        >
          <DialogPrimitive.Description className="sr-only">
            Answer one skin concern question, then enter your email to receive a 15% discount code.
          </DialogPrimitive.Description>
          <button
            type="button"
            onClick={close}
            aria-label="Close skin concern quiz"
            className="absolute right-3 top-3 flex size-11 items-center justify-center text-[#1A2F4C]/65 transition-colors hover:text-[#1A2F4C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {step === "concern" && (
            <div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
                1 of 2 · Get <strong className="font-black text-[#1A2F4C]">15% off</strong>
              </p>
              <DialogPrimitive.Title className="mt-3 max-w-[390px] font-heading text-[32px] font-black uppercase leading-[0.94] tracking-[-0.035em] text-[#1A2F4C] sm:text-[40px]">
                Your skin. One better layer.
              </DialogPrimitive.Title>
              <p className="mt-3 font-body text-[14px] leading-relaxed text-[#4A5568] sm:text-[15px]">
                Pick the thing you want to fix first. Your <strong className="font-bold text-[#1A2F4C]">15% code</strong> is on the next step.
              </p>

              <fieldset className="mt-6">
                <legend className="font-heading text-[14px] font-bold uppercase tracking-[0.06em] text-[#1A2F4C]">
                  What's your main skin concern?
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {SKIN_CONCERNS.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => chooseConcern(item.id)}
                      className="group flex min-h-14 items-center gap-3 border-2 border-[#1A2F4C]/18 bg-white px-4 py-3 text-left transition-colors hover:border-[#1A2F4C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
                    >
                      <span className="font-body text-[10px] font-bold tabular-nums text-brand">{String(index + 1).padStart(2, "0")}</span>
                      <span className="font-heading text-[13px] font-bold uppercase tracking-[0.04em] text-[#1A2F4C]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <button type="button" onClick={close} className="mt-5 min-h-11 font-body text-[12px] font-semibold text-[#4A5568] underline underline-offset-4 hover:text-[#1A2F4C]">
                No thanks
              </button>
            </div>
          )}

          {step === "email" && selectedConcern && (
            <div>
              <button
                type="button"
                onClick={() => setStep("concern")}
                className="mb-4 flex min-h-11 items-center gap-2 pr-3 font-body text-[12px] font-semibold text-[#4A5568] hover:text-[#1A2F4C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
              >
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </button>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-brand">2 of 2 · Your match</p>
              <DialogPrimitive.Title className="mt-3 font-heading text-[32px] font-black uppercase leading-[0.94] tracking-[-0.035em] text-[#1A2F4C] sm:text-[40px]">
                Base Layer. Done.
              </DialogPrimitive.Title>
              <p className="mt-3 font-body text-[15px] font-semibold leading-relaxed text-[#1A2F4C]">
                {selectedConcern.result}
              </p>
              <p className="mt-2 font-body text-[13px] leading-relaxed text-[#4A5568]">
                Enter your email to unlock <strong className="font-bold text-[#1A2F4C]">15% off</strong> your first one-time order.
              </p>

              <form onSubmit={submit} className="mt-6">
                <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor="skin-quiz-website">Website</label>
                  <input
                    id="skin-quiz-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </div>
                <label htmlFor="skin-quiz-email" className="block font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[#1A2F4C]">
                  Email address
                </label>
                <input
                  id="skin-quiz-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-describedby={error ? "skin-quiz-error skin-quiz-email-terms" : "skin-quiz-email-terms"}
                  className="mt-2 min-h-12 w-full border-2 border-[#1A2F4C]/28 bg-white px-4 font-body text-[16px] text-[#1A2F4C] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#1A2F4C]"
                  placeholder="you@email.com"
                />
                {error && <p id="skin-quiz-error" role="alert" className="mt-2 font-body text-[12px] font-semibold text-[#B42318]">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 flex min-h-12 w-full items-center justify-center bg-brand px-5 font-heading text-[12px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C] disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? "Unlocking…" : error ? "Try again" : "Unlock 15% off"}
                </button>
                <p id="skin-quiz-email-terms" className="mt-3 font-body text-[10px] leading-[1.5] text-[#596270]">
                  By signing up, you agree to receive Base Layer emails. Unsubscribe anytime. See our{" "}
                  <Link to="/privacy-policy" onClick={() => setOpen(false)} className="font-semibold underline underline-offset-3 hover:no-underline">Privacy Policy</Link>.
                </p>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="text-center">
              <span className="mx-auto flex size-11 items-center justify-center border-2 border-[#25803A] bg-[#E8F4E9] text-[#25803A]">
                <Check className="size-6" strokeWidth={3} aria-hidden="true" />
              </span>
              <p className="mt-4 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-[#25803A]">Discount unlocked</p>
              <DialogPrimitive.Title className="mt-2 font-heading text-[32px] font-black uppercase leading-[0.94] tracking-[-0.035em] text-[#1A2F4C] sm:text-[40px]">
                15% off. Locked in.
              </DialogPrimitive.Title>
              <p className="mt-3 font-body text-[13px] leading-relaxed text-[#4A5568]">
                {autoApplied
                  ? "Applied automatically to your next one-time order."
                  : "Use this code on your first one-time order."}
              </p>

              <button
                type="button"
                onClick={copyCode}
                className="mt-6 flex min-h-16 w-full items-center justify-between border-2 border-dashed border-[#1A2F4C]/35 bg-white px-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
                aria-label={`Copy discount code ${SKIN_QUIZ_PROMOTION.code}`}
              >
                <span className="text-left">
                  <span className="block font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#6B7280]">Your code</span>
                  <span className="mt-1 block font-heading text-[22px] font-black tracking-[0.08em] text-[#1A2F4C]">{SKIN_QUIZ_PROMOTION.code}</span>
                </span>
                <span className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.08em] text-[#1A2F4C]">
                  {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>

              <button
                type="button"
                onClick={shopWithDiscount}
                className="mt-3 flex min-h-12 w-full items-center justify-center bg-brand px-5 font-heading text-[12px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
              >
                Shop with 15% off
              </button>
              <p className="mt-3 font-body text-[10px] leading-relaxed text-[#596270]">First one-time order only. Cannot be applied to subscriptions.</p>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default SkinConcernQuiz;
