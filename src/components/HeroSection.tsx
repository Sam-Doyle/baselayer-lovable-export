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
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[85vh] bg-[#1A2F4C] overflow-hidden flex items-center">
      {/* Background "Video" Simulation (Slow Pan Static Image fallback) */}
      <div className="absolute inset-0 z-0 bg-[#1A2F4C]">
        <picture>
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet="/images/hero-product-mountain-mobile.webp"
            sizes="100vw"
          />
          <source
            type="image/webp"
            media="(min-width: 769px)"
            srcSet="/images/hero-product-mountain.webp"
            sizes="100vw"
          />
          <source
            type="image/png"
            media="(max-width: 768px)"
            srcSet="/images/hero-product-mountain-mobile.png"
            sizes="100vw"
          />
          <img
            ref={heroImgRef}
            src="/images/hero-product-mountain.png"
            alt="Base Layer product in alpine environment"
            sizes="100vw"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-[65%_center] lg:object-[center_right]"
          />
        </picture>
        {/* Gradient overlays to ensure text readability */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,47,76,0.85)_0%,rgba(26,47,76,0.60)_35%,rgba(26,47,76,0.20)_55%,transparent_70%)] md:bg-[linear-gradient(to_right,rgba(26,47,76,0.80)_0%,rgba(26,47,76,0.50)_30%,rgba(26,47,76,0.15)_50%,transparent_60%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-[80px] md:pt-[120px]">
        <div className="max-w-[500px]">

          {/* Eyebrow Label */}
          <div className="animate-fade-in-up mb-4">
            <span className="font-heading text-[11px] uppercase tracking-[0.2em] font-normal text-white/70">
              BUILT IN COLORADO FOR HARSH ELEMENTS
            </span>
          </div>

          {/* Primary Headline */}
          <h1 className="animate-fade-in-up font-heading text-[clamp(36px,8vw,48px)] lg:text-[84px] font-black tracking-tighter text-white uppercase leading-[1.05] mb-6">
            ONE CREAM<span className="text-[#F35D1A]">.</span><br />
            15 SECONDS<span className="text-[#F35D1A]">.</span><br />
            DONE<span className="text-[#F35D1A]">.</span>
          </h1>

          {/* Subheading */}
          <p
            className="animate-fade-in-up font-body text-base sm:text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-lg"
            style={{ animationDelay: "0.1s" }}
          >
            Your face takes a beating — sun, wind, dry air, bad sleep. Fix it in 15 seconds with one clinical-grade layer. No routines. Zero shine. Nobody knows you're wearing it.
          </p>

          {/* Inline Email Capture (Industrial Styling) */}
          <div
            className="animate-fade-in-up w-full max-w-[460px] pb-12"
            style={{ animationDelay: "0.2s" }}
          >
            {!submitted ? (
              <div className="flex flex-col w-full">
                {/* Price Block */}
                <div className="flex items-start gap-2 mb-3 md:mb-4">
                  <span className="font-body text-[16px] text-white opacity-60 line-through mt-1.5 mr-1">$48</span>
                  <span className="font-heading font-bold text-[28px] text-white leading-none">$38</span>
                  <span className="font-body text-[12px] text-white opacity-70 tracking-[0.1em] uppercase mt-2 block">Founding Price</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full sm:w-[55%] px-5 py-[14px] bg-[#F4F4F0]/80 backdrop-blur-md border border-transparent text-[#1E201E] text-base font-body placeholder:text-[#1E201E]/50 focus:outline-none focus:ring-2 focus:ring-[#F35D1A] transition-all rounded-[4px]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-[45%] px-0 py-[14px] bg-[#F35D1A] text-white font-heading font-black tracking-[0.1em] text-[13px] uppercase hover:bg-[#1A2F4C] transition-all duration-300 disabled:opacity-50 rounded-[4px] whitespace-nowrap"
                  >
                    {loading ? "\u2026" : "GET STARTED \u2014 $38 \u2192"}
                  </button>
                </form>

                {/* Trust Micro-Copy */}
                <p className="font-body text-[12px] text-white opacity-60 mt-3 hidden sm:block">
                  Free shipping &middot; 30-day guarantee &middot; Cancel anytime
                </p>
                <div className="flex items-center mt-2 hidden sm:flex">
                  <span className="text-[#F35D1A] text-[14px] tracking-[2px] leading-none">★★★★★</span>
                  <span className="font-body text-[12px] text-white opacity-70 ml-2">4.8/5 from 1,000+ men</span>
                </div>

                {/* Mobile exact recreation */}
                <div className="sm:hidden mt-3 text-left">
                  <p className="font-body text-[12px] text-white opacity-60 mb-2">
                    Free shipping &middot; 30-day guarantee<br />Cancel anytime
                  </p>
                  <div className="flex items-center">
                    <span className="text-[#F35D1A] text-[14px] tracking-[2px] leading-none">★★★★★</span>
                    <span className="font-body text-[12px] text-white opacity-70 ml-2">4.8/5 from 1,000+ men</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex border border-[#F35D1A]/50 bg-[#F4F4F0]/80 backdrop-blur-md p-5 border-l-4 border-l-[#F35D1A] rounded-[4px]">
                <div className="flex flex-col">
                  <span className="font-heading text-base font-bold tracking-widest uppercase text-[#1E201E]">Allocation Secured.</span>
                  <span className="font-body text-sm text-[#1E201E]/80 mt-1">Check your inbox for Batch 01 details.</span>
                </div>
              </div>
            )}
          </div>

          {/* Premium Gear Spec Badges (Technical SVG row) */}
          <div
            className="animate-fade-in-up flex flex-wrap sm:flex-nowrap items-center justify-start gap-4 sm:gap-10 text-left border-t border-white/20 pt-6 mt-8 md:mt-12 max-w-[500px]"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Badge 1 */}
            <div className="flex flex-col gap-2 min-w-[30%] sm:min-w-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-heading font-semibold text-[10px] tracking-[0.15em] text-white/80 uppercase">
                ONE STEP
              </span>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col gap-2 min-w-[30%] sm:min-w-0 sm:border-l sm:border-white/20 sm:pl-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-white">
                <circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" />
              </svg>
              <span className="font-heading font-semibold text-[10px] tracking-[0.15em] text-white/80 uppercase">
                LAB TESTED
              </span>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col gap-2 min-w-[30%] sm:min-w-0 sm:border-l sm:border-white/20 sm:pl-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-white">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <span className="font-heading font-semibold text-[10px] tracking-[0.15em] text-white/80 uppercase">
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
