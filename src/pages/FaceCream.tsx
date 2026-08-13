import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/stores/cartStore";
import { AVAILABLE_TIERS, buildCartItem, getInitialTier } from "@/config/product";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { useEffect, useState, useRef } from "react";
import textureSmearStone from "@/assets/generated-creatives/asset_texture_smear_stone_1772750541116.png";
import carouselPrimary from "@/assets/product-carousel/base-layer-carousel-01-primary.webp";
import carouselPositioning from "@/assets/product-carousel/base-layer-carousel-02-positioning.webp";
import carouselIngredients from "@/assets/product-carousel/base-layer-carousel-03-ingredients.webp";
import carouselOneStep from "@/assets/product-carousel/base-layer-carousel-04-one-step.webp";
import carouselLifestyle from "@/assets/product-carousel/base-layer-carousel-05-lifestyle-v2.webp";
import carouselDesign from "@/assets/product-carousel/base-layer-carousel-06-design.webp";
import carouselRecap from "@/assets/product-carousel/base-layer-carousel-07-recap.webp";
import { Mountain, Zap, Shield, Droplets, Timer, Leaf, ChevronLeft, ChevronRight, Check, Sun, Moon } from "lucide-react";
import howToUseImage from "@/assets/generated-creatives/how-to-use-lifestyle.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/TestimonialsSection";
import { testimonials, TESTIMONIAL_DISCLOSURE } from "@/components/testimonialsData";
import ComparisonTable from "@/components/ComparisonTable";
import ReviewsSection from "@/components/ReviewsSection";
import StarRating from "@/components/StarRating";
import { reviewAggregate } from "@/lib/reviews";
import { merchantOfferFields } from "@/config/merchantSchema";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Men's Performance Daily Face Cream",
  description: "Men's face moisturizer with niacinamide 5%, copper peptide GHK-Cu 0.03%, panthenol, centella asiatica, squalane, and hyaluronic acid. Absorbs in 15 seconds. Fragrance-free. 50mL.",
  brand: { "@type": "Brand", name: "Base Layer" },
  offers: {
    "@type": "Offer",
    price: "38.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://baselayerskin.co/face-cream",
    priceValidUntil: "2026-12-31",
    ...merchantOfferFields("38.00"),
  },
  /*
   * aggregateRating is spread in only once five real Judge.me reviews exist.
   * Never emit it with reviewCount: 0 — Google's Rich Results Test treats that
   * as an error on the Product itself, which can cost the whole rich result
   * rather than just the stars. reviewAggregate zeroes below the gate, so this
   * hides on exactly the same condition as <StarRating> and <ReviewsSection>.
   */
  ...(reviewAggregate.count > 0 && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewAggregate.rating.toFixed(1),
      reviewCount: reviewAggregate.count,
    },
  }),
};

const ingredients = [
  { name: "Niacinamide (5%)", slug: "niacinamide", desc: "That oily forehead by noon? Niacinamide turns down oil production at the source. Most guys see noticeably less shine within a week." },
  { name: "Copper Peptide GHK-Cu (0.03%)", slug: "copper-peptide", desc: "The tired-looking skin around your eyes? Copper peptide stimulates collagen underneath. Firmer, smoother texture in 4-8 weeks." },
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
  { question: "How is this different from CeraVe or Nivea?", answer: "Base Layer is a treatment product. Niacinamide at 5% actively reduces oil production. Copper peptide at 0.03% stimulates collagen synthesis." },
  { question: "Do I have to subscribe?", answer: "No. Buying once is the default and always will be. Subscribe & Save is there if you want the discount and hate reordering — pause or cancel in one click, no lock-in, no hoops." },
];

