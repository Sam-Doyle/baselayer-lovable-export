import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/stores/cartStore";
import { AVAILABLE_TIERS, buildCartItem, getInitialTier, metaContentId, tierCtaLabel, tierSummary } from "@/config/product";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { trackLifecycleProductViewed } from "@/lib/lifecycle";
import { useEffect, useState, useRef } from "react";
import textureSmearStone from "@/assets/generated-creatives/asset_texture_smear_stone_1772750541116.png";
import { Mountain, ShieldCheck, Droplets, Timer, Leaf, Check, Sun, Moon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import TestimonialsSection from "@/components/TestimonialsSection";
import ReviewsSection from "@/components/ReviewsSection";
import StarRating from "@/components/StarRating";
import { reviewAggregate, reviewSchema } from "@/lib/reviews";
import { merchantOfferFields } from "@/config/merchantSchema";
import { FREE_SHIPPING_PHRASE } from "@/config/legal";
import { metaFor } from "@/config/pageSeo";
import ProductGallery from "@/components/ProductGallery";
import { PRODUCT_GALLERY_IMAGES } from "@/data/productGallery";
import { HOW_TO_USE_MEDIA } from "@/data/howToUseMedia";
import PdpJumpNav from "@/components/PdpJumpNav";
import CustomerProofStrip from "@/components/CustomerProofStrip";
import FormulaEvidenceSection from "@/components/FormulaEvidenceSection";
import BlueprintPriceContrast from "@/components/BlueprintPriceContrast";
import SkinProfileCards from "@/components/SkinProfileCards";

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Base Layer Men's Performance Daily Face Cream",
  description: "Fast-absorbing men's face moisturizer with niacinamide 5%, copper peptide GHK-Cu 0.03%, panthenol, centella asiatica, squalane, and hyaluronic acid. Fragrance-free. 50mL.",
  brand: { "@type": "Brand", name: "Base Layer" },
  /*
   * image, sku and url were absent here while every other Product schema on the
   * site carried them. image is the one that costs something: Google will not
   * render a product rich result without it, so this page — the only route with
   * a real rating attached — was the least eligible of the four.
   *
   * sku matches the 1-bottle variant in Shopify and the SKU the other pages
   * declare, which is what lets Google treat all four as one product rather
   * than four thin duplicates of the same $38 cream.
   */
  image: "https://baselayerskin.co/og-mountain-product-v2.jpg",
  sku: "BL-PDFC-50ML",
  url: "https://baselayerskin.co/face-cream",
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
   * aggregateRating is spread in only once the configured real-review gate is met.
   * Never emit it with reviewCount: 0 — Google's Rich Results Test treats that
   * as an error on the Product itself, which can cost the whole rich result
   * rather than just the stars. reviewAggregate zeroes below the gate, so this
   * hides on exactly the same condition as <StarRating> and <ReviewsSection>.
   *
   * `review` rides the same gate and answers the other half of the Search
   * Console warning ("Missing field review"). It is safe here and only here:
   * this page renders every one of those reviews below the fold, and Google
   * requires marked-up reviews to be visible on the page carrying them.
   */
  ...(reviewAggregate.count > 0 && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewAggregate.rating.toFixed(1),
      reviewCount: reviewAggregate.count,
    },
    review: reviewSchema,
  }),
};

const faqs = [
  { question: "Will this leave my face greasy?", answer: "It is designed to absorb quickly with a lightweight, matte finish. Skin varies, so the 30-day guarantee gives you time to judge the finish on your own face." },
  { question: "Can I put this on right after shaving?", answer: "Yes. The formula includes 2% panthenol to help soothe skin and support its natural moisture barrier. If shaving leaves your skin raw or broken, let it settle before applying." },
  { question: "Will this break me out?", answer: "The formula is designed to be non-comedogenic, but no moisturizer can promise the same response for every person. Patch test first if you are acne-prone or reactive, and stop use if irritation develops." },
  { question: "How is this different from CeraVe or Nivea?", answer: "Base Layer combines moisturizer and serum-style ingredients in one step and publishes its active concentrations: 5% niacinamide, 0.03% GHK-Cu, 2% panthenol, and 1% centella asiatica, all in a hyaluronic acid cream base with squalane. Compare the full ingredient lists and choose the formula that fits your skin and routine." },
  { question: "Do I have to subscribe?", answer: "No. Buying once is the default and always will be. Subscribe & Save is there if you want the discount and hate reordering — pause or cancel in one click, no lock-in, no hoops." },
];

