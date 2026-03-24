import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/*
 * INGREDIENTS SHOWCASE
 *
 * 6 active ingredients displayed as pill-shaped image cards
 * with name + "Why we chose it" copy below.
 *
 * Warm background matching the benefits section above.
 * Links each ingredient to its detail page.
 */

const ingredients = [
  {
    name: "Niacinamide",
    slug: "niacinamide",
    concentration: "5%",
    why: "Regulates oil production, reduces pore size, and strengthens the skin barrier. The most studied active in men's skincare.",
    gradient: "from-sky-200 via-sky-300 to-blue-400",
    emoji: "💧",
  },
  {
    name: "Copper Peptide GHK-Cu",
    slug: "copper-peptide",
    concentration: null,
    why: "Signals fibroblasts to produce collagen and elastin. Shown to increase collagen synthesis by up to 70% in clinical studies.",
    gradient: "from-amber-300 via-orange-400 to-amber-600",
    emoji: "⚡",
  },
  {
    name: "Centella Asiatica",
    slug: "centella-asiatica",
    concentration: null,
    why: "Calms post-shave irritation and active inflammation. Accelerates wound healing without steroids or harsh chemicals.",
    gradient: "from-emerald-300 via-green-400 to-emerald-600",
    emoji: "🌿",
  },
  {
    name: "Hyaluronic Acid",
    slug: "hyaluronic-acid",
    concentration: null,
    why: "Holds 1,000x its weight in water. Pulls deep hydration into the skin without adding weight or shine.",
    gradient: "from-blue-100 via-blue-200 to-cyan-300",
    emoji: "🧊",
  },
  {
    name: "Squalane",
    slug: "squalane",
    concentration: null,
    why: "Plant-derived lipid that matches your skin's natural oils. Absorbs in seconds, locks in moisture, zero greasiness.",
    gradient: "from-yellow-100 via-amber-200 to-yellow-300",
    emoji: "🫧",
  },
  {
    name: "Panthenol",
    slug: "panthenol",
    concentration: null,
    why: "Vitamin B5 derivative that repairs the moisture barrier and soothes wind-chapped, sun-exposed skin on contact.",
    gradient: "from-rose-100 via-pink-200 to-rose-300",
    emoji: "🛡️",
  },
];

const IngredientCard = ({
  ingredient,
  index,
  isVisible,
}: {
  ingredient: (typeof ingredients)[0];
  index: number;
  isVisible: boolean;
}) => {
  return (
    <Link
      to={`/ingredients/${ingredient.slug}`}
      className="group block transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? "0" : "30px"})`,
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {/* Pill-shaped image card */}
      <div
        className={`w-full aspect-[3/4] rounded-[40%/20%] bg-gradient-to-br ${ingredient.gradient} flex items-center justify-center overflow-hidden group-hover:scale-[1.03] transition-transform duration-500`}
      >
        <span className="text-5xl md:text-6xl opacity-60 group-hover:opacity-80 transition-opacity duration-300 select-none">
          {ingredient.emoji}
        </span>
      </div>

      {/* Name + concentration */}
      <div className="mt-4 mb-2">
        <h3 className="font-heading text-xs md:text-sm font-bold uppercase tracking-wide text-[#1A2F4C] leading-tight">
          {ingredient.name}
        </h3>
        {ingredient.concentration && (
          <span className="font-body text-[10px] uppercase tracking-widest text-[#1A2F4C]/40 font-semibold">
            {ingredient.concentration}
          </span>
        )}
      </div>

      {/* Why we chose it */}
      <p className="font-body text-xs md:text-sm text-[#1A2F4C]/60 leading-relaxed">
        <span className="font-semibold text-[#1A2F4C]/80">Why we chose it: </span>
        {ingredient.why}
      </p>

      {/* Hover arrow */}
      <span className="inline-flex items-center gap-1 font-heading text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A2F4C]/30 group-hover:text-[#1A2F4C] transition-colors mt-3">
        Learn more <ArrowUpRight className="w-3 h-3" />
      </span>
    </Link>
  );
};

const IngredientsShowcase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-28 px-8 md:px-12 bg-[#E8E4DC]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div
          className="text-center mb-14 md:mb-20 transition-all duration-700"
          style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "20px"})` }}
        >
          <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#1A2F4C]/40 mb-3">
            Precision Skincare
          </p>
          <h2 className="font-heading text-2xl md:text-4xl font-bold tracking-tight text-[#1A2F4C] mb-4">
            Clinically-backed ingredients
          </h2>
          <p className="font-body text-sm md:text-base text-[#1A2F4C]/50 max-w-2xl mx-auto">
            Six active ingredients at clinical concentrations. No filler. Every ingredient selected from peer-reviewed research on men's skin biology.
          </p>
        </div>

        {/* 6-column ingredient grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {ingredients.map((ingredient, i) => (
            <IngredientCard
              key={ingredient.slug}
              ingredient={ingredient}
              index={i}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center mt-14 transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transitionDelay: "600ms",
          }}
        >
          <Link
            to="/ingredients"
            className="inline-flex items-center gap-2 font-heading text-xs uppercase tracking-[0.2em] font-bold text-[#1A2F4C] border border-[#1A2F4C]/20 px-8 py-4 hover:bg-[#1A2F4C] hover:text-white transition-all duration-300"
          >
            Full ingredient breakdown <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IngredientsShowcase;
