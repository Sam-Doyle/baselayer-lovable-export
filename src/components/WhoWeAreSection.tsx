import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import skierColorado from "@/assets/skier-colorado.jpg";

const WhoWeAreSection = () => {
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
      { threshold: 0.15 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="who-we-are" ref={sectionRef} className="relative overflow-hidden">
      {/* Background image */}
      <img
        src={skierColorado}
        alt="Colorado mountains"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/70" />

      <div
        className="relative z-10 max-w-xl mx-auto px-5 md:px-8 py-16 md:py-24 transition-all duration-700 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? "0" : "30px"})`,
        }}
      >
        <p className="font-body text-[11px] tracking-[0.3em] text-white/60 uppercase">
          Why we made it
        </p>
        <h2 className="font-heading text-[1.75rem] md:text-3xl font-black mt-4 mb-6 tracking-tight text-white uppercase leading-[0.95]">
          BUILT IN COLORADO FOR HARSH AIR, DRY SKIN, AND REAL MORNINGS.
        </h2>
        <p className="font-body text-[15px] text-white/70 leading-relaxed mb-4">
          We made Base Layer in Breckenridge after getting tired of choosing between overpriced skincare systems and drugstore moisturizers that felt like oil.
        </p>
        <p className="font-body text-[15px] text-white/70 leading-relaxed mb-8">
          We spent two years making one formula that works fast, feels invisible, and fits into real life.
        </p>
        <Button
          variant="hero"
          size="lg"
          className="w-full sm:w-auto px-10 py-5 text-xs border-white text-white before:bg-white hover:text-black"
          onClick={() => openModal("who_we_are")}
        >
          RESERVE MY BOTTLE &mdash; $38
        </Button>
      </div>
    </section>
  );
};

export default WhoWeAreSection;
