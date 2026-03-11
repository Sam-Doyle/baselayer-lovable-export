import { useEffect, useRef, useState } from "react";

const OurOriginSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

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
                    <div className="h-px w-8 bg-[#E85D04]"></div>
                    <span className="font-heading text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase text-[#E85D04]">
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

                        <div className="mt-4">
                            <button
                                onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
                                className="group flex items-center gap-3 font-heading text-[12px] md:text-[13px] font-black uppercase tracking-widest text-[#1E201E] hover:text-[#E85D04] transition-colors py-3"
                            >
                                <span className="w-8 h-px bg-[#1E201E] group-hover:bg-[#E85D04] transition-colors"></span>
                                Join the Waitlist
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default OurOriginSection;
