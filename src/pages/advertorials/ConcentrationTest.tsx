import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { Check, X } from "lucide-react";
import { BUY_TIERS } from "@/config/product";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { testimonials, TESTIMONIAL_DISCLOSURE } from "@/components/testimonialsData";

import ingredientsLabelImg from "@/assets/product-source/bottle-back-ingredients.webp";
import packshotImg from "@/assets/product-carousel/base-layer-carousel-01-primary.webp";
import mountainPackshotImg from "@/assets/generated-creatives/hero-mountain-packshot-v2.webp";
import blankLineupImg from "@/assets/generated-creatives/antiaging-blank-lineup.webp";
import portraitImg from "@/assets/generated-creatives/antiaging-portrait.webp";

const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Most Men's Anti-Aging Creams Won't Tell You How Much Is In Them",
  "image": "https://baselayerskin.com/og-image.jpg",
  "datePublished": new Date().toISOString().split('T')[0],
  "author": { "@type": "Organization", "name": "Base Layer" }
};

// A bottle is a 6-week (42-day) supply. Derived from BUY_TIERS so the per-day
// math can't drift from the buy box.
const perDay = (price: number, bottles: number) =>
  (price / (bottles * 42)).toFixed(2);

const SINGLE = BUY_TIERS.find(t => t.id === 1);
const TWO_PACK = BUY_TIERS.find(t => t.id === 2);

/*
 * Preset C — Consumer Report. Two deliberate deviations from the preset spec in
 * `src/pages/advertorials/CLAUDE.md`, both documented rather than silent:
 *
 *  1. The preset names #E53E3E for emphasis. That is 3.9:1 on white and
 *     `tailwind.config.ts` carries an explicit gate that any accent clear 4.5:1
 *     before it ships, plus a "never a raw hex" rule. `brand-accent` (#C4470E,
 *     4.94:1) is the token built for exactly this job — eyebrows, rules, inline
 *     links — so the accessibility gate wins over the preset hex.
 *  2. Body text is #111111 per the preset, but secondary text uses the gray
 *     scale already in use across the other advertorials rather than a second
 *     bespoke ramp.
 *
 * Everything else is the preset: stark white ground, heavy Montserrat display,
 * 700px measure, third-person journalist voice, no whistleblower framing.
 */
