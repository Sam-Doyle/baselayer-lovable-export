import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { ChevronRight } from "lucide-react";
import { BUY_TIERS } from "@/config/product";
import { testimonials, TESTIMONIAL_DISCLOSURE } from "@/components/testimonialsData";

import clutteredSinkImg from "@/assets/generated-creatives/article_hero_cluttered_sink_1772743561435.png";
import minimalistRoutineImg from "@/assets/generated-creatives/article_visual_minimalist_routine_1772741436619.png";
import niacinamideImg from "@/assets/generated-creatives/content_visual_ingredient_niacinamide_1772738739613.png";
import squalaneImg from "@/assets/generated-creatives/ingredient_graphic_squalane_1772743695227.png";
import postShaveImg from "@/assets/generated-creatives/article_usecase_post_shave_1772743590221.png";
import copperPeptideImg from "@/assets/generated-creatives/content_visual_ingredient_copper_peptide_1772738726598.png";
import productBoxBottle from "@/assets/generated-creatives/product-box-bottle.jpg";

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The One-Bottle Experiment: What Happened When Men Stopped Buying Serums, Toners, and Eye Cream",
  "image": "https://baselayerskin.co/og-mountain-product-v2.jpg",
  "datePublished": new Date().toISOString().split('T')[0],
  "author": { "@type": "Organization", "name": "Base Layer" }
};

// Per-tier daily cost, derived from config so it can't drift from the
// buy box: a bottle is a 6-week (42-day) supply.
const perDay = (price: number, bottles: number) =>
  (price / (bottles * 42)).toFixed(2);

