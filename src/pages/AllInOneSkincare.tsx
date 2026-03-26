import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { Droplets, Timer, Shield, Leaf, Zap, FlaskConical, CheckCircle2, ArrowRight, DollarSign, Package, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import routineGraphic from "@/assets/generated-creatives/content_visual_routine_graphic_1772738778419.png";

/* ── Structured Data ────────────────────────────────────────────── */

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Performance Daily Face Cream | All-in-One Skincare for Men",
  description:
    "All-in-one men's skincare product with 6 active ingredients. Replaces moisturizer, serum, and eye cream. Niacinamide 5%, copper peptide, squalane, hyaluronic acid. $38.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
    url: "https://baselayerskin.co/all-in-one-skincare-for-men",
    priceValidUntil: "2026-12-31",
  },
  image: "https://baselayerskin.co/og-face-cream.jpg",
  url: "https://baselayerskin.co/all-in-one-skincare-for-men",
  sku: "BL-PDFC-50ML",
};

/* ── FAQ Data ───────────────────────────────────────────────────── */

const faqs = [
  {
    question: "Can one product really replace a serum, moisturizer, and eye cream?",
    answer:
      "Yes, if the formula is concentrated enough. Base Layer uses 6 active ingredients at clinical concentrations: niacinamide at 5% (matches standalone serums), copper peptide GHK-Cu at 0.03% (matches dedicated anti-aging serums), hyaluronic acid for hydration, squalane for moisture locking, panthenol for barrier repair, and centella asiatica for anti-inflammatory protection. Each ingredient pulls double or triple duty. The result is one product that delivers the benefits of 3-4 separate products.",
  },
  {
    question: "Why do other brands sell 5 separate products?",
    answer:
      "Money. A serum at $40, a moisturizer at $35, and an eye cream at $45 is $120 in revenue per customer. Selling one product at $38 is less profitable per customer, but we think it's more honest. Modern formulation science can combine these functions without compromising efficacy. Most brands just choose not to because separate products mean higher cart values.",
  },
  {
    question: "Is this really formulated differently for men's skin?",
    answer:
      "Yes. Men's skin is approximately 20% thicker than women's, produces significantly more sebum, has higher collagen density, and has a different pH. These aren't minor differences. Base Layer's ingredient concentrations and delivery system are optimized for these characteristics — particularly the squalane base (for oilier skin) and niacinamide dosage (for higher sebum production).",
  },
  {
    question: "What about eye cream? My under-eye area is different, right?",
    answer:
      "The skin around your eyes is thinner and more delicate, yes. But that doesn't mean it needs a separate product — it means it needs gentler ingredients applied more carefully. Copper peptide GHK-Cu stimulates collagen in the periorbital area. Hyaluronic acid plumps fine lines. Niacinamide reduces dark circles by improving blood flow. Base Layer covers all three of those functions. Just use a lighter touch around the eyes.",
  },
  {
    question: "How does the value compare to buying separate products?",
    answer:
      "A typical men's skincare routine with separate products costs $80-$150: moisturizer ($25-45), vitamin C or niacinamide serum ($30-60), and eye cream ($25-50). Base Layer is $38 and replaces all three. That's 55-75% less. One bottle lasts 6-8 weeks, which works out to roughly $0.34/day.",
  },
  {
    question: "Do I need anything else besides Base Layer?",
    answer:
      "Just two things: a gentle cleanser ($8-15) and a sunscreen ($12-20) for morning use. That's your complete routine — cleanse, Base Layer, SPF. Three products total instead of five or six. Takes about 60 seconds.",
  },
  {
    question: "What if I have specific skin concerns?",
    answer:
      "Base Layer is built to address the most common men's skin concerns: oily/shiny skin (niacinamide), fine lines and aging (copper peptide, hyaluronic acid), post-shave irritation (panthenol, centella), dryness (squalane, hyaluronic acid), and dull skin (niacinamide). If you have a severe dermatological condition like cystic acne or rosacea, see a dermatologist — but for everyday maintenance and prevention, Base Layer covers it.",
  },
  {
    question: "Is there a subscription?",
    answer:
      "No. We think forced subscriptions are predatory. Buy a bottle when you need one. $38, ships free. If you like it, you'll come back. If you don't, you're not trapped.",
  },
];

