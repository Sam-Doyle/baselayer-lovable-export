import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import guyMoisturizer from "@/assets/guy-moisturizer.webp";


const benefits = ["$0.68 / day", "6-8 weeks per jar", "Replaces 3 products"];

const PayoffSection = () => {
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
    <section id="payoff" ref={sectionRef} className="grid lg:grid-cols-2 lg:min-h-screen bg-background">
      <div
        className="relative h-[30vh] lg:min-h-screen overflow-hidden transition-opacity duration-1000 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <img
          src={guyMoisturizer}
          alt="Man applying moisturizer to face"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={600}
          height={483}
          sizes="(max-width: 767px) 100vw, 50vw"
        />
      </div>

      <div
        className="flex items-center justify-center px-6 md:px-12 lg:px-16 xl:px-24 py-12 lg:py-24 transition-all duration-1000 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? "0" : "40px"})`,
        }}
      >
        <div className="max-w-md">
          <span className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase">
            The payoff
          </span>
          <h2 className="font-heading text-[1.75rem] md:text-3xl lg:text-4xl xl:text-5xl font-black mt-6 mb-4 tracking-tight text-foreground uppercase leading-[0.95]">
            YOU LOOK LIKE YOU
            <br />
            SLEPT 8 HOURS.
            <br />
            <span className="text-primary">YOU DIDN'T.</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-10">
            You just look right. Not shiny. Not dry. Not like you're wearing product. Your skin is calm after shaving, matte through the afternoon, and you haven't thought about it once since 7 AM. One jar lasts 6-8 weeks.
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="border border-foreground/10 rounded-lg p-4 md:p-5 flex items-center justify-center"
              >
                <p className="font-heading text-[10px] md:text-xs font-bold uppercase tracking-wider text-foreground text-center leading-snug">
                  {benefit}
                </p>
              </div>
            ))}
          </div>

          <Button variant="hero" size="lg" className="w-full sm:w-auto px-8 sm:px-14 py-4 md:py-5 text-xs md:text-sm" onClick={() => openModal("payoff_section")}>
            GET MY BOTTLE — $38
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PayoffSection;