const GALLERY = [
  { id: 1, type: "image", src: carouselPrimary, alt: "Base Layer Daily Face Cream bottle and carton on white background" },
  { id: 2, type: "image", src: carouselPositioning, alt: "Base Layer bottle on charcoal stone — Daily Moisture. Active Recovery." },
  { id: 3, type: "image", src: carouselIngredients, alt: "Ingredient callout — 5% Niacinamide + Copper Peptides" },
  { id: 4, type: "image", src: carouselOneStep, alt: "One Step. Every Day. — Base Layer bottle with cream ribbon" },
  { id: 5, type: "image", src: carouselLifestyle, alt: "Man applying Base Layer face cream in morning bathroom light" },
  { id: 6, type: "image", src: carouselDesign, alt: "Base Layer bottle and carton on graphite — Simple by Design." },
  { id: 7, type: "image", src: carouselRecap, alt: "Daily Face Cream — 5% Niacinamide + Copper Peptides — 50 ml / 1.7 fl oz" },
];

const BUY_OPTIONS = AVAILABLE_TIERS;

// F01 social-proof slot, wired to Judge.me via src/lib/reviews.ts (data baked
// in at build time by scripts/fetch-reviews.mjs). Reads {rating: 0, count: 0}
// below REVIEW_GATE, which hides the rating link and keeps aggregateRating out
// of the Product schema. Not sourced from Sanity's product.rating field, which
// is hand-editable — the whole point is that no human can type this number.
const PRODUCT_RATING = reviewAggregate;

// Sourced from testimonialsData.ts rather than retyped, so the quote can't
// drift from the homepage version. <TestimonialsSection /> lower on this page
// renders all three testers, so whoever is quoted here necessarily appears
// twice. Sean is the pick because his quote speaks directly to the matte/
// no-shine promise this buy box is closing on.
const pullQuoteTestimonial = testimonials.find((t) => t.name.startsWith("Sean")) ?? testimonials[0];