const ConcentrationTest = () => {
  useCanonical();
  useMetaTags({
    title: "Most Men's Anti-Aging Creams Won't Tell You How Much Is In Them",
    description: "Niacinamide and copper peptides carry most of the published evidence for aging skin. Both only do anything at a dose — and an ingredient list is a ranking, not a recipe. How to read a label, and which brands print the numbers."
  });

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { page: 'concentration_test', type: 'advertorial', angle: 'concentration_transparency' });

    const handleScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = (placement: string) =>
    trackEvent('advertorial_cta_click', { page: 'concentration_test', placement, action: 'navigate_to_product' });

  const Rule = () => <div className="w-16 h-[3px] bg-brand-accent my-10" />;

  // Mid-article CTA. The page runs long and the offer section sits near the
  // bottom, so these give a reader who is already convinced somewhere to go.
  // Editorial register on purpose — the argument is the sell, so each one reads
  // as "go check the claim" rather than "buy now."
  const InlineCTA = ({ placement, heading, sub, label }: {
    placement: string; heading: string; sub: string; label: string;
  }) => (
    <div className="not-prose border-2 border-[#111111] p-6 sm:p-7 my-10 flex flex-col sm:flex-row sm:items-center gap-5">
      <div className="flex-1">
        <div className="font-heading font-black text-[17px] sm:text-[19px] text-[#111111] leading-tight mb-2">{heading}</div>
        <p className="font-body text-[14px] text-gray-700 leading-relaxed m-0">{sub}</p>
      </div>
      <Link to="/face-cream" onClick={() => handleCTAClick(placement)} className="shrink-0 w-full sm:w-auto">
        <Button className="w-full sm:w-auto px-8 py-5 font-heading font-bold tracking-[0.08em] text-[12px] uppercase bg-brand text-white hover:bg-brand-hover border-none rounded-none h-auto transition-all duration-300">
          {label}
        </Button>
      </Link>
    </div>
  );

  const Active = ({ pct, name, job, research, text }: {
    pct: string; name: string; job: string; research: string; text: string;
  }) => (
    <div className="border-t-2 border-[#111111] pt-5">
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <span className="font-heading font-black text-[32px] text-[#111111] leading-none tabular-nums">{pct}</span>
        <span className="font-heading font-bold text-lg text-[#111111] leading-tight">{name}</span>
      </div>
      <div className="text-brand-accent font-bold text-[11px] tracking-widest uppercase mb-3">{job}</div>
      <p className="text-[15px] sm:text-[16px] m-0 mb-3 text-gray-800 leading-relaxed font-body">{text}</p>
      <p className="text-[13px] m-0 text-gray-600 leading-relaxed font-body border-l-2 border-gray-200 pl-3">
        <span className="font-bold text-[#111111]">What the research used: </span>{research}
      </p>
    </div>
  );

  // Every row states what a brand publishes on its own product pages — a
  // verifiable disclosure fact — never what a formula does or doesn't contain.
  const DiscloseRow = ({ brand, publishes, detail }: {
    brand: string; publishes: boolean; detail: string;
  }) => (
    <tr className="border-b border-gray-200 last:border-0">
      <td className="py-4 pr-4 font-body text-[14px] font-bold text-[#111111] align-top whitespace-nowrap">{brand}</td>
      <td className="py-4 px-3 align-top">
        {publishes
          ? <Check className="w-5 h-5 text-[#1B7A3D]" aria-label="Publishes concentrations" />
          : <X className="w-5 h-5 text-gray-400" aria-label="Does not publish concentrations" />}
      </td>
      <td className="py-4 pl-3 font-body text-[14px] text-gray-700 align-top">{detail}</td>
    </tr>
  );

  return (
    <div className="bg-white min-h-screen font-body text-[#111111] selection:bg-brand-accent selection:text-white pb-28 md:pb-24">
      <JsonLd data={ARTICLE_SCHEMA} />

      {/* Top banner — every claim here is independently true */}
      <div className="w-full bg-[#111111] text-white text-center py-2 px-4">
        <span className="font-body text-[12px] md:text-[13px] tracking-wide">
          {FREE_SHIPPING_PHRASE} on every order · 30-day keep-the-bottle guarantee
        </span>
      </div>

      {/* Editorial navigation */}
      <nav className="w-full h-16 border-b-2 border-[#111111] flex items-center justify-center px-4 bg-white sticky top-0 z-40">
        <div className="font-heading font-black tracking-[0.2em] text-[#111111] text-[10px] md:text-[12px] uppercase flex gap-4 md:gap-8 items-center">
          <span>Consumer Desk</span>
          <span className="w-1 h-1 rounded-full bg-brand-accent"></span>
          <span>Ingredients</span>
          <span className="w-1 h-1 rounded-full bg-brand-accent"></span>
          <span>Men's Grooming</span>
        </div>
      </nav>

      <main className="max-w-[700px] mx-auto px-5 sm:px-6 py-10 md:py-14">

        {/* Header */}
        <header className="mb-10">
          <div className="text-brand-accent font-heading font-black text-[11px] tracking-[0.2em] uppercase mb-5">
            Ingredient Review · Sponsored Feature
          </div>
          <h1 className="font-heading font-black text-[34px] md:text-[46px] text-[#111111] leading-[1.08] mb-6 tracking-[-0.02em] text-balance">
            Most Men's Anti-Aging Creams Won't Tell You How Much Is In Them
          </h1>
          <p className="text-gray-700 text-lg md:text-[20px] leading-[1.5] mb-6">
            Niacinamide and copper peptides carry most of the published evidence for aging skin. Both only do anything at a dose. An ingredient list tells you the order, never the amount — so here is which brands print the number, and what the research actually used.
          </p>
          <div className="flex flex-wrap items-center gap-3 py-4 border-y-2 border-[#111111] text-xs text-gray-600">
            <span className="font-bold text-[#111111]">Base Layer Consumer Desk</span>
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
            <span>This article contains a paid partnership with Base Layer Skin</span>
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
            <span>Updated: Today</span>
          </div>
        </header>

        {/* Hero image — the category that publishes nothing */}
        <figure className="mb-12">
          <img
            src={blankLineupImg}
            alt="A row of unbranded skincare bottles, jars and tubes with blank labels, lit from one side against a dark background"
            className="w-full h-auto object-cover rounded-sm"
            width={1200}
            height={896}
          />
          <figcaption className="text-[13px] text-gray-600 mt-3 font-body leading-snug border-l-2 border-brand-accent pl-3">
            Strip the branding off a shelf of anti-aging products and most of them tell you the same thing about their actives: nothing you can measure.
          </figcaption>
        </figure>

        {/* Article body */}
        <article className="prose prose-lg max-w-none text-gray-900 leading-[1.7] font-body">

          <p className="min-h-[1.6em]">
            The moment usually arrives in a photograph. Not a bad one — an ordinary one, taken at a wedding or a work event, where the face looking back seems tired in a way that doesn't match how the day felt. Around the eyes, mostly. Some slackness along the jaw that wasn't there in the last set of photos anyone bothered to print.
          </p>
          <p>
            What tends to happen next is a purchase. Something with "anti-aging" on the front and a list on the back that includes peptides, niacinamide, maybe a botanical blend with a Latin name. It gets used most mornings for three or four months. Then it runs out, nothing has visibly changed, and it doesn't get replaced.
          </p>
          <p>
            The conclusion drawn from that experiment is almost always that the ingredients don't work. That conclusion is usually wrong, and the real explanation is more boring: there may never have been enough of the active in the jar to do anything, and nothing on the packaging would have told you either way.
          </p>

          <Rule />

          {/* Proof interrupter — published concentrations, the only proof this page needs */}
          <div className="not-prose border-y-2 border-[#111111] py-8 my-10">
            <div className="font-heading font-black text-[11px] tracking-[0.2em] uppercase text-brand-accent mb-6 text-center">
              The numbers on one label
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-[520px] mx-auto text-center">
              {[
                { n: "5%", l: "Niacinamide" },
                { n: "0.03%", l: "Copper peptide GHK-Cu" },
                { n: "6 of 6", l: "Actives with a printed dose" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-heading font-black text-[26px] md:text-[34px] text-[#111111] leading-none mb-2 tabular-nums">{s.n}</div>
                  <div className="font-body text-[12px] text-gray-700 leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-7">
              <Link
                to="/face-cream"
                onClick={() => handleCTAClick('proof_interrupter')}
                className="font-body text-[13px] font-bold text-brand-accent no-underline hover:underline"
              >
                See the label these numbers come from
              </Link>
            </div>
          </div>

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            A Cream That Does Nothing Costs More Than Its Price
          </h2>
          <p>
            The wasted money is the smallest part of it. The expensive part is what a failed attempt teaches, because the lesson it appears to teach is the wrong one.
          </p>
          <div className="not-prose my-8 space-y-4">
            {[
              "You can't tell whether the ingredient failed, the dose failed, or you stopped too early — the label gives you nothing to diagnose with.",
              "So the next attempt changes brand rather than dose, which is a different bottle running the same unknown.",
              "After two or three of those, the reasonable read is that the whole category is marketing.",
              "And the men who reach that conclusion stop entirely, which is the one option that reliably does nothing.",
            ].map((line) => (
              <div key={line} className="flex items-start gap-3">
                <span className="font-heading font-black text-brand-accent text-[15px] leading-[1.6] shrink-0">—</span>
                <p className="font-body text-[15px] sm:text-[16px] text-gray-800 leading-[1.6] m-0">{line}</p>
              </div>
            ))}
          </div>
          <p>
            Skin change is gradual and it compounds. The difference between starting at thirty-six and starting at forty-six isn't a matter of taste; it's the difference between keeping something and trying to get it back, and the second job is much harder than anything sold in a jar can honestly promise. Which makes a wasted four-month experiment more costly than it looks on the receipt.
          </p>

          <Rule />

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            An Ingredient List Is a Ranking, Not a Recipe
          </h2>
          <figure className="not-prose float-right w-1/2 md:w-[42%] ml-6 mb-5">
            <img
              src={portraitImg}
              alt="Portrait of a man in his forties, lit from one side against a dark background"
              className="w-full h-auto object-cover rounded-sm"
              loading="lazy"
              width={1200}
              height={896}
            />
          </figure>
          <p>
            Here is the mechanical fact the whole category rests on. Cosmetic ingredient lists are ordered by weight, from most to least — but only down to the 1% line. Below 1%, ingredients may be listed in any order the manufacturer likes. And at no point does a list state a quantity.
          </p>
          <p>
            That single gap does a lot of work. "Contains niacinamide" is equally true of a formula built around it and a formula carrying a trace of it so the word can appear on the front of the box. Both statements are accurate. Both are printed in the same size. Nothing about the ordering distinguishes a working dose from a rounding error, because ordering describes rank, and efficacy is a question of amount.
          </p>
          <p>
            So the useful question is not whether a product contains the ingredients with evidence behind them. It's whether the brand will tell you how much. That is not a technicality — it's the one number that determines whether the four-month experiment was ever capable of producing a result.
          </p>

          <div className="clear-both"></div>

          <Rule />

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            Two Ingredients, Two Different Jobs
          </h2>
          <p>
            The second thing worth understanding is that niacinamide and copper peptides are not competing options. They're not two versions of the same idea, and picking the one with the bigger number on the front is not how either of them works.
          </p>
          <p>
            <strong className="font-bold text-[#111111]">Niacinamide is a form of vitamin B3</strong>, and it's the more thoroughly studied of the two by a wide margin. The published work has it supporting the skin's barrier, moderating oil production, and visibly improving tone and texture over a period of weeks. It is, in effect, the surface-quality ingredient: how even the skin looks, how well it holds water, how much it shines by four in the afternoon.
          </p>
          <p>
            <strong className="font-bold text-[#111111]">Copper tripeptide-1, or GHK-Cu</strong>, is a different kind of thing entirely. It's a small copper-binding peptide that occurs naturally in human plasma and becomes less abundant with age. Peptides are signal molecules rather than bulk materials — which is why they're dosed in fractions of a percent and why more is not automatically better. It's associated in the literature with firmer-looking, denser-looking skin over months rather than weeks.
          </p>
          <p>
            Neither does the other's job. A formula heavy on niacinamide and empty of peptides addresses tone and barrier while leaving firmness alone. The reverse leaves you with a signal molecule working on a surface that's still rough and still leaking water. The pair is the point, and the pair only means anything at a stated dose.
          </p>

          <Rule />

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            What the Research Actually Used
          </h2>
          <p>
            This is where a published number becomes checkable rather than decorative. Both ingredients have a concentration range the studies were run at, and both ranges are public.
          </p>
          <p>
            For niacinamide, <strong className="font-bold text-[#111111]">5% is the figure most of the meaningful work used</strong>. Bissett and colleagues, writing in <em>Dermatologic Surgery</em> in 2005, ran a twelve-week study at that concentration and reported improvement in the appearance of fine lines, hyperpigmentation and elasticity. Hakozaki and colleagues in the <em>British Journal of Dermatology</em> in 2002 documented its effect on pigment transfer between skin cells. Draelos and colleagues found sebum reduction over four weeks at a concentration as low as 2%. Going meaningfully above 5% is not a straightforward upgrade — it raises the odds of irritation without a matching return, which is why 5% reads as a deliberate choice rather than a ceiling somebody couldn't afford.
          </p>
          <p>
            For GHK-Cu, the number that matters is the range. <strong className="font-bold text-[#111111]">The published literature works in the 0.01% to 1% band</strong>, with Pickart's research the most-cited body of work on skin firmness and density over roughly twelve weeks. That range is the context a percentage needs in order to mean anything. A figure like 0.03% looks negligible next to a 5% — right up until you know that for this ingredient, 0.03% sits inside the researched band and 5% would sit far outside it.
          </p>
          <p className="not-prose text-[14px] text-gray-700 leading-relaxed bg-gray-50 border-l-2 border-brand-accent p-4 my-8">
            <span className="font-bold text-[#111111]">A note on what these studies do and don't establish.</span> All of the work cited above tested the ingredients, not any finished product. No claim on this page is that a specific cream has been through a clinical trial — none has. The point is narrower and more useful: these are the concentrations the research ran at, and a product that publishes its concentrations lets you check its numbers against them yourself.
          </p>

          <Rule />

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            One Product That Prints Every Number
          </h2>
          <p>
            <Link to="/face-cream" className="text-brand-accent font-bold no-underline hover:underline">Base Layer</Link> makes a single product — a daily face cream formulated in Breckenridge, Colorado, at 9,600 feet, where cold, wind and thin dry air make an unusually harsh test environment. It carries six active ingredients, and the concentration of each one is printed on the package before you buy it.
          </p>
          <p>
            That last part is the entire reason it belongs in this article. The formula is defensible on its own terms, but what makes it checkable is that the numbers are stated. You can hold them against the research above and decide for yourself whether they land in the right band. That option is not available for most of the shelf.
          </p>

          <figure className="not-prose my-10">
            <img
              src={mountainPackshotImg}
              alt="Base Layer Daily Face Cream bottle and carton on a rock, snow-covered Colorado peaks behind"
              className="w-full h-auto object-cover rounded-sm"
              loading="lazy"
              width={1536}
              height={1536}
            />
            <figcaption className="text-[13px] text-gray-600 mt-3 font-body leading-snug border-l-2 border-brand-accent pl-3">
              The 50 ml bottle and carton. The niacinamide figure is on the front of both; the doses for all six actives are printed on the back.
            </figcaption>
          </figure>

          <div className="not-prose border-2 border-[#111111] p-6 sm:p-8 my-10">
            <div className="space-y-8">
              <Active
                pct="5%"
                name="Niacinamide"
                job="Tone, texture, oil control"
                text="Vitamin B3, and the most-studied active in the formula. Supports the skin's moisture barrier, moderates oil production through the day, and works on the evenness of tone that reads as tired in a photograph."
                research="Bissett et al., Dermatologic Surgery, 2005 — twelve weeks at 5%. Draelos et al. found sebum reduction over four weeks at 2%. Above 5% the irritation risk rises without a proportional return."
              />
              <Active
                pct="0.03%"
                name="Copper Tripeptide-1 (GHK-Cu)"
                job="Firmness"
                text="A copper-binding peptide found naturally in human plasma, which becomes less abundant with age. Associated with firmer-looking, denser-looking skin and helps diminish the visible signs of aging. A signal molecule, so it is dosed low by design rather than by cost."
                research="Pickart's body of work on skin firmness and density over roughly twelve weeks. The effective range across the published literature is 0.01% to 1% — this sits inside it."
              />
              <Active
                pct="2%"
                name="Panthenol"
                job="Post-shave calm"
                text="Provitamin B5. The ingredient that makes this read as a product built for men rather than a rebranded one: shaving is a daily controlled abrasion, and most anti-aging creams ignore it completely."
                research="Widely used at 1–5% in cosmetic formulation for skin conditioning and soothing after mechanical irritation."
              />
            </div>
          </div>

          <figure className="not-prose my-10 flex flex-col sm:flex-row gap-6 items-center border-2 border-[#111111] p-6">
            <div className="w-full sm:w-[40%] flex items-center justify-center bg-gray-50">
              <img
                src={ingredientsLabelImg}
                alt="The back of the Base Layer bottle showing the full printed ingredient list"
                className="w-auto h-auto max-h-[380px] max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="w-full sm:w-[60%]">
              <h3 className="font-heading font-black text-xl text-[#111111] mb-3 leading-tight">The whole list, printed on the bottle</h3>
              <p className="font-body text-[15px] text-gray-800 leading-relaxed mb-0">
                Not a marketing panel with three hero ingredients on it. The full INCI list is on the back in order, preservatives included — because the practical test of an ingredient claim is whether the brand will also show you the parts that aren't flattering.
              </p>
            </div>
          </figure>

          <InlineCTA
            placement="post_ingredients"
            heading="Six actives, every dose printed on the package"
            sub={`One 50 ml bottle, about six weeks. $${SINGLE?.price ?? 38}, ${FREE_SHIPPING_PHRASE.toLowerCase()}, 30 days to change your mind and keep the bottle.`}
            label="See the full formula"
          />

          <Rule />

          {/* Disclosure comparison — every row is a statement about what a brand
              publishes, which is checkable, not about what a formula contains. */}
          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            Who Prints the Numbers
          </h2>
          <p className="mb-6">
            One way to shop this category is to ignore the front of the box entirely and ask a single question of each brand: does it state how much of the active is in there. Sorted that way, the shelf thins out quickly.
          </p>
          <div className="not-prose my-8 overflow-x-auto">
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b-2 border-[#111111]">
                  <th className="text-left py-3 pr-4 font-heading font-black text-[11px] uppercase tracking-[0.15em] text-[#111111] w-[26%]">Brand</th>
                  <th className="text-left py-3 px-3 font-heading font-black text-[11px] uppercase tracking-[0.15em] text-[#111111] w-[16%]">States doses</th>
                  <th className="text-left py-3 pl-3 font-heading font-black text-[11px] uppercase tracking-[0.15em] text-[#111111]">What the product page shows</th>
                </tr>
              </thead>
              <tbody>
                <DiscloseRow brand="Base Layer" publishes detail="A stated concentration for all six actives, printed on the package" />
                <DiscloseRow brand="Caldera Lab" publishes={false} detail="Botanical oil blend, no active concentrations stated" />
                <DiscloseRow brand="Kiehl's" publishes={false} detail="Named ingredients, no concentrations stated" />
                <DiscloseRow brand="Brickell" publishes={false} detail="Natural and organic positioning, no concentrations stated" />
                <DiscloseRow brand="Lumin" publishes={false} detail="Undisclosed active concentrations alongside clinical-testing language" />
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Reflects each brand's own public product pages as reviewed in August 2026. This table describes disclosure practice only — whether a concentration is stated — and makes no claim about what any formula contains or how well it performs. Brands revise their pages; check for yourself before buying anything, including this one.
          </p>

          <InlineCTA
            placement="post_table"
            heading="Check the numbers yourself"
            sub="Every concentration is on the product page and on the package, next to the research ranges above. Read them before you decide."
            label="Read the label"
          />

          <Rule />

          {/* Testers — real, disclosed, no star graphics, no verified-buyer badges */}
          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            What the Testers Reported
          </h2>
          <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-5 my-8">
            {testimonials.map((t) => (
              <div key={t.name} className="border-t-2 border-[#111111] pt-4 flex flex-col">
                <div className="text-brand-accent font-heading font-black text-[10px] tracking-[0.15em] uppercase mb-3">{t.tag}</div>
                <p className="font-body text-[15px] leading-[1.6] text-gray-900 mb-5 flex-grow">"{t.quote}"</p>
                <div className="mt-auto">
                  <div className="font-heading font-bold text-[13px] text-[#111111]">{t.name}</div>
                  <div className="font-body text-[12px] text-gray-600">{t.detail}</div>
                  <div className="font-body text-[11px] text-gray-500 uppercase tracking-wider mt-1">Product tester</div>
                </div>
              </div>
            ))}
          </div>
          <p className="not-prose text-[12px] text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 p-4 my-8">
            {TESTIMONIAL_DISCLOSURE}
          </p>

          <Rule />

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            What to Expect, and When
          </h2>
          <p>
            The honest sequencing matters here, because the gap between what a cream does in week one and what it does in month three is where most people quit.
          </p>
          <p>
            The immediate thing is the absorption — roughly fifteen seconds, matte, no residue on a collar or a phone screen. That sounds cosmetic and it's actually the most important variable on this page, because it's the reason the bottle still gets used in week nine. Hydration and post-shave comfort turn up inside the first week or two. Oil control through the day is a four-to-six week story. Tone and the appearance of fine lines run on the niacinamide timeline, which is eight to twelve weeks.
          </p>
          <p>
            Firmness is the long one. The peptide research runs on twelve-week timelines and beyond, and anything claiming faster than that is selling a schedule nobody can back. What this is, plainly: a maintenance product where the results compound quietly and the main variable is whether you keep using it.
          </p>

          <Rule />

          <h2 className="font-heading font-black text-2xl md:text-[32px] text-[#111111] mb-4 leading-tight tracking-[-0.01em]">
            What It Costs
          </h2>
          <p className="mb-8">
            One bottle is 50 ml and lasts about six weeks used morning and night. {FREE_SHIPPING_PHRASE} on every order.
          </p>

          <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            {BUY_TIERS.map((tier) => {
              const featured = tier.id === 2;
              return (
                <div
                  key={tier.id}
                  className={`p-6 flex flex-col text-center ${
                    featured ? 'border-2 border-[#111111] bg-gray-50' : 'border border-gray-300 bg-white'
                  }`}
                >
                  {tier.badge && (
                    <div className={`${tier.badgeColor} text-white font-heading font-black text-[10px] tracking-[0.15em] uppercase px-3 py-1 self-center mb-3 whitespace-nowrap`}>
                      {tier.badge}
                    </div>
                  )}
                  <div className="font-heading font-bold text-[15px] text-[#111111] mb-1">{tier.label}</div>
                  <div className="font-body text-[12px] text-gray-600 mb-4">{tier.duration}</div>
                  <div className="font-heading font-black text-[34px] text-[#111111] leading-none mb-1 tabular-nums">${tier.price}</div>
                  <div className="font-body text-[12px] text-gray-600 mb-5 tabular-nums">
                    ${perDay(tier.price, tier.bottles)} per day
                  </div>
                  {tier.subCopy && (
                    <div className="font-body text-[12px] text-gray-700 mb-4 leading-snug">{tier.subCopy}</div>
                  )}
                  <Link to="/face-cream" onClick={() => handleCTAClick(`tier_${tier.id}`)} className="mt-auto">
                    <Button className={`w-full px-4 py-5 font-heading font-bold tracking-[0.08em] text-[12px] uppercase border-none rounded-none h-auto transition-all duration-300 ${
                      featured ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-[#111111] text-white hover:bg-brand'
                    }`}>
                      Choose {tier.label}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Guarantee */}
          <div className="not-prose bg-[#111111] text-white p-8 md:p-10 my-10 flex flex-col sm:flex-row gap-8 items-center">
            <div className="w-full sm:w-[36%] bg-white">
              <img src={packshotImg} alt="Base Layer Daily Face Cream bottle beside its retail carton on a white background" className="w-full h-auto object-contain" loading="lazy" width={1254} height={1254} />
            </div>
            <div className="w-full sm:w-[64%] text-center sm:text-left">
              <h3 className="font-heading font-black text-2xl md:text-[28px] mb-4 text-white leading-tight">Thirty days, keep the bottle</h3>
              <p className="text-gray-300 mb-6 text-[15px] leading-relaxed">
                Use it morning and night for thirty days. If your skin isn't calmer, matter and less tight than it was, ask for a refund and keep what's left of the bottle. Nothing to ship back, and nothing to cancel unless you chose the subscription.
              </p>
              <Link to="/face-cream" onClick={() => handleCTAClick('guarantee')}>
                <Button className="w-full sm:w-auto px-10 py-6 font-heading font-bold tracking-[0.1em] text-[13px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-none h-auto">
                  Start with one bottle
                </Button>
              </Link>
            </div>
          </div>

          {/* Final CTA */}
          <div className="not-prose text-center my-14">
            <h2 className="font-heading font-black text-[28px] md:text-[36px] text-[#111111] leading-[1.1] mb-4 max-w-[560px] mx-auto tracking-[-0.02em] text-balance">
              Ask the shelf one question
            </h2>
            <p className="font-body text-gray-700 text-[16px] leading-relaxed max-w-[520px] mx-auto mb-8">
              Not what's in it. How much. Six actives, every dose printed on the package, about fifteen seconds a day.
            </p>
            <Link to="/face-cream" onClick={() => handleCTAClick('final')}>
              <Button className="w-full sm:w-auto px-12 py-7 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-none h-auto">
                Get Base Layer — ${SINGLE?.price ?? 38}
              </Button>
            </Link>
            <p className="font-body text-[13px] text-gray-600 mt-4">
              {FREE_SHIPPING_PHRASE} · 30-day keep-the-bottle guarantee{TWO_PACK ? ` · 2-pack $${TWO_PACK.price}` : ''}
            </p>
          </div>

        </article>
      </main>

      {/* Footer disclaimer */}
      <footer className="border-t-2 border-[#111111] bg-white py-10 px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <p className="font-body text-[12px] text-gray-600 leading-relaxed mb-4 max-w-[620px] mx-auto">
            Base Layer Daily Face Cream is a cosmetic product intended to moisturize and improve the appearance of skin. It is not intended to diagnose, treat, cure, or prevent any disease. Studies referenced on this page tested individual ingredients, not this or any other finished product. Individual results vary with skin type and consistency of use. For external use only.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-body text-[12px] text-gray-600">
            <Link to="/privacy-policy" className="hover:text-[#111111]">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
            <Link to="/terms-of-service" className="hover:text-[#111111]">Terms of Service</Link>
            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
            <Link to="/refund-policy" className="hover:text-[#111111]">Refund Policy</Link>
          </div>
        </div>
      </footer>

      {/* Sticky CTA — shown on every breakpoint, not just mobile. The offer
          section sits near the end of a long page, so on a wide screen this is
          the only standing purchase affordance for most of the scroll. Mobile
          gets a full-width button; desktop a slim bar with the offer terms. */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t-2 border-[#111111] z-50 transition-transform duration-300 ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-[900px] mx-auto p-4 md:py-3 md:px-6 flex items-center gap-6">
          <div className="hidden md:block flex-1 min-w-0">
            <div className="font-heading font-black text-[14px] text-[#111111] leading-tight">Base Layer Daily Face Cream</div>
            <div className="font-body text-[12px] text-gray-600 leading-tight mt-0.5">
              Six actives, every dose printed · {FREE_SHIPPING_PHRASE} · 30-day keep-the-bottle guarantee
            </div>
          </div>
          <Link to="/face-cream" onClick={() => handleCTAClick('sticky')} className="w-full md:w-auto shrink-0">
            <Button className="w-full md:w-auto px-6 md:px-8 py-6 md:py-5 font-heading font-bold tracking-[0.1em] text-[14px] md:text-[13px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-none h-auto flex items-center justify-between md:justify-center gap-3">
              <span>Get Base Layer</span>
              <span className="bg-black/10 px-2 py-1 text-xs tabular-nums">${SINGLE?.price ?? 38}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationTest;
