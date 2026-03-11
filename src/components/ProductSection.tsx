import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import guyMoisturizer from "@/assets/guy-moisturizer.webp";
import guyMoisturizerFallback from "@/assets/guy-moisturizer.png";

const benefits = [
  "5% niacinamide helps reduce excess oil",
  "Panthenol helps calm post-shave irritation",
  "Squalane and hyaluronic acid hydrate without heaviness",
  "Copper peptide supports firmer-looking skin over time",
  "Fragrance-free and non-greasy",
];

const ProductSection = () => {
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
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="product" ref={sectionRef} className="grid lg:grid-cols-2 bg-background">
      <div
        className="flex flex-col justify-center px-5 md:px-12 lg:px-16 xl:px-24 py-16 lg:py-24 order-2 lg:order-1 transition-all duration-700 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? "0" : "30px"})`,
        }}
      >
        <div className="max-w-md">
          <span className="font-body text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            What it does
          </span>
          <h2 className="font-heading text-[1.75rem] md:text-3xl lg:text-4xl font-black mt-4 mb-8 tracking-tight text-foreground uppercase leading-[0.95]">
            HYDRATES. MATTIFIES.
            <br />
            CALMS. DONE.
          </h2>

          <div className="space-y-4 mb-8">
            {benefits.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0 mt-2" />
                <span className="font-body text-[15px] text-muted-foreground leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p className="font-body text-sm text-foreground font-semibold mb-6 uppercase tracking-wider">
            No filler. No fragrance. No complicated routine.
          </p>

          <Button
            variant="hero"
            size="lg"
            className="w-full sm:w-auto px-10 py-5 text-xs"
            onClick={() => openModal("product_benefits")}
          >
            RESERVE MY BOTTLE &mdash; $38
          </Button>
        </div>
      </div>

      <div
        className="relative h-[35vh] lg:h-full order-1 lg:order-2 transition-opacity duration-700 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <picture>
          <source type="image/webp" srcSet={guyMoisturizer} />
          <img
            src={guyMoisturizerFallback}
            alt="Man applying Base Layer face cream"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
      </div>
    </section>
  );
};

export default ProductSection;
