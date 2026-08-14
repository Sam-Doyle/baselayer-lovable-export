import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const formulaIngredients = [
  {
    name: "Niacinamide",
    concentration: "5%",
    slug: "niacinamide",
    role: "Helps balance visible oil and improve the look of tone and texture.",
  },
  {
    name: "Copper Peptide GHK-Cu",
    concentration: "0.03%",
    slug: "copper-peptide",
    role: "Supports a firmer, smoother-looking complexion without another serum step.",
  },
  {
    name: "Panthenol",
    concentration: "2%",
    slug: "panthenol",
    role: "Vitamin B5 that helps soothe skin and support its natural moisture barrier.",
  },
  {
    name: "Centella Asiatica",
    concentration: "2%",
    slug: "centella-asiatica",
    role: "Helps calm the visible look of redness and supports sensitive-feeling skin.",
  },
  {
    name: "Squalane",
    concentration: "3%",
    slug: "squalane",
    role: "A lightweight emollient that helps hold moisture without a heavy feel.",
  },
  {
    name: "Hyaluronic Acid",
    concentration: "0.5%",
    slug: "hyaluronic-acid",
    role: "A water-binding humectant that helps skin feel hydrated and look smoother.",
  },
] as const;

const fullInci =
  "Water (Aqua), Simmondsia Chinensis (Jojoba) Seed Oil, Niacinamide, Polyacrylamide, Panthenol, Copper Tripeptide-1, Centella Asiatica Extract, Sodium Hyaluronate, Prunus Armeniaca (Apricot) Kernel Oil, Squalane, Glycerin, C13-14 Isoparaffin, Laureth-7, Phenoxyethanol, Ethylhexylglycerin, Disodium EDTA.";

const FormulaEvidenceSection = () => (
  <section
    id="formula-evidence"
    aria-labelledby="formula-evidence-heading"
    className="border-y border-[#D8D3CA] bg-[#F7F4EE] px-6 py-16 md:py-24"
  >
    <div className="mx-auto max-w-[1120px]">
      <header className="max-w-3xl">
        <p className="mb-3 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B33D0B]">
          Formula breakdown
        </p>
        <h2
          id="formula-evidence-heading"
          className="font-heading text-[32px] font-black uppercase leading-[0.95] tracking-[-0.035em] text-[#1A2F4C] md:text-[48px]"
        >
          Six workhorse ingredients. Every dose disclosed.
        </h2>
        <p className="mt-6 max-w-2xl font-body text-[16px] leading-[1.7] text-[#4A5568]">
          No mystery blend. Base Layer publishes the concentration of every highlighted ingredient and prints the full INCI on the bottle.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 border-l border-t border-[#CFC8BC] sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
        {formulaIngredients.map((ingredient) => (
          <article
            key={ingredient.slug}
            className="flex min-h-full flex-col border-b border-r border-[#CFC8BC] bg-white p-6 md:p-8"
          >
            <p className="font-heading text-[42px] font-black leading-none tracking-[-0.04em] text-[#1A2F4C]">
              {ingredient.concentration}
            </p>
            <p className="mt-2 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
              Formula concentration
            </p>
            <h3 className="mt-7 font-heading text-[17px] font-bold uppercase leading-tight text-[#1A2F4C]">
              {ingredient.name}
            </h3>
            <p className="mt-3 flex-1 font-body text-[14px] leading-[1.65] text-[#4A5568]">
              {ingredient.role}
            </p>
            <Link
              to={`/ingredients/${ingredient.slug}`}
              className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A2F4C] underline decoration-[#A9A39A] underline-offset-4 transition-colors hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A2F4C]"
            >
              Ingredient details
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <aside className="mt-10 bg-[#1A2F4C] px-6 py-8 text-white md:mt-12 md:px-10 md:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-white/65">
              Full ingredient list
            </p>
            <h3 className="mt-3 font-heading text-[24px] font-bold uppercase leading-tight">
              Full INCI. No mystery.
            </h3>
          </div>
          <p className="font-body text-[14px] leading-[1.75] text-white/80">
            {fullInci}
          </p>
        </div>
      </aside>

      <div className="mt-8 flex justify-start">
        <Link
          to="/ingredients"
          className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#1A2F4C] px-6 py-3 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[#1A2F4C] transition-colors hover:bg-[#1A2F4C] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A2F4C]"
        >
          See all ingredient details
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default FormulaEvidenceSection;
