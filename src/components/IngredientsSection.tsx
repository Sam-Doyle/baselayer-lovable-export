import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import skierBg from "@/assets/skier-colorado.jpg";

const IngredientsSection = () => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { openModal } = useEarlyAccess();

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ingredients"
      ref={sectionRef}
      className="relative min-h-[70vh] md:min-h-screen flex items-center overflow-hidden">

      <img
        src={skierBg}
        alt="Male skier holding Base Layer moisturizer on a Colorado mountain"
        className="absolute inset-0 w-full h-full object-cover"
        width={600}
        height={400}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        sizes="100vw" />

      <div className="absolute inset-0 bg-black/40 md:bg-black/20" />

      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-8 md:px-16 py-24">
        <div
          className="max-w-2xl transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: `translateY(${visible ? "0" : "30px"})`
          }}>

          <p className="font-body text-xs md:text-sm uppercase tracking-[0.25em] text-white/70 mb-4">
            Born at 9,600 feet
          </p>
          <h2 className="font-heading text-[1.75rem] md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[0.95]">
            ALTITUDE DESTROYS SKIN.
            <br />
            WE BUILT THE FIX.
          </h2>
          <p className="font-body text-sm md:text-base text-white/80 mt-6 max-w-lg leading-relaxed mb-8">
            Breckenridge, Colorado. The UV is 35% stronger. The air holds half the moisture of sea level. We didn't formulate Base Layer in a coastal lab — we built it here because our own faces were wrecked. If it works at altitude, it works in your apartment.
          </p>
          <Button variant="hero" size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-4 md:py-5 text-xs md:text-sm" onClick={() => openModal("ingredients")}>
            RESERVE MINE — $38
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IngredientsSection;
