import { ExternalLink } from "lucide-react";

const BLUEPRINT_PRODUCT_URL =
  "https://blueprint.bryanjohnson.com/products/facial-moisturizer";

/**
 * A deliberately narrow competitor comparison: current public price and fill
 * size only. Formula comparisons need a separate substantiation pass whenever
 * either INCI list changes; this module makes no efficacy or quality claim.
 */
const BlueprintPriceContrast = () => (
  <section
    aria-labelledby="blueprint-price-heading"
    className="border-y border-[#1A2F4C]/12 bg-[#F7F4EE] px-6 py-14"
  >
    <div className="mx-auto grid max-w-[1000px] items-center gap-8 md:grid-cols-[1fr_auto]">
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
          CURRENT PRICE CHECK
        </p>
        <h2
          id="blueprint-price-heading"
          className="mt-2 font-heading text-[clamp(26px,4vw,40px)] font-bold uppercase leading-[1.05] text-[#1A2F4C]"
        >
          TWO BOTTLES. ONE DOLLAR LESS.
        </h2>
        <p className="mt-4 max-w-[650px] font-body text-[15px] leading-[1.65] text-[#4A5568]">
          Base Layer&apos;s 2-pack is 100 mL for $68. Blueprint&apos;s SFC Facial
          Moisturizer is currently $69 for one 50 mL bottle as a one-time order.
        </p>
      </div>

      <dl className="grid min-w-[280px] grid-cols-2 border border-[#D8D3CA] bg-white">
        <div className="border-r border-[#D8D3CA] p-5 text-center">
          <dt className="font-heading text-[12px] font-bold uppercase tracking-[0.08em] text-[#1A2F4C]">
            BASE LAYER
          </dt>
          <dd className="mt-2 font-heading text-[28px] font-extrabold text-[#1A2F4C]">
            $68
          </dd>
          <dd className="font-body text-[12px] text-[#6B7280]">2 × 50 mL</dd>
        </div>
        <div className="p-5 text-center">
          <dt className="font-heading text-[12px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">
            BLUEPRINT
          </dt>
          <dd className="mt-2 font-heading text-[28px] font-extrabold text-[#6B7280]">
            $69
          </dd>
          <dd className="font-body text-[12px] text-[#6B7280]">1 × 50 mL</dd>
        </div>
      </dl>
    </div>

    <p className="mx-auto mt-5 max-w-[1000px] font-body text-[10px] leading-[1.5] text-[#596270]">
      Public one-time prices observed August 13, 2026, before tax or promotions.
      Competitor pricing can change.{" "}
      <a
        href={BLUEPRINT_PRODUCT_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-[#1A2F4C] underline underline-offset-2 hover:no-underline"
      >
        Check Blueprint&apos;s current price
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
      .
    </p>
  </section>
);

export default BlueprintPriceContrast;
