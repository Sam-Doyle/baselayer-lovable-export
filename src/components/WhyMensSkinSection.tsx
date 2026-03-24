import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";

/*
 * BENEFITS SPLIT-SCREEN SECTION
 *
 * Left: Top 3 benefits as expandable accordion rows
 * Right: Product image (sticky on desktop)
 *
 * Inspired by clean DTC design: warm background, separated
 * rows with expand/collapse, product hero on the right.
 *
 * Replaces the previous dark-navy 3-column text wall.
 */

const benefits = [
  {
    title: "FIRMING",
    bullets: [
      "Copper Peptide GHK-Cu stimulates collagen at the cellular level",
      "Supports natural elastin production for resilient skin",
      "Reduces fine lines with consistent daily use",
    ],
    detail:
      "Men's skin loses about 1% of collagen per year after 30. Most moisturizers ignore this entirely. Base Layer delivers Copper Peptide GHK-Cu — shown in peer-reviewed studies to increase collagen synthesis by up to 70%. Not a trace amount for the label. A clinical dose that rebuilds skin structure from the inside.",
    link: { text: "See the formula", href: "/face-cream" },
  },
  {
    title: "SOOTHING",
    bullets: [
      "Centella Asiatica calms post-shave irritation instantly",
      "Panthenol repairs the moisture barrier without heaviness",
      "Niacinamide reduces redness and inflammation",
    ],
    detail:
      "Razor burn, windburn, dry mountain air — your skin is constantly under assault. Centella Asiatica and Panthenol work together to calm inflammation and repair barrier damage in real-time. No stinging, no residue. Just fast, invisible relief that works under sunscreen, helmets, or nothing at all.",
    link: { text: "Full ingredient breakdown", href: "/ingredients" },
  },
  {
    title: "REPLENISHING",
    bullets: [
      "Hyaluronic Acid pulls moisture deep into the skin",
      "Squalane locks in hydration without clogging pores",
      "Absorbs in 15 seconds — zero shine, completely invisible",
    ],
    detail:
      "Male skin produces 50% more sebum but still gets dehydrated — especially at altitude, in dry offices, or after a flight. Hyaluronic Acid binds 1,000x its weight in water. Squalane matches your skin's natural lipids so it absorbs instantly instead of sitting on top. The result: deep hydration with a matte, invisible finish.",
    link: null,
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
          {isOpen ? (
            <ArrowUpRight className="w-5 h-5 text-[#1A2F4C]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#1A2F4C]/60" />
          )}
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isOpen ? "500px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pb-8 space-y-4">
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
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

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
    <section
      id="why-mens-skin"
      ref={sectionRef}
      className="bg-[#E8E4DC] relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

        {/* Left: Benefits accordion */}
        <div className="py-16 md:py-24 px-8 md:px-16 lg:pr-12 flex flex-col justify-center">

          {/* Section label */}
          <div
            className="mb-8 transition-all duration-700 ease-out"
            style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "20px"})` }}
          >
            <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#1A2F4C]/40 mb-3">
              Engineered for Performance
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[#1A2F4C] leading-snug">
              Trust data, not opinions
            </h2>
          </div>

          {/* Accordion rows */}
          <div className="border-t border-[#1A2F4C]/15">
            {benefits.map((benefit, i) => (
              <BenefitRow
                key={benefit.title}
                benefit={benefit}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                index={i}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>

        {/* Right: Product image */}
        <div className="relative hidden lg:block">
          <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
            <img
              src="/images/product-on-rock.webp"
              alt="Base Layer Performance Daily Face Cream"
              className="w-full h-full object-cover"
              loading="lazy"
              width="720"
              height="900"
            />
          </div>
        </div>

        {/* Mobile: product image below accordion */}
        <div className="lg:hidden px-8 pb-12">
          <img
            src="/images/product-on-rock.webp"
            alt="Base Layer Performance Daily Face Cream"
            className="w-full max-w-sm mx-auto rounded-lg"
            loading="lazy"
            width="640"
            height="640"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyMensSkinSection;
