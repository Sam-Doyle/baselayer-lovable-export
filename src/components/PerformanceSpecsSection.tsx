import { useEffect, useRef, useState } from "react";
import { Wind, Sun, Snowflake, Mountain, Shield, Droplet, ArrowUpRight, Zap, Target, Crosshair, MapPin, Gauge } from "lucide-react";

const specs = [
    { icon: Wind, label: "Windburn Defense" },
    { icon: Zap, label: "Instant Absorption" },
    { icon: Crosshair, label: "Zero Residue" },
    { icon: Mountain, label: "Altitude Rated" },
    { icon: Snowflake, label: "Cold Barrier" },
    { icon: Droplet, label: "Matte Finish" },
    { icon: Shield, label: "Daily Armor" },
    { icon: MapPin, label: "Travel Ready" },
    { icon: Target, label: "Precision Repair" },
];

const bigLinks = [
    "Windburn Defense",
    "Altitude Hydration",
    "Helmet-Matte Finish"
];

const PerformanceSpecsSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const ref = sectionRef.current;
        if (!ref) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );
        observer.observe(ref);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="specs" ref={sectionRef} className="relative bg-[#F4F4F0] py-24 border-t border-[#1E201E]/10 overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">

                {/* Top Half: Content + Grid */}
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 mb-24">

                    {/* Left Column: Heading */}
                    <div
                        className="flex flex-col justify-center transition-all duration-700 ease-out"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})` }}
                    >
                        <div className="inline-block border border-[#E85D04] bg-[#E85D04]/10 px-3 py-1 mb-6 self-start rounded-none">
                            <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#E85D04]">
                                [ PERFORMANCE SPECS ]
                            </span>
                        </div>

                        <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-[#1E201E] uppercase leading-[0.9] mb-6">
                            ENGINEERED FOR<br />
                            EXTREME CONDITIONS.
                        </h2>

                        <p className="font-body text-base md:text-lg text-[#1E201E]/70 leading-relaxed mb-8 max-w-md">
                            Your skin is an organ. Treat it like gear. Base Layer utilizes a highly-calibrated matrix of copper peptides, squalane, and hyaluronic acid to lock out hostile environments.
                        </p>

                        <button
                            onClick={() => document.getElementById("gear")?.scrollIntoView({ behavior: "smooth" })}
                            className="self-start px-8 py-5 border border-[#1E201E]/20 text-[#1E201E] font-heading font-black tracking-widest text-[13px] md:text-[14px] uppercase hover:bg-[#E85D04] hover:text-[#F4F4F0] hover:border-[#E85D04] transition-all rounded-none"
                        >
                            VIEW FORMULATION
                        </button>
                    </div>

                    {/* Right Column: Icon Grid */}
                    <div
                        className="grid grid-cols-3 gap-3 lg:gap-4 transition-all duration-700 ease-out delay-200"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})` }}
                    >
                        {specs.map((spec, i) => (
                            <div
                                key={i}
                                className="aspect-square flex flex-col justify-center items-center gap-2 border border-[#1E201E]/10 bg-[#1E201E]/5 backdrop-blur-sm p-4 hover:border-[#E85D04]/50 hover:bg-[#E85D04]/5 transition-colors group rounded-none"
                            >
                                <spec.icon className="w-6 h-6 text-[#1E201E]/60 group-hover:text-[#E85D04] transition-colors" />
                                <span className="font-heading text-[10px] md:text-[11px] uppercase tracking-wider text-center text-[#1E201E]/70 font-bold group-hover:text-[#E85D04] transition-colors">
                                    {spec.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Half: Big Links */}
                <div className="flex flex-col w-full">
                    {bigLinks.map((link, j) => (
                        <div
                            key={link}
                            className="group flex items-center justify-between py-6 md:py-10 border-b border-[#1E201E]/10 last:border-0 cursor-pointer transition-all duration-700 ease-out"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: `translateX(${isVisible ? "0" : "-20px"})`,
                                transitionDelay: `${400 + (j * 100)}ms`
                            }}
                            onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            <h3 className="font-heading text-4xl sm:text-5xl md:text-[80px] lg:text-[110px] font-black tracking-tighter text-[#1E201E] group-hover:text-[#E85D04] transition-colors uppercase leading-none">
                                {link}
                            </h3>
                            <ArrowUpRight className="w-8 h-8 md:w-16 md:h-16 text-[#1E201E]/50 group-hover:rotate-45 group-hover:text-[#E85D04] transition-all duration-300" />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default PerformanceSpecsSection;
