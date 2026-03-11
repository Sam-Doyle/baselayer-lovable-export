import { useEffect, useRef, useState } from "react";

const benefits = [
  {
    number: "01",
    title: "ABSORBS IN 15 SECONDS",
    description:
      "Squalane-based formula disappears into your skin on contact. No residue. No shine. No waiting around for your face to dry.",
  },
  {
    number: "02",
    title: "ONE PUMP. YOU'RE DONE.",
    description:
      "Replaces your serum, moisturizer, and eye cream in one step. No layering, no waiting, no second bottle.",
  },
  {
    number: "03",
    title: "ACTUALLY DOES SOMETHING",
    description:
      "6 active ingredients at clinical concentrations. Niacinamide for oil control. Copper peptide for firmness. Panthenol for post-shave calm. Not filler — function.",
  },
];

const BenefitsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="relative bg-secondary">
      <div className="max-w-[1440px] mx-auto">
        {/* Section header */}
        <div className="pt-28 px-8 md:px-16">
          <span className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase">
            What It Does
          </span>
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-black mt-4 tracking-tight text-foreground">
            THREE THINGS. ONE PRODUCT.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 lg:min-h-[300vh]">
          {/* Left: Sticky number */}
          <div className="hidden lg:flex sticky top-0 h-screen items-center justify-center px-16">
            <div className="relative">
              {benefits.map((b, i) => (
                <span
                  key={b.number}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[12rem] lg:text-[16rem] font-black text-foreground/[0.04] leading-none transition-all duration-700 ease-out"
                  style={{
                    opacity: activeIndex === i ? 1 : 0,
                    transform: `translate(-50%, ${activeIndex === i ? "-50%" : activeIndex > i ? "-70%" : "-30%"})`,
                  }}
                >
                  {b.number}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Scrolling content panels */}
          <div className="flex flex-col">
            {benefits.map((b, i) => (
              <div
                key={b.number}
                ref={(el) => { sectionRefs.current[i] = el; }}
                className="flex items-center min-h-0 py-16 lg:min-h-screen px-8 md:px-16"
              >
                <div
                  className="transition-all duration-700 ease-out"
                  style={{
                    opacity: activeIndex === i ? 1 : 0.15,
                    transform: `translateY(${activeIndex === i ? "0" : "20px"})`,
                  }}
                >
                  <span className="lg:hidden font-heading text-6xl font-black text-foreground/[0.06] leading-none block mb-4">
                    {b.number}
                  </span>
                  <span className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase">
                    {b.number}
                  </span>
                  <h3 className="font-heading text-2xl lg:text-4xl font-black mt-4 mb-6 tracking-tight text-foreground">
                    {b.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
