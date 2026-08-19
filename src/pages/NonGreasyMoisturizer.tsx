import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { Droplets, Timer, Shield, Leaf, Zap, FlaskConical, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import absorptionProof from "@/assets/absorption-proof.jpg";
import creamTextureMacro from "@/assets/cream-texture-macro.jpg";
import { merchantOfferFields } from "@/config/merchantSchema";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { metaFor } from "@/config/pageSeo";

/* ── Structured Data ────────────────────────────────────────────── */

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream: Non-Greasy Moisturizer for Men",
  description:
    "Non-greasy men's face moisturizer that absorbs in 15 seconds. Squalane-based formula with niacinamide 5%, copper peptide, and hyaluronic acid. No residue. $38.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://baselayerskin.co/non-greasy-moisturizer-for-men",
    priceValidUntil: "2026-12-31",
    ...merchantOfferFields("38.00"),
  },
  image: "https://baselayerskin.co/og-mountain-product-v2.jpg",
  url: "https://baselayerskin.co/non-greasy-moisturizer-for-men",
  sku: "BL-PDFC-50ML",
};

/* ── FAQ Data ───────────────────────────────────────────────────── */

const faqs = [
  {
    question: "What actually makes a moisturizer feel greasy?",
    answer:
      "Weight and molecule size, mostly. Occlusive ingredients like petrolatum and mineral oil use molecules too large to pass into skin, so they sit on the surface as a film instead of absorbing. Silicones cause a similar problem in a different way: they smooth over your skin rather than integrating into it. Base Layer uses squalane instead, which is close enough to your skin's own oils that it gets pulled in rather than sitting on top.",
  },
  {
    question: "Why do most moisturizers feel greasy on men's skin?",
    answer:
      "Two reasons. First, a lot of moisturizers are formulated for skin that's thinner and produces less oil, so they lean on heavy, occlusive bases (petroleum, mineral oil) built to lock moisture into drier skin. Second, men's skin produces more sebum on average, thanks to higher testosterone levels. Put a heavy, occlusive moisturizer on skin that's already producing plenty of its own oil, and you get that greasy, sticky feel within minutes.",
  },
  {
    question: "How can I tell if a moisturizer actually absorbs or just feels like it does?",
    answer:
      "Count to 15 after applying, then touch your face. If you feel any film, tackiness, or slip, it's still sitting on the surface. Full absorption feels like bare skin: nothing on your fingers when you touch your face, nothing to wipe on a towel, nothing that transfers onto a phone screen or steering wheel.",
  },
  {
    question: "How does Base Layer absorb so fast?",
    answer:
      "The base is squalane, a biomimetic oil that matches your skin's natural lipid structure. Because your skin recognizes it as 'self,' it absorbs in roughly 15 seconds, compared to 2 to 5 minutes for petroleum-based formulas. There's no residue because the molecules are small enough to integrate into your skin's lipid barrier rather than sitting on top of it.",
  },
  {
    question: "Will this clog my pores?",
    answer:
      "No. Every ingredient in Base Layer is non-comedogenic. Squalane has a comedogenicity rating of 0, the lowest possible. Niacinamide actually helps minimize pore appearance by regulating oil production. If you've been breaking out from other moisturizers, it's likely because they contain pore-clogging ingredients like coconut oil, cocoa butter, or isopropyl myristate. Base Layer has none of those.",
  },
  {
    question: "I have oily skin. Do I even need a moisturizer?",
    answer:
      "Yes. Oily skin and dehydrated skin aren't mutually exclusive. In fact, they often go together. When your skin is dehydrated (lacking water), it compensates by producing even more sebum (oil). A lightweight, non-greasy moisturizer like Base Layer breaks that cycle: hyaluronic acid delivers water-based hydration while niacinamide reduces excess oil production.",
  },
  {
    question: "Can I use this before applying sunscreen?",
    answer:
      "Absolutely. Base Layer's fast absorption makes it a good base for SPF. Apply one pump, wait 15 to 30 seconds, then apply your sunscreen. Because there's no greasy residue underneath, your sunscreen won't pill or slide off throughout the day.",
  },
  {
    question: "How is this different from gel moisturizers?",
    answer:
      "Gel moisturizers are lightweight but often rely on silicones for their smooth feel, and those silicones can trap bacteria and cause breakouts over time. Many gels also skip the active ingredients you'd want for oil control or aging. Base Layer uses a squalane base (no silicones) with 6 active ingredients including copper peptide and niacinamide. You get the lightweight feel of a gel with the performance of a treatment product.",
  },
  {
    question: "How long does one bottle last?",
    answer:
      "One bottle (50 mL) lasts 6 to 8 weeks with daily use: one pump morning and night. That's roughly $0.34 a day for a complete moisturizer, serum, and eye cream replacement.",
  },
  {
    question: "Is there a subscription?",
    answer:
      "Not unless you pick one. Buying once is the default. One bottle is $38, the 2-pack is $68, and shipping is free either way. If you do subscribe, the first bottle is still $38 and every one after that is $34.",
  },
];

