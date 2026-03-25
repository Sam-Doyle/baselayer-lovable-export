import { Link } from "react-router-dom";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import TrustpilotStars from "@/components/TrustpilotStars";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useState, useRef } from "react";
import textureSmearStone from "@/assets/generated-creatives/asset_texture_smear_stone_1772750541116.png";
import productBoxBottle from "@/assets/generated-creatives/product-box-bottle.jpg";
import productInHand from "@/assets/generated-creatives/product-in-hand.jpg";
import productMacroText from "@/assets/generated-creatives/product-macro-text.jpg";
import productBathroom from "@/assets/generated-creatives/product-bathroom-counter.jpg";
import { Mountain, Zap, Shield, Droplets, Timer, Leaf, ChevronLeft, ChevronRight, Check, Sun, Moon } from "lucide-react";
import howToUseImage from "@/assets/generated-creatives/how-to-use-lifestyle.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/TestimonialsSection";
import ComparisonTable from "@/components/ComparisonTable";

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
};

const ingredients = [
  { name: "Niacinamide (5%)", slug: "niacinamide", desc: "That oily forehead by noon? Niacinamide turns down oil production at the source. Most guys see noticeably less shine within a week." },
  { name: "Copper Peptide GHK-Cu (1%)", slug: "copper-peptide", desc: "The tired-looking skin around your eyes? Copper peptide stimulates collagen underneath. Firmer, smoother texture in 4-8 weeks." },
  { name: "Panthenol (2%)", slug: "panthenol", desc: "You shave, your skin burns, you put on moisturizer and it stings. Panthenol breaks that cycle. Calms razor burn within 24 hours without leaving a film." },
  { name: "Centella Asiatica", slug: "centella-asiatica", desc: "Dry office air, wind, long flights. All of it damages your moisture barrier. Centella rebuilds it over 2-4 weeks so your skin stops overreacting." },
  { name: "Squalane", slug: "squalane", desc: "Your skin already produces squalane naturally, which is why it absorbs in seconds instead of sitting on top. No residue on your phone." },
  { name: "Hyaluronic Acid", slug: "hyaluronic-acid", desc: "Pulls moisture into deeper skin layers to plump fine lines from underneath. The hydration happens below the surface, and what you feel on top is matte." },
];

const concerns = [
  { name: "Oily Skin", slug: "oily-skin-men" },
  { name: "Acne-Prone Skin", slug: "acne-prone-skin-men" },
  { name: "Post-Shave Irritation", slug: "post-shave-irritation" },
  { name: "Dry & Dehydrated Skin", slug: "dry-dehydrated-skin-men" },
  { name: "Aging & Wrinkles", slug: "aging-wrinkles-men" },
  { name: "Dark Circles", slug: "dark-circles-men" },
  { name: "Sensitive Skin", slug: "sensitive-skin-men" },
];

const faqs = [
  { question: "Will this leave my face greasy?", answer: "No. Squalane mirrors your skin's own lipids, so the formula absorbs in seconds rather than sitting on top." },
  { question: "Can I put this on right after shaving?", answer: "That's exactly when it works best. Panthenol at 2% calms razor burn and micro-irritation within 24 hours." },
  { question: "Will this break me out?", answer: "Every ingredient is non-comedogenic. Squalane has a comedogenicity rating of 0, the lowest possible." },
  { question: "How is this different from CeraVe or Nivea?", answer: "Base Layer is a treatment product. Niacinamide at 5% actively reduces oil production. Copper peptide at 1% stimulates collagen synthesis." },
  { question: "Why no subscription option?", answer: "Because subscriptions benefit the brand, not you. Navigate checkout once, and when you run out, just reorder confidently." },
];

const GALLERY = [
  { id: 1, type: "image", src: productBoxBottle, alt: "Base Layer Daily Face Cream with Box" },
  { id: 2, type: "image", src: productBathroom, alt: "Base Layer Daily Face Cream in Bathroom" },
  { id: 3, type: "image", src: productInHand, alt: "Base Layer Product in-hand showing scale" },
  { id: 4, type: "image", src: productMacroText, alt: "Base Layer Bottle Macro Texture details" },
  { id: 5, type: "image", src: textureSmearStone, alt: "Cream texture close-up on stone" },
  { id: 6, type: "image", src: "/images/benefits-face-closeup.png", alt: "Face close-up portrait" },
];

