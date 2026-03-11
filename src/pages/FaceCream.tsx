import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import productShot from "@/assets/product-hero-rock.png";
import productShot480w from "@/assets/product-hero-rock-480w.webp";
import productShot768w from "@/assets/product-hero-rock-768w.webp";
import productShot1200w from "@/assets/product-hero-rock-1200w.webp";
import textureSmearStone from "@/assets/generated-creatives/asset_texture_smear_stone_1772750541116.png";
import { Mountain, Zap, Shield, Droplets, Timer, Leaf, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Men's Performance Daily Face Cream",
  description: "Men's face moisturizer with niacinamide 5%, copper peptide GHK-Cu 1%, panthenol, centella asiatica, squalane, and hyaluronic acid. Absorbs in 15 seconds. Fragrance-free. 50mL.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
    url: "https://baselayerskin.co/face-cream",
    priceValidUntil: "2026-12-31",
  },
  image: "https://baselayerskin.co/og-face-cream.jpg",
  url: "https://baselayerskin.co/face-cream",
  sku: "BL-PDFC-50ML",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "3", bestRating: "5" },
  review: [
    { "@type": "Review", author: { "@type": "Person", name: "Sean G." }, reviewBody: "My forehead used to look shiny by 11 AM. After a week of Base Layer, it just doesn't happen anymore.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, datePublished: "2025-12-01" },
    { "@type": "Review", author: { "@type": "Person", name: "Matt M." }, reviewBody: "I hit the gym at 6 AM and need something that doesn't sweat off. This absorbs immediately and my skin still feels good at end of day.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, datePublished: "2025-12-15" },
    { "@type": "Review", author: { "@type": "Person", name: "Cooper S." }, reviewBody: "I shave daily for work. Every moisturizer I tried either stung or left a greasy film. Base Layer does neither.", reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }, datePublished: "2026-01-05" },
  ],
};

const ingredients = [
  { name: "Niacinamide (5%)", slug: "niacinamide", desc: "That oily forehead by noon? Niacinamide turns down oil production at the source. Most guys see noticeably less shine within a week." },
  { name: "Copper Peptide GHK-Cu (1%)", slug: "copper-peptide", desc: "The tired-looking skin around your eyes? Copper peptide stimulates collagen underneath. Firmer, smoother texture in 4-8 weeks." },
  { name: "Panthenol (2%)", slug: "panthenol", desc: "You shave, your skin burns, you put on moisturizer and it stings. Panthenol breaks that cycle. Calms razor burn within 24 hours without leaving a film." },
  { name: "Centella Asiatica", slug: "centella-asiatica", desc: "Dry office air, wind, long flights — all of it damages your moisture barrier. Centella rebuilds it over 2-4 weeks so your skin stops overreacting." },
  { name: "Squalane", slug: "squalane", desc: "Your skin already produces squalane naturally, which is why it absorbs in seconds instead of sitting on top. No residue on your phone, your pillowcase, or your face." },
  { name: "Hyaluronic Acid", slug: "hyaluronic-acid", desc: "Pulls moisture into deeper skin layers to plump fine lines from underneath. The hydration happens below the surface — what you feel on top is matte, not sticky." },
];

const concerns = [
  { name: "Oily Skin", slug: "oily-skin-men" },
  { name: "Acne-Prone Skin", slug: "acne-prone-skin-men" },
  { name: "Post-Shave Irritation", slug: "post-shave-irritation" },
  { name: "Dry & Dehydrated Skin", slug: "dry-dehydrated-skin-men" },
];

