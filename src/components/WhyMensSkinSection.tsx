import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";

/*
 * BENEFITS SPLIT-SCREEN SECTION
 *
 * Left: Top 3 benefits as expandable accordion rows
 * Right: Product image (sticky on desktop)
 */

const benefits = [
  {
    title: "LESS SHINE",
    statNumber: "5%",
    statLabel: "niacinamide — concentration published on our label",
    bullets: [
      "A matte finish designed to avoid the heavy feel of a traditional cream",
      "Niacinamide selected to help balance the appearance of oil over time",
      "Light enough to layer under sunscreen without adding another greasy step",
    ],
    detail:
      "Base Layer pairs 5% niacinamide with a lightweight emollient system. The goal is simple: add daily moisture without making already-shiny skin feel coated. Individual results and timing vary.",
    link: { text: "See the formula evidence", href: "/face-cream#formula" },
  },
  {
    title: "LIGHT HYDRATION",
    statNumber: "1 STEP",
    statLabel: "moisturizer plus serum-style ingredients",
    bullets: [
      "Squalane helps hold moisture without a waxy finish",
      "Hyaluronic acid supports hydration in dry indoor and outdoor air",
      "Designed to work alone or under your daily sunscreen",
    ],
    detail:
      "The formula combines a daily moisturizer with serum-style ingredients in one bottle. Squalane and hyaluronic acid support hydration, while the finish stays lightweight enough for a routine you can repeat.",
    link: null,
  },
  {
    title: "POST-SHAVE COMFORT",
    statNumber: "2%",
    statLabel: "panthenol — concentration published on our label",
    bullets: [
      "Panthenol helps soothe skin and support its natural moisture barrier",
      "Centella was selected for comfortable-feeling skin after shaving",
      "Fragrance-free, with no added scent competing with your routine",
    ],
    detail:
      "Shaving can leave skin feeling tight or uncomfortable. Base Layer uses 2% panthenol alongside centella to support post-shave comfort. If your skin is raw or broken, let it settle before applying.",
    link: { text: "Full ingredient breakdown", href: "/ingredients" },
  },
];

const BenefitRow = ({
  benefit,
  isOpen,
  onToggle,
  index,
  isVisible,
}: {
  benefit: (typeof benefits)[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isVisible: boolean;
}) => {
  return (
    <div
      className="border-b border-[#1A2F4C]/15 transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? "0" : "20px"})`,
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 md:py-8 group text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#1A2F4C] uppercase">
          {benefit.title}
        </h3>
        <span className="shrink-0 ml-4 w-10 h-10 flex items-center justify-center rounded-full border border-[#1A2F4C]/20 group-hover:border-[#1A2F4C]/50 transition-colors">
          <ChevronDown className={`w-5 h-5 text-[#ABB3BB] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isOpen ? "800px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pb-8 space-y-4">
          
          {/* Animated Stat Callout */}
          <div 
            className={`transition-all duration-400 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: isOpen ? '150ms' : '0ms' }}
          >
            <div className="font-heading font-bold text-4xl md:text-5xl text-[#1A2F4C] leading-none mb-1">{benefit.statNumber}</div>
            <div className="font-body text-[13px] text-[#6B7280] tracking-[0.05em] uppercase mb-6">{benefit.statLabel}</div>
          </div>

          {/* Bullet points */}
          <ul className="space-y-2">
            {benefit.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A2F4C]/40 mt-2 shrink-0" />
                <span className="font-body text-sm md:text-base text-[#1A2F4C]/80 leading-relaxed">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          {/* Expanded detail text */}
          <p className="font-body text-sm md:text-base text-[#1A2F4C]/60 leading-relaxed pt-2">
            {benefit.detail}
          </p>

          {/* Optional link */}
          {benefit.link && (
            <Link
              to={benefit.link.href}
              className="inline-flex items-center gap-2 font-heading text-[11px] uppercase tracking-[0.2em] font-bold text-[#1A2F4C] hover:text-[#1A2F4C]/70 transition-colors pt-2"
            >
              {benefit.link.text} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const WhyMensSkinSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const getFilterStyle = (index: number | null) => {
    switch (index) {
      case 0:
        return 'saturate(1.15) brightness(1.05) sepia(0.05)';
      case 1:
        return 'saturate(0.85) brightness(1.02) hue-rotate(8deg)';
      case 2:
        return 'saturate(1.0) brightness(1.08) contrast(1.03)';
      default:
        return 'none';
    }
  };

  return (
    <section
      id="why-mens-skin"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#E8E4DC] pt-14 md:pt-20"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-0 pb-14 md:flex-row md:gap-[40px] md:pb-20 lg:gap-[60px]">

        {/* Left: Benefits accordion */}
        <div className="order-2 md:order-1 w-full md:w-1/2 lg:w-[45%] px-8 md:px-0 flex flex-col justify-center">

          {/* Section label */}
          <div
            className="mb-8 transition-all duration-700 ease-out"
            style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "20px"})` }}
          >
            <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#1A2F4C]/40 mb-3">
              One Product. Three Daily Needs.
            </p>
            <h2 className="font-heading text-2xl font-bold uppercase leading-snug tracking-tight text-[#1A2F4C] md:text-3xl">
              Built for how men's skin actually works
            </h2>
          </div>

          {/* Accordion rows */}
          <div className="border-t border-[#1A2F4C]/15">
            {benefits.map((benefit, i) => (
              <BenefitRow
                key={benefit.title}
                benefit={benefit}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                index={i}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* New CTA */}
          <a 
            href="#formula"
            className="inline-flex mt-8 font-heading font-semibold text-[14px] text-[#1A2F4C] tracking-[0.05em] no-underline group transition-colors self-start"
          >
            Explore the six key ingredients <span className="ml-2 group-hover:text-brand-accent transition-colors">→</span>
          </a>
        </div>

        {/* Right: Product image */}
        <div className="order-1 md:order-2 w-full md:w-1/2 lg:w-[55%] px-8 md:px-0 mb-8 md:mb-0 relative">
          <div className="aspect-[4/3] max-h-[85vh] overflow-hidden rounded-[2px] md:sticky md:top-[100px] md:h-full md:aspect-auto">
            <picture className="w-full h-full block">
              <source type="image/webp" srcSet={isVisible ? "/images/benefits-face-closeup.webp" : undefined} />
              <img
                src={isVisible ? "/images/benefits-face-closeup.png" : undefined}
                alt="Base Layer Performance Benefits"
                className="w-full h-full object-cover object-[center_top] md:object-[left_center] transition-all duration-600 ease-in-out"
                style={{ filter: getFilterStyle(openIndex) }}
                loading="lazy"
                decoding="async"
                width="720"
                height="900"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMensSkinSection;
