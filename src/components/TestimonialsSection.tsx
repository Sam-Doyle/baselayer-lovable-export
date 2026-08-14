import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import StarRating from "@/components/StarRating";
import { testimonials, TESTIMONIAL_DISCLOSURE } from "@/components/testimonialsData";

const TestimonialCard = ({ t, index, isVisible }: { t: typeof testimonials[0], index: number, isVisible: boolean }) => {
  return (
    <div 
      className="flex h-full flex-col rounded-[2px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] p-6 transition-all duration-500 ease-out md:p-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? "0" : "20px"})`,
        transitionDelay: `${index * 150}ms`
      }}
    >
      {/*
        Optional Tag.

        White label, not accent. The pill's ground is brand-accent-on-dark at
        15% over the card's rgba(255,255,255,0.06) over #1A2F4C, which
        composites to roughly #484352 — accent text on its own tint is only
        3.46:1 and fails AA at this 10px size. White on that ground is 9.55:1.
        The pill keeps the accent; only the label moved.
      */}
      {t.tag && (
        <div className="self-start bg-brand-accent-on-dark/15 px-[10px] py-[4px] rounded-[12px] mb-4 flex items-center justify-center">
          <span className="text-white font-heading font-semibold text-[10px] tracking-[0.1em] uppercase block leading-none">
            {t.tag}
          </span>
        </div>
      )}

      {/* Stars - individual tester's own rating */}
      <div className="mb-4">
        <StarRating rating={t.stars} />
      </div>

      {/* Quote */}
      <p className="font-body text-[16px] leading-[1.65] text-white/90 font-normal mb-6 flex-grow" style={{ fontStyle: "normal" }}>
        "{t.quote}"
      </p>

      {/* Author Info */}
      <div className="flex items-center mt-auto">
        <picture className="w-[48px] h-[48px] rounded-[50%] overflow-hidden border-[2px] border-[rgba(255,255,255,0.15)] shrink-0 mr-4">
          <source type="image/webp" srcSet={t.image} />
          <img src={t.fallback} alt={t.name} loading="lazy" width={48} height={48} className="w-full h-full object-cover object-[center_top]" />
        </picture>
        <div className="flex flex-col">
          <span className="font-heading font-semibold text-[14px] text-white leading-tight mb-[2px]">
            {t.name}
          </span>
          <span className="font-body text-[12px] text-[#ABB3BB] leading-tight">
            {t.detail}
          </span>
        </div>
      </div>
    </div>
  );
};

interface TestimonialsSectionProps {
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
}

const TestimonialsSection = ({ ctaLabel, ctaDisabled = false, onCtaClick }: TestimonialsSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();
  const productHref = pathname === "/" ? "/face-cream?offer=single" : "/face-cream";

  useEffect(() => {
    const ref = sectionRef.current;
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Trigger once
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#1A2F4C] px-5 py-14 text-[#FFFFFF] md:px-12 md:py-24"
    >
      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-[48px]">
          <span className="block font-heading font-normal text-[11px] tracking-[0.2em] text-brand-accent-on-dark uppercase mb-3">
            REAL RESULTS
          </span>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-bold tracking-tight text-white uppercase leading-[1.1]">
            DON'T TAKE OUR WORD FOR IT<span className="text-brand-accent-on-dark">.</span>
          </h2>
          <p className="font-body text-[17px] text-[#ABB3BB] mt-2">
            Hear from guys who tried it.
          </p>
        </div>

        {/* Material-connection disclosure (FTC 16 CFR Part 255) — kept
            visible with the testimonials, not tucked into a footer. */}
        <p className="font-body text-[13px] text-[#ABB3BB] text-center max-w-[620px] mx-auto mb-8 leading-[1.5]">
          {TESTIMONIAL_DISCLOSURE}
        </p>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full">
          {testimonials.map((t, index) => (
            <TestimonialCard key={t.name} t={t} index={index} isVisible={isVisible} />
          ))}
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-[48px] text-center flex flex-col items-center">
          <p className="font-body text-[14px] text-[#ABB3BB] mb-4 leading-none">
            30-day money-back guarantee. Keep the bottle.
          </p>

          {onCtaClick ? (
            <button
              type="button"
              disabled={ctaDisabled}
              onClick={onCtaClick}
              className="mt-2 inline-flex w-full items-center justify-center rounded-[4px] bg-brand px-[36px] py-[14px] font-heading text-[14px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {ctaLabel ?? "GET BASE LAYER"}
            </button>
          ) : (
            <Link
              to={productHref}
              className="inline-flex items-center justify-center px-[36px] py-[14px] bg-brand text-white font-heading font-bold text-[14px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-brand-hover transition-colors duration-300 w-full sm:w-auto mt-2"
            >
              GET BASE LAYER · $38 →
            </Link>
          )}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