const BUY_OPTIONS = [
  { id: 1, bottles: 1, duration: "6 weeks", price: 38, badge: null, savings: 0 },
  { id: 2, bottles: 2, duration: "12 weeks", price: 68, badge: "MOST POPULAR", badgeColor: "bg-[#1A2F4C]", savings: 8 },
  { id: 3, bottles: 3, duration: "18 weeks", price: 89, badge: "BEST VALUE", badgeColor: "bg-[#F35D1A]", savings: 25 },
];

const FaceCream = () => {
  const { openModal } = useEarlyAccess();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(2);
  const [showStickyBottom, setShowStickyBottom] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const selectedOption = BUY_OPTIONS.find(o => o.id === quantity) || BUY_OPTIONS[1];
  const msrp = 48 * selectedOption.bottles;

  useCanonical();
  useMetaTags({
    title: "Best Men's Face Moisturizer - Base Layer Performance Daily Face Cream | $38",
    description: "The one-step daily face cream for men. Absorbs in 15 seconds. Replaces serum, moisturizer, and eye cream. Niacinamide 5% + Copper Peptides. $38 with free shipping and 30-day guarantee.",
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

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        setShowStickyBottom(true);
      } else {
        setShowStickyBottom(false);
      }
    });
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  const nextImage = () => setActiveImage((c) => (c + 1) % GALLERY.length);
  const prevImage = () => setActiveImage((c) => (c - 1 + GALLERY.length) % GALLERY.length);

  return (
    <div className="min-h-screen bg-white text-[#1A2F4C]">
      <JsonLd data={[PRODUCT_SCHEMA, buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Face Cream" }]), buildFaqSchema(faqs)]} />
      <Navbar />
      
      <main className="pt-24 pb-0">
        
        {/* ABOVE THE FOLD — TWO COLUMN LAYOUT */}
        <section className="max-w-[1200px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-[55%_45%] lg:grid-cols-2 gap-[32px] lg:gap-[48px] py-8">
          
          {/* LEFT COLUMN: IMAGE GALLERY */}
          <div className="w-full flex-col gap-4 hidden md:flex">
            <div className="relative aspect-[4/5] w-full rounded-[2px] overflow-hidden bg-[#E2E8F0]">
              {GALLERY.map((img, idx) => (
                <div key={idx} className={`absolute inset-0 transition-opacity duration-300 ${activeImage === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                  {img.type === "image" ? (
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover bg-[#E2E8F0]" {...(idx === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const })} width={1024} height={1024} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E2E8F0] p-4 text-center text-[#ABB3BB] text-sm">
                      [Placeholder: {img.alt}]
                    </div>
                  )}
                </div>
              ))}
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow" aria-label="Previous">
                <ChevronLeft className="w-5 h-5"/>
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow" aria-label="Next">
                <ChevronRight className="w-5 h-5"/>
              </button>
            </div>
            {/* Thumbnail Strip */}
            <div className="flex gap-3 mt-4">
              {GALLERY.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative w-[60px] h-[60px] rounded overflow-hidden flex-shrink-0 bg-[#E2E8F0] ${activeImage === idx ? "border-2 border-[#1A2F4C]" : "border border-transparent"}`}>
                  {img.type === "image" ? (
                    <img src={img.src} alt="" className="w-full h-full object-cover" loading="lazy" width={60} height={60} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#ABB3BB]">Img {idx + 1}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* MOBILE SWIPEABLE CAROUSEL */}
          <div className="md:hidden relative w-full aspect-[4/5] bg-[#E2E8F0] overflow-hidden -mx-6 px-6 sm:mx-0 sm:px-0 sm:rounded-[2px]">
            <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                 onScroll={(e) => {
                   const scrollLeft = e.currentTarget.scrollLeft;
                   const width = e.currentTarget.clientWidth;
                   setActiveImage(Math.round(scrollLeft / width));
                 }}>
              {GALLERY.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                  {img.type === "image" ? (
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" {...(idx === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const })} width={1024} height={1024} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E2E8F0] p-4 text-center text-[#ABB3BB]">
                      [Placeholder: {img.alt}]
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
              {GALLERY.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full ${activeImage === idx ? "bg-[#1A2F4C]" : "bg-white/60"}`} />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: BUY BOX */}
          <div className="flex flex-col pt-4 md:pt-0">
            {/* 1. Star Rating */}
            <div className="flex items-center mb-3">
              <TrustpilotStars size={14} />
              <a href="#testimonials" className="font-body text-[13px] text-[#ABB3BB] ml-2 hover:underline">4.8/5 (1,000+ reviews)</a>
            </div>

            {/* 2. Title & H1 SEO */}
            <h1 className="font-heading text-[24px] md:text-[28px] font-bold text-[#1A2F4C] leading-[1.2] mb-1">
              Performance Daily Face Cream
            </h1>

            {/* 3. Short Desc */}
            <p className="font-body text-[15px] text-[#4A5568] mb-4">
              The one-step daily moisturizer for men.
            </p>

            {/* 4. Price Block */}
            <div className="flex items-center mb-5">
              <span className="font-body text-[16px] text-[#ABB3BB] line-through mr-2">${msrp}</span>
              <span className="font-heading text-[32px] font-bold text-[#1A2F4C] leading-none">${selectedOption.price}</span>
              <span className="bg-[#E8F5E9] text-[#2E7D32] font-heading font-semibold text-[11px] px-2 py-1 rounded-[4px] ml-2">
                SAVE {Math.round(((msrp - selectedOption.price) / msrp) * 100)}%
              </span>
            </div>

            {/* 5. Benefit Checkmarks */}
            <div className="flex flex-col gap-2 mb-[24px]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2E7D32] mt-1 shrink-0" />
                <span className="font-body text-[14px] text-[#2D3748] leading-[1.6]">Absorbs in 15 seconds. Zero shine, completely invisible</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2E7D32] mt-1 shrink-0" />
                <span className="font-body text-[14px] text-[#2D3748] leading-[1.6]">Replaces your serum, moisturizer, and eye cream</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2E7D32] mt-1 shrink-0" />
                <span className="font-body text-[14px] text-[#2D3748] leading-[1.6]">Fragrance-free. Built for men's skin.</span>
              </div>
            </div>

            {/* 6. Quantity Selector */}
            <div className="flex flex-row gap-[12px] mb-[20px] max-[380px]:flex-col">
              {BUY_OPTIONS.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => setQuantity(opt.id)}
                  className={`flex-1 p-[20px_16px] max-[380px]:p-[16px_12px] rounded-[2px] text-center relative cursor-pointer outline-none transition-all duration-200 ${quantity === opt.id ? "border-[2px] border-[#1A2F4C] bg-white shadow-[0_2px_8px_rgba(26,47,76,0.08)]" : "border border-[#E2E8F0] bg-[#F7F8FA]"}`}
                >
                  {opt.badge && (
                    <div className={`absolute -top-[10px] left-1/2 -translate-x-1/2 ${opt.badgeColor} text-white font-heading font-semibold text-[9px] tracking-[0.12em] uppercase px-[10px] py-[4px] rounded-[10px] whitespace-nowrap`}>
                      {opt.badge}
                    </div>
                  )}
                  <div className="font-heading font-bold text-[16px] text-[#1A2F4C] uppercase">{opt.bottles} {opt.bottles === 1 ? 'Bottle' : 'Bottles'}</div>
                  <div className="font-body font-medium text-[13px] text-[#ABB3BB]">{opt.duration}</div>
                  <div className="font-heading font-extrabold text-[24px] text-[#1A2F4C] mt-[12px]">${opt.price}</div>
                  {opt.savings > 0 ? (
                    <div className="font-body font-semibold text-[12px] text-[#2E7D32]">save ${opt.savings}</div>
                  ) : (
                    <div className="h-[18px]"></div> 
                  )}
                  <div className="font-body text-[11px] text-[#ABB3BB] mt-1">${(opt.price / opt.bottles).toFixed(2).replace(/\.00$/, '')}/bottle</div>
                </div>
              ))}
            </div>

            {/* 7. CTA Button */}
            <button 
              ref={ctaRef}
              className="w-full bg-[#F35D1A] text-white font-heading font-bold text-[15px] tracking-[0.1em] py-[16px] rounded-[4px] hover:bg-[#E04F10] active:scale-[0.98] transition-all mb-[12px]"
              onClick={() => openModal("buy_box")}
            >
              ADD TO CART - ${selectedOption.price}
            </button>

            {/* 8. Trust Micro-Copy */}
            <p className="text-center font-body text-[12px] text-[#ABB3BB]">
              Free shipping &middot; 30-day money-back guarantee &middot; Ships Spring 2026
            </p>

            {/* 9. Trust Badges Row */}
            <div className="flex items-start justify-between border-t border-[#E2E8F0] pt-4 mt-6">
              {[
                {icon: Mountain, label: "Breckenridge-Formulated"}, 
                {icon: Zap, label: "Lab Tested"}, 
                {icon: Shield, label: "Cruelty-Free"}, 
                {icon: Leaf, label: "Clean Ingredients"}
              ].map((b, i) => (
                <div key={i} className={`flex flex-col items-center flex-1 px-1 ${i !== 0 ? 'border-l border-[#E2E8F0]' : ''}`}>
                  <b.icon className="w-4 h-4 text-[#ABB3BB] mb-1" />
                  <span className="font-body text-[10px] sm:text-[11px] text-[#ABB3BB] text-center leading-[1.2]">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STICKY MOBILE CTA BAR */}
        <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] p-[12px_16px] flex items-center justify-between transition-transform duration-300 ${showStickyBottom ? 'translate-y-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]' : 'translate-y-full'}`}>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-[20px] text-[#1A2F4C] leading-none">${selectedOption.price}</span>
            <span className="font-body text-[11px] text-[#ABB3BB] mt-1">Founding Price</span>
          </div>
          <button 
            className="bg-[#F35D1A] text-white font-heading font-bold text-[13px] tracking-[0.1em] px-[24px] py-[14px] rounded-[4px]"
            onClick={() => openModal("sticky_mobile_cta")}
          >
            ADD TO CART - ${selectedOption.price}
          </button>
        </div>

        {/* BELOW THE FOLD */}
        
        {/* 1. What It Actually Does */}
        <section className="px-6 py-20 bg-white max-w-[1200px] mx-auto border-t border-[#E2E8F0] mt-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12 text-[#1A2F4C]">What It Actually Does</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { icon: Timer, title: "Absorbs Fast", desc: "Squalane mirrors your skin's own oils, so it sinks in instead of sitting on top. No waiting. No residue on your phone screen or pillowcase." },
              { icon: Droplets, title: "Stays Matte", desc: "Niacinamide at 5% reduces how much oil your skin produces, not just blotting it. Most guys notice the difference within a week." },
              { icon: Leaf, title: "Shaving Fixed", desc: "Panthenol calms razor burn and micro-irritation within 24 hours. Centella rebuilds the moisture barrier that shaving strips away." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center px-4">
                <Icon className="w-10 h-10 mx-auto mb-4 text-[#F35D1A]" />
                <h3 className="font-heading text-lg font-bold uppercase mb-3 text-[#1A2F4C]">{title}</h3>
                <p className="font-body text-[15px] text-[#4A5568] leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. TEXTURE IMAGE (Parallax) */}
        <div 
          className="w-full h-[400px] md:h-[500px] bg-fixed bg-cover bg-center hidden md:block" 
          style={{ backgroundImage: `url(${textureSmearStone})` }}
        />
        <div className="w-full md:hidden">
          <img src={textureSmearStone} alt="Texture close-up" className="w-full h-auto object-cover" loading="lazy" width={1200} height={800} />
        </div>

        {/* 3. WHAT'S INSIDE */}
        <section className="px-6 py-20 bg-white border-b border-[#E2E8F0]">
          <div className="max-w-[800px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12 text-[#1A2F4C]">What's Inside</h2>
            <Accordion type="single" collapsible defaultValue="ing-1" className="w-full">
              {ingredients.map((ing, i) => (
                <AccordionItem key={i} value={`ing-${i}`}>
                  <AccordionTrigger className="font-heading font-bold text-[16px] text-[#1A2F4C]">{ing.name}</AccordionTrigger>
                  <AccordionContent className="font-body text-[15px] text-[#4A5568] leading-[1.6]">
                    {ing.desc}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 4. NEW SECTION: HOW TO USE */}
        <section className="bg-[#F7F8FA] py-[80px] px-6">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Product Image */}
            <div className="w-full relative aspect-[4/3] md:aspect-[4/3] bg-[#E2E8F0] rounded-[8px] overflow-hidden shadow-sm">
              <img src={howToUseImage} alt="Base Layer Daily Face Cream in Bathroom" className="w-full h-full object-cover" loading="lazy" width={500} height={375} />
            </div>
            {/* Right: Text and Instructions */}
            <div className="flex flex-col text-left px-0 md:px-8">
              <span className="font-heading font-semibold text-[13px] md:text-[14px] uppercase tracking-[0.05em] text-[#4A5568] mb-2">HOW TO USE</span>
              <h2 className="font-heading text-[28px] md:text-3xl font-bold text-[#1A2F4C] mb-6">Simple routine</h2>
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-[6px] text-[#1A2F4C] mt-1 shrink-0">
                  <Sun className="w-5 h-5 text-[#F35D1A]" />
                  <span className="font-body text-[18px] font-light text-[#1A2F4C] leading-none">/</span>
                  <Moon className="w-5 h-5 text-[#1A2F4C]" />
                </div>
                <p className="font-body text-[15px] text-[#4A5568] leading-[1.6]">
                  Morning. Night. Clean face. One pump. Done.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. WHO THIS IS FOR */}
        <section className="px-6 py-20 max-w-[1200px] mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12 text-[#1A2F4C]">Who This Is For</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concerns.map((c) => (
              <Link key={c.slug} to={`/skin-concerns/${c.slug}`} className="bg-white p-5 rounded-[2px] border border-[#E2E8F0] hover:border-[#1A2F4C] transition-colors text-center shadow-sm">
                <h3 className="font-heading font-semibold text-[13px] text-[#1A2F4C]">{c.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. WHAT GUYS ACTUALLY NOTICE (Import from newly redesigned component) */}
        <TestimonialsSection />

        <ComparisonTable />

        {/* 7. BEFORE YOU BUY (FAQ) */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12 text-[#1A2F4C]">Before You Buy</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="font-body font-semibold text-left text-[#1A2F4C] hover:text-[#F35D1A]">{faq.question}</AccordionTrigger>
                  <AccordionContent className="font-body text-[#4A5568] leading-[1.6]">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>



        {/* 9. BOTTOM CTA */}
        <section className="px-6 py-[80px] text-center bg-[#1A2F4C] text-white">
          <h2 className="font-heading text-[28px] md:text-4xl font-bold uppercase tracking-wide mb-8">
            ONE MOISTURIZER.<br className="md:hidden" /> VISIBLE RESULTS.<br className="md:hidden" /> NO GREASY FINISH.
          </h2>
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-10 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-[#F35D1A] text-white hover:bg-[#E04F10] border-none transition-all duration-300 rounded-[4px] mb-4" 
            onClick={() => openModal("face_cream_bottom")}
          >
            GET STARTED - ${selectedOption.price}
          </Button>
          <div className="flex items-center justify-center">
            <TrustpilotStars size={14} />
            <span className="font-body text-[13px] text-[#ABB3BB] ml-2 leading-none">
              4.8/5 from 1,000+ men
            </span>
          </div>
        </section>

      </main>
      <Footer />
      <ExitIntentPopup />
    </div>
  );
};

export default FaceCream;