/* ── Component ──────────────────────────────────────────────────── */

const NonGreasyMoisturizer = () => {
  useCanonical();
  useMetaTags(metaFor("/non-greasy-moisturizer-for-men"));

  useEffect(() => {
    trackEvent("view_item", {
      content_name: "Non-Greasy Moisturizer for Men — Landing Page",
      content_ids: ["base-layer-face-cream"],
      value: 38.0,
      currency: "USD",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={[
          PRODUCT_SCHEMA,
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Face Cream", path: "/face-cream" },
            { name: "Non-Greasy Moisturizer for Men" },
          ]),
          buildFaqSchema(faqs),
        ]}
      />
      <Navbar />

      <main className="pt-24 pb-20">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-[820px] mx-auto text-center">
            <nav className="flex items-center flex-wrap justify-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link to="/face-cream" className="hover:text-foreground transition-colors">Face Cream</Link>
              <span>/</span>
              <span className="text-foreground">Non-Greasy Moisturizer</span>
            </nav>

            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Base Layer
            </p>

            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-6">
              Non-Greasy Moisturizer for Men. Absorbs in 15 Seconds, Feels Like Nothing.
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Most moisturizers leave the job half done: shiny hands, a film in the mirror, and
              you're still checking twenty minutes later. Base Layer is a lightweight gel-cream that
              matches your skin's own lipid structure, so it absorbs completely in about 15 seconds
              and stops there. No slick residue, no waxy film, no wiping your hands on your jeans.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                to="/face-cream"
                className={buttonVariants({ variant: "hero", size: "lg", className: "w-full sm:w-auto px-12 py-6 text-sm" })}
                onClick={() => {
                  trackEvent("cta_click", {
                    content_name: "Non-Greasy Moisturizer for Men",
                    content_ids: ["base-layer-face-cream"],
                    value: 38.0,
                    currency: "USD",
                  });
                  trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "non_greasy_hero" });
                }}
              >
                <span className="relative z-10">GRAB YOURS: $38</span>
              </Link>
            </div>

            <p className="font-body text-xs text-muted-foreground">
              Zero fragrance. Zero residue. {FREE_SHIPPING_PHRASE}.
            </p>
          </div>
        </section>

        {/* ── 15-Second Routine ────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <img
                src={absorptionProof}
                alt="Base Layer face moisturizer fully absorbed into skin with no greasy residue or film"
                className="w-full h-auto"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </section>

        {/* ── The Problem ──────────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-6">
              Why Most Moisturizers Feel Wrong
            </h2>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              You put on a moisturizer and immediately regret it. It feels like you rubbed cooking
              oil into your face. You wipe your hands on a towel. Twenty minutes later your skin
              still feels coated. Greasy feel is the complaint you hear most often about men's
              moisturizers, and it's usually the reason a guy tries one, hates the texture, and
              stops using moisturizer altogether. The problem is not discipline. It is that most
              moisturizers were never built around how they actually feel once they're on your skin.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Here is why it happens. Most formulas use petroleum-based emollients (mineral oil,
              petrolatum, dimethicone) built as occlusives: they sit on top of your skin and
              physically block moisture from escaping. That's genuinely useful on very dry skin. On
              men's skin, which runs oilier on average, an occlusive layer just adds weight to oil
              you're already producing. Nothing is absorbing. It's sitting there.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Then there are "lightweight" gel moisturizers, which absorb faster but often lean on
              silicones (dimethicone, cyclomethicone) for that smooth, slippery feel. Silicones
              don't absorb into skin either. They sit on the surface as a thin film, which is why
              some gel formulas still feel filmy or trap sebum and bacteria underneath over time.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed">
              The fix isn't a lighter version of the same idea. It's a formula built around
              ingredients that actually absorb into skin instead of sitting on top of it, however
              light that top layer feels at first touch. That is what Base Layer is.
            </p>
          </div>
        </section>

        {/* ── Squalane vs. Petroleum ───────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              Squalane vs. Petroleum: Why the Base Matters
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              The reason Base Layer absorbs in 15 seconds comes down to one ingredient:{" "}
              <Link to="/ingredients/squalane" className="text-primary hover:underline">
                squalane
              </Link>.
            </p>

            <div className="rounded-lg border border-border overflow-hidden bg-card mb-12">
              <img
                src={creamTextureMacro}
                alt="Macro close-up of Base Layer's lightweight, non-greasy gel-cream texture"
                className="w-full h-auto"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-lg border border-border">
                <h3 className="font-heading text-lg font-bold uppercase mb-4 text-muted-foreground">
                  Petroleum-Based Moisturizers
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      label: "Molecular size",
                      detail: "Large molecules that can't penetrate the stratum corneum",
                    },
                    {
                      label: "Mechanism",
                      detail: "Sits on top of skin as an occlusive barrier, trapping moisture underneath",
                    },
                    {
                      label: "Absorption time",
                      detail: "2-5 minutes, and often never fully absorbs",
                    },
                    {
                      label: "Residue",
                      detail: "Visible greasy film on skin surface",
                    },
                    {
                      label: "Pore impact",
                      detail: "Can trap sebum and bacteria, leading to breakouts",
                    },
                  ].map((item) => (
                    <li key={item.label}>
                      <p className="font-heading text-sm font-bold">{item.label}</p>
                      <p className="font-body text-sm text-muted-foreground">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card p-8 rounded-lg border border-primary/30">
                <h3 className="font-heading text-lg font-bold uppercase mb-4 text-primary">
                  Squalane (Base Layer)
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      label: "Molecular size",
                      detail: "Small molecules identical to your skin's natural squalene",
                    },
                    {
                      label: "Mechanism",
                      detail: "Integrates into your skin's lipid barrier, hydrating from within",
                    },
                    {
                      label: "Absorption time",
                      detail: "~15 seconds to full absorption",
                    },
                    {
                      label: "Residue",
                      detail: "Zero. Completely invisible once absorbed",
                    },
                    {
                      label: "Pore impact",
                      detail: "Comedogenicity rating of 0, the lowest rating there is",
                    },
                  ].map((item) => (
                    <li key={item.label}>
                      <p className="font-heading text-sm font-bold">{item.label}</p>
                      <p className="font-body text-sm text-foreground">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Key Benefits ─────────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              What Changes When Your Moisturizer Actually Absorbs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: "15-Second Absorption",
                  desc: "Apply one pump before you get dressed. By the time you grab your keys, it is fully absorbed. No waiting. No wiping excess off on a towel.",
                },
                {
                  icon: Droplets,
                  title: "Clean Finish All Day",
                  desc: "Touch your face an hour after the gym, during a long meeting, or right before dinner. It feels like bare skin, not a greasy layer.",
                },
                {
                  icon: Shield,
                  title: "Layers Under SPF Cleanly",
                  desc: "No pilling under sunscreen when you head outside. No sliding. Your morning sunscreen stays where you put it.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6">
                  <Icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-heading text-lg font-bold uppercase mb-2">{title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Full Ingredient Stack ────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              What's Inside Base Layer
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              6 active ingredients, each chosen for fast absorption and zero greasiness.
              No petroleum. No mineral oil. No silicones. No fragrance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Timer,
                  name: "Squalane",
                  slug: "squalane",
                  desc: "Biomimetic oil that absorbs in 15 seconds. The non-greasy base of the entire formula.",
                },
                {
                  icon: Droplets,
                  name: "Niacinamide (5%)",
                  slug: "niacinamide",
                  desc: "Regulates sebum production so your skin stays matte. Visible oil reduction in 7 days.",
                },
                {
                  icon: FlaskConical,
                  name: "Copper Peptide GHK-Cu (0.03%)",
                  slug: "copper-peptide",
                  desc: "Stimulates collagen synthesis. Firmer, younger-looking skin in 4-8 weeks.",
                },
                {
                  icon: Shield,
                  name: "Panthenol (2%)",
                  slug: "panthenol",
                  desc: "Water-soluble moisturizer that calms post-shave redness without any greasy residue.",
                },
                {
                  icon: Leaf,
                  name: "Centella Asiatica",
                  slug: "centella-asiatica",
                  desc: "Anti-inflammatory that rebuilds your moisture barrier. Soothes without a film.",
                },
                {
                  icon: Zap,
                  name: "Hyaluronic Acid",
                  slug: "hyaluronic-acid",
                  desc: "Holds 1,000x its weight in water. Hydrates beneath the surface, with zero shine on top.",
                },
              ].map((ing) => (
                <Link
                  key={ing.slug}
                  to={`/ingredients/${ing.slug}`}
                  className="group block bg-card p-6 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <ing.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold group-hover:underline underline-offset-4">
                      {ing.name}
                    </h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">{ing.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── The 15-Second Test ────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-6">
              The 15-Second Test
            </h2>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6 text-center max-w-2xl mx-auto">
              Put it on. Count to 15. Touch your face. If you feel a film or residue, it is sitting
              on your skin instead of absorbing into it. Base Layer passes every time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  time: "0 sec",
                  title: "Apply",
                  desc: "One pump, spread across face and neck. Lightweight gel-cream texture.",
                },
                {
                  time: "8 sec",
                  title: "Absorbing",
                  desc: "Squalane integrates into your lipid barrier. You can feel it disappearing.",
                },
                {
                  time: "15 sec",
                  title: "Done",
                  desc: "Touch your face. It feels like bare skin. No film. No residue. No shine.",
                },
              ].map((step) => (
                <div key={step.time} className="bg-background p-6 rounded-lg border border-border text-center">
                  <span className="font-heading text-2xl font-bold text-primary">{step.time}</span>
                  <h3 className="font-heading text-sm font-bold uppercase mt-2 mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Common Greasy Ingredients to Avoid ───────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-6">
              Ingredients That Make Moisturizers Feel Heavy
            </h2>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-8">
              If your current moisturizer leaves a film after applying, check the ingredient list.
              These are the most common culprits that sit on your skin instead of absorbing:
            </p>

            <div className="space-y-4">
              {[
                {
                  name: "Mineral Oil / Petrolatum",
                  why: "Large-molecule occlusives that form a plastic-like film on skin. They're cheap and effective at trapping moisture, but they feel terrible on skin that's already producing plenty of its own oil.",
                },
                {
                  name: "Dimethicone / Cyclomethicone",
                  why: "Silicones create a smooth, silky feel but can trap sebum and bacteria underneath. Often the reason 'lightweight' moisturizers still cause breakouts.",
                },
                {
                  name: "Coconut Oil / Cocoa Butter",
                  why: "Heavy emollients with high comedogenicity ratings. Popular in 'natural' products but terrible for oily or acne-prone skin.",
                },
                {
                  name: "Isopropyl Myristate",
                  why: "An emollient used to improve 'spreadability' that's rated 5/5 on the comedogenicity scale. One of the worst pore-cloggers in conventional skincare.",
                },
                {
                  name: "Lanolin",
                  why: "A wool-derived wax that's extremely moisturizing but leaves a heavy, waxy feel. Great for dry winter skin, not so great for daily wear on oilier skin.",
                },
              ].map((item) => (
                <div key={item.name} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-heading font-bold text-sm mb-1">{item.name}</h3>
                  <p className="font-body text-sm text-muted-foreground">{item.why}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-lg border border-primary/30 bg-card">
              <p className="font-body text-sm text-foreground">
                <strong>Base Layer contains none of these.</strong> Our formula uses squalane,
                hyaluronic acid, niacinamide, copper peptide, panthenol, and centella asiatica:
                ingredients that absorb into your skin rather than coating it.{" "}
                <Link to="/face-cream" className="text-primary hover:underline">
                  See the full ingredient list
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Skin Concerns ────────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              Fits Oily, Combination, And Active Lifestyles
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Non-greasy does not mean non-hydrating. Base Layer delivers deep moisture for dry skin
              and oil control for oily skin simultaneously.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Oily Skin",
                  slug: "oily-skin-men",
                  desc: "Shiny forehead and nose by noon, even after washing. Niacinamide regulates oil while squalane absorbs without adding shine.",
                },
                {
                  title: "Dry Skin",
                  slug: "dry-dehydrated-skin-men",
                  desc: "Tight, flaky patches after showering or in dry office air. Hyaluronic acid hydrates and panthenol repairs the moisture barrier.",
                },
                {
                  title: "Sensitive Skin",
                  slug: "sensitive-skin-men",
                  desc: "Redness, stinging, and reactions to most products. Fragrance-free formula with centella and panthenol to calm and protect.",
                },
                {
                  title: "Dark Circles",
                  slug: "dark-circles-men",
                  desc: "Tired-looking under-eyes on Zoom calls. Copper peptide and hyaluronic acid plump and firm the delicate eye area.",
                },
              ].map((item) => (
                <Link
                  key={item.slug}
                  to={`/skin-concerns/${item.slug}`}
                  className="group block bg-background p-5 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <h3 className="font-heading font-bold text-sm uppercase mb-2 group-hover:underline underline-offset-4">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                  <p className="font-body text-xs text-primary mt-2 flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof ─────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              What A Clean Finish Actually Feels Like
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Derek R.",
                  age: 33,
                  skinType: "Oily",
                  quote:
                    "I've thrown out more moisturizers than I can count because they felt like Vaseline going on. This one goes on like a light gel and just disappears. My skin feels like skin, not like it's wearing something.",
                },
                {
                  name: "Jason T.",
                  age: 29,
                  skinType: "Combination",
                  quote:
                    "I put it on before the gym at 6am and I'm out the door in under a minute. No greasy hands, nothing to wipe off, nothing that transfers onto my phone screen.",
                },
                {
                  name: "Alex P.",
                  age: 36,
                  skinType: "Sensitive",
                  quote:
                    "I use it right after shaving. No sting, no film, no grease. Ten minutes later I genuinely forget I put anything on, which is kind of the whole point.",
                },
              ].map((t) => (
                <div key={t.name} className="bg-card p-6 rounded-lg border border-border">
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm">
                      {t.name}, {t.age}
                    </span>
                    <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                      {t.skinType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Proposition ─────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide mb-6">
              $38. Clean Texture. Real Ingredients.
            </h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Most non-greasy options sacrifice results for texture. Base Layer does not. You get
              6 active ingredients that actually improve your skin and a feel-nothing finish that
              disappears on contact. One pump, $0.34/day.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { stat: "15s", label: "Absorption Time" },
                { stat: "$38", label: "Per Bottle" },
                { stat: "6-8wk", label: "Bottle Life" },
              ].map((item) => (
                <div key={item.label} className="bg-background p-4 rounded-lg border border-border">
                  <p className="font-heading text-2xl font-bold text-primary">{item.stat}</p>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="font-body text-[11px] text-muted-foreground/60 mt-4 text-center uppercase tracking-wider">
              In stock, ships in 1-2 business days
            </p>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="font-body text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Related Pages ────────────────────────────────────────── */}
        <section className="px-6 py-16 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-center mb-8">
              Related Guides
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Best Men's Moisturizers Compared", path: "/comparisons/best-mens-face-moisturizers-compared" },
                { label: "CeraVe vs Base Layer", path: "/comparisons/cerave-vs-base-layer" },
                { label: "Aging & Wrinkles Guide", path: "/skin-concerns/aging-wrinkles-men" },
                { label: "Squalane Deep Dive", path: "/ingredients/squalane" },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="bg-background p-4 rounded-lg border border-border hover:bg-muted transition-colors text-center"
                >
                  <span className="font-heading font-bold text-sm">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related Reading ──────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-center mb-6">
              Related Reading
            </h2>
            <ul className="space-y-3 font-body text-sm text-center">
              <li>
                <Link to="/matte-moisturizer-for-men" className="text-primary hover:underline">
                  Fighting shine more than grease? See the matte moisturizer for men.
                </Link>
              </li>
              <li>
                <Link to="/all-in-one-skincare-for-men" className="text-primary hover:underline">
                  See how one bottle replaces your serum, moisturizer, and eye cream.
                </Link>
              </li>
              <li>
                <Link to="/face-cream" className="text-primary hover:underline">
                  Full ingredient list and pricing for the Base Layer Daily Face Cream.
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <section className="px-6 py-20 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4">
            Try The Non-Greasy Option
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            $38. Absorbs in 15 seconds. No subscription required. In stock, ships in 1-2 business days.
          </p>
          <Link
            to="/face-cream"
            className={buttonVariants({ variant: "hero", size: "lg", className: "px-12 py-6 text-sm" })}
            onClick={() => {
              trackEvent("cta_click", {
                content_name: "Non-Greasy Moisturizer for Men",
                content_ids: ["base-layer-face-cream"],
                value: 38.0,
                currency: "USD",
              });
              trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "non_greasy_bottom" });
            }}
          >
            <span className="relative z-10">GRAB YOURS: $38</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NonGreasyMoisturizer;
