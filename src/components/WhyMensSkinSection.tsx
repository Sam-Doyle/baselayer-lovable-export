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
    title: "OIL CONTROL",
    statNumber: "5%",
    statLabel: "niacinamide — the clinical dose that actually works",
    bullets: [
      "Stops the noon shine. Niacinamide regulates oil production at the source",
      "Visibly reduces pore size within 2-4 weeks",
      "No more blotting, no more \"is my face shiny?\" in meetings",
    ],
    detail:
      "Men produce up to 50% more sebum than women. That's why your face looks like a frying pan by lunch. Most moisturizers just add more moisture on top of the oil. Base Layer uses Niacinamide at 5% — the exact concentration shown in clinical studies to reduce sebum production and tighten pores. Your skin stays matte. All day.",
    link: { text: "See the formula", href: "/face-cream" },
  },
  {
    title: "ZERO GREASE",
    statNumber: "15s",
    statLabel: "full absorption — then you forget it's there",
    bullets: [
      "Absorbs in 15 seconds. No residue. No shine. Completely invisible",
      "Squalane hydrates without sitting on top of your skin like a film",
      "Works under sunscreen, hats, helmets — or nothing at all",
    ],
    detail:
      "\"That greasy feeling 30 minutes after applying\" — it's the reason most guys quit moisturizing. We built the formula around Squalane, a lightweight lipid that matches your skin's own chemistry. It absorbs into the skin instead of coating it. The finish is matte and invisible. You will forget you put anything on.",
    link: null,
  },
  {
    title: "BREAKOUT DEFENSE",
    statNumber: "42%",
    statLabel: "of men in their 20s deal with adult acne",
    bullets: [
      "Niacinamide unclogs pores by regulating the oil that blocks them",
      "Centella Asiatica calms the redness and inflammation around breakouts",
      "No salicylic acid burn. No benzoyl peroxide bleaching your pillowcase",
    ],
    detail:
      "Adult acne isn't a teenage problem — 42% of men in their 20s still deal with it. The cause is usually the same: excess oil, clogged pores, inflammation. Most acne products nuke your face with harsh acids that leave you dry, red, and peeling. Niacinamide tackles the root cause by regulating oil production and tightening pores, while Centella Asiatica calms the inflammation that turns a clogged pore into a visible breakout. Prevention, not punishment.",
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
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

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
      className="bg-[#E8E4DC] relative overflow-hidden pt-[80px]"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-0 md:gap-[40px] lg:gap-[60px] pb-16 md:pb-24">

        {/* Left: Benefits accordion */}
        <div className="order-2 md:order-1 w-full md:w-1/2 lg:w-[45%] px-8 md:px-0 flex flex-col justify-center">

          {/* Section label */}
          <div
            className="mb-8 transition-all duration-700 ease-out"
            style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "20px"})` }}
          >
            <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#1A2F4C]/40 mb-3">
              One Product. Three Problems Solved.
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[#1A2F4C] leading-snug">
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
            See the full formula <span className="ml-2 group-hover:text-[#F35D1A] transition-colors">→</span>
          </a>
        </div>

        {/* Right: Product image */}
        <div className="order-1 md:order-2 w-full md:w-1/2 lg:w-[55%] px-8 md:px-0 mb-8 md:mb-0 relative">
          <div className="md:sticky md:top-[100px] overflow-hidden rounded-lg aspect-[4/3] md:aspect-auto md:h-full max-h-[85vh]">
            <picture className="w-full h-full block">
              <source type="image/webp" srcSet="/images/benefits-face-closeup.webp" />
              <img
                src="/images/benefits-face-closeup.png"
                alt="Base Layer Performance Benefits"
                className="w-full h-full object-cover object-[center_top] md:object-[left_center] transition-all duration-600 ease-in-out"
                style={{ filter: getFilterStyle(openIndex) }}
                loading="lazy"
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
