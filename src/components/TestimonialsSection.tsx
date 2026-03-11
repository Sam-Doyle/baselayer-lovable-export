import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";

const testimonials = [
  {
    quote:
      "I used to blot my forehead before every afternoon meeting. One week on Base Layer and I stopped.",
    name: "Sean, 34",
    skin: "oily skin",
  },
  {
    quote:
      "Everything I tried after shaving either stung or left a film. This absorbs fast and feels calm.",
    name: "Matt, 36",
    skin: "combination skin",
  },
  {
    quote:
      "Hotel air usually wrecks my skin. This is the one bottle I pack every trip.",
    name: "Cooper, 27",
    skin: "dry skin",
  },
];

const TestimonialsSection = () => {
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
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-16 md:py-20 px-5 md:px-8 bg-secondary"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-12 transition-all duration-700 ease-out"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? "0" : "30px"})`,
          }}
        >
          <span className="font-body text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            Early testers
          </span>
          <h2 className="font-heading text-2xl md:text-3xl font-black mt-4 tracking-tight text-foreground uppercase leading-[0.95]">
            MEN WITH DIFFERENT SKIN TYPES ALL SAID THE SAME THING.
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            We sent early bottles to guys dealing with shine, dryness, and
            post-shave irritation. Here's what came back.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-background/50 border border-border/30 p-6 transition-all duration-700 ease-out flex flex-col"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? "0" : "30px"})`,
                transitionDelay: `${300 + i * 150}ms`,
              }}
            >
              <div className="flex gap-0.5 mb-3 text-amber-400 text-sm">
                {"★★★★★"}
              </div>
              <p className="font-body text-sm text-foreground/80 leading-relaxed mb-6 italic flex-1">
                "{t.quote}"
              </p>
              <div>
                <span className="font-heading text-sm font-bold text-foreground uppercase tracking-wide">
                  {t.name}
                </span>
                <span className="block font-body text-xs text-muted-foreground mt-0.5 tracking-wide">
                  {t.skin}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + CTA */}
        <div
          className="text-center transition-all duration-700 ease-out"
          style={{ opacity: isVisible ? 1 : 0, transitionDelay: "800ms" }}
        >
          <p className="font-body text-sm text-muted-foreground mb-6">
            50 early bottles. Multiple skin types. One simple routine.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="px-12 py-4 md:py-5 text-xs"
            onClick={() => openModal("testimonials")}
          >
            TRY IT RISK-FREE
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
