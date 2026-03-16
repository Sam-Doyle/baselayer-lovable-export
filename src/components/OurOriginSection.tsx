import { useEffect, useRef, useState } from "react";
import { trackEvent, setCapturedEmail } from "@/lib/analytics";

let _supabase: typeof import("@/integrations/supabase/client")["supabase"] | null = null;
async function getSupabase() {
  if (!_supabase) {
    const mod = await import("@/integrations/supabase/client");
    _supabase = mod.supabase;
  }
  return _supabase;
}

const OurOriginSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("bl_email_captured") === "true") {
            setSubmitted(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || loading) return;
        setLoading(true);
        try {
            const sb = await getSupabase();
            await sb.from("waitlist").insert({ email: email.trim(), source: "origin_inline" });
            setCapturedEmail(email);
            localStorage.setItem("bl_email_captured", "true");
            trackEvent("email_signup", { source: "origin_inline", email: email.trim() });
            sb.functions
                .invoke("email-subscribe", { body: { email: email.trim(), source: "origin_inline" } })
                .catch(() => { });
            setSubmitted(true);
        } catch {
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const ref = sectionRef.current;
        if (!ref) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.2 }
        );
        observer.observe(ref);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="origin" ref={sectionRef} className="bg-[#F4F4F0] py-24 md:py-32 border-t border-[#1E201E]/10">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* Header Label */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-px w-8 bg-[#F95D1A]"></div>
                    <span className="font-heading text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-[#F95D1A]">
                        Forged in CO
                    </span>
                </div>

                {/* Two Column Content */}
                <div className="grid lg:grid-cols-12 gap-16 lg:gap-12 items-start">

                    {/* Left: Heading & Imagery Grid */}
                    <div className="lg:col-span-7 flex flex-col gap-12">
                        <h2 className="font-heading text-4xl sm:text-5xl md:text-[64px] font-black tracking-tighter text-[#1E201E] uppercase leading-[0.9]">
                            WHY WE BUILT SKINCARE<br />
                            <span className="text-[#1E201E]/40">LIKE SURVIVAL EQUIPMENT.</span>
                        </h2>

                        {/* 3 Abstract Texture/Lifestyle Images */}
                        <div
                            className="grid grid-cols-3 gap-2 md:gap-4 transition-all duration-1000 ease-out"
                            style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "40px"})` }}
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-[#F4F4F0]">
                                <img src="/images/guy-skiing.png" alt="Alpine skier" width={636} height={569} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 hover:scale-105 transition-all duration-700" />
                            </div>
                            <div className="aspect-[3/4] overflow-hidden bg-[#F4F4F0] mt-8">
                                <img src="/images/texture-pine.png" alt="Misty pine forest texture" width={640} height={640} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                            </div>
                            <div className="aspect-[3/4] overflow-hidden bg-[#F4F4F0] mt-16">
                                <img src="/images/texture-granite.png" alt="Dark mossy granite texture" width={640} height={640} loading="lazy" decoding="async" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700" />
                            </div>
                        </div>
                    </div>

                    {/* Right: Editorial Copy */}
                    <div
                        className="lg:col-span-4 lg:col-start-9 flex flex-col gap-8 transition-all duration-1000 ease-out delay-300"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "40px"})` }}
                    >
                        <p className="font-body text-lg md:text-xl text-[#1E201E] leading-relaxed font-medium">
                            We grew tired of "men's grooming" brands selling complex, clinical routines that felt like a chore. Out here, you don't have time for a 6-step process.
                        </p>
                        <p className="font-body text-base md:text-lg text-[#1E201E]/70 leading-relaxed">
                            Base Layer was formulated in the harsh climate of Colorado to solve a specific problem: environmental assault. Whether you're climbing a 14er, working a rig, or just navigating a freezing city commute, your skin needs armor, not perfume.
                        </p>
                        <p className="font-body text-base md:text-lg text-[#1E201E]/70 leading-relaxed">
                            We stripped away the fluff, doubled down on clinical-grade barrier repair (Copper Peptides, Squalane), and engineered a matte finish so you never look shiny or feel greasy.
                        </p>

                        <div className="mt-4 w-full">
                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email to reserve"
                                        className="w-full sm:w-2/3 px-5 py-5 bg-[#F4F4F0] border-2 border-[#1E201E]/20 text-[#1E201E] text-base font-body placeholder:text-[#1E201E]/50 focus:outline-none focus:border-[#F95D1A] transition-all rounded-none"
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
                                <div className="flex border-2 border-[#F95D1A]/50 bg-[#F4F4F0] p-5 border-l-4 border-l-[#F95D1A] rounded-none">
                                    <div className="flex flex-col">
                                        <span className="font-heading text-base font-bold tracking-widest uppercase text-[#1E201E]">Allocation Secured.</span>
                                        <span className="font-body text-sm text-[#1E201E]/80 mt-1">Check your inbox for Batch 01 details.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default OurOriginSection;
