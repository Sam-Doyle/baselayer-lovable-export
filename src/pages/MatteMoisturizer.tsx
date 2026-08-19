import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buttonVariants } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { metaFor } from "@/config/pageSeo";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { Droplets, Timer, Shield, Leaf, Sun, FlaskConical, CheckCircle2, ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import matteUgc from "@/assets/ugc-cooper.jpg";
import bottleBackLabel from "@/assets/product-source/bottle-back-ingredients.webp";
import { merchantOfferFields } from "@/config/merchantSchema";

/* ── Structured Data ────────────────────────────────────────────── */

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream: Matte Moisturizer for Men",
  description:
    "Matte-finish men's face moisturizer with niacinamide 5% and squalane. Controls shine all day without drying your skin. Fragrance-free. $38.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://baselayerskin.co/matte-moisturizer-for-men",
    priceValidUntil: "2026-12-31",
    ...merchantOfferFields("38.00"),
  },
  image: "https://baselayerskin.co/og-mountain-product-v2.jpg",
  url: "https://baselayerskin.co/matte-moisturizer-for-men",
  sku: "BL-PDFC-50ML",
};

/* ── FAQ Data ───────────────────────────────────────────────────── */

const faqs = [
  {
    question: "Why is my face shiny by midday, even right after I wash it?",
    answer:
      "Washing removes the oil that's already on your skin, not the sebum your glands are about to produce next. Men's sebaceous glands are larger and more active than women's, and testosterone keeps them running well past your 20s. If your moisturizer is heavy or occlusive, it adds a second layer on top of that new sebum instead of doing anything about it. Niacinamide is the piece most guys are missing. It works on the gland itself, not just what's already sitting on your skin.",
  },
  {
    question: "What makes a moisturizer matte?",
    answer:
      "A matte moisturizer uses lightweight, fast-absorbing emollients instead of heavy petroleum-based oils. Base Layer uses squalane, which mimics your skin's natural sebum, absorbs in about 15 seconds, and leaves zero shine. Niacinamide at 5% regulates sebum production, so your skin produces less oil throughout the day instead of just having that oil sit there.",
  },
  {
    question: "Is a matte moisturizer the same as a mattifying powder or primer?",
    answer:
      "No, and that mix-up is why some guys think matte skincare doesn't work. A powder or primer sits on top of your skin and physically blocks shine for a few hours, then you reapply. Base Layer is a moisturizer with niacinamide in it: it absorbs into your skin and tells your sebaceous glands to produce less oil over time. You don't touch it up at 2pm. You put it on once in the morning.",
  },
  {
    question: "Will a matte moisturizer dry out my skin?",
    answer:
      "Not if it's formulated correctly. Cheap matte products use alcohol or mattifying powders that strip moisture and cause rebound oiliness. Base Layer hydrates deeply with hyaluronic acid (holds 1,000x its weight in water) while niacinamide and squalane keep the surface matte. You get hydration without the shine.",
  },
  {
    question: "How long does the matte finish last?",
    answer:
      "Most guys get a matte finish that holds for 8 to 12 hours. Niacinamide works upstream: your skin produces less oil in the first place, instead of that oil getting blotted or absorbed after the fact. In hot or humid conditions you might notice a slight natural glow by late afternoon, but nothing close to the shine you'd get from untreated skin.",
  },
  {
    question: "Can I use this under sunscreen or makeup?",
    answer:
      "Yes. The fast-absorbing squalane base creates a smooth, non-greasy layer that works well under SPF or concealer. Apply Base Layer first, wait 30 to 60 seconds, then apply your sunscreen. No pilling, no sliding.",
  },
  {
    question: "Is this good for oily skin?",
    answer:
      "It's built for oily skin specifically. Niacinamide at 5% is one of the best-studied ingredients for regulating sebum production. Squalane is non-comedogenic and won't clog pores. Hyaluronic acid provides lightweight hydration without adding any oil of its own. If you have oily skin, this is the moisturizer built around that problem, not despite it.",
  },
  {
    question: "How is this different from using a mattifying primer?",
    answer:
      "A mattifying primer sits on top of your skin and absorbs oil temporarily. It doesn't change anything about what your skin is doing underneath. Base Layer works at the cellular level: niacinamide regulates sebum production, copper peptide stimulates collagen, and centella asiatica repairs your moisture barrier. You get a matte finish and better skin over time, not a matte finish instead of it.",
  },
  {
    question: "What's the price and how long does it last?",
    answer:
      "Base Layer is $38 for 50 mL. One bottle lasts 6 to 8 weeks with daily use (one pump, morning and night). No subscription required. Buy it once, and buy it again when you run out.",
  },
  {
    question: "Is it fragrance-free?",
    answer:
      "Yes. Base Layer contains zero fragrance, synthetic or natural. Fragrance is one of the most common causes of skin irritation in men's skincare, so we left it out entirely.",
  },
];

