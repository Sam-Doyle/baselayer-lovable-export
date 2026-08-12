import { Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import mountainPackshot from "@/assets/generated-creatives/hero-mountain-packshot-v2.webp";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { trackEvent } from "@/lib/analytics";

const HeroSection = () => {
  return (
    <section className="w-full bg-[#F2EFE8] pt-[96px]">
      <div className="mx-auto grid min-h-[calc(100svh-96px)] max-w-[1440px] md:grid-cols-[1.02fr_0.98fr]">
        <div className="relative order-1 h-[226px] overflow-hidden bg-[#D8D3CA] sm:h-[300px] md:order-2 md:h-auto md:min-h-[650px]">
          <img
            src={mountainPackshot}
            alt="Base Layer Daily Face Cream bottle and carton on Colorado alpine granite"
            width={1536}
            height={1536}
            {...{ fetchpriority: "high" }}
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 49vw"
            className="absolute inset-0 h-full w-full object-cover object-[center_51%] md:object-center"
          />
        </div>

        <div className="order-2 flex bg-[#F2EFE8] px-5 py-7 sm:px-8 sm:py-10 md:order-1 md:items-center md:px-12 md:py-16 lg:px-16 xl:px-20">
          <div className="w-full max-w-[610px]">
            <p className="mb-3 font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-[#1A2F4C]/75 md:text-[11px]">
              DAILY FACE MOISTURIZER
            </p>

            <h1 className="font-heading text-[clamp(40px,10.8vw,60px)] font-black uppercase leading-[0.91] tracking-[-0.05em] text-[#1A2F4C] [word-spacing:0.1em] md:text-[clamp(60px,5.2vw,82px)]">
              ONE STEP<span className="text-[#1A2F4C]/25">.</span><br />
              ZERO SHINE<span className="text-[#1A2F4C]/25">.</span>
            </h1>

            <p className="mt-4 max-w-[560px] font-body text-[15px] leading-[1.5] text-[#1A2F4C]/78 sm:text-[16px] md:mt-6 md:text-[18px] md:leading-[1.6]">
              Fast-absorbing hydration for dry air, sun, wind, and bad sleep. Put it on in 15 seconds. Forget it&apos;s there.
            </p>

            <a
              href="#testimonials"
              className="mt-4 inline-flex min-h-7 items-center gap-2 font-body text-[12px] font-semibold text-[#1A2F4C] underline decoration-[#1A2F4C]/30 underline-offset-4 transition-colors hover:text-brand-accent md:mt-6 md:text-[13px]"
            >
              <Check className="h-4 w-4 text-brand-accent" strokeWidth={2.75} aria-hidden="true" />
              50 early testers &middot; Read their results
            </a>

            <div className="mt-5 flex items-end gap-3 md:mt-7">
              <span className="font-heading text-[32px] font-black leading-none text-[#1A2F4C] md:text-[38px]">$38</span>
              <span className="pb-0.5 font-body text-[13px] text-[#1A2F4C]/75 line-through md:text-[14px]">$48</span>
              <span className="pb-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1A2F4C]/75 md:text-[11px]">Founding price</span>
            </div>

            <Link
              id="hero-primary-cta"
              to="/face-cream?offer=single"
              onClick={() => trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "hero" })}
              className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center bg-brand px-6 py-4 text-center font-heading text-[13px] font-black uppercase tracking-[0.11em] text-white transition-colors hover:bg-brand-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C] sm:w-auto sm:min-w-[320px] md:mt-5 md:text-[14px]"
            >
              GET BASE LAYER &middot; $38 &rarr;
            </Link>

            <div className="mt-4 space-y-1.5 font-body text-[12px] leading-[1.45] text-[#1A2F4C]/75 md:text-[13px]">
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-brand-accent" strokeWidth={2.5} aria-hidden="true" />
                {FREE_SHIPPING_PHRASE} &middot; No subscription required
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-accent" strokeWidth={2.25} aria-hidden="true" />
                30-day money-back guarantee. Keep the bottle. Full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
