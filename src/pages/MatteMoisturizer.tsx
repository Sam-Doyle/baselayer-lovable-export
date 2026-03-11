import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { Droplets, Timer, Shield, Leaf, Sun, FlaskConical, CheckCircle2, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import routineGraphic from "@/assets/generated-creatives/content_visual_routine_graphic_1772738778419.png";
import absorptionDiagram from "@/assets/generated-creatives/content_visual_absorption_diagram_1772738792625.png";

/* ── Structured Data ────────────────────────────────────────────── */

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream — Matte Moisturizer for Men",
  description:
    "Matte-finish men's face moisturizer with niacinamide 5% and squalane. Controls shine all day without drying your skin. Fragrance-free. $38.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
    url: "https://baselayerskin.co/matte-moisturizer-for-men",
    priceValidUntil: "2026-12-31",
  },
  image: "https://baselayerskin.co/og-face-cream.jpg",
  url: "https://baselayerskin.co/matte-moisturizer-for-men",
  sku: "BL-PDFC-50ML",
};

/* ── FAQ Data ───────────────────────────────────────────────────── */

const faqs = [
  {
    question: "What makes a moisturizer matte?",
    answer:
      "A matte moisturizer uses lightweight, fast-absorbing emollients instead of heavy petroleum-based oils. Base Layer uses squalane, which mimics your skin's natural sebum, absorbs in about 15 seconds, and leaves zero shine. Niacinamide at 5% actively regulates sebum production so your skin produces less oil throughout the day.",
  },
  {
    question: "Will a matte moisturizer dry out my skin?",
    answer:
      "Not if it's formulated correctly. Cheap matte products use alcohol or mattifying powders that strip moisture and cause rebound oiliness. Base Layer hydrates deeply with hyaluronic acid (holds 1,000x its weight in water) while niacinamide and squalane keep the surface matte. You get hydration without the shine.",
  },
  {
    question: "How long does the matte finish last?",
    answer:
      "Most users report a matte finish that holds for 8-12 hours. Niacinamide reduces sebum production at the source, so oil doesn't just get absorbed — it's produced less in the first place. In hot or humid conditions, you may notice a slight natural glow by late afternoon, but nothing close to the greasy look of untreated skin.",
  },
  {
    question: "Can I use this under sunscreen or makeup?",
    answer:
      "Yes. The fast-absorbing squalane base creates a smooth, non-greasy layer that works well under SPF or concealer. Apply Base Layer first, wait 30-60 seconds, then apply your sunscreen. No pilling, no sliding.",
  },
  {
    question: "Is this good for oily skin?",
    answer:
      "It's designed for oily skin. Niacinamide at 5% is clinically proven to reduce sebum production. Squalane is non-comedogenic and won't clog pores. Hyaluronic acid provides lightweight hydration without adding oil. If you have oily skin, this is the moisturizer that finally makes sense.",
  },
  {
    question: "How is this different from using a mattifying primer?",
    answer:
      "A mattifying primer sits on top of your skin and absorbs oil temporarily — it doesn't actually improve your skin. Base Layer works at the cellular level: niacinamide regulates sebum production, copper peptide stimulates collagen, and centella asiatica repairs your moisture barrier. You get a matte finish AND better skin over time.",
  },
  {
    question: "What's the price and how long does it last?",
    answer:
      "Base Layer is $38 for 50 mL. One bottle lasts 6-8 weeks with daily use (one pump, morning and night). No subscription required — buy when you need it.",
  },
  {
    question: "Is it fragrance-free?",
    answer:
      "Yes. Base Layer contains zero fragrance, synthetic or natural. Fragrance is one of the most common causes of skin irritation in men's skincare. We left it out entirely.",
  },
];

/* ── Component ──────────────────────────────────────────────────── */

