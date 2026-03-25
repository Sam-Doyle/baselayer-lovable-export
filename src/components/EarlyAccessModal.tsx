import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
let _supabase: typeof import("@/integrations/supabase/client")["supabase"] | null = null;
async function getSupabase() {
  if (!_supabase) {
    const mod = await import("@/integrations/supabase/client");
    _supabase = mod.supabase;
  }
  return _supabase;
}
import { trackEvent, setCapturedEmail } from "@/lib/analytics";
import { X, Check, ChevronRight } from "lucide-react";

/*
 * SIMPLIFIED FUNNEL: 3 screens instead of 6
 *
 * OLD: email → reserve → ask → survey(3 sub-steps) → done = 6 screens
 *   Problem: Each transition is a drop-off point. Survey completion rate is low
 *   because users must click through 2 intermediate screens before the survey even starts.
 *
 * NEW: email → confirmation + optional inline survey → done = 3 screens
 *   - Screen 1: Email capture (unchanged)
 *   - Screen 2: Confirmation + reserve toggle + compact survey (ALL ON ONE SCREEN)
 *   - Screen 3: Thank you
 *
 * Key design decisions:
 *   - Reserve is now a toggle, not a full screen. Reduces one click.
 *   - Survey questions appear inline below the confirmation, not behind another gate.
 *   - Users can submit partial surveys (any questions answered).
 *   - "Skip" and "Done" are always visible — no trapped feeling.
 */

type Step = "email" | "confirm" | "done" | "returning";

const issues = [
  "Dryness",
  "Shine / greasy feel",
  "No routine",
  "I want to simplify things",
];
const priceOptions = ["$28", "$38", "$45"];
const prefOptions = [
  "One moisturizer to rule them all",
  "Simple 2 step AM routine",
  "Full system (3-4 steps AM + PM)",
];

