import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const WhyMensSkinSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const ref = sectionRef.current;
        if (!ref) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.15 }
        );
        observer.observe(ref);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="why-mens-skin" ref={sectionRef} className="py-24 md:py-32 px-6 md:px-12 bg-[#1A2F4C] text-[#FFFFFF] relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto">

                {/* Header Label */}
                <div
                    className="mb-16 transition-all duration-700 ease-out"
                    style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})` }}
                >
                    <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#FFFFFF]/50 mb-4 flex items-center gap-4">
                        <span className="w-8 h-px bg-[#FFFFFF]/30"></span>
                        The Science
                    </p>
                    <h2 className="font-heading text-4xl md:text-5xl lg:text-[64px] font-black tracking-tighter uppercase leading-[0.9]">
                        YOUR SKIN IS DIFFERENT.<br />
                        <span className="text-[#F95D1A]">YOUR PRODUCT SHOULD BE TOO.</span>
                    </h2>
                </div>

                {/* Three Column Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

                    {/* Column 1: Men's Skin Biology */}
                    <div
                        className="flex flex-col gap-6 transition-all duration-700 ease-out"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})`, transitionDelay: "100ms" }}
                    >
                        <div className="inline-block border border-[#F95D1A] bg-[#F95D1A]/10 px-3 py-1 self-start rounded-none">
                            <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#F95D1A]">
                                [ MALE SKIN BIOLOGY ]
                            </span>
                        </div>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/90 leading-relaxed">
                            Men's skin produces roughly 50% more sebum than women's, driven by testosterone. That means more oil, larger pores, and a constant battle between hydration and shine. Most moisturizers were formulated for female skin biology. They sit on top, feel greasy, and make the problem worse.
                        </p>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/70 leading-relaxed">
                            Male skin is also about 20% thicker on average. That extra density needs actives that can actually penetrate, not just coat the surface. Base Layer is built around this reality. Every ingredient was selected to work with male skin architecture, not against it.
                        </p>
                        <Link to="/face-cream" className="self-start flex items-center gap-2 font-heading text-[12px] uppercase tracking-widest font-bold text-[#F95D1A] hover:text-[#FFFFFF] transition-colors mt-2">
                            See the formula <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Column 2: Colorado Altitude Story */}
                    <div
                        className="flex flex-col gap-6 transition-all duration-700 ease-out"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})`, transitionDelay: "250ms" }}
                    >
                        <div className="inline-block border border-[#F95D1A] bg-[#F95D1A]/10 px-3 py-1 self-start rounded-none">
                            <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#F95D1A]">
                                [ ALTITUDE TESTED ]
                            </span>
                        </div>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/90 leading-relaxed">
                            Base Layer was formulated at 9,600 feet in the Colorado high country. At that altitude, humidity drops below 15%, UV intensity jumps 25% compared to sea level, and wind strips moisture from exposed skin in minutes. If a formula works here, it works anywhere.
                        </p>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/70 leading-relaxed">
                            That environment became the proving ground. Every batch gets tested against dry mountain air, post-shave sensitivity, and long days outdoors before it ships. The result is a moisturizer that holds up in the real world, not just a lab.
                        </p>
                        <div className="inline-block border border-[#F95D1A] bg-[#F95D1A]/10 px-3 py-1 self-start rounded-none mt-4">
                            <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#F95D1A]">
                                [ BUILT FOR THESE GUYS ]
                            </span>
                        </div>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/90 leading-relaxed">
                            Whether you're a construction foreman spending ten hours under direct sun, a trail runner logging miles at altitude, or a consultant living out of hotel rooms with recycled cabin air — Base Layer was formulated for the conditions you actually face. Outdoor workers dealing with windburn, UV exposure, and temperature swings throughout the day. Athletes whose post-workout skin needs fast-absorbing hydration without a greasy layer under a helmet or hat. Frequent travelers battling dry airplane cabins and hard hotel water. And any guy who wants a clean post-shave recovery step that calms razor irritation and redness without stinging or leaving residue. One product, engineered to perform across every scenario.
                        </p>
                    </div>

                    {/* Column 3: Clinical-Dose Ingredients */}
                    <div
                        className="flex flex-col gap-6 transition-all duration-700 ease-out"
                        style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "30px"})`, transitionDelay: "400ms" }}
                    >
                        <div className="inline-block border border-[#F95D1A] bg-[#F95D1A]/10 px-3 py-1 self-start rounded-none">
                            <span className="font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#F95D1A]">
                                [ 6 CLINICAL-DOSE ACTIVES ]
                            </span>
                        </div>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/90 leading-relaxed">
                            Most brands sprinkle actives at trace amounts so they can list them on the label. Base Layer loads six key ingredients at the concentrations shown to work in peer-reviewed studies. Niacinamide at 5% to regulate oil and reduce pore size. Copper Peptide GHK-Cu to accelerate skin repair at the cellular level.
                        </p>
                        <p className="font-body text-base md:text-lg text-[#FFFFFF]/70 leading-relaxed">
                            Panthenol for deep hydration without heaviness. Centella Asiatica to calm irritation and strengthen the skin barrier. Squalane to lock in moisture without clogging pores. Hyaluronic Acid to pull water into the skin and hold it there. Six actives. Clinical doses. No filler.
                        </p>
                        <Link to="/ingredients" className="self-start flex items-center gap-2 font-heading text-[12px] uppercase tracking-widest font-bold text-[#F95D1A] hover:text-[#FFFFFF] transition-colors mt-2">
                            Full ingredient breakdown <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyMensSkinSection;