const MatteMoisturizer = () => {
  const { openModal } = useEarlyAccess();

  useCanonical();
  useMetaTags({
    title: "Matte Moisturizer for Men | Lightweight Moisture Without Shine",
    description:
      "Matte moisturizer for men with niacinamide 5% and squalane. Controls shine 8-12 hours, absorbs in 15 seconds. $38 — try Base Layer.",
    type: "product",
    image: "https://baselayerskin.co/og-face-cream.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", {
      content_name: "Matte Moisturizer for Men — Landing Page",
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
            { name: "Matte Moisturizer for Men" },
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
              <span className="text-foreground">Matte Moisturizer</span>
            </nav>

            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Base Layer
            </p>

            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-6">
              Matte Moisturizer for Men — Zero Shine, All Day
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              If your face looks slick by noon, your moisturizer should not be making that worse.
              Base Layer uses niacinamide at 5% to dial back the oil your skin produces throughout the
              day, while squalane absorbs in about 15 seconds and leaves nothing on the surface.
              The result is a matte finish that holds 8-12 hours without powders, alcohol, or tricks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button
                variant="hero"
                size="lg"
                className="w-full sm:w-auto px-12 py-6 text-sm"
                onClick={() => {
                  trackEvent("cta_click", {
                    content_name: "Matte Moisturizer for Men",
                    content_ids: ["base-layer-face-cream"],
                    value: 38.0,
                    currency: "USD",
                  });
                  openModal("matte_moisturizer_hero");
                }}
              >
                GET EARLY ACCESS — $38
              </Button>
            </div>

            <p className="font-body text-xs text-muted-foreground">
              Fragrance-free. $0.34/day. No subscription lock-in.
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
              Why Your Face Gets Shiny By Lunch
            </h2>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              You apply moisturizer at 7am. By 11am you are touching your forehead and it feels slick.
              By noon your forehead and nose are reflecting the overhead lights. The problem is
              not your skin — it is your moisturizer. Most formulas use petroleum-based oils designed
              for drier skin types. On men's skin, which is{" "}
              <strong className="text-foreground">20% thicker</strong> and already produces more
              sebum, those heavy bases just pile on.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              The alternative most guys try is skipping moisturizer entirely. But dehydrated skin
              compensates by producing <em>even more</em> oil. You end up shinier than before, with
              tighter, more irritated skin underneath. The actual solution is a moisturizer that
              hydrates below the surface while keeping the top layer dry.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed">
              That takes two things: a base that absorbs fast enough to never sit on top (squalane),
              and an active that tells your sebaceous glands to ease up (niacinamide at 5%).
              Base Layer does both.
            </p>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              How Base Layer Achieves a Matte Finish
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              No powders. No alcohol. No tricks. Just two ingredients working together to control
              oil and hydrate simultaneously.
            </p>

            <div className="rounded-lg border border-border overflow-hidden bg-card mb-12">
              <img
                src={absorptionDiagram}
                alt="Clinical diagram showing how Base Layer absorbs through the epidermis in 15 seconds for a matte finish"
                className="w-full h-auto"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Droplets className="w-8 h-8 text-primary flex-shrink-0" />
                  <h3 className="font-heading text-lg font-bold uppercase">
                    <Link to="/ingredients/niacinamide" className="hover:underline underline-offset-4">
                      Niacinamide (5%)
                    </Link>
                  </h3>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  Niacinamide is the gold standard for oil control. At 5% concentration, it
                  regulates sebum production at the cellular level — meaning your skin produces less
                  oil in the first place, rather than just absorbing it after the fact.
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Clinical studies show visible shine reduction within 7 days. By week four,
                  participants had measurably lower sebum output. This isn't a temporary fix — it's a
                  long-term recalibration of your skin's oil production.
                </p>
              </div>

              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Timer className="w-8 h-8 text-primary flex-shrink-0" />
                  <h3 className="font-heading text-lg font-bold uppercase">
                    <Link to="/ingredients/squalane" className="hover:underline underline-offset-4">
                      Squalane
                    </Link>
                  </h3>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  Squalane is a biomimetic oil — it matches the molecular structure of your skin's
                  natural sebum. That's why it absorbs in about 15 seconds and leaves zero residue.
                  Your skin treats it as its own, pulling it beneath the surface instantly.
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Compare that to petroleum-based moisturizers (mineral oil, petrolatum) that sit on
                  top of your skin like a plastic wrap, trapping heat and oil underneath. Squalane
                  hydrates without any of that — matte on top, moisturized underneath.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Full Ingredient Stack ────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              6 Active Ingredients, One Matte Formula
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Every ingredient pulls double duty: oil control on the surface, active treatment
              underneath. Here's what each one does for a matte finish specifically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Droplets,
                  name: "Niacinamide (5%)",
                  slug: "niacinamide",
                  benefit: "Controls sebum, shrinks pores, evens skin tone",
                  matteRole: "Primary oil regulator — reduces shine within 7 days",
                },
                {
                  icon: FlaskConical,
                  name: "Copper Peptide GHK-Cu (1%)",
                  slug: "copper-peptide",
                  benefit: "Stimulates collagen, firms skin, reduces fine lines",
                  matteRole: "Strengthens skin structure without adding oil",
                },
                {
                  icon: Shield,
                  name: "Panthenol (2%)",
                  slug: "panthenol",
                  benefit: "Calms post-shave redness, repairs skin barrier",
                  matteRole: "Soothes without a greasy film — water-soluble moisturizer",
                },
                {
                  icon: Leaf,
                  name: "Centella Asiatica",
                  slug: "centella-asiatica",
                  benefit: "Anti-inflammatory, rebuilds moisture barrier",
                  matteRole: "Reduces irritation that triggers excess oil production",
                },
                {
                  icon: Timer,
                  name: "Squalane",
                  slug: "squalane",
                  benefit: "Absorbs in 15 seconds, zero residue",
                  matteRole: "The fast-absorbing base that keeps the finish matte",
                },
                {
                  icon: Sun,
                  name: "Hyaluronic Acid",
                  slug: "hyaluronic-acid",
                  benefit: "Holds 1,000x its weight in water — plumps fine lines",
                  matteRole: "Deep hydration that never reaches the surface as shine",
                },
              ].map((ing) => (
                <Link
                  key={ing.slug}
                  to={`/ingredients/${ing.slug}`}
                  className="group block bg-background p-6 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <ing.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold group-hover:underline underline-offset-4">
                      {ing.name}
                    </h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-2">{ing.benefit}</p>
                  <p className="font-body text-xs text-primary/80">
                    Matte role: {ing.matteRole}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Matte vs. Greasy Comparison ──────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              Matte Moisturizer vs. Regular Moisturizer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-heading font-bold uppercase text-sm mb-4 text-muted-foreground">
                  Typical Moisturizer
                </h3>
                <ul className="space-y-3">
                  {[
                    "Petroleum/mineral oil base sits on skin",
                    "Greasy residue within 30 minutes",
                    "Clogs pores, triggers breakouts",
                    "Fragranced to mask the greasy feel",
                    "Formulated for women's thinner skin",
                    "No sebum regulation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                      <span className="text-destructive mt-0.5">x</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card p-6 rounded-lg border border-primary/30">
                <h3 className="font-heading font-bold uppercase text-sm mb-4 text-primary">
                  Base Layer (Matte)
                </h3>
                <ul className="space-y-3">
                  {[
                    "Squalane base absorbs in 15 seconds",
                    "Matte finish lasts 8-12 hours",
                    "Non-comedogenic — won't clog pores",
                    "Zero fragrance, zero irritation",
                    "Formulated for men's thicker, oilier skin",
                    "Niacinamide actively reduces oil production",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who It's For ─────────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              Who This Is Actually For
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Whether you are on back-to-back video calls, working in a dry office, or hitting
              the gym after work, Base Layer keeps your face matte and comfortable all day.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Oily Skin",
                  slug: "oily-skin-men",
                  desc: "Your forehead and nose are shiny by lunch and blotting papers are a regular habit. Niacinamide reduces oil production at the source so you stop managing the shine and start producing less of it.",
                },
                {
                  title: "Combination Skin",
                  slug: "oily-skin-men",
                  desc: "Oily forehead but dry cheeks, especially in winter or after shaving. Squalane balances both areas — hydrating where you need it without adding oil where you do not.",
                },
                {
                  title: "Acne-Prone Skin",
                  slug: "acne-prone-skin-men",
                  desc: "You get breakouts after using heavy moisturizers. This formula is non-comedogenic, fragrance-free, and uses centella asiatica to calm the inflammation that triggers new spots.",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  to={`/skin-concerns/${item.slug}`}
                  className="group block bg-background p-6 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <h3 className="font-heading font-bold uppercase mb-3 group-hover:underline underline-offset-4">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                  <p className="font-body text-xs text-primary mt-3 flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Science of Matte ─────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-6">
              What Actually Happens On Your Skin
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Why You Look Oily By Midday
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  Shine comes from sebum — an oily substance produced by your sebaceous glands.
                  Men's sebaceous glands are larger and more active than women's, which is why men
                  tend to have oilier skin. Sebum production is regulated by androgens (testosterone
                  and DHT), which is why men's oil production remains high well into their 40s and
                  50s, while women's decreases after menopause.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  How Niacinamide Controls Oil
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  <Link to="/ingredients/niacinamide" className="text-primary hover:underline">
                    Niacinamide
                  </Link>{" "}
                  (vitamin B3) works by regulating the production of fatty acids and ceramides in
                  sebaceous glands. A 2006 study in the <em>Journal of Cosmetic Dermatology</em>{" "}
                  found that 2% niacinamide reduced sebum production rate by over 20% after 4 weeks.
                  Base Layer uses 5% — the concentration where efficacy plateaus without irritation.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Why Squalane Doesn't Leave a Greasy Feel
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  <Link to="/ingredients/squalane" className="text-primary hover:underline">
                    Squalane
                  </Link>{" "}
                  is the hydrogenated form of squalene, a lipid your skin already produces naturally.
                  Because its molecular structure is nearly identical to your skin's own oils, it
                  absorbs almost instantly. Petroleum-derived moisturizers (mineral oil, petrolatum)
                  have much larger molecules that sit on the skin's surface, creating that familiar
                  greasy film. Squalane delivers the same moisturizing benefit without the surface
                  residue.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  The Hydration-Without-Shine Effect
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  <Link to="/ingredients/hyaluronic-acid" className="text-primary hover:underline">
                    Hyaluronic acid
                  </Link>{" "}
                  is a humectant, not an emollient. It draws water into the deeper layers of your
                  skin (the dermis) rather than coating the surface. This means your skin stays
                  plump and hydrated beneath the surface while the top layer — the part everyone
                  sees — stays dry and matte. It's the perfect complement to niacinamide's
                  oil-reducing effect.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How to Use ───────────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              How to Use
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Cleanse",
                  desc: "Wash your face with a gentle cleanser after you wake up or get out of the shower. Pat dry. Takes 30 seconds.",
                },
                {
                  step: "02",
                  title: "Apply Base Layer",
                  desc: "One pump. Spread across face and neck. It goes on like a lightweight gel and vanishes into your skin. Matte to the touch in about 15 seconds — before you finish getting dressed.",
                },
                {
                  step: "03",
                  title: "SPF (Morning)",
                  desc: "Apply sunscreen. That is your entire routine. Cleanser, Base Layer, SPF. Out the door.",
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <span className="font-heading text-4xl font-black text-primary/20">{s.step}</span>
                  <h3 className="font-heading text-lg font-bold uppercase mt-2 mb-2">{s.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof ─────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              What The Matte Finish Feels Like, According To Real Users
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Sean G.",
                  age: 31,
                  skinType: "Oily",
                  quote:
                    "I work in an open office. Used to catch my reflection in the monitor around 11am and my forehead was shining. After a week with Base Layer, I touched it and it felt dry. That had never happened before.",
                },
                {
                  name: "Matt M.",
                  age: 28,
                  skinType: "Combination",
                  quote:
                    "I used to blot my face with a napkin before every client meeting. Base Layer keeps me matte through back-to-back calls without thinking about it.",
                },
                {
                  name: "Cooper S.",
                  age: 35,
                  skinType: "Sensitive",
                  quote:
                    "Every other matte product dried out my cheeks after shaving while my nose stayed oily. This one balances both. No dry patches, no shine. Just normal-looking skin.",
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
              $38. Replaces 3 Products.
            </h2>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Most matte moisturizers only handle shine. You still need a serum for aging and a
              separate eye cream. That stack runs $80-$150. Base Layer handles all three with 6
              active ingredients in one pump. Same matte finish, broader results, lower cost.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Matte Moisturizer", typicalPrice: "$25-45" },
                { label: "Vitamin C Serum", typicalPrice: "$30-60" },
                { label: "Eye Cream", typicalPrice: "$25-50" },
              ].map((item) => (
                <div key={item.label} className="bg-background p-4 rounded-lg border border-border">
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className="font-heading font-bold text-muted-foreground line-through">
                    {item.typicalPrice}
                  </p>
                </div>
              ))}
            </div>

            <p className="font-heading text-3xl font-bold mb-2">
              Base Layer: <span className="text-primary">$38</span>
            </p>
            <p className="font-body text-sm text-muted-foreground">
              All six actives. One bottle. 6-8 weeks of daily use.
            </p>
            <p className="font-body text-[11px] text-muted-foreground/60 mt-2 uppercase tracking-wider">
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
                { label: "Oily Skin Guide", path: "/skin-concerns/oily-skin-men" },
                { label: "Sensitive Skin Guide", path: "/skin-concerns/sensitive-skin-men" },
                { label: "Best Men's Moisturizers Compared", path: "/comparisons/best-mens-face-moisturizers-compared" },
                { label: "CeraVe vs Base Layer", path: "/comparisons/cerave-vs-base-layer" },
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
            Shop The Matte Formula
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            $38 pre-launch. No subscription traps. Shipping Spring 2026.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="px-12 py-6 text-sm"
            onClick={() => {
              trackEvent("cta_click", {
                content_name: "Matte Moisturizer for Men",
                content_ids: ["base-layer-face-cream"],
                value: 38.0,
                currency: "USD",
              });
              openModal("matte_moisturizer_bottom");
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

export default MatteMoisturizer;