const EarlyAccessModal = () => {
  const { isOpen, closeModal } = useEarlyAccess();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Confirmation screen state
  const [reserved, setReserved] = useState(false);
  const [biggestIssue, setBiggestIssue] = useState("");
  const [wouldTry, setWouldTry] = useState("");
  const [preference, setPreference] = useState("");
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset to email step each time modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen]);

  const reset = () => {
    setStep("email");
    setEmail("");
    setReserved(false);
    setBiggestIssue("");
    setWouldTry("");
    setPreference("");
    setSurveySubmitted(false);
  };

  const handleClose = () => {
    closeModal();
    setTimeout(reset, 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await (await getSupabase()).from("waitlist").insert({ email: email.trim(), source: "early_access" });
      setCapturedEmail(email);
      localStorage.setItem("bl_email_captured", "true");
      trackEvent("email_signup", { source: "early_access", email: email.trim() });
      (await getSupabase()).functions.invoke("email-subscribe", { body: { email: email.trim(), source: "early_access" } }).catch(() => {});
      setStep("confirm");
    } catch {
      // non-blocking — still advance
      setStep("confirm");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = () => {
    setReserved(true);
    trackEvent("reserve_intent", { email: email.trim(), response: "yes", price: 38 });
  };

  const handleSurveySubmit = async () => {
    if (surveySubmitted) return;
    setSurveySubmitted(true);
    try {
      await ((await getSupabase()).from("survey_responses") as any).insert({
        waitlist_email: email.trim(),
        biggest_issue: biggestIssue || null,
        would_try: wouldTry || null,
        preference: preference || null,
      });
      trackEvent("survey_completed", { email: email.trim() });
    } catch {
      // non-blocking
    }
    setStep("done");
  };

  const handleFinish = () => {
    // If any survey data was filled but not submitted, submit it
    if (!surveySubmitted && (biggestIssue || wouldTry || preference)) {
      // Fire and forget partial survey
      getSupabase().then((sb) =>
        (sb.from("survey_responses") as any).insert({
          waitlist_email: email.trim(),
          biggest_issue: biggestIssue || null,
          would_try: wouldTry || null,
          preference: preference || null,
        }).catch(() => {})
      );
      if (biggestIssue || wouldTry || preference) {
        trackEvent("survey_partial", { email: email.trim(), fields_completed: [biggestIssue && "issue", wouldTry && "price", preference && "pref"].filter(Boolean).length });
      }
    }
    setStep("done");
  };

  const hasSurveyData = biggestIssue || wouldTry || preference;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="bg-background border border-border max-w-md w-full p-6 sm:p-8 md:p-10 text-center relative max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-t-none">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ===== SCREEN 1: EMAIL CAPTURE ===== */}
        {step === "email" && (
          <>
            <h2 className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight leading-[0.95] mb-4">
              GET EARLY ACCESS
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
              Be first in line. Pre-launch pricing at $38.
            </p>
            <p className="font-body text-xs text-muted-foreground mb-6 uppercase tracking-wider">
              One email when we launch. No spam.
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                inputMode="email"
                autoComplete="email"
                aria-label="Email address"
                className="w-full px-4 py-3 bg-transparent border border-border text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
              />
              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={loading}
                className="w-full py-5 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90"
              >
                {loading ? "..." : "GET EARLY ACCESS"}
              </Button>
            </form>
            <p className="font-body text-[11px] text-muted-foreground mt-4 leading-relaxed">
              No spam. No fluff. One launch email.
            </p>
          </>
        )}

        {/* ===== SCREEN 2: CONFIRMATION + RESERVE + INLINE SURVEY ===== */}
        {step === "confirm" && (
          <>
            {/* Confirmation header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20">
                <Check className="w-4 h-4 text-green-400" strokeWidth={3} />
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight leading-[0.95]">
                YOU'RE IN
              </h2>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
              Early access secured at $38. You're on the list.
            </p>

            {/* Reserve toggle — single click, not a full screen */}
            {!reserved ? (
              <button
                onClick={handleReserve}
                className="w-full flex items-center justify-between px-4 py-3 border border-border hover:border-foreground transition-colors mb-6 group"
              >
                <span className="font-body text-sm text-foreground">Reserve a bottle for me</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ) : (
              <div className="w-full flex items-center gap-2 px-4 py-3 border border-green-500/30 bg-green-500/5 mb-6">
                <Check className="w-4 h-4 text-green-400" />
                <span className="font-body text-sm text-green-400">Bottle reserved</span>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <span className="flex-1 h-px bg-border" />
              <span className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">
                Help shape the first drop
              </span>
              <span className="flex-1 h-px bg-border" />
            </div>

            {/* Compact inline survey — all 3 questions visible */}
            <div className="space-y-5 text-left mb-6">
              {/* Q1: Biggest issue */}
              <div>
                <p className="font-heading text-xs font-bold uppercase tracking-wider mb-2 text-foreground">
                  Biggest skin issue?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {issues.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setBiggestIssue(biggestIssue === opt ? "" : opt)}
                      className={`px-3 py-1.5 border text-xs font-body transition-colors ${
                        biggestIssue === opt
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/50 text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Price point */}
              <div>
                <p className="font-heading text-xs font-bold uppercase tracking-wider mb-2 text-foreground">
                  Ideal price for skincare?
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {priceOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setWouldTry(wouldTry === opt ? "" : opt)}
                      className={`px-3 py-1.5 border text-xs font-body transition-colors ${
                        wouldTry === opt
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/50 text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Preference */}
              <div>
                <p className="font-heading text-xs font-bold uppercase tracking-wider mb-2 text-foreground">
                  What would you prefer?
                </p>
                <div className="flex flex-col gap-1.5">
                  {prefOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPreference(preference === opt ? "" : opt)}
                      className={`px-3 py-2 border text-xs font-body text-left transition-colors ${
                        preference === opt
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/50 text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {hasSurveyData ? (
              <Button
                variant="hero"
                size="lg"
                className="w-full py-5 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90"
                onClick={handleSurveySubmit}
              >
                SUBMIT ANSWERS
              </Button>
            ) : (
              <button
                onClick={handleFinish}
                className="font-body text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors py-3 inline-block"
              >
                Skip, I'm good for now
              </button>
            )}
          </>
        )}

        {/* ===== SCREEN 3: DONE ===== */}
        {step === "done" && (
          <>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight mb-3">
              {surveySubmitted ? "YOU'RE SHAPING THE FIRST DROP." : "YOU'RE ALL SET."}
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
              {surveySubmitted
                ? "Your answers directly influence our formulation. We'll email you first when we launch."
                : "We'll email you first when we launch."}
            </p>
            <a href="https://www.instagram.com/baselayerskin/" target="_blank" rel="noopener noreferrer" className="block mb-3">
              <Button variant="hero" size="lg" className="w-full px-10 py-5 text-xs border-foreground text-foreground before:bg-foreground hover:text-background font-bold tracking-wider">
                FOLLOW ON INSTAGRAM
              </Button>
            </a>
            <button
              onClick={handleClose}
              className="font-body text-xs text-muted-foreground underline hover:text-foreground transition-colors py-3 inline-block"
            >
              Close
            </button>
          </>
        )}

        {/* ===== RETURNING VISITOR ===== */}
        {step === "returning" && (
          <>
            <h2 className="font-heading text-2xl md:text-3xl font-black tracking-tight uppercase mb-4">WELCOME BACK</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
              You're already on the early access list. Follow us for behind-the-scenes updates.
            </p>
            <a href="https://www.instagram.com/baselayerskin/" target="_blank" rel="noopener noreferrer" className="block mb-3">
              <Button variant="hero" size="lg" className="w-full px-10 py-5 text-xs border-foreground text-foreground before:bg-foreground hover:text-background font-bold tracking-wider">
                FOLLOW ON INSTAGRAM
              </Button>
            </a>
            <button onClick={handleClose} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors underline py-3 inline-block">
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EarlyAccessModal;
