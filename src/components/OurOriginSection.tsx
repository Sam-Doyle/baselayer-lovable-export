import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useEarlyAccess } from "@/context/EarlyAccessContext";

const OurOriginSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { openModal } = useEarlyAccess();

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
        <section id="origin" ref={sectionRef} className="bg-[#1A2F4C] py-20 md:py-28">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left: Imagery */}
                    <div
                        className="relative transition-all duration-1000 ease-out"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})` }}
                    >
                        <div className="aspect-[4/3] overflow-hidden rounded-[2px]">
                            <picture>
                                <source type="image/webp" srcSet="/images/guy-skiing.webp" />
                                <img
                                    src="/images/guy-skiing.png"
                                    alt="Skier in Colorado alpine environment"
                                    width={636} height={569}
                                    loading="lazy" decoding="async"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="w-full h-full object-cover"
                                />
                            </picture>
                        </div>
                        {/* Stat overlay */}
                        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-[#1A2F4C]/90 backdrop-blur-sm px-5 py-4 rounded-[2px]">
                            <div className="font-heading font-bold text-[32px] text-white leading-none">9,600 ft</div>
                            <div className="font-body text-[12px] text-white/60 tracking-wide uppercase mt-1">Where we built it</div>
                        </div>
                    </div>

                    {/* Right: Copy + CTA */}
                    <div
                        className="flex flex-col transition-all duration-1000 ease-out delay-200"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})` }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-px w-6 bg-[#F35D1A]"></div>
                            <span className="font-heading text-[10px] tracking-[0.2em] font-bold uppercase text-[#F35D1A]">
                                Breckenridge, CO
                            </span>
                        </div>

                        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-[0.95] mb-8">
                            BUILT WHERE YOUR<br />
                            SKIN GETS WRECKED.
                        </h2>

                        <div className="space-y-5 mb-10">
                            <p className="font-body text-base md:text-lg text-white/80 leading-relaxed">
                                9,600 feet. UV 35% stronger than sea level. Humidity below 20% for six months. Wind that strips moisture off your face in minutes.
                            </p>
                            <p className="font-body text-base md:text-lg text-white/60 leading-relaxed">
                                We didn't build Base Layer in a lab and ship it to Colorado. We built it here because our own faces were getting destroyed every day. If it works at altitude, it works in your apartment.
                            </p>
                            <p className="font-body text-base md:text-lg text-white/60 leading-relaxed">
                                6 active ingredients. Clinical concentrations. One bottle that replaces your serum, moisturizer, and eye cream. $38.
                            </p>
                        </div>

                        {/* Conversion CTA */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <button
                                onClick={() => openModal("origin_section")}
                                className="px-8 py-4 bg-[#D94E12] text-white font-heading font-bold text-[14px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-[#C04510] transition-colors w-full sm:w-auto text-center"
                            >
                                GRAB YOURS · $38
                            </button>
                            <Link
                                to="/face-cream"
                                className="font-body text-[13px] text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
                            >
                                See the full formula
                            </Link>
                        </div>

                        {/* Trust line */}
                        <p className="font-body text-[12px] text-white/40 mt-4">
                            Free shipping · 30-day money-back guarantee
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default OurOriginSection;