const BUY_OPTIONS = AVAILABLE_TIERS;

// F01 social-proof slot, wired to Judge.me via src/lib/reviews.ts (data baked
// in at build time by scripts/fetch-reviews.mjs). Reads {rating: 0, count: 0}
// below REVIEW_GATE, which hides the rating link and keeps aggregateRating out
// of the Product schema. Not sourced from Sanity's product.rating field, which
// is hand-editable — the whole point is that no human can type this number.
const PRODUCT_RATING = reviewAggregate;

const FaceCream = () => {
  const [searchParams] = useSearchParams();
  const initialTier = getInitialTier(searchParams.get("offer"));
  const [quantity, setQuantity] = useState(() => initialTier.id);
  // Mobile shoppers should never have to scroll just to find the purchase
  // action. Start visible, hide only while the full buy-box CTA is on screen.
  const [showStickyBottom, setShowStickyBottom] = useState(true);
  const ctaRef = useRef<HTMLButtonElement>(null);
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
        content_ids: [metaContentId(selectedOption.variantGid as string)],
        value: selectedOption.price,
        currency: "USD",
        source,
      });
    });
  };
  const msrp = 48 * selectedOption.bottles;

  useCanonical();
  useMetaTags(metaFor("/face-cream"));

  useEffect(() => {
    // Value and ID come from the tier that's actually preselected, not a
    // literal. This sent value 38 for the whole window in which the 2-pack
    // was the PDP default, which is what Meta and GA4 were optimizing on.
    trackEvent("view_item", {
      content_name: "Base Layer Face Cream",
      content_ids: [metaContentId(initialTier.variantGid as string)],
      value: initialTier.price,
      currency: "USD",
    });
    trackLifecycleProductViewed({
      id: metaContentId(initialTier.variantGid as string),
      name: "Base Layer Performance Daily Face Cream",
      variant: initialTier.label,
      price: initialTier.price,
      url: "https://baselayerskin.co/face-cream",
      image: "https://baselayerskin.co/og-mountain-product-v2.jpg",
    });

    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyBottom(!entry.isIntersecting);
    }, { threshold: 0.15 });
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [initialTier.label, initialTier.price, initialTier.variantGid]);

  return (
    <div className="min-h-screen bg-white text-[#1A2F4C]">
      <JsonLd data={[PRODUCT_SCHEMA, buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Face Cream" }]), buildFaqSchema(faqs)]} />
      <Navbar />
      
      <main className="pt-24 pb-0">
        <PdpJumpNav />
        
        {/* ABOVE THE FOLD — TWO COLUMN LAYOUT */}
        <section id="offer" className="scroll-mt-[160px] mx-auto grid max-w-[1200px] grid-cols-1 gap-0 md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] md:gap-[32px] md:px-6 md:py-8 lg:grid-cols-2 lg:gap-[48px] lg:px-12">
          
          {/* LEFT COLUMN: IMAGE GALLERY */}
          <ProductGallery images={PRODUCT_GALLERY_IMAGES} className="self-start" />

          {/* RIGHT COLUMN: BUY BOX */}
          <div id="purchase-options" className="flex min-h-[500px] flex-col px-5 pb-8 pt-6 sm:px-8 md:min-h-[600px] md:px-0 md:pb-0 md:pt-0">
            {/* 1. Selected-offer context. The global founding price remains
                $38; this line tells the shopper exactly what the displayed
                total covers when the higher-value two-pack is selected. */}
            <div className="flex items-center mb-3">
              <span className="font-heading font-semibold text-[11px] tracking-[0.12em] uppercase text-brand">
                {selectedOption.kind === "subscription" ? "Subscribe & Save" : "Founding Offer"}
              </span>
              <span className="font-body text-[13px] text-[#6B7280] ml-2">
                {selectedOption.bottles > 1 ? `${selectedOption.bottles} bottles` : "1 bottle"}
              </span>
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
                aria-label={`${PRODUCT_RATING.rating.toFixed(1)} · ${PRODUCT_RATING.count} ${PRODUCT_RATING.count === 1 ? "review" : "reviews"} — rated ${PRODUCT_RATING.rating.toFixed(1)} out of 5; read customer reviews`}
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
                {Math.round(((msrp - selectedOption.price) / msrp) * 100)}% BELOW FUTURE RETAIL
              </span>
            </div>
            <p className="-mt-3 mb-5 font-body text-[12px] font-semibold text-[#4A5568]">
              {tierSummary(selectedOption)}
            </p>

            {/* 5. Benefit Checkmarks */}
            <div className="flex flex-col gap-2 mb-[24px]">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2E7D32] mt-1 shrink-0" />
                <span className="font-body text-[14px] text-[#2D3748] leading-[1.6]">Fast-absorbing, lightweight finish designed to stay matte</span>
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
                    <div className="font-body font-semibold text-[12px] text-[#2E7D32]">
                      save ${opt.savings} {opt.kind === "subscription" ? "vs one-time" : "vs 2 singles"}
                    </div>
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
              {tierCtaLabel(selectedOption)}
            </button>

            {selectedOption.kind === "subscription" && selectedOption.subCopy && (
              <p className="text-center font-body text-[12px] text-[#4A5568] mb-3 -mt-1">{selectedOption.subCopy}</p>
            )}

            {/* 8. Trust Micro-Copy */}
            <p className="text-center font-body text-[12px] text-[#6B7280]">
              {FREE_SHIPPING_PHRASE} &middot; 30-day money-back guarantee &middot; In stock, ships in 1-2 business days
            </p>

            {/* 9. Trust Badges Row */}
            <div className="mt-6 grid grid-cols-2 border-t border-[#E2E8F0] pt-4 sm:grid-cols-4">
              {[
                {icon: Mountain, label: "Breckenridge-Formulated"}, 
                {icon: Droplets, label: "Fragrance-Free"},
                {icon: ShieldCheck, label: "30-Day Guarantee"},
                {icon: Leaf, label: "Cruelty-Free"}
              ].map((b, i) => (
                <div key={b.label} className={`flex min-h-[64px] flex-col items-center justify-center px-2 ${i % 2 === 1 ? 'border-l border-[#E2E8F0]' : ''} ${i > 1 ? 'border-t border-[#E2E8F0] pt-3 sm:border-t-0 sm:pt-0' : ''} ${i > 1 ? 'sm:border-l' : i === 1 ? 'sm:border-l' : ''}`}>
                  <b.icon className="w-4 h-4 text-[#6B7280] mb-1" />
                  <span className="font-body text-[12px] text-[#6B7280] text-center leading-[1.2]">{b.label}</span>
                </div>
              ))}
            </div>

            {/* 10. Purchase reassurance — answers the last questions at the
                decision point without duplicating genuine reviews below. */}
            <div className="mt-5 border border-[#D8D3CA] bg-[#F7F4EE] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div>
                  <h2 className="font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-[#1A2F4C]">
                    Try it for 30 days
                  </h2>
                  <p className="mt-1 font-body text-[13px] leading-[1.55] text-[#4A5568]">
                    Use it daily. If it&apos;s not for you, keep the bottle—we&apos;ll refund your purchase.
                  </p>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="mt-3 border-t border-[#E2E8F0]">
              <AccordionItem value="what-you-get" className="border-[#E2E8F0]">
                <AccordionTrigger className="min-h-12 py-3 text-left font-heading text-[13px] font-semibold text-[#1A2F4C] hover:no-underline">
                  What you get
                </AccordionTrigger>
                <AccordionContent className="font-body text-[13px] leading-[1.6] text-[#4A5568]">
                  50 mL / 1.7 fl oz. Use one pump morning and night. A bottle lasts about six weeks; actual duration varies with how much you apply.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping-returns" className="border-[#E2E8F0]">
                <AccordionTrigger className="min-h-12 py-3 text-left font-heading text-[13px] font-semibold text-[#1A2F4C] hover:no-underline">
                  Shipping &amp; returns
                </AccordionTrigger>
                <AccordionContent className="font-body text-[13px] leading-[1.6] text-[#4A5568]">
                  {FREE_SHIPPING_PHRASE}. In-stock orders ship in 1–2 business days. Your first order is covered by our 30-day guarantee, with no return shipment required.{" "}
                  <Link to="/refund-policy" className="font-semibold text-[#1A2F4C] underline underline-offset-2 hover:no-underline">
                    Read the policy
                  </Link>
                  .
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="formula-safety" className="border-[#E2E8F0]">
                <AccordionTrigger className="min-h-12 py-3 text-left font-heading text-[13px] font-semibold text-[#1A2F4C] hover:no-underline">
                  Formula &amp; safety
                </AccordionTrigger>
                <AccordionContent className="font-body text-[13px] leading-[1.6] text-[#4A5568]">
                  Fragrance-free and non-comedogenic, with six active ingredients including 5% niacinamide and 0.03% copper peptide GHK-Cu. If your skin is reactive, patch test before use.{" "}
                  <Link to="/ingredients" className="font-semibold text-[#1A2F4C] underline underline-offset-2 hover:no-underline">
                    See every ingredient
                  </Link>
                  .
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-5">
              <CustomerProofStrip />
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
            {tierCtaLabel(selectedOption)}
          </button>
        </div>

        {/* BELOW THE FOLD */}
        
        {/* 1. What It Actually Does */}
        <section id="results" className="scroll-mt-[160px] mx-auto mt-10 max-w-[1200px] border-t border-[#E2E8F0] bg-white px-6 py-14 md:mt-16 md:py-20">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold uppercase tracking-wide text-[#1A2F4C] md:mb-12 md:text-3xl">What It Actually Does</h2>
          <div className="grid grid-cols-1 gap-9 md:grid-cols-3 md:gap-8">
            {[
              { icon: Timer, title: "Absorbs Fast", desc: "Squalane is a lightweight emollient selected to help hold moisture without the heavy feel of a traditional cream." },
              { icon: Droplets, title: "Stays Matte", desc: "The formula pairs a matte finish with 5% niacinamide, selected to help balance the appearance of oil over time." },
              { icon: Leaf, title: "Post-Shave Support", desc: "Two percent panthenol helps soothe skin, while centella supports comfortable-feeling skin and its natural moisture barrier." },
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

        <div id="formula" className="scroll-mt-[160px]">
          <FormulaEvidenceSection />
        </div>

        {/* 4. NEW SECTION: HOW TO USE */}
        <section className="bg-[#F7F8FA] px-6 py-14 md:py-20">
          <div className="mx-auto grid max-w-[1000px] grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            {/* Left: Product Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-[#E2E8F0] shadow-sm">
              <picture>
                <source
                  type="image/avif"
                  srcSet={HOW_TO_USE_MEDIA.avifSrcSet}
                  sizes={HOW_TO_USE_MEDIA.sizes}
                />
                <source
                  type="image/webp"
                  srcSet={HOW_TO_USE_MEDIA.webpSrcSet}
                  sizes={HOW_TO_USE_MEDIA.sizes}
                />
                <img
                  src={HOW_TO_USE_MEDIA.src}
                  alt={HOW_TO_USE_MEDIA.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width={HOW_TO_USE_MEDIA.width}
                  height={HOW_TO_USE_MEDIA.height}
                />
              </picture>
            </div>
            {/* Right: Text and Instructions */}
            <div className="flex flex-col text-left px-0 md:px-8">
              <span className="font-heading font-semibold text-[13px] md:text-[14px] uppercase tracking-[0.05em] text-[#4A5568] mb-2">HOW TO USE</span>
              <h2 className="mb-6 font-heading text-[28px] font-bold uppercase text-[#1A2F4C] md:text-3xl">One pump. Twice a day.</h2>
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
        <SkinProfileCards />

        {/* 6. CUSTOMER REVIEWS (Judge.me — renders nothing below REVIEW_GATE) */}
        <ReviewsSection />

        {/* 7. WHAT GUYS ACTUALLY NOTICE (Import from newly redesigned component) */}
        <TestimonialsSection
          ctaLabel={tierCtaLabel(selectedOption)}
          ctaDisabled={isAddingToCart}
          onCtaClick={() => handleAddToCart("tester_section")}
        />

        <BlueprintPriceContrast />

        {/* 7. BEFORE YOU BUY (FAQ) */}
        <section id="faq" className="scroll-mt-[160px] bg-white px-6 py-14 md:py-20">
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
            ONE MOISTURIZER.<br className="md:hidden" /> DAILY HYDRATION.<br className="md:hidden" /> NO HEAVY FINISH.
          </h2>
          <Button
            size="lg"
            disabled={isAddingToCart}
            className="w-full sm:w-auto px-10 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-brand text-white hover:bg-brand-hover border-none transition-all duration-300 rounded-[4px] mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={() => handleAddToCart("face_cream_bottom")}
          >
            {tierCtaLabel(selectedOption)}
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
