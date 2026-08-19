import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";
import { metaFor } from "@/config/pageSeo";
import { trackEvent } from "@/lib/analytics";
import { Check, X } from "lucide-react";
import { BUY_TIERS } from "@/config/product";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { testimonials, TESTIMONIAL_DISCLOSURE } from "@/components/testimonialsData";

import bottleBoxImg from "@/assets/product-source/bottle-box-studio.webp";
import bottleFrontImg from "@/assets/product-source/bottle-front-studio.webp";
import boxFrontImg from "@/assets/product-source/box-front-studio.webp";
import ingredientsLabelImg from "@/assets/product-source/bottle-back-ingredients.webp";

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Peptides Went Mainstream. The Men Who Need Them Most Are Still Doing Nothing.",
  "image": "https://baselayerskin.co/og-mountain-product-v2.jpg",
  "datePublished": new Date().toISOString().split('T')[0],
  "author": { "@type": "Organization", "name": "Base Layer" }
};

// A bottle is a 6-week (42-day) supply. Derived from BUY_TIERS so the per-day
// math can't drift from the buy box.
const perDay = (price: number, bottles: number) =>
  (price / (bottles * 42)).toFixed(2);

const SINGLE = BUY_TIERS.find(t => t.id === 1);
const TWO_PACK = BUY_TIERS.find(t => t.id === 2);

