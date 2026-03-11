import { useEffect, useRef, useState } from "react";
import clutterBlur from "@/assets/clutter-blur.jpg";

const WhyMenQuitSection = () => {
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
    <section id="why-men-quit" ref={sectionRef} className="grid lg:grid-cols-2 bg-background">
      <div
        className="flex items-center justify-center px-5 md:px-12 lg:px-16 xl:px-24 py-16 lg:py-24 order-2 lg:order-1 transition-all duration-700 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? "0" : "30px"})`,
        }}
      >
        <div className="max-w-md">
          <span className="font-body text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
            Why most men quit skincare
          </span>
          <h2 className="font-heading text-[1.75rem] md:text-3xl lg:text-4xl font-black mt-4 mb-6 tracking-tight text-foreground uppercase leading-[0.95]">
            TOO MANY STEPS.
            <br />
            TOO MUCH SHINE.
            <br />
            TOO LITTLE PAYOFF.
          </h2>
          <p className="font-body text-[15px] text-muted-foreground leading-relaxed mb-6">
            Most products fail for the same reasons: they feel greasy, sting
            after shaving, or ask you to commit to a full routine. Base Layer
            does the opposite. One bottle. One step. Better skin you don't have
            to think about again until tomorrow.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("product")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-body text-xs text-foreground uppercase tracking-[0.15em] underline underline-offset-4 hover:text-foreground/70 transition-colors"
          >
            See what's inside
          </button>
        </div>
      </div>

      <div
        className="relative h-[30vh] lg:h-full overflow-hidden order-1 lg:order-2 transition-opacity duration-700 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <img
          src={clutterBlur}
          alt="Cluttered bathroom countertop with too many products"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={600}
          height={572}
          sizes="(max-width: 1023px) 100vw, 50vw"
        />
      </div>
    </section>
  );
};

export default WhyMenQuitSection;
