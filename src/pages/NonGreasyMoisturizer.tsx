import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { Droplets, Timer, Shield, Leaf, Zap, FlaskConical, CheckCircle2, ArrowRight, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import routineGraphic from "@/assets/generated-creatives/content_visual_routine_graphic_1772738778419.png";
import absorptionDiagram from "@/assets/generated-creatives/content_visual_absorption_diagram_1772738792625.png";

/* ── Structured Data ────────────────────────────────────────────── */

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream — Non-Greasy Moisturizer for Men",
  description:
    "Non-greasy men's face moisturizer that absorbs in 15 seconds. Squalane-based formula with niacinamide 5%, copper peptide, and hyaluronic acid. No residue. $38.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
    url: "https://baselayerskin.co/non-greasy-moisturizer-for-men",
    priceValidUntil: "2026-12-31",
  },
  image: "https://baselayerskin.co/og-face-cream.jpg",
  url: "https://baselayerskin.co/non-greasy-moisturizer-for-men",
  sku: "BL-PDFC-50ML",
};

/* ── FAQ Data ───────────────────────────────────────────────────── */

const faqs = [
  {
    question: "Why do most moisturizers feel greasy on men's skin?",
    answer:
      "Two reasons. First, most moisturizers are formulated for women's skin, which is thinner and produces less oil — so they use heavy, occlusive bases (petroleum, mineral oil) designed to lock moisture into drier skin. Second, men's skin produces significantly more sebum due to higher testosterone levels. Put a heavy moisturizer on already-oily skin and you get that greasy, sticky feel within minutes.",
  },
  {
    question: "How does Base Layer absorb so fast?",
    answer:
      "The base is squalane, a biomimetic oil that matches your skin's natural lipid structure. Because your skin recognizes it as 'self,' it absorbs in roughly 15 seconds — compared to 2-5 minutes for petroleum-based formulas. There's no residue because the molecules are small enough to integrate into your skin's lipid barrier rather than sitting on top of it.",
  },
  {
    question: "Will this clog my pores?",
    answer:
      "No. Every ingredient in Base Layer is non-comedogenic. Squalane has a comedogenicity rating of 0 (the lowest possible). Niacinamide actually helps minimize pore appearance by regulating oil production. If you've been breaking out from other moisturizers, it's likely because they contain pore-clogging ingredients like coconut oil, cocoa butter, or isopropyl myristate. Base Layer has none of those.",
  },
  {
    question: "I have oily skin — do I even need a moisturizer?",
    answer:
      "Yes. Oily skin and dehydrated skin aren't mutually exclusive — in fact, they often go together. When your skin is dehydrated (lacking water), it compensates by producing even more sebum (oil). A lightweight, non-greasy moisturizer like Base Layer breaks the cycle: hyaluronic acid delivers water-based hydration while niacinamide reduces excess oil production.",
  },
  {
    question: "Can I use this before applying sunscreen?",
    answer:
      "Absolutely. Base Layer's fast absorption makes it an ideal base for SPF. Apply one pump, wait 15-30 seconds, then apply your sunscreen. Because there's no greasy residue, your sunscreen won't pill or slide off throughout the day.",
  },
  {
    question: "How is this different from gel moisturizers?",
    answer:
      "Gel moisturizers are lightweight but often rely on silicones for their smooth feel — these can trap bacteria and cause breakouts over time. Many also lack the active ingredients needed for anti-aging or oil control. Base Layer uses a squalane base (no silicones) with 6 active ingredients including copper peptide and niacinamide. You get the lightweight feel of a gel with the performance of a treatment product.",
  },
  {
    question: "How long does one bottle last?",
    answer:
      "One bottle (50 mL) lasts 6-8 weeks with daily use — one pump morning and night. That's roughly $0.34/day for a complete moisturizer, serum, and eye cream replacement.",
  },
  {
    question: "Is there a subscription?",
    answer:
      "No. We don't do subscriptions. Buy when you need it. One bottle, $38, ships free.",
  },
];

/* ── Component ──────────────────────────────────────────────────── */

