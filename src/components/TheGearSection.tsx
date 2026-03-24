import { useEffect, useRef, useState } from "react";
import { Shield, ArrowUpRight, Copy } from "lucide-react";
import { trackEvent, setCapturedEmail } from "@/lib/analytics";

let _supabase: typeof import("@/integrations/supabase/client")["supabase"] | null = null;
async function getSupabase() {
    if (!_supabase) {
        const mod = await import("@/integrations/supabase/client");
        _supabase = mod.supabase;
    }
    return _supabase;
}

const TheGearSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Email capture state
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || loading) return;
        setLoading(true);
        try {
            const sb = await getSupabase();
            await sb.from("waitlist").insert({ email: email.trim(), source: "gear_inline" });
            setCapturedEmail(email);
            localStorage.setItem("bl_email_captured", "true");
            trackEvent("email_signup", { source: "gear_inline", email: email.trim() });
            sb.functions
                .invoke("email-subscribe", { body: { email: email.trim(), source: "gear_inline" } })
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

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText("https://baselayerskin.co");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            trackEvent("copy_link", { source: "gear_cta_success" });
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    return (
        <section id="gear" ref={sectionRef} className="relative py-32 overflow-hidden bg-[#F4F4F0]">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/texture-light-stone.webp"
                    alt="Light textured alpine stone"
                    width={640}
                    height={640}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-40 mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#F4F4F0] via-transparent to-[#F4F4F0]"></div>
            </div>

            <div className="relative z-10 max-w-[1000px] mx-auto px-6 md:px-12 flex flex-col items-center">

                {/* Section Header */}
                <div
                    className="text-center mb-16 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})` }}
                >
                    <div className="inline-block border border-[#F95D1A] bg-[#F95D1A]/10 px-3 py-1 mb-6 rounded-none">
                        <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#F95D1A]">
                            [ ONE-STEP ARMOR ]
                        </span>
                    </div>
                    <h2 className="font-heading text-4xl md:text-5xl lg:text-[64px] font-black tracking-tighter text-[#1E201E] uppercase leading-[0.9]">
                        DROP THE 6-STEP ROUTINE.<br />
                        GRAB THE GEAR THAT WORKS.
                    </h2>
                </div>

                {/* Industrial Glassmorphism Card (Light Edition) */}
                <div
                    className="w-full grid md:grid-cols-2 gap-0 border border-[#1E201E]/10 bg-[#F4F4F0]/80 backdrop-blur-xl rounded-none shadow-2xl transition-all duration-1000 ease-out delay-200"
                    style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "40px"})` }}
                >

                    {/* Left Column: Specs */}
                    <div className="p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#1E201E]/10">
                        <h3 className="font-heading text-3xl font-black tracking-tight text-[#1E201E] uppercase leading-none mb-6">
                            COMPLETE<br />ENVIRONMENTAL<br />DEFENSE.
                        </h3>
                        <p className="font-body text-[#1E201E]/70 text-[15px] sm:text-base leading-relaxed mb-8">
                            Engineered to replace your entire medicine cabinet. Base Layer acts as a daily moisturizer, an aftershave repair balm, and a defensive barrier against wind and cold.
                        </p>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <Shield className="w-5 h-5 text-[#F95D1A] shrink-0 mt-0.5" />
                                <span className="font-body text-[15px] font-medium text-[#1E201E]/90 tracking-wide">
                                    Locks in moisture at 10,000 ft.
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Shield className="w-5 h-5 text-[#F95D1A] shrink-0 mt-0.5" />
                                <span className="font-body text-[15px] font-medium text-[#1E201E]/90 tracking-wide">
                                    Repairs wind-chapped skin instantly.
                                </span>
                            </li>
                            <li className="flex items-start gap-4">
                                <Shield className="w-5 h-5 text-[#F95D1A] shrink-0 mt-0.5" />
                                <span className="font-body text-[15px] font-medium text-[#1E201E]/90 tracking-wide">
                                    Leaves zero greasy residue.
                                </span>
                            </li>
                        </ul>

                        {/* Merged CTA Block */}
                        <div className="mt-10 pt-8 border-t border-[#1E201E]/10 w-full">
                            <p className="font-heading text-[11px] uppercase tracking-[0.1em] font-black text-[#1E201E] mb-4">
                                Reserve Batch 01 at <span className="line-through opacity-40">$48</span> $38 Prelaunch Price.
                            </p>

                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full sm:w-3/5 px-4 py-3 bg-transparent border-2 border-[#1E201E]/20 text-[#1E201E] text-sm font-body placeholder:text-[#1E201E]/50 focus:outline-none focus:border-[#F95D1A] focus:bg-[#F95D1A]/5 transition-all rounded-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-2/5 flex items-center justify-center gap-2 py-3 bg-[#F95D1A] text-[#F4F4F0] font-heading font-black tracking-widest text-[12px] uppercase hover:bg-[#1E201E] transition-all duration-300 disabled:opacity-50 rounded-none group"
                                    >
                                        {loading ? "\u2026" : "RESERVE"} <ArrowUpRight className="w-3 h-3 text-[#F4F4F0]" />
                                    </button>
                                </form>
                            ) : (
                                <div className="flex flex-col gap-4 border-2 border-[#F95D1A]/50 bg-[#1E201E] p-4 border-l-4 border-l-[#F95D1A] rounded-none w-full">
                                    <div className="flex flex-col">
                                        <span className="font-heading text-[13px] font-black tracking-widest uppercase text-[#F4F4F0]">You're on the list.</span>
                                        <span className="font-body text-xs text-[#F4F4F0]/70 mt-1">We'll notify you when Batch 01 drops.</span>
                                    </div>
                                    <button
                                        onClick={copyLink}
                                        className="flex items-center justify-center gap-2 px-4 py-2 border border-[#F4F4F0]/20 text-[#F4F4F0] hover:bg-[#F4F4F0]/10 transition-colors font-heading text-[10px] font-bold uppercase tracking-widest rounded-none"
                                    >
                                        <Copy className="w-3 h-3" />
                                        {copied ? "COPIED" : "SHARE LINK"}
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Product Image */}
                    <div className="relative min-h-[300px] h-full overflow-hidden bg-[#E8EAE6]">
                        <img
                            src="/images/baselayer-carton.webp"
                            alt="Base Layer Carton"
                            width={640}
                            height={640}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TheGearSection;
