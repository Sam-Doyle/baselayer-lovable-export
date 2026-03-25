import { useEffect, useRef, useState } from "react";
// Removed clutterBlur import
// import clutterBlur from "@/assets/clutter-blur.jpg";

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
    <section id="why-men-quit" ref={sectionRef} className="grid lg:grid-cols-2 bg-[#F4F4F2]">
      <div
        className="flex items-center justify-center px-5 md:px-12 lg:px-16 xl:px-24 py-16 lg:py-24 order-2 lg:order-1 transition-all duration-700 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${isVisible ? "0" : "30px"})`,
        }}
      >
        <div className="max-w-md">
          <p className="font-body text-[11px] tracking-[0.15em] font-medium text-[#4A4D4A] uppercase">
            Built for the elements
          </p>
          <h2 className="font-heading text-[1.75rem] md:text-3xl lg:text-4xl font-black mt-4 mb-6 tracking-tight text-[#121212] uppercase leading-[0.95]">
            NOT A ROUTINE.
            <br />
            JUST PROTECTION.
          </h2>
          <p className="font-body text-[15px] text-[#4A4D4A] leading-relaxed mb-4">
            You aren't going to do a 6-step routine. You just need a barrier that stops windburn, locks in moisture at altitude, and dries matte so you don't feel greasy under your gear.
          </p>
          <p className="font-body text-[15px] text-[#4A4D4A] leading-relaxed mb-6 font-semibold">
            One bottle. One step. Complete environmental defense.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("product")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="font-body text-xs text-[#121212] uppercase tracking-[0.15em] font-bold underline underline-offset-4 hover:text-[#4A4D4A] transition-colors"
          >
            See Performance Specs
          </button>
        </div>
      </div>

      <div
        className="relative h-[30vh] lg:h-full overflow-hidden order-1 lg:order-2 transition-opacity duration-700 ease-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <picture>
          <source type="image/webp" srcSet="/images/weather-texture.webp" />
          <img
            src="/images/weather-texture.png"
            alt="Harsh elemental outdoor texture"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={600}
            height={572}
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
        </picture>
      </div>
    </section>
  );
};

export default WhyMenQuitSection;