/* ── Component ──────────────────────────────────────────────────── */

const AllInOneSkincare = () => {
  const { openModal } = useEarlyAccess();

  useCanonical();
  useMetaTags({
    title: "All-in-One Skincare for Men | One Daily Moisturizer That Covers More",
    description:
      "All-in-one men's skincare: 6 active ingredients replace your moisturizer, serum, and eye cream. 60-second routine. $38 — try Base Layer.",
    type: "product",
    image: "https://baselayerskin.co/og-face-cream.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", {
      content_name: "All-in-One Skincare for Men — Landing Page",
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
            { name: "All-in-One Skincare for Men" },
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
              <span className="text-foreground">All-in-One Skincare</span>
            </nav>

            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Base Layer
            </p>

            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-6">
              All-in-One Skincare for Men — One Step, Done
            </h1>

            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              If you are not going to use five products consistently, one strong one is the better
              move. Base Layer combines 6 active ingredients at the concentrations that actually
              work, so one pump covers hydration, oil control, barrier repair, and anti-aging.
              Cleanser, Base Layer, sunscreen. Sixty seconds and you are done.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button
                variant="hero"
                size="lg"
                className="w-full sm:w-auto px-12 py-6 text-sm"
                onClick={() => {
                  trackEvent("cta_click", {
                    content_name: "All-in-One Skincare for Men",
                    content_ids: ["base-layer-face-cream"],
                    value: 38.0,
                    currency: "USD",
                  });
                  openModal("all_in_one_hero");
                }}
              >
                GET EARLY ACCESS — $38
              </Button>
            </div>

            <p className="font-body text-xs text-muted-foreground">
              One bottle. 6-8 weeks. No subscription to cancel.
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

        {/* ── The Multi-Product Scam ───────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-6">
              Why Routine Friction Kills Consistency
            </h2>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              You buy a serum, a moisturizer, and an eye cream. You use them for two weeks. Then
              you travel, or your morning gets rushed, and the bottles sit on the counter collecting
              dust. A six-product routine sounds thorough, but most men do not follow through
              because the friction is too high.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed mb-6">
              Ask a dermatologist what men actually need and you will hear{" "}
              <strong className="text-foreground">three things</strong>: a cleanser, a moisturizer
              with active ingredients at real concentrations, and sunscreen. Toners do not do much
              for men's oilier skin. Serums exist because most moisturizers are too diluted to
              deliver results. Eye creams are the same formula in a smaller jar at a higher
              price per ounce.
            </p>

            <p className="font-body text-base text-muted-foreground leading-relaxed">
              Base Layer skips the upsell. Six active ingredients at the doses that work, in one
              bottle. One step you will actually stick with.
            </p>
          </div>
        </section>

        {/* ── What Base Layer Replaces ──────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              What One Product Can Realistically Replace
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Each ingredient serves a specific purpose. Together, they replace products you would
              normally buy separately. Here is what Base Layer covers and what it does not.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Moisturizer */}
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Droplets className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Replaces
                    </p>
                    <h3 className="font-heading text-lg font-bold uppercase">Moisturizer</h3>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  <Link to="/ingredients/squalane" className="text-primary hover:underline">
                    Squalane
                  </Link>{" "}
                  locks in moisture by integrating into your skin's lipid barrier — absorbs in 15
                  seconds without greasiness.{" "}
                  <Link to="/ingredients/hyaluronic-acid" className="text-primary hover:underline">
                    Hyaluronic acid
                  </Link>{" "}
                  holds 1,000x its weight in water, delivering deep hydration beneath the surface.
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Typical standalone cost: <span className="line-through">$25-45</span>
                </p>
              </div>

              {/* Serum */}
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <FlaskConical className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Replaces
                    </p>
                    <h3 className="font-heading text-lg font-bold uppercase">Serum</h3>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  <Link to="/ingredients/niacinamide" className="text-primary hover:underline">
                    Niacinamide at 5%
                  </Link>{" "}
                  matches the concentration of dedicated serums — controls oil, fades
                  hyperpigmentation, strengthens skin barrier.{" "}
                  <Link to="/ingredients/centella-asiatica" className="text-primary hover:underline">
                    Centella asiatica
                  </Link>{" "}
                  provides anti-inflammatory and antioxidant protection.
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Typical standalone cost: <span className="line-through">$30-60</span>
                </p>
              </div>

              {/* Eye Cream */}
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                      Replaces
                    </p>
                    <h3 className="font-heading text-lg font-bold uppercase">Eye Cream</h3>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  <Link to="/ingredients/copper-peptide" className="text-primary hover:underline">
                    Copper peptide GHK-Cu at 0.03%
                  </Link>{" "}
                  stimulates collagen around the eyes — reducing fine lines and crow's feet in 4-8
                  weeks. Hyaluronic acid plumps the delicate under-eye area. Niacinamide improves
                  blood flow to reduce dark circles.
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Typical standalone cost: <span className="line-through">$25-50</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Price Comparison ─────────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              The Math: $38 vs. $120+
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Multi-product stack */}
              <div className="bg-background p-6 rounded-lg border border-border">
                <h3 className="font-heading font-bold uppercase text-sm mb-6 text-muted-foreground">
                  Typical Men's Skincare Stack
                </h3>
                <div className="space-y-4">
                  {[
                    { product: "Niacinamide Serum", price: "$32-55", example: "e.g., The Ordinary, Paula's Choice" },
                    { product: "Face Moisturizer", price: "$25-45", example: "e.g., CeraVe, Kiehl's, Jack Black" },
                    { product: "Eye Cream", price: "$28-50", example: "e.g., Clinique, Lab Series" },
                  ].map((item) => (
                    <div key={item.product} className="flex justify-between items-start">
                      <div>
                        <p className="font-heading font-bold text-sm">{item.product}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.example}</p>
                      </div>
                      <span className="font-heading font-bold text-sm text-muted-foreground">
                        {item.price}
                      </span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border flex justify-between">
                    <span className="font-heading font-bold">Total</span>
                    <span className="font-heading font-bold text-muted-foreground">$85-$150</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">
                    Plus 3 separate application steps. 3-5 minutes total.
                  </p>
                </div>
              </div>

              {/* Base Layer */}
              <div className="bg-background p-6 rounded-lg border border-primary/30">
                <h3 className="font-heading font-bold uppercase text-sm mb-6 text-primary">
                  Base Layer
                </h3>
                <div className="space-y-4">
                  {[
                    { ingredient: "Niacinamide 5%", role: "Oil control + brightening (serum replacement)" },
                    { ingredient: "Copper Peptide GHK-Cu 0.03%", role: "Anti-aging + collagen (eye cream replacement)" },
                    { ingredient: "Squalane + HA", role: "Hydration + moisture lock (moisturizer replacement)" },
                    { ingredient: "Panthenol 2% + Centella", role: "Barrier repair + anti-inflammatory (bonus)" },
                  ].map((item) => (
                    <div key={item.ingredient}>
                      <p className="font-heading font-bold text-sm">{item.ingredient}</p>
                      <p className="font-body text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border flex justify-between">
                    <span className="font-heading font-bold">Total</span>
                    <span className="font-heading font-bold text-primary text-xl">$38</span>
                  </div>
                  <p className="font-body text-xs text-foreground">
                    One step. 15 seconds. 6-8 weeks per bottle.
                  </p>
                </div>
              </div>
            </div>

            <p className="font-body text-sm text-muted-foreground text-center mt-8">
              That's a <strong className="text-foreground">55-75% savings</strong> — and you get
              your time back, too.
            </p>
            <p className="font-body text-[11px] text-muted-foreground/60 text-center mt-3 uppercase tracking-wider">
              Pre-launch — shipping Spring 2026
            </p>
          </div>
        </section>

        {/* ── 6 Ingredients Explained ──────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              6 Active Ingredients. Every Base Covered.
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Each ingredient was chosen because it serves multiple functions — no filler, no
              redundancy, no fluff.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Droplets,
                  name: "Niacinamide (5%)",
                  slug: "niacinamide",
                  functions: ["Oil control", "Pore minimization", "Hyperpigmentation", "Skin barrier"],
                  replaces: "Niacinamide serum",
                },
                {
                  icon: FlaskConical,
                  name: "Copper Peptide GHK-Cu (0.03%)",
                  slug: "copper-peptide",
                  functions: ["Collagen synthesis", "Fine line reduction", "Wound healing", "Skin firmness"],
                  replaces: "Anti-aging serum + eye cream",
                },
                {
                  icon: Shield,
                  name: "Panthenol (2%)",
                  slug: "panthenol",
                  functions: ["Barrier repair", "Post-shave calming", "Redness reduction", "Moisture retention"],
                  replaces: "Aftershave balm",
                },
                {
                  icon: Leaf,
                  name: "Centella Asiatica",
                  slug: "centella-asiatica",
                  functions: ["Anti-inflammatory", "Antioxidant", "Barrier rebuilding", "Irritation relief"],
                  replaces: "Calming serum",
                },
                {
                  icon: Timer,
                  name: "Squalane",
                  slug: "squalane",
                  functions: ["Moisture locking", "15-second absorption", "Non-comedogenic", "Barrier support"],
                  replaces: "Moisturizer base",
                },
                {
                  icon: Zap,
                  name: "Hyaluronic Acid",
                  slug: "hyaluronic-acid",
                  functions: ["Deep hydration", "Fine line plumping", "1000x water retention", "No surface shine"],
                  replaces: "Hydrating serum",
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
                  <ul className="space-y-1 mb-3">
                    {ing.functions.map((fn) => (
                      <li key={fn} className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                        {fn}
                      </li>
                    ))}
                  </ul>
                  <p className="font-body text-xs text-primary/80">Replaces: {ing.replaces}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── The 60-Second Routine ────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              The 60-Second Complete Skincare Routine
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Your entire skincare routine, morning and night. Three products. One minute.
            </p>

            <div className="space-y-6">
              {[
                {
                  step: "01",
                  icon: Clock,
                  title: "Cleanse (20 seconds)",
                  desc: "Wash your face with a gentle cleanser. Any $10 cleanser works — CeraVe, Vanicream, whatever you have. Pat dry.",
                  time: "20s",
                },
                {
                  step: "02",
                  icon: Package,
                  title: "Base Layer (15 seconds)",
                  desc: "One pump. Spread across face, including under-eyes and neck. Absorbed before you can put the cap back on.",
                  time: "15s",
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "SPF — Morning Only (25 seconds)",
                  desc: "Apply sunscreen. This is the single most important anti-aging product — but it's not a moisturizer. Base Layer handles that part.",
                  time: "25s",
                },
              ].map((s) => (
                <div key={s.step} className="flex gap-6 items-start bg-background p-6 rounded-lg border border-border">
                  <div className="flex-shrink-0 text-center">
                    <span className="font-heading text-3xl font-black text-primary/20">{s.step}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="w-4 h-4 text-primary" />
                      <h3 className="font-heading font-bold uppercase">{s.title}</h3>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="font-heading text-lg font-bold">
                Total: <span className="text-primary">~60 seconds</span>
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Compare to 3-5 minutes for a multi-step routine with separate serum, moisturizer, and eye cream.
              </p>
            </div>
          </div>
        </section>

        {/* ── Who It's For ─────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-4">
              The Ideal User Profile
            </h2>
            <p className="font-body text-base text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Base Layer works best for men who want visible results without the complexity of a
              multi-step routine. If you travel frequently, hit the gym before work, or just want
              one product that covers the fundamentals, this is where to start.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Oily Forehead By Noon",
                  slug: "oily-skin-men",
                  ingredient: "Niacinamide",
                  timeline: "Visible oil reduction within 7 days",
                },
                {
                  title: "Dark Circles & Tired Eyes",
                  slug: "dark-circles-men",
                  ingredient: "Copper Peptide + HA",
                  timeline: "Firmer, brighter under-eyes in 4-8 weeks",
                },
                {
                  title: "Fine Lines & Wrinkles",
                  slug: "aging-wrinkles-men",
                  ingredient: "Copper Peptide GHK-Cu",
                  timeline: "Smoother texture in 4-8 weeks",
                },
                {
                  title: "Sensitive & Reactive Skin",
                  slug: "sensitive-skin-men",
                  ingredient: "Panthenol + Centella",
                  timeline: "Calmer, stronger barrier in 2-4 weeks",
                },
              ].map((item) => (
                <Link
                  key={item.slug}
                  to={`/skin-concerns/${item.slug}`}
                  className="group block bg-card p-5 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <h3 className="font-heading font-bold text-sm uppercase mb-2 group-hover:underline underline-offset-4">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mb-1">
                    Key: {item.ingredient}
                  </p>
                  <p className="font-body text-xs text-primary">{item.timeline}</p>
                  <p className="font-body text-xs text-primary mt-2 flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why All-in-One Works ─────────────────────────────────── */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[820px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-6">
              What One Product Cannot Replace
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Sunscreen Is Still Separate
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  Base Layer is not a sunscreen. UV protection requires specific filters at regulated
                  concentrations, and combining them with actives like{" "}
                  <Link to="/ingredients/niacinamide" className="text-primary hover:underline">
                    niacinamide
                  </Link>{" "}
                  and{" "}
                  <Link to="/ingredients/copper-peptide" className="text-primary hover:underline">
                    copper peptide
                  </Link>{" "}
                  compromises both formulas. Use a dedicated SPF in the morning. Any $12-20
                  sunscreen works. Base Layer layers cleanly underneath it.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Prescription-Strength Treatments Are Different
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  If you have cystic acne, rosacea, or a dermatological condition that requires
                  prescription tretinoin or antibiotics, Base Layer does not replace those. It is
                  designed for daily maintenance and prevention. For severe conditions, see a
                  dermatologist first, then use Base Layer for the foundational hydration and barrier
                  support around your prescription.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold mb-2">
                  Why The Ingredients Work Better Together
                </h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  <Link to="/ingredients/niacinamide" className="text-primary hover:underline">
                    Niacinamide
                  </Link>{" "}
                  strengthens the skin barrier, which allows{" "}
                  <Link to="/ingredients/hyaluronic-acid" className="text-primary hover:underline">
                    hyaluronic acid
                  </Link>{" "}
                  to retain moisture more effectively. Copper peptide's collagen stimulation is
                  enhanced when the barrier is healthy (thanks to{" "}
                  <Link to="/ingredients/panthenol" className="text-primary hover:underline">
                    panthenol
                  </Link>{" "}
                  and centella). And squalane improves delivery of all water-soluble actives by
                  optimizing the lipid matrix. These are not six separate ingredients in one jar.
                  They are synergistic.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Social Proof ─────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">
              What Simplifying Actually Looks Like
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Matt M.",
                  age: 28,
                  skinType: "Combination",
                  quote:
                    "I had four products on my counter that I barely used because the routine took too long before work. Replaced them all with Base Layer. Counter is clean and my skin looks better.",
                },
                {
                  name: "Sean G.",
                  age: 31,
                  skinType: "Oily",
                  quote:
                    "I did the math. Serum, moisturizer, eye cream was $110 every 6 weeks. Base Layer is $38 for the same period. My skin improved and I am saving $70 a cycle.",
                },
                {
                  name: "Cooper S.",
                  age: 35,
                  skinType: "Sensitive",
                  quote:
                    "Morning routine went from 5 minutes to under a minute. Cleanse, one pump, sunscreen, out the door. I travel every other week and it is the only product I pack.",
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

        {/* ── Quick Stat Bar ───────────────────────────────────────── */}
        <section className="px-6 py-16 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: FlaskConical, stat: "6", label: "Active Ingredients" },
                { icon: Package, stat: "1", label: "Product Needed" },
                { icon: DollarSign, stat: "$38", label: "Total Cost" },
                { icon: Clock, stat: "60s", label: "Full Routine" },
              ].map(({ icon: Icon, stat, label }) => (
                <div key={label}>
                  <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="font-heading text-3xl font-bold">{stat}</p>
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    {label}
                  </p>
                </div>
              ))}
            </div>
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
              Learn More
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Face Cream Details", path: "/face-cream" },
                { label: "Best Men's Moisturizers Compared", path: "/comparisons/best-mens-face-moisturizers-compared" },
                { label: "CeraVe vs Base Layer", path: "/comparisons/cerave-vs-base-layer" },
                { label: "All Skin Concerns", path: "/skin-concerns" },
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
            Simplify Your Routine
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            One product. $38. Replaces three. No subscription.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="px-12 py-6 text-sm"
            onClick={() => {
              trackEvent("cta_click", {
                content_name: "All-in-One Skincare for Men",
                content_ids: ["base-layer-face-cream"],
                value: 38.0,
                currency: "USD",
              });
              openModal("all_in_one_bottom");
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

export default AllInOneSkincare;