const faqs = [
  { question: "Will this leave my face greasy?", answer: "No. Squalane mirrors your skin's own lipids, so the formula absorbs in seconds rather than sitting on top. Touch your face a minute later and it feels like bare skin. No film on your phone screen, no shine under office lights, no residue on your pillowcase." },
  { question: "Can I put this on right after shaving?", answer: "That's exactly when it works best. Panthenol at 2% calms razor burn and micro-irritation within 24 hours. Centella repairs the moisture barrier that shaving strips away. And because there's zero fragrance, there's no stinging on freshly shaved skin. Most aftershave products are loaded with alcohol and fragrance that make irritation worse." },
  { question: "Will this break me out?", answer: "Every ingredient is non-comedogenic. Squalane has a comedogenicity rating of 0 — the lowest possible. There are no silicones, no coconut oil, no petroleum, and no fragrance. Niacinamide actually reduces the inflammation that leads to breakouts. If moisturizers have broken you out before, it was almost certainly the base formula, not the concept of moisturizing." },
  { question: "I have oily skin. Why would I add more moisture?", answer: "When your skin is dehydrated, it overproduces oil to compensate. That's why your forehead gets shiny by noon even though it felt tight after washing. Niacinamide at 5% reduces sebum production at the source. Hyaluronic acid delivers hydration beneath the surface so your skin stops overcompensating. Most guys with oily skin see noticeably less shine within a week." },
  { question: "How is this different from CeraVe or Nivea?", answer: "Those are basic moisturizers — they hydrate, and that's about it. Base Layer is a treatment product. Niacinamide at 5% actively reduces oil production. Copper peptide at 1% stimulates collagen synthesis — something no drugstore moisturizer does. Panthenol repairs your skin barrier after shaving. You won't notice CeraVe doing anything because it isn't doing much beyond basic moisture. Base Layer is built so you see real changes: less oil in week one, firmer-looking skin by week six." },
  { question: "Do I need a whole routine with this?", answer: "A cleanser — any basic one you already own — and SPF in the morning. That's it. Base Layer handles moisturizer, serum, and eye cream in one step. Three total products, about 60 seconds. No layering, no waiting between steps." },
  { question: "When will I actually see a difference?", answer: "Day one: your skin feels hydrated without residue. Week one: noticeably less shine, especially across your forehead and nose. Weeks four to eight: smoother texture and firmer-looking skin as copper peptide builds collagen underneath." },
  { question: "I travel a lot. Is this TSA-friendly?", answer: "Yes. The bottle is 50 mL (1.7 fl oz) — well under the 3.4 oz limit. It replaces your moisturizer, serum, and eye cream, so you're packing one product instead of three. Your entire skincare routine fits in a Dopp kit pocket." },
  { question: "I work out every day. Will this hold up?", answer: "The squalane base absorbs fully, so it doesn't sweat off during a workout. Apply it after you wash your face in the morning, hit the gym, and it's still working when you get to the office. Layer SPF on top without pilling." },
  { question: "Why no subscription option?", answer: "Because subscriptions benefit the brand, not you. One bottle lasts 6-8 weeks. When you run out, reorder. If you don't want more, you're not stuck canceling through a dark-pattern checkout flow." },
];

