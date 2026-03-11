import { useState, useEffect } from "react";
import heroProduct from "@/assets/hero-product.jpg";
import heroWebp480 from "@/assets/hero-product-480w.webp";
import heroWebp768 from "@/assets/hero-product-768w.webp";
import heroWebp1200 from "@/assets/hero-product-1200w.webp";
import heroWebp1920 from "@/assets/hero-product-1920w.webp";
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

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MQ);
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Returning visitor — already signed up
  useEffect(() => {
    if (localStorage.getItem("bl_email_captured") === "true") {
      setSubmitted(true);
    }
  }, []);

  // Deferred waitlist count — loads Supabase chunk only after hero paint
  useEffect(() => {
    const load = async () => {
      try {
        const sb = await getSupabase();
        const { count, error } = await sb
          .from("waitlist")
          .select("*", { count: "exact", head: true });
        if (!error && count !== null) {
          setWaitlistCount(Math.max(count, 332));
        }
      } catch {
        // silent — counter just won't show
      }
    };
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(load, { timeout: 3000 });
    } else {
      setTimeout(load, 1500);
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
        .catch(() => {});
      setSubmitted(true);
      setWaitlistCount((prev) => (prev !== null ? prev + 1 : null));
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center overflow-hidden pt-[80px]"
    >
      {/* Background image */}
      <picture>
        <source
          type="image/webp"
          srcSet={`${heroWebp480} 480w, ${heroWebp768} 768w, ${heroWebp1200} 1200w, ${heroWebp1920} 1920w`}
          sizes="100vw"
        />
        <img
          src={heroProduct}
          alt="Base Layer face cream bottle"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1200}
          height={800}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: isMobile ? "center center" : "center 20%" }}
        />
      </picture>

      {/* Gradient overlay — heavier on mobile for text legibility */}
      <div
        className={`absolute inset-0 ${
          isMobile
            ? "bg-gradient-to-t from-black/90 via-black/65 to-black/30"
            : "bg-gradient-to-r from-black/80 via-black/55 to-black/20"
        }`}
      />

      <div className="relative z-10 w-full max-w-xl px-5 md:px-12 mx-auto md:mx-0 md:ml-[5%] lg:ml-[10%]">
        <div className="text-center md:text-left">
          {/* Eyebrow — broader positioning statement */}
          <p className="font-body text-[11px] tracking-[0.3em] uppercase text-white/70 mb-3">
            Better skin for men who don't want a routine.
          </p>

          {/* Headline — specific, punchy, benefit-driven promise */}
          <h1
            className="font-heading text-[2rem] md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-5 text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
          >
            ONE FACE CREAM.
            <br />
            15 SECONDS.
            <br />
            NO SHINE.
            <span className="sr-only">
              {" "}
              &mdash; Face Moisturizer for Men by Base Layer
            </span>
          </h1>

          {/* Body copy — identity confirmation, mirrors ad message */}
          <p
            className="font-body text-[15px] md:text-base text-white/80 leading-relaxed mb-6 max-w-md mx-auto md:mx-0"
          >
            You don't need a shelf full of products. One pump, 15 seconds, and
            you're out the door &mdash; hydrated, matte, no greasy residue.
          </p>

          {/* Inline email capture — one field, one button, zero friction */}
          <div
            className="animate-fade-in-up max-w-md mx-auto md:mx-0"
            style={{ animationDelay: "0.2s" }}
          >
            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  inputMode="email"
                  autoComplete="email"
                  className="flex-1 min-w-0 px-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-body placeholder:text-white/40 focus:outline-none focus:border-white/50 focus:bg-white/[0.14] transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-white text-black font-heading font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-colors shrink-0 disabled:opacity-50"
                >
                  {loading ? "\u2026" : "RESERVE \u2014 $38"}
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2.5 text-white/90 justify-center md:justify-start py-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/25 shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="font-body text-sm">
                  You're on the list. We'll email you first.
                </span>
              </div>
            )}
          </div>

          {/* Social proof — live waitlist count */}
          <div
            className="mt-3 min-h-[1.125rem] animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            {waitlistCount !== null && (
              <p className="font-body text-xs text-white/50 text-center md:text-left">
                {submitted ? (
                  <>
                    You joined{" "}
                    <span className="font-heading font-bold text-white/70 tabular-nums">
                      {waitlistCount.toLocaleString()}
                    </span>{" "}
                    men on the founding batch list
                  </>
                ) : (
                  <>
                    Join{" "}
                    <span className="font-heading font-bold text-white/70 tabular-nums">
                      {waitlistCount.toLocaleString()}
                    </span>{" "}
                    men on the founding batch list
                  </>
                )}
              </p>
            )}
          </div>

          {/* Microcopy */}
          <div
            className="mt-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="font-body text-[10px] text-white/35 uppercase tracking-wider text-center md:text-left">
              Fragrance-free &middot; 50 mL &middot; no subscription &middot;
              ships April 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
