import { Check, ShieldCheck, Star } from "lucide-react";
import { Link } from "react-router-dom";
import mountainPackshot from "@/assets/generated-creatives/hero-mountain-packshot-v2.webp";
import mountainPackshot480 from "@/assets/generated-creatives/responsive/hero-mountain-packshot-v2-480w.webp";
import mountainPackshot768 from "@/assets/generated-creatives/responsive/hero-mountain-packshot-v2-768w.webp";
import mountainPackshot1200 from "@/assets/generated-creatives/responsive/hero-mountain-packshot-v2-1200w.webp";
import mountainPackshotMobile480 from "@/assets/generated-creatives/responsive/hero-mountain-packshot-v2-mobile-480w.webp";
import mountainPackshotMobile824 from "@/assets/generated-creatives/responsive/hero-mountain-packshot-v2-mobile-824w.webp";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { trackEvent } from "@/lib/analytics";
import { reviews, type Review } from "@/lib/reviews";

/**
 * A small aggregate can read as "hardly anyone has bought this" in the first
 * viewport. Feature one truthful, verified outcome instead, while the linked
 * PDP section continues to show the complete count, histogram, and every
 * review. The preferred ID is intentionally explicit editorial curation; if
 * Judge.me ever removes it, the block falls back to another verified review
 * rather than inventing proof or rendering a broken card.
 */
const HERO_REVIEW_ID = 1295448160;

const selectHeroReview = (reviewList: readonly Review[]): Review | null =>
  reviewList.find((review) => review.id === HERO_REVIEW_ID && review.verified) ??
  reviewList.find((review) => review.verified && review.rating >= 4) ??
  null;

const firstSentence = (body: string): string => {
  const sentence = body.match(/^.*?[.!?]+(?=\s|$)/)?.[0];
  return sentence ?? body;
};

const HeroSection = () => {
  const featuredReview = selectHeroReview(reviews);

  return (
    <section className="w-full bg-[#F2EFE8] pt-[96px]">
      <div className="mx-auto grid min-h-[calc(100svh-96px)] max-w-[1440px] md:grid-cols-[1.02fr_0.98fr]">
        <div className="relative order-1 h-[226px] overflow-hidden bg-[#D8D3CA] sm:h-[300px] md:order-2 md:h-auto md:min-h-[650px]">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet={`${mountainPackshotMobile480} 480w, ${mountainPackshotMobile824} 824w`}
              sizes="100vw"
            />
            <img
              src={mountainPackshot}
              srcSet={`${mountainPackshot480} 480w, ${mountainPackshot768} 768w, ${mountainPackshot1200} 1200w, ${mountainPackshot} 1536w`}
              alt="Base Layer Daily Face Cream bottle and carton on Colorado alpine granite"
              width={1536}
              height={1536}
              {...{ fetchpriority: "high" }}
              loading="eager"
              sizes="min(49vw, 706px)"
              className="absolute inset-0 h-full w-full object-cover object-[center_51%] md:object-center"
            />
          </picture>
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
              Fast-absorbing hydration for dry air, sun, wind, and bad sleep. Apply it. Forget it&apos;s there.
            </p>

            {featuredReview && (
              <Link
                to="/face-cream#reviews"
                aria-label={`Rated ${featuredReview.rating} out of 5 by ${featuredReview.reviewer}, verified buyer. Read all customer reviews`}
                className="group mt-4 block min-h-[58px] max-w-[520px] border-l-[3px] border-brand bg-white/55 px-3.5 py-2.5 transition-colors hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C] md:mt-6 md:px-4 md:py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex shrink-0 gap-0.5"
                    role="img"
                    aria-label={`${featuredReview.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`h-3.5 w-3.5 ${
                          index < featuredReview.rating
                            ? "fill-brand-accent text-brand-accent"
                            : "fill-transparent text-[#1A2F4C]/20"
                        }`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="font-body text-[9px] font-bold uppercase tracking-[0.14em] text-[#1A2F4C]/70 md:text-[10px]">
                    {featuredReview.reviewer} &middot; Verified buyer
                  </span>
                </div>
                <blockquote className="mt-1 font-body text-[12px] font-semibold leading-[1.4] text-[#1A2F4C] md:text-[13px]">
                  &ldquo;{firstSentence(featuredReview.body)}&rdquo;
                </blockquote>
              </Link>
            )}

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