const NonGreasyMoisturizer = () => {
  const { openModal } = useEarlyAccess();

  useCanonical();
  useMetaTags({
    title: "Non-Greasy Moisturizer for Men | Fast Absorption, Clean Finish",
    description:
      "Non-greasy moisturizer for men that absorbs in 15 seconds with zero residue. Squalane-based, fragrance-free. $38 — try Base Layer.",
    type: "product",
    image: "https://baselayerskin.co/og-face-cream.jpg",
  });

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
              Non-Greasy Moisturizer for Men — Lightweight Daily Hydration
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Good skincare should disappear after you apply it, not follow you around all day.
              Base Layer uses a squalane base that matches your skin's own lipid structure, so it
              absorbs completely in about 15 seconds. No slick residue, no waxy film, no wiping
              your hands on your jeans after applying.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button
                variant="hero"
                size="lg"
                className="w-full sm:w-auto px-12 py-6 text-sm"
                onClick={() => {
                  trackEvent("cta_click", {
                    content_name: "Non-Greasy Moisturizer for Men",
                    content_ids: ["base-layer-face-cream"],
                    value: 38.0,
                    currency: "USD",
                  });
                  openModal("non_greasy_hero");
                }}
              >
                GET EARLY ACCESS — $38
              </Button>
            </div>

            <p className="font-body text-xs text-muted-foreground">
              Zero fragrance. Zero residue. Free shipping.
            </p>
          </div>
        </section>

        {/* ── 15-Second Routine ────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <img
                src={routineGraphic}
                alt="The 15-second Base Layer routine: 1. Wash, 2. Apply, 3. Done"
                className="w-full h-auto"
                loading="lazy"
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
              You try a moisturizer. It feels like you smeared cooking oil on your face. You wipe
              your hands on a towel. Twenty minutes later your skin still feels coated. According
              to Mintel research, <strong className="text-foreground">73% of men</strong> who have
              tried a face moisturizer say the greasy feel was their top complaint. They try one
              product, hate the texture, and quit. The problem is not discipline. It is that most
              moisturizers were not designed for skin that already produces plenty of its own oil.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Most formulas use petroleum-based emollients (mineral oil, petrolatum, dimethicone)
              that create an occlusive layer on your skin. These ingredients were designed for drier
              skin that needs help retaining moisture. On men's thicker, oilier skin, they just sit
              there.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Then there are the "lightweight" gel moisturizers. They absorb faster but rely on
              silicones for that smooth finish. Silicones can trap bacteria and sebum beneath a
              synthetic film, leading to clogged pores and breakouts over time.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed">
              The fix is a moisturizer built around ingredients that absorb into the skin rather
              than sitting on top of it. That is exactly what Base Layer is.
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
                src={absorptionDiagram}
                alt="Clinical diagram showing how squalane absorbs through the epidermis in 15 seconds with zero residue"
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
                      detail: "2-5 minutes — often never fully absorbs",
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
                      detail: "Integrates into your skin's lipid barrier — hydrates from within",
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
                      detail: "Comedogenicity rating of 0 — the lowest possible",
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
                  name: "Copper Peptide GHK-Cu (1%)",
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
                  desc: "Holds 1,000x its weight in water. Hydrates beneath the surface — zero shine on top.",
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
                  desc: "Touch your face — it feels like bare skin. No film. No residue. No shine.",
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
                  why: "Large-molecule occlusives that form a plastic-like film on skin. They're cheap and effective at trapping moisture — but they feel terrible on oily male skin.",
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
                  why: "A wool-derived wax that's extremely moisturizing but leaves a heavy, waxy feel. Great for dry winter skin — terrible for daily use on men's faces.",
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
                hyaluronic acid, niacinamide, copper peptide, panthenol, and centella asiatica —
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
                  name: "Sean G.",
                  age: 31,
                  skinType: "Oily",
                  quote:
                    "I have thrown away so many moisturizers because they felt like Vaseline on my face. Base Layer goes on, disappears, and my skin just feels like skin. Except better.",
                },
                {
                  name: "Matt M.",
                  age: 28,
                  skinType: "Combination",
                  quote:
                    "I put it on before the gym at 6am. By the time I shower and get to work, my face feels clean and hydrated. I can put on sunglasses immediately after applying and nothing transfers.",
                },
                {
                  name: "Cooper S.",
                  age: 35,
                  skinType: "Sensitive",
                  quote:
                    "I applied it right after shaving and felt nothing. No sting, no film, no grease. Twenty minutes later I forgot I had applied anything. That is the entire review.",
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
              Pre-launch — shipping Spring 2026
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

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <section className="px-6 py-20 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4">
            Try The Non-Greasy Option
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            $38. Absorbs in 15 seconds. No subscription. Shipping Spring 2026.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="px-12 py-6 text-sm"
            onClick={() => {
              trackEvent("cta_click", {
                content_name: "Non-Greasy Moisturizer for Men",
                content_ids: ["base-layer-face-cream"],
                value: 38.0,
                currency: "USD",
              });
              openModal("non_greasy_bottom");
            }}
          >
            GET EARLY ACCESS — $38
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NonGreasyMoisturizer;
