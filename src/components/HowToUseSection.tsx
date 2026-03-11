import { useEffect, useRef, useState } from "react";

const steps = [
  { num: "1", title: "WASH", desc: "Cleanse with any face wash" },
  { num: "2", title: "APPLY", desc: "One pump, spread evenly" },
  { num: "3", title: "DONE", desc: "Absorbs in 15 seconds. Go live your life." },
];

const HowToUseSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ref = sectionRef.current;
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-8 bg-card">
      <div className="max-w-4xl mx-auto">
        <div
          className="text-center mb-16 transition-all duration-700 ease-out"
          style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "20px"})` }}
        >
          <span className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase">
            The Routine
          </span>
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-black mt-4 tracking-tight text-foreground uppercase">
            HOW TO USE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="text-center transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? "0" : "30px"})`,
                transitionDelay: `${200 + i * 150}ms`,
              }}
            >
              <span className="font-heading text-5xl md:text-6xl font-black text-foreground/[0.06] leading-none block mb-2">
                {step.num}
              </span>
              <h3 className="font-heading text-lg md:text-xl font-bold uppercase tracking-wide mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToUseSection;