const FaceCream = () => {
  const { openModal } = useEarlyAccess();

  useCanonical();
  useMetaTags({
    title: "Base Layer Face Cream | Lightweight Daily Moisturizer for Men",
    description: "A daily moisturizer for men with niacinamide, copper peptide, panthenol, centella, squalane, and hyaluronic acid. Built for shine control, barrier support, and fast absorption.",
    type: "product",
    image: "https://baselayerskin.co/og-face-cream.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", {
      content_name: "Base Layer Face Cream",
      content_ids: ["base-layer-face-cream"],
      value: 38.00,
      currency: "USD",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[PRODUCT_SCHEMA, buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Face Cream" },
      ]), buildFaqSchema(faqs)]} />
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-0 items-stretch">
          <div className="relative min-h-[400px] md:min-h-0">
            <picture>
              <source
                type="image/webp"
                srcSet={`${productShot480w} 480w, ${productShot768w} 768w, ${productShot1200w} 1200w`}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
              <img src={productShot} alt="Base Layer face cream — lightweight daily moisturizer for men" className="absolute inset-0 w-full h-full object-cover" width={400} height={600} loading="eager" decoding="async" fetchPriority="high" />
            </picture>
          </div>
          <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 md:py-24">
            <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <span className="text-foreground">Face Cream</span>
            </nav>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Base Layer</p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-6">
              Best Men's Face Moisturizer — Hydrate in 15 Seconds
            </h1>
            <p className="font-body text-base text-muted-foreground leading-relaxed mb-4 max-w-md">
              One bottle for hydration, oil control, post-shave recovery, and smoother-looking skin. Absorbs fast, leaves a matte finish, and doesn't require a second step.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
              Fragrance-free. Non-comedogenic. Formulated for men's thicker, oilier skin. 50 mL / 1.7 fl oz.
            </p>
            <p className="font-heading text-2xl font-bold mb-1">$38</p>
            <p className="font-body text-xs text-muted-foreground mb-6">Pre-launch pricing. Shipping Spring 2026.</p>
            <Button
              variant="hero"
              size="lg"
              className="w-full sm:w-auto px-12 py-6 text-sm"
              onClick={() => openModal("face_cream_cta")}
            >
              RESERVE NOW — $38
            </Button>
            <div className="flex flex-wrap gap-4 mt-6 text-muted-foreground">
              <span className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider"><Mountain className="w-3.5 h-3.5" /> Breckenridge‑Formulated</span>
              <span className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider"><Zap className="w-3.5 h-3.5" /> Clean Ingredients</span>
              <span className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider"><Shield className="w-3.5 h-3.5" /> Cruelty-Free</span>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="px-6 py-20 max-w-[1200px] mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">What It Actually Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Timer, title: "Absorbs Before You Grab Your Keys", desc: "Squalane mirrors your skin's own oils, so it sinks in instead of sitting on top. No waiting. No residue on your phone screen or pillowcase." },
              { icon: Droplets, title: "Your Face Stays Matte Through Dinner", desc: "Niacinamide at 5% reduces how much oil your skin produces — not just blotting it. Most guys notice the difference within a week." },
              { icon: Leaf, title: "Shaving Stops Being a Problem", desc: "Panthenol calms razor burn and micro-irritation within 24 hours. Centella rebuilds the moisture barrier that shaving strips away. No fragrance to sting freshly shaved skin." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <Icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-heading text-lg font-bold uppercase mb-2">{title}</h3>
                <p className="font-body text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Texture on stone — visual break */}
        <div className="max-w-[900px] mx-auto px-6 py-10">
          <div className="rounded-lg overflow-hidden border border-border">
            <img src={textureSmearStone} alt="Base Layer cream texture on natural stone — lightweight, fast-absorbing formula" className="w-full" loading="lazy" decoding="async" />
          </div>
        </div>

        {/* Ingredients */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">What's Inside</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ingredients.map((ing) => (
                <Link key={ing.slug} to={`/ingredients/${ing.slug}`} className="group block bg-background p-6 rounded-lg border border-border hover:bg-muted transition-colors">
                  <h3 className="font-heading font-bold group-hover:underline underline-offset-4">{ing.name}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-2">{ing.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Skin Concerns */}
        <section className="px-6 py-20 max-w-[1200px] mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">Who This Is For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concerns.map((c) => (
              <Link key={c.slug} to={`/skin-concerns/${c.slug}`} className="bg-card p-5 rounded-lg border border-border hover:bg-muted transition-colors text-center">
                <h3 className="font-heading font-bold text-sm">{c.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-20 bg-card">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">What Guys Actually Notice</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Sean G.", age: 31, skinType: "Oily", quote: "I work in an open office with bright overhead lights. My forehead used to look visibly shiny by 11 AM. After a week of Base Layer, it just doesn't happen anymore." },
                { name: "Matt M.", age: 28, skinType: "Combination", quote: "I hit the gym at 6 AM and need something that doesn't sweat off or clog pores. This absorbs immediately and my skin still feels good at the end of the day." },
                { name: "Cooper S.", age: 35, skinType: "Sensitive", quote: "I shave daily for work. Every moisturizer I've tried either stung or left a greasy film under my collar. Base Layer does neither. Just calm skin." },
              ].map((t) => (
                <div key={t.name} className="bg-background p-6 rounded-lg border border-border">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm">{t.name}, {t.age}</span>
                    <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">{t.skinType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-20">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12">Before You Buy</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="font-body text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="font-body text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-6 py-20 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4">ONE MOISTURIZER. VISIBLE RESULTS. NO GREASY FINISH.</h2>
          <p className="font-body text-muted-foreground mb-2 max-w-md mx-auto">Pre-launch pricing — $38.</p>
          <p className="font-body text-xs text-muted-foreground/60 mb-8 uppercase tracking-wider">Pre-launch — shipping Spring 2026</p>
          <Button variant="hero" size="lg" className="px-12 py-6 text-sm" onClick={() => openModal("face_cream_bottom")}>
            RESERVE NOW — $38
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FaceCream;