const PeptideStack = () => {
  useCanonical();
  // Same strings the prerenderer writes into the served HTML. Kept in
  // pageSeo.ts so the two heads can't drift apart again.
  useMetaTags(metaFor("/article/peptide-stack"));

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    // Named advertorial_view, not page_view: GA4 already receives a page_view
    // for this route from the gtag config / MetaRouterTracker, and reusing the
    // name here made the ad landers report roughly double the real pageviews.
    // The params are the reason this event exists at all — keep them.
    trackEvent('advertorial_view', { page: 'peptide_stack', type: 'advertorial', angle: 'peptide_maxxing' });

    const handleScroll = () => {
      setShowSticky(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = (placement: string) =>
    trackEvent('advertorial_cta_click', { page: 'peptide_stack', placement, action: 'navigate_to_product' });

  const Active = ({ pct, name, job, text }: { pct: string, name: string, job: string, text: string }) => (
    <div className="border-l-2 border-brand-accent pl-5 py-1">
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <span className="font-heading font-black text-2xl text-[#1A2F4C] leading-none">{pct}</span>
        <span className="font-heading font-bold text-lg text-[#1A2F4C] leading-tight">{name}</span>
      </div>
      <div className="text-brand-accent font-bold text-[11px] tracking-widest uppercase mb-2">{job}</div>
      <p className="text-[15px] sm:text-[16px] m-0 text-gray-700 leading-relaxed font-body">{text}</p>
    </div>
  );

  const CompareRow = ({ label, stack, bottle }: { label: string, stack: string, bottle: string }) => (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-4 pr-4 font-body text-[14px] text-gray-800 align-top">{label}</td>
      <td className="py-4 px-3 align-top">
        <div className="flex items-start gap-2">
          <X className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span className="font-body text-[14px] text-gray-600">{stack}</span>
        </div>
      </td>
      <td className="py-4 pl-3 align-top">
        <div className="flex items-start gap-2">
          <Check className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
          <span className="font-body text-[14px] text-gray-800 font-medium">{bottle}</span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white min-h-screen font-body selection:bg-brand-accent selection:text-white pb-24 md:pb-0">
      <JsonLd data={ARTICLE_SCHEMA} />

      {/* Top banner — every claim here is independently true */}
      <div className="w-full bg-[#1A2F4C] text-white text-center py-2 px-4">
        <span className="font-body text-[12px] md:text-[13px] tracking-wide">
          {FREE_SHIPPING_PHRASE} on every order · 30-day keep-the-bottle guarantee
        </span>
      </div>

      {/* Editorial Navigation */}
      <nav className="w-full h-16 border-b border-gray-100 flex items-center justify-center px-4 bg-white sticky top-0 z-40">
        <div className="font-heading font-black tracking-widest text-[#1A2F4C] text-[11px] md:text-[13px] uppercase flex gap-4 md:gap-8 items-center">
          <span>Men's Grooming</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Ingredients</span>
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
            Peptides Went Mainstream. The Men Who Need Them Most Are Still Doing Nothing.
          </h1>
          <p className="text-gray-600 text-lg md:text-[20px] leading-relaxed mb-6 font-medium">
            The forums argue about copper peptide percentages all day. Meanwhile the average 38-year-old has never put one on his face. A look at what the published numbers actually say, and what the argument is missing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 py-4 border-y border-gray-100 text-xs text-gray-500">
            <span>This article contains a paid partnership with Base Layer Skin</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>Updated: Today</span>
          </div>
        </header>

        {/* Hero Image */}
        <figure className="mb-12">
          {/*
            The source render is 1000x1500. Left at h-auto it draws 1125px tall in
            an 800px column and pushes the opening hook off the first screen,
            which is the one thing an ad landing page can't afford.
          */}
          <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-[#F7FAFC] flex items-center justify-center">
            <img
              src={bottleBoxImg}
              alt="Base Layer Daily Face Cream bottle and retail carton, 5% niacinamide and copper peptides"
              className="w-auto h-auto max-h-[440px] max-w-full object-contain"
            />
          </div>
          <figcaption className="text-[13px] text-gray-500 mt-3 text-center font-body">
            Base Layer Daily Face Cream. Every active concentration is printed on the package.
          </figcaption>
        </figure>

        {/* Article Body */}
        <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-body">

          <p className="min-h-[1.6em]">
            Somewhere in the last two years, peptides stopped being a dermatology word and became an internet one. Threads run for hundreds of comments comparing copper peptide concentrations. Men in their early twenties post shelf photos of four serums and a pipette, debating layering order and whether one active cancels out another.
          </p>
          <p>
            It is genuinely a more informed conversation than men's grooming has ever had. It is also aimed at the wrong people. The men doing the most reading are, on average, a decade away from the changes they're trying to get ahead of. The men who are actually watching their face change in photographs — the ones noticing that they look tired in a picture where they felt fine — are mostly not in those threads at all. They're doing nothing.
          </p>
          <p>
            Not out of indifference. Out of a reasonable read of the situation: the whole category looks like a hobby with a steep entry cost, and the payoff is described in language nobody trusts.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          {/* Proof interrupter — real proof only, no ratings against a 0-review product */}
          <div className="not-prose bg-[#F7FAFC] border border-gray-100 rounded-xl px-6 py-8 my-10 text-center">
            <div className="font-heading font-black text-[13px] tracking-widest uppercase text-brand-accent mb-4">
              What's on the label
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-[520px] mx-auto">
              {[
                { n: "6", l: "active ingredients" },
                { n: "6", l: "published concentrations" },
                { n: "0", l: "added fragrance" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-heading font-black text-[34px] md:text-[40px] text-[#1A2F4C] leading-none mb-2">{s.n}</div>
                  <div className="font-body text-[12px] text-gray-600 leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
            <p className="font-body text-[13px] text-gray-500 mt-6 mb-0 max-w-[460px] mx-auto">
              Most men's brands publish none of them. That is the part of this story worth paying attention to.
            </p>
          </div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            The Cost of Waiting Until You Can See It
          </h2>
          <p>
            Fifty-eight percent of men rarely or never moisturize. The number is easy to read as laziness. It is closer to a sequencing problem: skin changes are gradual and unremarkable day to day, so there's never a morning where it becomes urgent. There's just a photograph, eventually, where something looks different.
          </p>
          <p>
            By then the conversation has changed. The men who start at thirty-two are maintaining. The men who start at forty-five are trying to reverse something, which is a harder job and a slower one, and it's the job the entire category oversells. Nothing in a jar reverses a decade. Things in a jar are quite good at slowing the next one down.
          </p>
          <p>
            This is the honest case for peptides, and it's a boring one, which is presumably why the forums prefer arguing about percentages. Copper peptides belong in the maintenance conversation, not the rescue one. Which means the best time to be using them is roughly a decade before you go looking for them.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            The Percentage Argument Is the Wrong Argument
          </h2>
          <div className="float-right w-1/2 md:w-[38%] ml-6 mb-6 rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-[#F7FAFC]">
            <img src={bottleFrontImg} alt="Base Layer Daily Face Cream bottle, front label" className="w-full h-auto object-contain" loading="lazy" />
          </div>
          <p>
            Here is where the shelf-photo crowd and the dermatology literature quietly part ways. A peptide is not a solvent you use more of to get more result. It's a signal molecule, and the concentrations used in the research that made copper peptides interesting in the first place are small — fractions of a percent, not the double digits the stacking threads gravitate toward.
          </p>
          <p>
            More to the point: copper peptides don't work in isolation, and neither does anything else on that shelf. Oil control, barrier repair, hydration, and firmness are four different jobs. Buying four products to do them separately introduces four chances to irritate your skin, a layering order to get wrong, and — the failure nobody accounts for — four opportunities to quit. A stack you abandon in three weeks outperforms nothing at all.
          </p>
          <p>
            The more useful question isn't which single active is dosed highest. It's whether the whole set is dosed at the levels the research used, in something you'll actually put on your face every day for a decade.
          </p>

          <div className="clear-both"></div>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            Six Actives, Four Jobs, Every Dose Printed on the Bottle
          </h2>
          <p>
            <Link to="/face-cream" className="text-brand-accent font-bold no-underline hover:underline">Base Layer</Link> is a single product formulated in Breckenridge, Colorado, at 9,600 feet — an environment that is unusually hard on skin and therefore a reasonable place to test one. The Daily Face Cream carries six active ingredients, each at a concentration you can read on the package before you buy it.
          </p>

          <div className="not-prose bg-[#FAF9F6] border border-gray-100 rounded-xl p-6 sm:p-8 my-10">
            <div className="space-y-8">
              <Active
                pct="5%"
                name="Niacinamide"
                job="Oil control"
                text="The most-studied concentration for sebum regulation, chosen because going higher raises sensitization risk without a matching return. It works on what causes midday shine rather than absorbing it after the fact."
              />
              <Active
                pct="0.03%"
                name="Copper Tripeptide-1 (GHK-Cu)"
                job="Firmness"
                text="The peptide the forums are arguing about, dosed in the range the research used rather than the range that markets well. Supports a firmer, more supple-looking complexion and helps diminish the visible signs of aging. It is also unstable in the wrong formula, which is a large part of why the number matters less than the emulsion it lives in."
              />
              <Active
                pct="2%"
                name="Panthenol"
                job="Post-shave calm"
                text="Provitamin B5. The reason this reads as a men's product rather than a repackaged women's one: shaving is a daily controlled abrasion, and most moisturizers ignore it entirely."
              />
              <Active
                pct="—"
                name="Centella Asiatica"
                job="Barrier repair"
                text="Rebuilds the moisture barrier that cold, altitude, wind, and hot showers strip out. The barrier is the thing that makes everything else in the formula work; without it you're applying actives to a leaking surface."
              />
              <Active
                pct="—"
                name="Sodium Hyaluronate"
                job="Hydration"
                text="The low-molecular-weight form of hyaluronic acid, which sits better under a moisturizer than the heavier version. Holds water in the upper layers, which is most of what makes skin look less tired in a photograph."
              />
              <Active
                pct="—"
                name="Squalane"
                job="Delivery"
                text="A plant-derived lipid close to what skin produces on its own. It carries the rest of the formula in and absorbs in about fifteen seconds, with no residue — which is the whole reason a man keeps using it past week two."
              />
            </div>
          </div>

          <figure className="not-prose my-10 flex flex-col sm:flex-row gap-6 items-center bg-white border border-gray-100 rounded-xl p-6">
            <div className="w-full sm:w-[40%] rounded-lg overflow-hidden bg-[#F7FAFC] flex items-center justify-center">
              <img src={ingredientsLabelImg} alt="The back of the Base Layer bottle showing the full ingredient list" className="w-auto h-auto max-h-[420px] max-w-full object-contain" loading="lazy" />
            </div>
            <div className="w-full sm:w-[60%]">
              <h3 className="font-heading font-bold text-xl text-[#1A2F4C] mb-3">The whole list, on the bottle</h3>
              <p className="font-body text-[15px] text-gray-700 leading-relaxed mb-0">
                Not a marketing panel. The full INCI list is printed on the back, in order, including the preservatives — because the useful test of an ingredient claim is whether the brand will show you the parts that aren't flattering.
              </p>
            </div>
          </figure>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          {/* Comparison */}
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            Stacking Singles Against One Formula
          </h2>
          <div className="not-prose my-8 overflow-x-auto">
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b-2 border-[#1A2F4C]">
                  <th className="text-left py-3 pr-4 font-heading font-bold text-[12px] uppercase tracking-widest text-gray-500 w-[34%]"></th>
                  <th className="text-left py-3 px-3 font-heading font-bold text-[12px] uppercase tracking-widest text-gray-500">Stacking single actives</th>
                  <th className="text-left py-3 pl-3 font-heading font-bold text-[12px] uppercase tracking-widest text-[#1A2F4C]">One formula</th>
                </tr>
              </thead>
              <tbody>
                <CompareRow label="Products to buy" stack="Typically four to six" bottle="One" />
                <CompareRow label="Concentrations published" stack="Varies, often not at all" bottle="All six, on the package" />
                <CompareRow label="Layering order to manage" stack="Yes, and getting it wrong costs you" bottle="None" />
                <CompareRow label="Daily time" stack="Several minutes, morning and night" bottle="About fifteen seconds" />
                <CompareRow label="Added fragrance" stack="Common, and a leading irritant" bottle="None" />
                <CompareRow label="Chances to abandon it" stack="One per product" bottle="One" />
              </tbody>
            </table>
          </div>
          <p className="text-[14px] text-gray-500 italic">
            Comparison describes the practice of assembling a multi-product lineup, not any single competing brand.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          {/* Testers — real, disclosed, no star graphics, no verified-buyer badges */}
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            What the Testers Reported
          </h2>
          <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col">
                <div className="text-brand-accent font-bold text-[10px] tracking-widest uppercase mb-4">{t.tag}</div>
                <p className="font-body text-[15px] leading-[1.6] text-gray-800 mb-6 flex-grow">"{t.quote}"</p>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="font-heading font-bold text-[13px] text-[#1A2F4C]">{t.name}</div>
                  <div className="font-body text-[12px] text-gray-500">{t.detail}</div>
                  <div className="font-body text-[11px] text-gray-400 uppercase tracking-wider mt-1">Product tester</div>
                </div>
              </div>
            ))}
          </div>
          <p className="not-prose text-[12px] text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-4 my-8">
            {TESTIMONIAL_DISCLOSURE}
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            What to Expect, Stated Plainly
          </h2>
          <p>
            The first thing anyone notices is the absorption, because it happens immediately and it's the reason the habit survives: about fifteen seconds, matte, no residue on a phone screen or a collar. Oil control and post-shave calm are the near-term effects, and testers described both inside the first couple of weeks. Barrier recovery from centella and panthenol is a two-to-four week story.
          </p>
          <p>
            The peptide is the long game, and it should be described as one. Copper peptides support a firmer-looking complexion over months of consistent use, not days. Any page that offers you a week-by-week transformation schedule is selling you a timeline nobody can promise. The honest version is that this is a maintenance product, the results compound quietly, and the main variable is whether you keep using it.
          </p>

          <div className="w-12 h-1 bg-brand-accent my-10"></div>

          {/* Offer */}
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            What It Costs
          </h2>
          <p className="mb-8">
            One bottle is 50 ml and lasts about six weeks with morning and night use. {FREE_SHIPPING_PHRASE} on every order.
          </p>

          <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            {BUY_TIERS.map((tier) => {
              const featured = tier.id === 2;
              return (
                <div
                  key={tier.id}
                  className={`rounded-xl p-6 flex flex-col text-center border ${
                    featured
                      ? 'border-[#1A2F4C] border-2 bg-[#F7FAFC] shadow-md'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {tier.badge && (
                    <div className={`${tier.badgeColor} text-white font-heading font-bold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full self-center mb-3 whitespace-nowrap`}>
                      {tier.badge}
                    </div>
                  )}
                  <div className="font-heading font-bold text-[15px] text-[#1A2F4C] mb-1">{tier.label}</div>
                  <div className="font-body text-[12px] text-gray-500 mb-4">{tier.duration}</div>
                  <div className="font-heading font-black text-[34px] text-[#1A2F4C] leading-none mb-1">${tier.price}</div>
                  <div className="font-body text-[12px] text-gray-500 mb-5">
                    ${perDay(tier.price, tier.bottles)} per day
                  </div>
                  {tier.subCopy && (
                    <div className="font-body text-[12px] text-gray-600 mb-4 leading-snug">{tier.subCopy}</div>
                  )}
                  <Link to="/face-cream" onClick={() => handleCTAClick(`tier_${tier.id}`)} className="mt-auto">
                    <Button className={`w-full px-4 py-5 font-heading font-bold tracking-[0.08em] text-[12px] uppercase border-none rounded-[4px] h-auto transition-all duration-300 ${
                      featured ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-[#1A2F4C] text-white hover:bg-brand'
                    }`}>
                      Choose {tier.label}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Guarantee */}
          <div className="not-prose bg-[#1A2F4C] text-white rounded-xl p-8 md:p-10 my-10 flex flex-col sm:flex-row gap-8 items-center">
            <div className="w-full sm:w-[38%] rounded-lg overflow-hidden bg-white/5">
              <img src={boxFrontImg} alt="Base Layer Daily Face Cream retail carton" className="w-full h-auto object-contain" loading="lazy" />
            </div>
            <div className="w-full sm:w-[62%] text-center sm:text-left">
              <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4 text-white">Thirty days, keep the bottle</h3>
              <p className="text-[#ABB3BB] mb-6 text-[15px] leading-relaxed">
                Use it morning and night for thirty days. If your skin isn't calmer, matter, and less tight than it was, ask for a refund and keep what's left of the bottle. There is nothing to ship back and no cancellation maze, because there's nothing to cancel unless you choose the subscription.
              </p>
              <Link to="/face-cream" onClick={() => handleCTAClick('guarantee')}>
                <Button className="w-full sm:w-auto px-10 py-6 font-heading font-bold tracking-[0.1em] text-[13px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-[4px] h-auto">
                  Start with one bottle
                </Button>
              </Link>
            </div>
          </div>

          {/* Final CTA */}
          <div className="not-prose text-center my-14">
            <h2 className="font-heading font-extrabold text-[28px] md:text-[36px] text-[#1A2F4C] leading-tight mb-4 max-w-[600px] mx-auto">
              The peptide argument will still be running next year
            </h2>
            <p className="font-body text-gray-600 text-[16px] leading-relaxed max-w-[540px] mx-auto mb-8">
              You don't have to win it. You have to start a decade before you'd otherwise think to. Six actives, every dose printed on the package, about fifteen seconds a day.
            </p>
            <Link to="/face-cream" onClick={() => handleCTAClick('final')}>
              <Button className="w-full sm:w-auto px-12 py-7 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-[4px] h-auto">
                Get Base Layer — ${SINGLE?.price ?? 38}
              </Button>
            </Link>
            <p className="font-body text-[13px] text-gray-500 mt-4">
              {FREE_SHIPPING_PHRASE} · 30-day keep-the-bottle guarantee · {TWO_PACK ? `2-pack $${TWO_PACK.price}` : null}
            </p>
          </div>

        </article>
      </main>

      {/* Footer disclaimer */}
      <footer className="border-t border-gray-100 bg-[#FAFAFA] py-10 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <p className="font-body text-[12px] text-gray-500 leading-relaxed mb-4 max-w-[640px] mx-auto">
            Base Layer Daily Face Cream is a cosmetic product intended to moisturize and improve the appearance of skin. It is not intended to diagnose, treat, cure, or prevent any disease. Individual results vary with skin type and consistency of use. For external use only.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-body text-[12px] text-gray-500">
            <Link to="/privacy-policy" className="hover:text-[#1A2F4C]">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <Link to="/terms-of-service" className="hover:text-[#1A2F4C]">Terms of Service</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <Link to="/refund-policy" className="hover:text-[#1A2F4C]">Refund Policy</Link>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 md:hidden ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <Link to="/face-cream" onClick={() => handleCTAClick('sticky_mobile')}>
          <Button className="w-full px-6 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-[4px] h-auto flex items-center justify-between">
            <span>Get Base Layer</span>
            <span className="bg-black/10 px-2 py-1 rounded text-xs">${SINGLE?.price ?? 38}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PeptideStack;