/* ── Component ──────────────────────────────────────────────────── */

const MatteMoisturizer = () => {
  useCanonical();
  useMetaTags(metaFor("/matte-moisturizer-for-men"));

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
              Matte Moisturizer for Oily Skin. Not a Powder, Not a Primer.
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Your skin doesn't need a filter or a blotting sheet at 2pm. It needs less oil at the
              source. Base Layer uses niacinamide at 5% to dial back how much sebum your skin produces
              in the first place, while squalane absorbs in about 15 seconds and leaves nothing on
              the surface to catch light. The result is a matte finish that holds 8-12 hours, with
              no powder, no alcohol, and nothing to reapply at your desk.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link
                to="/face-cream"
                className={buttonVariants({ variant: "hero", size: "lg", className: "w-full sm:w-auto px-12 py-6 text-sm" })}
                onClick={() => {
                  trackEvent("cta_click", {
                    content_name: "Matte Moisturizer for Men",
                    content_ids: ["base-layer-face-cream"],
                    value: 38.0,
                    currency: "USD",
                  });
                  trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "matte_moisturizer_hero" });
                }}
              >
                <span className="relative z-10">GRAB YOURS: $38</span>
              </Link>
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
                src={matteUgc}
                alt="Man with clear, matte skin after using Base Layer moisturizer for oil control"
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
              Why Your Face Gets Shiny By Lunch
            </h2>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              You apply moisturizer at 7am. By 11am you are touching your forehead and it feels
              slick. By noon your forehead and nose are reflecting the overhead lights. That is not
              a discipline problem, and it is not entirely a moisturizer problem either. It is
              sebum: the oil your skin produces to protect itself. Men's skin makes more of it than
              women's skin does, and most moisturizers on the shelf were formulated for skin that
              makes less. Layer a heavy, petroleum-based formula on top of skin that is already
              producing plenty of its own oil, and you get shine stacked on shine.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Skipping moisturizer does not fix it either. Dehydrated skin reads as a signal to
              produce <em>even more</em> oil, so you end up shinier than before, with tighter, more
              irritated skin underneath. What actually works is hydrating below the surface while
              keeping the top layer from adding to the shine: a fast-absorbing base so nothing sits
              on top, plus an active that tells your skin to make less oil instead of just mopping
              up what is already there.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed">
              That is the model behind Base Layer. Squalane as the base, so nothing sits on top.
              Niacinamide at 5%, so your glands ease off. Not a powder. Not a primer. Not a trend.
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
                src={bottleBackLabel}
                alt="Base Layer bottle back label listing niacinamide, copper tripeptide, squalane, and the full ingredient list"
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
                  Niacinamide is one of the most studied ingredients for oil control, which is why
                  it shows up in nearly every serious oily-skin formula. At 5%, it works on the
                  sebaceous gland itself: your skin produces less oil in the first place, rather
                  than just having that oil absorbed or blotted after the fact.
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  That is a different job than a blotting paper or a mattifying primer does.
                  Blotting removes oil that is already on your skin. Niacinamide changes how much
                  your skin makes to begin with, which is why the effect builds over days and weeks
                  instead of resetting the moment you touch your face.
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
                  Squalane is a biomimetic oil: its structure closely matches the sebum your skin
                  already produces. That is why it absorbs in about 15 seconds and does not sit on
                  the surface waiting to catch light. Your skin treats it as its own.
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Compare that to petroleum-based moisturizers (mineral oil, petrolatum) that sit on
                  top of your skin like plastic wrap, trapping heat and oil underneath. Squalane
                  hydrates without doing that: matte on top, moisturized underneath.
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
                  matteRole: "Primary oil regulator, less shine within the first couple weeks",
                },
                {
                  icon: FlaskConical,
                  name: "Copper Peptide GHK-Cu (0.03%)",
                  slug: "copper-peptide",
                  benefit: "Stimulates collagen, firms skin, reduces fine lines",
                  matteRole: "Strengthens skin structure without adding oil",
                },
                {
                  icon: Shield,
                  name: "Panthenol (2%)",
                  slug: "panthenol",
                  benefit: "Calms post-shave redness, repairs skin barrier",
                  matteRole: "Soothes without a greasy film. Water-soluble, never adds shine",
                },
                {
                  icon: Leaf,
                  name: "Centella Asiatica (1%)",
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
                  benefit: "Holds 1,000x its weight in water and plumps fine lines",
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
                    "Non-comedogenic, won't clog pores",
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
                  desc: "Oily forehead but dry cheeks, especially in winter or after shaving. Squalane balances both areas, hydrating where you need it without adding oil where you do not.",
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
                  Shine comes from sebum, the oily substance produced by your sebaceous glands.
                  Men's sebaceous glands are larger and more active than women's, which is why men
                  tend to have oilier skin. Sebum production is regulated by androgens (testosterone
                  and DHT), which is why men's oil production stays high well into their 40s and
                  50s, while women's tends to drop off after menopause.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Matte Doesn't Mean Powder, Primer, or Dewy Skin
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  The dewy, glass-skin look dominating a lot of skincare content right now works by
                  adding shine on purpose, with illuminating primers and highlighting drops. Matte
                  is the opposite goal, and it is easy to fake the same way a dewy look is faked: a
                  mattifying primer or setting powder blocks shine for a few hours by sitting on top
                  of your skin, then you touch it up. Base Layer is not either of those. There is no
                  powder and no primer in the formula. Niacinamide works on your sebaceous glands
                  directly, so the shine control holds through the day instead of wearing off by
                  your first afternoon meeting.
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
                  sebaceous glands, which is well documented in dermatology research on oily skin.
                  Base Layer uses it at 5%, published on the label, in the range studies associate
                  with visible oil control without irritation.
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
                  plump and hydrated beneath the surface, while the top layer, the part everyone
                  actually sees, stays dry and matte. It's the perfect complement to niacinamide's
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
                  desc: "One pump. Spread across face and neck. It goes on like a lightweight gel and vanishes into your skin. Matte to the touch in about 15 seconds, before you're even done getting dressed.",
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

        {/* ── Related Reading ──────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-center mb-6">
              Related Reading
            </h2>
            <ul className="space-y-3 font-body text-sm text-center">
              <li>
                <Link to="/non-greasy-moisturizer-for-men" className="text-primary hover:underline">
                  More worried about greasy residue than shine? Read the non-greasy moisturizer guide.
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
            Shop The Matte Formula
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            $38. No subscription traps. In stock, ships in 1-2 business days.
          </p>
          <Link
            to="/face-cream"
            className={buttonVariants({ variant: "hero", size: "lg", className: "px-12 py-6 text-sm" })}
            onClick={() => {
              trackEvent("cta_click", {
                content_name: "Matte Moisturizer for Men",
                content_ids: ["base-layer-face-cream"],
                value: 38.0,
                currency: "USD",
              });
              trackEvent("select_item", { content_name: "Base Layer Face Cream", source: "matte_moisturizer_bottom" });
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

export default MatteMoisturizer;