const FaceCream = () => {
  const [searchParams] = useSearchParams();
  const initialTier = getInitialTier(searchParams.get("offer"));
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(() => initialTier.id);
  // Mobile shoppers should never have to scroll just to find the purchase
  // action. Start visible, hide only while the full buy-box CTA is on screen.
  const [showStickyBottom, setShowStickyBottom] = useState(true);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(s => s.addItem);
  // F07: the correctness fix for the cart(2)/$76 double-add lives in
  // cartStore.addItem, which now early-returns while a request is in flight —
  // that covers every call site, not just this page. Subscribing to isLoading
  // here is purely UX: it disables all three CTA buttons so the user gets
  // immediate visual feedback instead of a dead-feeling button. Don't remove
  // it as redundant; it's doing different work from the store guard.
  const isAddingToCart = useCartStore(s => s.isLoading);

  const selectedOption = BUY_OPTIONS.find(o => o.id === quantity) || BUY_OPTIONS[0];

  // add_to_cart fires only after the Storefront API confirms the line. It used
  // to fire before addItem was even called, so a rejected add (out of stock,
  // quantity cap, expired cart) still reported a successful add_to_cart to GA4
  // and Meta — inflating the funnel and training Meta's optimizer on
  // conversions that never happened. addItem now resolves { success }.
  const handleAddToCart = (source: string) => {
    if (useCartStore.getState().isLoading) return;
    void addItem(buildCartItem(selectedOption)).then((result) => {
      if (!result.success) return;
      trackEvent("add_to_cart", {
        content_name: "Base Layer Face Cream",
        content_ids: ["base-layer-face-cream"],
        value: selectedOption.price,
        currency: "USD",
        source,
      });
    });
  };
  const msrp = 48 * selectedOption.bottles;

  useCanonical();
  useMetaTags({
    title: "Best Men's Face Moisturizer - Base Layer Performance Daily Face Cream | $38",
    description: "The one-step daily face cream for men. Absorbs in 15 seconds. Replaces serum, moisturizer, and eye cream. Niacinamide 5% + Copper Peptides. $38 a bottle, 2-pack $68, 30-day guarantee.",
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
      setShowStickyBottom(!entry.isIntersecting);
    }, { threshold: 0.15 });
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  const nextImage = () => setActiveImage((c) => (c + 1) % GALLERY.length);
  const prevImage = () => setActiveImage((c) => (c - 1 + GALLERY.length) % GALLERY.length);
  const showMobileImage = (index: number) => {
    const gallery = mobileGalleryRef.current;
    if (!gallery) return;
    gallery.scrollTo({ left: gallery.clientWidth * index, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#1A2F4C]">
      <JsonLd data={[PRODUCT_SCHEMA, buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Face Cream" }]), buildFaqSchema(faqs)]} />
      <Navbar />
      
      <main className="pt-24 pb-0">
        
        {/* ABOVE THE FOLD — TWO COLUMN LAYOUT */}
        <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-0 md:grid-cols-[55%_45%] md:gap-[32px] md:px-6 md:py-8 lg:grid-cols-2 lg:gap-[48px] lg:px-12">
          
          {/* LEFT COLUMN: IMAGE GALLERY */}
          <div className="w-full flex-col gap-4 hidden md:flex">
            <div className="relative aspect-square w-full rounded-[2px] overflow-hidden bg-[#E2E8F0]">
              {GALLERY.map((img, idx) => (
                <div key={idx} className={`absolute inset-0 transition-opacity duration-300 ${activeImage === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                  {img.type === "image" ? (
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover bg-[#E2E8F0]" {...(idx === 0 ? { loading: "eager" as const, fetchpriority: "high" } : { loading: "lazy" as const })} width={1024} height={1024} />
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
                <button key={idx} onClick={() => setActiveImage(idx)} aria-label={`View product image ${idx + 1}`} className={`relative w-[60px] h-[60px] rounded overflow-hidden flex-shrink-0 bg-[#E2E8F0] ${activeImage === idx ? "border-2 border-[#1A2F4C]" : "border border-transparent"}`}>
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
          <div className="relative aspect-square w-full overflow-hidden bg-[#E2E8F0] md:hidden">
            <div ref={mobileGalleryRef} className="flex h-full w-full snap-x snap-mandatory overflow-x-auto hide-scrollbar"
                 aria-label="Product image gallery"
                 onScroll={(e) => {
                   const scrollLeft = e.currentTarget.scrollLeft;
                   const width = e.currentTarget.clientWidth;
                   setActiveImage(Math.round(scrollLeft / width));
                 }}>
              {GALLERY.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                  {img.type === "image" ? (
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" {...(idx === 0 ? { loading: "eager" as const, fetchpriority: "high" } : { loading: "lazy" as const })} width={1024} height={1024} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E2E8F0] p-4 text-center text-[#ABB3BB]">
                      [Placeholder: {img.alt}]
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full bg-black/15 px-1 backdrop-blur-[2px]">
              {GALLERY.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => showMobileImage(idx)}
                  aria-label={`Show product image ${idx + 1} of ${GALLERY.length}`}
                  aria-current={activeImage === idx ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center"
                >
                  <span className={`h-2 w-2 rounded-full ring-1 ring-black/10 ${activeImage === idx ? "bg-[#1A2F4C]" : "bg-white/80"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: BUY BOX */}
          <div id="purchase-options" className="flex min-h-[500px] flex-col px-5 pb-8 pt-6 sm:px-8 md:min-h-[600px] md:px-0 md:pb-0 md:pt-0">
            {/* 1. Founding Price Badge */}
            <div className="flex items-center mb-3">
              <span className="font-heading font-semibold text-[11px] tracking-[0.12em] uppercase text-brand">Founding Price</span>
              <span className="font-body text-[13px] text-[#6B7280] ml-2">$38 now — $48 after launch</span>
            </div>

            {/* 2. Title & H1 SEO */}
            <h1 className="font-heading text-[24px] md:text-[28px] font-bold text-[#1A2F4C] leading-[1.2] mb-1">
              Performance Daily Face Cream
            </h1>

            {/* 2b. Judge.me rating summary — the "ranking widget" slot.
                Jumps to the review block rather than being a dead badge: the
                aggregate is the hook, the reviews are the proof, and a shopper
                who reads the stars is already looking for them. Renders nothing
                below the review gate, since reviewAggregate zeroes there. */}
            {PRODUCT_RATING.count > 0 && (
              <a
                href="#reviews"
                className="group mb-1 inline-flex w-fit items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2"
                aria-label={`Rated ${PRODUCT_RATING.rating.toFixed(1)} out of 5 from ${PRODUCT_RATING.count} Judge.me ${PRODUCT_RATING.count === 1 ? "review" : "reviews"} — read them`}
              >
                <StarRating rating={PRODUCT_RATING.rating} />
                <span className="font-body text-[13px] text-[#4A5568]">
                  <span className="font-heading font-semibold text-[#1A2F4C]">
                    {PRODUCT_RATING.rating.toFixed(1)}
                  </span>
                  <span className="mx-1.5 text-[#CBD5E1]">·</span>
                  <span className="underline decoration-[#CBD5E1] underline-offset-[3px] transition-colors group-hover:decoration-[#1A2F4C]">
                    {PRODUCT_RATING.count} {PRODUCT_RATING.count === 1 ? "review" : "reviews"}
                  </span>
                </span>
              </a>
            )}

            {/* 3. Short Desc */}
            <p className="font-body text-[15px] text-[#4A5568] mb-4">
              The one-step daily moisturizer for men.
            </p>

            {/* 4. Price Block */}
            <div className="flex items-center mb-5">
              <span className="font-body text-[16px] text-[#6B7280] line-through mr-2">${msrp}</span>
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
            <div className="mb-[20px] grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Select quantity">
              {BUY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={quantity === opt.id}
                  onClick={() => setQuantity(opt.id)}
                  className={`relative min-w-0 cursor-pointer rounded-[2px] px-1.5 py-4 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-3 sm:py-5 ${quantity === opt.id ? "border-[2px] border-[#1A2F4C] bg-white shadow-[0_2px_8px_rgba(26,47,76,0.08)]" : "border border-[#E2E8F0] bg-[#F7F8FA]"}`}
                >
                  {opt.badge && (
                    <div className={`absolute -top-[10px] left-1/2 -translate-x-1/2 ${opt.badgeColor} whitespace-nowrap rounded-[10px] px-2 py-[4px] font-heading text-[8px] font-semibold uppercase tracking-[0.08em] text-white sm:px-[10px] sm:text-[9px] sm:tracking-[0.12em]`}>
                      {opt.badge}
                    </div>
                  )}
                  <div className="font-heading text-[13px] font-bold uppercase leading-tight text-[#1A2F4C] sm:text-[16px]">{opt.label}</div>
                  <div className="font-body text-[11px] font-medium leading-tight text-[#6B7280] sm:text-[13px]">{opt.duration}</div>
                  <div className="mt-3 font-heading text-[21px] font-extrabold text-[#1A2F4C] sm:text-[24px]">${opt.price}</div>
                  {opt.savings > 0 ? (
                    <div className="font-body font-semibold text-[12px] text-[#2E7D32]">save ${opt.savings}</div>
                  ) : (
                    <div className="h-[18px]"></div> 
                  )}
                  <div className="font-body text-[11px] text-[#6B7280] mt-1">{opt.kind === "subscription" ? "per bottle, delivered on your schedule" : `$${(opt.price / opt.bottles).toFixed(2).replace(/\.00$/, '')}/bottle`}</div>
                </button>
              ))}
            </div>

            {/* 7. CTA Button */}
            <button
              ref={ctaRef}
              disabled={isAddingToCart}
              className="w-full bg-brand text-white font-heading font-bold text-[15px] tracking-[0.1em] py-[16px] rounded-[4px] hover:bg-brand-hover active:scale-[0.98] transition-all mb-[12px] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={() => handleAddToCart("buy_box")}
            >
              {selectedOption.kind === "subscription" ? `SUBSCRIBE & SAVE - $${selectedOption.price}` : `ADD TO CART - $${selectedOption.price}`}
            </button>

            {selectedOption.kind === "subscription" && selectedOption.subCopy && (
              <p className="text-center font-body text-[12px] text-[#4A5568] mb-3 -mt-1">{selectedOption.subCopy}</p>
            )}

            {/* 8. Trust Micro-Copy */}
            <p className="text-center font-body text-[12px] text-[#6B7280]">
              {FREE_SHIPPING_PHRASE} &middot; 30-day money-back guarantee &middot; In stock, ships in 1-2 business days
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
                  <b.icon className="w-4 h-4 text-[#6B7280] mb-1" />
                  <span className="font-body text-[12px] text-[#6B7280] text-center leading-[1.2]">{b.label}</span>
                </div>
              ))}
            </div>

            {/*
              10. Tester pull quote.
              Deliberately a compact callout, not a full testimonial card: the same tester
              also appears in the full <TestimonialsSection /> further down this page, and
              repeating the avatar card would read as a duplication bug rather than a
              decision-point callout. Disclosure repeats here because FTC 16 CFR 255
              wants the material connection disclosed near each endorsement, not once
              per page.
            */}
            <div className="border-t border-[#E2E8F0] pt-4 mt-4">
              <StarRating rating={pullQuoteTestimonial.stars} />
              <p className="font-body text-[14px] text-[#2D3748] leading-[1.6] mt-2 mb-2">
                "{pullQuoteTestimonial.quote}"
              </p>
              <p className="font-body text-[12px] text-[#1A2F4C] mb-3">
                <span className="font-heading font-semibold">{pullQuoteTestimonial.name}</span>
                <span className="text-[#6B7280]"> · {pullQuoteTestimonial.detail}</span>
              </p>
              <p className="font-body text-[12px] text-[#6B7280] leading-[1.5]">
                {TESTIMONIAL_DISCLOSURE}
              </p>
            </div>

          </div>
        </section>

        {/* STICKY MOBILE CTA BAR */}
        <div
          aria-hidden={!showStickyBottom}
          className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 md:hidden ${showStickyBottom ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
        >
          <div className="flex flex-col">
            <span className="font-heading font-bold text-[20px] text-[#1A2F4C] leading-none">${selectedOption.price}</span>
            <span className="mt-1 font-body text-[11px] text-[#6B7280]">{selectedOption.label} · Free shipping</span>
          </div>
          <button
            disabled={isAddingToCart}
            tabIndex={showStickyBottom ? 0 : -1}
            className="min-h-12 shrink-0 rounded-[4px] bg-brand px-5 py-3 font-heading text-[12px] font-bold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => handleAddToCart("sticky_mobile_cta")}
          >
            {selectedOption.kind === "subscription" ? `SUBSCRIBE · $${selectedOption.price}` : `ADD ${selectedOption.label} · $${selectedOption.price}`}
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
                <Icon className="w-10 h-10 mx-auto mb-4 text-brand-accent" />
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
                  <Sun className="w-5 h-5 text-brand-accent" />
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

        {/* 6. CUSTOMER REVIEWS (Judge.me — renders nothing below 5 reviews) */}
        <ReviewsSection />

        {/* 7. WHAT GUYS ACTUALLY NOTICE (Import from newly redesigned component) */}
        <TestimonialsSection />

        <ComparisonTable />

        {/* 7. BEFORE YOU BUY (FAQ) */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-12 text-[#1A2F4C]">Before You Buy</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="font-body font-semibold text-left text-[#1A2F4C] hover:text-brand-accent">{faq.question}</AccordionTrigger>
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
            disabled={isAddingToCart}
            className="w-full sm:w-auto px-10 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-[4px] mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={() => handleAddToCart("face_cream_bottom")}
          >
            GET STARTED - ${selectedOption.price}
          </Button>
          <p className="font-body text-[13px] text-[#ABB3BB] leading-none text-center">
            30-day guarantee. Hate it? Keep the bottle.
          </p>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default FaceCream;
