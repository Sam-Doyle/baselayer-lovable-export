import { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";

const TheGearSection = () => {
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
        <section id="gear" ref={sectionRef} className="relative py-32 overflow-hidden bg-[#F4F4F0]">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 z-0">
                <picture>
                    <source type="image/webp" srcSet="/images/texture-light-stone.webp" />
                    <img
                        src="/images/texture-light-stone.png"
                        alt="Light textured alpine stone"
                        width={640}
                        height={640}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover opacity-40 mix-blend-multiply"
                    />
                </picture>
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

                    </div>

                    {/* Right Column: Product Image */}
                    <div className="relative min-h-[300px] h-full overflow-hidden bg-[#E8EAE6]">
                        <picture>
                            <source type="image/webp" srcSet="/images/baselayer-carton.webp" />
                            <img
                                src="/images/baselayer-carton.jpeg"
                                alt="Base Layer Carton"
                                width={640}
                                height={640}
                                loading="lazy"
                                decoding="async"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"
                            />
                        </picture>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default TheGearSection;