const OneBottleExperiment = () => {
  useCanonical();
  useMetaTags({
    title: "The One-Bottle Experiment",
    description: "What happened when men stopped buying serums, toners, and eye cream. Published ingredient percentages, a 15-second habit, and one bottle doing the job of four."
  });

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    // Named advertorial_view, not page_view: GA4 already receives a page_view
    // for this route from the gtag config / MetaRouterTracker, and reusing the
    // name here made the ad landers report roughly double the real pageviews.
    // The params are the reason this event exists at all — keep them.
    trackEvent('advertorial_view', { page: 'one_bottle_experiment', type: 'advertorial' });

    const handleScroll = () => {
      setShowSticky(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = () => trackEvent('advertorial_cta_click', { page: 'one_bottle_experiment', action: 'navigate_to_product' });

  const IngredientJob = ({ job, title, text, img, reverse = false }: { job: string, title: string, text: string, img: string, reverse?: boolean }) => (
    <div className={`flex flex-col ${reverse ? 'sm:flex-row-reverse' : 'sm:flex-row'} gap-6 items-center`}>
      <div className="w-full sm:w-1/2 rounded-lg overflow-hidden shadow-sm aspect-[4/3] sm:aspect-square relative">
        <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="w-full sm:w-1/2">
        <div className="text-brand-accent font-bold text-[11px] tracking-widest uppercase mb-2">{job}</div>
        <h4 className="font-heading font-bold text-lg text-brand mb-3 leading-tight">{title}</h4>
        <p className="text-[15px] sm:text-[16px] m-0 text-gray-700 leading-relaxed font-body">
          {text}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-body selection:bg-brand-accent selection:text-white pb-24 md:pb-0">
      <JsonLd data={ARTICLE_SCHEMA} />

      {/* Editorial Navigation */}
      <nav className="w-full h-16 border-b border-gray-100 flex items-center justify-center px-4 bg-white sticky top-0 z-40">
        <div className="font-heading font-black tracking-widest text-[#1A2F4C] text-[11px] md:text-[13px] uppercase flex gap-4 md:gap-8 items-center">
          <span>Men's Grooming</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Health</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Performance</span>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-5 sm:px-6 py-10 md:py-16">

        {/* Header */}
        <header className="mb-10 text-center">
          <div className="text-brand-accent font-bold text-[11px] tracking-widest uppercase mb-4 inline-block bg-orange-50 px-3 py-1 rounded-full">
            Sponsored Feature
          </div>
          <h1 className="font-heading font-extrabold text-[34px] md:text-[46px] text-[#1A2F4C] leading-[1.15] mb-6 tracking-tight">
            The One-Bottle Experiment: What Happened When Men Stopped Buying Serums, Toners, and Eye Cream
          </h1>
          <p className="text-gray-600 text-lg md:text-[20px] leading-relaxed mb-6 font-medium">
            No 10-step lineup. No subscription you have to fight your way out of. Just published ingredient percentages and a 15-second habit, formulated at 9,600 feet in Breckenridge, Colorado.
          </p>
          <div className="flex items-center justify-center gap-3 py-4 border-y border-gray-100 text-xs text-gray-500">
            <span>This article contains a paid partnership with Base Layer Skin</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>Updated: Today</span>
          </div>
        </header>

        {/* Hero Image */}
        <div className="mb-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 relative pt-[100%] md:pt-[65%]">
          <img
            src={clutteredSinkImg}
            alt="A bathroom sink crowded with half-used skincare products"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Article Body */}
        <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-body">

          <p className="min-h-[1.6em]">
            Ask ten men what's in their moisturizer and most won't know. Ask what percentage of anything is actually in the bottle, and the room goes quiet. That's not an accident — most men's skincare brands don't publish concentrations at all. A quiet experiment among a small group of testers in Colorado started with a simpler question: what if one product, with the doses printed on the label, did the job of four?
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            The Routine Problem Nobody Fixes
          </h2>
          <p>
            Fifty-eight percent of men rarely or never moisturize. Not because they don't have a problem — because the fix looks like a chore. A serum here, a moisturizer there, an eye cream nobody remembers to use, and a routine that falls apart by week two. The men who do try something usually land on one of two paths: a drugstore basic that feels heavy and doesn't touch oil control, or a subscription kit that mails a new box every month whether you want it or not — and that's turned into its own well-documented headache. Trustpilot and BBB complaint boards are full of men describing the same thing: a "free trial" that quietly becomes a recurring charge, and a cancellation flow designed to wear you down.
          </p>
          <p>
            The actual pain points, in the words men use: skin that's shiny by noon. Razor burn every time. Looking tired in photos nobody's supposed to see. And underneath all of it, a low-grade suspicion that none of these products are doing much of anything — just sitting on the skin, or worse, sitting in a subscription queue.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            Six Ingredients, Three Jobs, Every Dose Published
          </h2>
          <div className="float-right w-1/2 md:w-1/3 ml-6 mb-6 rounded-lg overflow-hidden shadow-sm">
            <img src={minimalistRoutineImg} alt="A single bottle replacing a multi-product routine" className="w-full h-auto object-cover" loading="lazy" />
          </div>
          <p>
            <Link to="/face-cream" className="text-brand-accent font-bold no-underline hover:underline">Base Layer</Link>'s approach starts from a narrower question than most brands ask: not "what feels premium," but "what's actually dosed at a level that does something." The Performance Daily Face Cream carries six active ingredients, each at a published concentration, doing three distinct jobs.
          </p>

          <div className="clear-both"></div>

          <div className="bg-[#FAF9F6] border border-gray-100 rounded-xl p-8 my-10">
            <div className="space-y-12">
              <IngredientJob
                job="Oil Control"
                title="Niacinamide, 5%"
                text="The most-studied clinical concentration of the ingredient, chosen because it's effective without the sensitization risk of going higher. In the formula, it works on the cause of midday shine rather than blotting it away after the fact."
                img={niacinamideImg}
                reverse={false}
              />
              <IngredientJob
                job="Fast Absorption, No Residue"
                title="Squalane"
                text="A plant-derived oil that's structurally close to what human skin already produces, which is the reason it's designed to sink in in about 15 seconds instead of sitting on top. It carries a comedogenicity rating of 0 — the lowest possible, meaning it isn't expected to clog pores."
                img={squalaneImg}
                reverse={true}
              />
              <IngredientJob
                job="Post-Shave Recovery"
                title="Panthenol, 2% + Centella Asiatica"
                text="Panthenol is a barrier-support ingredient with decades of use behind it; in this formula it's aimed at calming razor burn and micro-irritation. Centella is included alongside it to help the skin's moisture barrier recover from the daily stress of shaving, wind, and dry indoor air."
                img={postShaveImg}
                reverse={false}
              />
              <IngredientJob
                job="Firmer-Looking Skin Over Time"
                title="Copper Peptide GHK-Cu, 0.03% + Hyaluronic Acid"
                text="Copper peptides are a naturally occurring class of compound that decline as skin ages; here they're included for their role in supporting firmer, smoother-looking skin, particularly around the eyes, over 4 to 8 weeks of daily use. Hyaluronic Acid — capable of holding roughly 1,000 times its weight in water — helps plump the visible appearance of fine lines from underneath."
                img={copperPeptideImg}
                reverse={true}
              />
            </div>
          </div>

          <p>
            There's no fragrance in the formula, no separate eye cream, no separate barrier cream. One pump, morning and night, on a clean face.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            What the Testers Said
          </h2>
          <p>
            Base Layer doesn't yet have a public review count — the company is upfront that it's early. What it does have are three named product testers who received the cream for free in exchange for honest feedback:
          </p>

          <div className="space-y-6 my-8 not-prose">
            {testimonials.map((t) => (
              <figure key={t.name} className="bg-[#FAF9F6] border border-gray-100 rounded-xl p-6 m-0">
                <blockquote className="text-[16px] text-gray-800 leading-relaxed m-0 mb-4">
                  "{t.quote}"
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = t.fallback; }}
                  />
                  <div>
                    <div className="font-bold text-sm text-[#1A2F4C]">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.detail}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="text-xs text-gray-500 italic">
            {TESTIMONIAL_DISCLOSURE}
          </p>

          <p>
            Every ingredient in the formula is non-comedogenic. The company publishes its concentrations on the product page rather than hiding behind "clinically tested" language with no data attached — a direct response to the most common complaint men have about this category: that nobody will show their work.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4 text-center">
            One Product, Three Ways to Buy It
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 my-8 not-prose">
            {BUY_TIERS.map((tier) => (
              <div key={tier.id} className={`border rounded-xl p-5 text-center relative ${tier.badge === "MOST POPULAR" ? 'border-[#1A2F4C] border-2' : 'border-gray-200'}`}>
                {tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${tier.badgeColor} text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap`}>
                    {tier.badge}
                  </div>
                )}
                <div className="font-heading font-bold text-sm text-[#1A2F4C] uppercase tracking-wide mt-2 mb-1">{tier.label}</div>
                <div className="font-heading font-extrabold text-3xl text-[#1A2F4C] mb-1">${tier.price}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {tier.kind === "subscription" ? tier.subCopy : `${tier.duration} · about $${perDay(tier.price, tier.bottles)} a day`}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center">
            Every order ships free. Every order is covered by a 30-day guarantee — if it's not for you, Base Layer refunds it in full and doesn't ask for the bottle back.
          </p>

          <div className="bg-[#1A2F4C] text-white p-8 md:p-12 rounded-xl text-center shadow-xl mt-10 mb-8 border-t-4 border-brand-accent-on-dark">
            <img src={productBoxBottle} alt="Base Layer Performance Daily Face Cream" className="w-32 h-32 object-cover rounded-full mx-auto mb-6 border-4 border-[#2A4469]" loading="lazy" />
            <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4 text-white">One Bottle. Every Dose on the Label.</h3>
            <p className="text-[#ABB3BB] mb-8 max-w-md mx-auto text-base">
              Free shipping on every order. 30-day guarantee — hate it, keep the bottle, full refund.
            </p>
            <Link to="/face-cream" onClick={handleCTAClick}>
              <Button className="w-full sm:w-auto px-12 py-7 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-[#8B2F08] border-none transition-all duration-300 rounded-[4px] h-auto">
                GRAB YOURS — $38
              </Button>
            </Link>
          </div>

        </article>

      </main>

      {/* Sticky Mobile CTA */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 md:hidden ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <Link to="/face-cream" onClick={handleCTAClick}>
          <Button className="w-full px-6 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-[4px] h-auto flex items-center justify-between">
            <span>SEE WHAT'S IN IT</span>
            <span className="bg-black/10 flex items-center p-1 rounded-full"><ChevronRight className="w-4 h-4"/></span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OneBottleExperiment;
