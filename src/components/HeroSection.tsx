import { useState, useEffect, useRef } from "react";
import { trackEvent, setCapturedEmail } from "@/lib/analytics";

const MOBILE_MQ = "(max-width: 767px)";

let _supabase: typeof import("@/integrations/supabase/client")["supabase"] | null = null;
async function getSupabase() {
  if (!_supabase) {
    const mod = await import("@/integrations/supabase/client");
    _supabase = mod.supabase;
  }
  return _supabase;
}

const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_MQ).matches : true
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MQ);
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Defer cinematic pan animation until after image loads (post-LCP)
  useEffect(() => {
    const img = heroImgRef.current;
    if (!img) return;
    const startAnimation = () => {
      img.classList.add("animate-cinematic-pan");
    };
    if (img.complete) {
      startAnimation();
    } else {
      img.addEventListener("load", startAnimation, { once: true });
      return () => img.removeEventListener("load", startAnimation);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const sb = await getSupabase();
      await sb.from("waitlist").insert({ email: email.trim(), source: "hero_inline" });
      setCapturedEmail(email);
      localStorage.setItem("bl_email_captured", "true");
      trackEvent("email_signup", { source: "hero_inline", email: email.trim() });
      sb.functions
        .invoke("email-subscribe", { body: { email: email.trim(), source: "hero_inline" } })
        .catch(() => { });
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] bg-[#F4F4F0] overflow-hidden flex items-center">
      {/* Background "Video" Simulation (Slow Pan Static Image fallback) */}
      <div className="absolute inset-0 z-0 bg-[#F4F4F0]">
        <picture>
          <source
            type="image/webp"
            srcSet="/images/hero-guy-orange-4k.webp"
            sizes="100vw"
          />
          <img
            ref={heroImgRef}
            src="/images/hero-guy-orange-4k.png"
            alt="Bright, rugged alpine environment"
            width={640}
            height={640}
            sizes="100vw"
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
        {/* Gradient overlays to ensure text readability (Daylight Version) */}
        <div className="absolute inset-0 bg-[#F4F4F0]/30 sm:bg-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F4F0]/80 via-[#F4F4F0]/40 to-transparent lg:w-[60%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F4F0]/90 via-[#F4F4F0]/30 to-transparent h-[35%] bottom-0 mt-auto"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-20">
        <div className="max-w-xl xl:max-w-2xl">

          {/* Eyebrow Label */}
          <div className="animate-fade-in-up flex items-center gap-3 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-[#F95D1A] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-[#F95D1A]"></span>
            </span>
            <span className="font-heading text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-[#1E201E]/80">
              BUILT IN COLORADO FOR HARSH ELEMENTS
            </span>
          </div>

          {/* Primary Headline */}
          <h1 className="animate-fade-in-up font-heading text-5xl sm:text-6xl md:text-[84px] font-black tracking-tighter text-[#1E201E] uppercase leading-[0.85] mb-6">
            ONE CREAM.<br />
            15 SECONDS.<br />
            DONE.
          </h1>

          {/* Subheading */}
          <p
            className="animate-fade-in-up font-body text-base sm:text-lg md:text-xl text-[#1E201E]/80 leading-relaxed mb-10 max-w-lg"
            style={{ animationDelay: "0.1s" }}
          >
            Your face takes a beating. Repair it instantly with one clinical-grade layer. No 6-step routines. Zero shine. Completely invisible under your gear.
          </p>

          {/* Inline Email Capture (Industrial Styling) */}
          <div
            className="animate-fade-in-up w-full max-w-[460px]"
            style={{ animationDelay: "0.2s" }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to reserve"
                  className="w-full sm:w-2/3 px-5 py-5 bg-[#F4F4F0]/80 backdrop-blur-md border-2 border-[#1E201E]/20 text-[#1E201E] text-base font-body placeholder:text-[#1E201E]/50 focus:outline-none focus:border-[#F95D1A] transition-all rounded-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-1/3 px-0 py-5 bg-[#F95D1A] text-[#F4F4F0] font-heading font-black tracking-widest text-[14px] uppercase hover:bg-[#1E201E] transition-all duration-300 disabled:opacity-50 rounded-none whitespace-nowrap"
                >
                  {loading ? "\u2026" : "BATCH 01 \u2192"}
                </button>
              </form>
            ) : (
              <div className="flex border-2 border-[#F95D1A]/50 bg-[#F4F4F0]/80 backdrop-blur-md p-5 border-l-4 border-l-[#F95D1A] rounded-none">
                <div className="flex flex-col">
                  <span className="font-heading text-base font-bold tracking-widest uppercase text-[#1E201E]">Allocation Secured.</span>
                  <span className="font-body text-sm text-[#1E201E]/80 mt-1">Check your inbox for Batch 01 details.</span>
                </div>
              </div>
            )}
          </div>

          {/* Premium Gear Spec Badges (Technical SVG row) */}
          <div
            className="mt-12 animate-fade-in-up flex items-center justify-between sm:justify-start gap-4 sm:gap-10 text-left border-t border-[#1E201E]/10 pt-6"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Badge 1 */}
            <div className="flex flex-col gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#1E201E]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-body text-[9px] text-[#1E201E]/80 font-bold uppercase tracking-[0.1em]">
                ONE STEP
              </span>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col gap-2 border-l border-[#1E201E]/10 pl-4 sm:pl-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#1E201E]">
                <circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" />
              </svg>
              <span className="font-body text-[9px] text-[#1E201E]/80 font-bold uppercase tracking-[0.1em]">
                LAB TESTED
              </span>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col gap-2 border-l border-[#1E201E]/10 pl-4 sm:pl-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#1E201E]">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <span className="font-body text-[9px] text-[#1E201E]/80 font-bold uppercase tracking-[0.1em]">
                ANTI-AGING DEFENSE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
