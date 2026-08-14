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
    why: "Selected to help balance the appearance of oil and support the skin's natural moisture barrier.",
    image: "/images/ingredients/niacinamide.png",
    responsiveImage: "/images/ingredients/responsive/niacinamide",
  },
  {
    name: "Copper Peptide GHK-Cu",
    slug: "copper-peptide",
    concentration: "0.03%",
    why: "A signal peptide included alongside the moisturizer's barrier-supporting ingredients.",
    image: "/images/ingredients/copper-peptide.png",
    responsiveImage: "/images/ingredients/responsive/copper-peptide",
  },
  {
    name: "Centella Asiatica",
    slug: "centella-asiatica",
    concentration: "2%",
    why: "Selected to support comfortable-feeling skin, especially after shaving or exposure to dry air.",
    image: "/images/ingredients/centella.png",
    responsiveImage: "/images/ingredients/responsive/centella",
  },
  {
    name: "Hyaluronic Acid",
    slug: "hyaluronic-acid",
    concentration: "0.5%",
    why: "A humectant that helps draw and hold water at the skin's surface without adding a heavy feel.",
    image: "/images/ingredients/hyaluronic-acid.png",
    responsiveImage: "/images/ingredients/responsive/hyaluronic-acid",
  },
  {
    name: "Squalane",
    slug: "squalane",
    concentration: "3%",
    why: "A lightweight emollient that helps reduce moisture loss without the waxy feel of a traditional cream.",
    image: "/images/ingredients/squalane.png",
    responsiveImage: "/images/ingredients/responsive/squalane",
  },
  {
    name: "Panthenol",
    slug: "panthenol",
    concentration: "2%",
    why: "A vitamin B5 derivative selected to soothe skin and support its natural moisture barrier.",
    image: "/images/ingredients/panthenol.png",
    responsiveImage: "/images/ingredients/responsive/panthenol",
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
        className="w-full aspect-[3/4] rounded-[40%/20%] bg-black/5 flex items-center justify-center overflow-hidden group-hover:scale-[1.03] transition-transform duration-500"
      >
        <img
          src={isVisible ? ingredient.image : undefined}
          srcSet={isVisible ? `${ingredient.responsiveImage}-240w.webp 240w, ${ingredient.responsiveImage}-480w.webp 480w` : undefined}
          sizes="(max-width: 639px) calc(50vw - 44px), (max-width: 1023px) calc(33vw - 48px), 180px"
          alt={ingredient.name}
          loading="lazy"
          decoding="async"
          width={500}
          height={500}
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"
        />
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
    <section id="formula" ref={ref} className="bg-[#E8E4DC] px-6 py-14 sm:px-8 md:px-12 md:py-24">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div
          className="mb-10 text-center transition-all duration-700 md:mb-16"
          style={{ opacity: isVisible ? 1 : 0, transform: `translateY(${isVisible ? "0" : "20px"})` }}
        >
          <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#1A2F4C]/40 mb-3">
            Precision Skincare
          </p>
          <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight text-[#1A2F4C] md:text-4xl">
            Formula, without the mystery
          </h2>
          <p className="font-body text-sm md:text-base text-[#1A2F4C]/50 max-w-2xl mx-auto">
            Six key ingredients at disclosed concentrations. See why each one is here.
          </p>
        </div>

        {/* 6-column ingredient grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:gap-8 lg:grid-cols-6">
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
          className="mt-10 text-center transition-all duration-700 md:mt-14"
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
