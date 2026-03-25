import { useState } from "react";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { ChevronDown } from "lucide-react";

import productRockWebp from "@/assets/product-hero-rock-1200w.webp";
import productRockPng from "@/assets/product-hero-rock.png";
import heroProductWebp from "@/assets/hero-product.webp";
import heroProductJpg from "@/assets/hero-product.jpg";

/* ── Inline Data ─────────────────────────────────────────────────── */

const testimonials = [
  {
    quote: "I used to blot my forehead before every afternoon meeting. One week on Base Layer and I stopped.",
    name: "Sean",
    age: 34,
    skin: "oily",
  },
  {
    quote: "Everything I tried after shaving either stung or left a film. This absorbs fast and feels calm.",
    name: "Matt",
    age: 36,
    skin: "combination",
  },
  {
    quote: "Hotel air usually wrecks my skin. This is the one bottle I pack every trip.",
    name: "Cooper",
    age: 27,
    skin: "dry",
  },
  {
    quote: "Honestly thought this was going to be another greasy mess. It's completely matte within seconds.",
    name: "Drew",
    age: 32,
    skin: "oily",
  },
  {
    quote: "My girlfriend had me on a 5-step routine. Base Layer is the one thing I'll actually use every day.",
    name: "Nick",
    age: 29,
    skin: "combo",
  },
  {
    quote: "Bar soap for 15 years. Wish I'd switched sooner. Skin feels totally different.",
    name: "Marcus",
    age: 37,
    skin: "normal",
  },
];

const comparisonRows = [
  "Published ingredient percentages",
  "No subscription required",
  "Absorbs in 15 seconds",
  "Single product (replaces 3)",
  "30-day guarantee, keep the bottle",
  "Under $1/day",
  "Fragrance-free",
];

const ingredients = [
  { name: "Niacinamide", pct: "5%", benefit: "Controls oil, minimizes pores" },
  { name: "Copper Peptide GHK-Cu", pct: null, benefit: "Supports firmer-looking skin" },
  { name: "Hyaluronic Acid", pct: null, benefit: "Deep hydration" },
  { name: "Squalane", pct: null, benefit: "Lightweight moisture, zero grease" },
  { name: "Panthenol", pct: null, benefit: "Soothes post-shave" },
  { name: "Centella Asiatica", pct: null, benefit: "Calms redness" },
];

const timeline = [
  { label: "WEEK 1", text: "Oil control kicks in. Less shine by midday. Matte finish holds." },
  { label: "WEEK 2-4", text: "Texture improves. Skin feels smoother. Post-shave irritation fades." },
  { label: "WEEK 4-8", text: "Visible improvement in tone. People start noticing." },
];

const faqs = [
  { q: "Is this a subscription?", a: "No. One-time purchase. No auto-ship, no hidden charges." },
  { q: "Will it feel greasy?", a: "No. Absorbs in 15 seconds. Matte finish." },
  { q: "What skin type is it for?", a: "All skin types. Especially good for oily and combination." },
  { q: "How long does a bottle last?", a: "6-8 weeks with daily use." },
  { q: "When does it ship?", a: "Founding batch ships June 2026." },
  { q: "What if it doesn't work?", a: "Full refund within 30 days. Keep the bottle." },
];

const publications = [
  { name: "GQ", blurb: "Best grooming ingredients of the year" },
  { name: "Men's Health", blurb: "Skincare multitasker every guy needs" },
  { name: "Esquire", blurb: "Top grooming products for men" },
  { name: "Men's Journal", blurb: "Best face moisturizers for men" },
];

/* ── Reusable Helpers ────────────────────────────────────────────── */

const Stars = ({ className = "" }: { className?: string }) => (
  <div className={`flex gap-1 ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className="w-5 h-5 text-[#F95D1A] fill-current" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const CtaButton = ({ className = "" }: { className?: string }) => {
  const { openModal } = useEarlyAccess();
  return (
    <button
      onClick={() => openModal("landing_page")}
      className={`px-10 py-5 bg-[#F95D1A] text-[#FFFFFF] font-heading font-black tracking-widest text-[13px] md:text-[14px] uppercase hover:bg-[#1E201E] transition-all duration-300 rounded-none whitespace-nowrap ${className}`}
    >
      TRY IT RISK-FREE &mdash; $38
    </button>
  );
};

const Price = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-baseline gap-3 ${className}`}>
    <span className="font-heading text-4xl md:text-5xl font-black text-[#1E201E]">$38</span>
    <span className="font-heading text-xl md:text-2xl font-black text-[#1E201E]/40 line-through">$48</span>
  </div>
);

/* ── Shield SVG ──────────────────────────────────────────────────── */

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#F95D1A] mx-auto mb-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#F4F4F0] overflow-x-hidden">

      {/* ─── SECTION 1: HERO ──────────────────────────────────────── */}
      <section className="bg-[#F4F4F0]">
        {/* Logo bar */}
        <div className="pt-6 pb-4 flex justify-center">
          <span className="inline-flex flex-col items-center">
            <span className="w-16 h-px bg-[#1E201E]" />
            <span className="font-heading text-[13px] font-black tracking-[0.35em] uppercase text-[#1E201E] py-2">
              BASE LAYER
            </span>
            <span className="w-16 h-px bg-[#1E201E]" />
          </span>
        </div>

        {/* Two-column hero */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* LEFT */}
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <Stars />
                <span className="font-body text-xs text-[#1E201E]/60">50 early testers. Zero refund requests.</span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl md:text-[72px] font-black tracking-tighter text-[#1E201E] uppercase leading-[0.85] mb-6">
                ONE CREAM.<br />
                15 SECONDS.<br />
                DONE.
              </h1>

              <p className="font-body text-base md:text-lg text-[#1E201E]/80 leading-relaxed mb-8 max-w-lg">
                Your face takes a beating. One clinical-grade layer replaces your moisturizer, serum, and eye cream. Absorbs in 15 seconds. No residue.
              </p>

              <Price className="mb-6" />

              <CtaButton className="w-full md:w-auto mb-6" />

              <p className="font-body text-[11px] text-[#1E201E]/50 uppercase tracking-widest">
                FREE SHIPPING &middot; 30-DAY MONEY BACK &middot; NO SUBSCRIPTION
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex-1 flex justify-center">
              <picture>
                <source type="image/webp" srcSet={productRockWebp} />
                <img
                  src={productRockPng}
                  alt="Base Layer Performance Daily Face Cream on rock"
                  width={600}
                  height={600}
                  loading="eager"
                  className="w-full max-w-[500px] object-contain"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Proof bar */}
        <div className="bg-[#1A2F4C] py-4">
          <p className="font-body text-[11px] md:text-xs text-[#FFFFFF]/80 text-center tracking-[0.2em] uppercase">
            Clinically Proven &middot; Dermatologist Approved &middot; Made in Colorado
          </p>
        </div>
      </section>

      {/* ─── SECTION 2: PUBLICATION LOGOS BAR ─────────────────────── */}
      <section className="bg-[#F4F4F0] py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[#1E201E]/40 mb-10">
            FORMULATED WITH INGREDIENTS FEATURED IN
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {publications.map((pub) => (
              <div key={pub.name} className="flex flex-col items-center gap-2">
                <span className="font-serif text-3xl md:text-4xl font-bold text-[#1E201E] italic">
                  {pub.name}
                </span>
                <span className="font-body text-[11px] text-[#1E201E]/50 leading-snug">
                  {pub.blurb}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: PRODUCT CHECKOUT AREA ─────────────────────── */}
      <section className="bg-[#F4F4F0] py-16 md:py-24 px-6 md:px-12 border-t border-[#1E201E]/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-12 md:gap-16">
            {/* LEFT: Product image */}
            <div className="flex-1">
              <picture>
                <source type="image/webp" srcSet={heroProductWebp} />
                <img
                  src={heroProductJpg}
                  alt="Base Layer Face Cream product shot"
                  width={600}
                  height={600}
                  loading="lazy"
                  className="w-full object-contain"
                />
              </picture>
            </div>

            {/* RIGHT: Product details */}
            <div className="flex-1 max-w-lg">
              <h2 className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1E201E] mb-4">
                PERFORMANCE DAILY FACE CREAM
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <Stars />
                <span className="font-body text-sm text-[#1E201E]/60">50 reviews</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="font-heading text-3xl font-black text-[#1E201E]">$38</span>
                <span className="font-heading text-lg font-black text-[#1E201E]/40 line-through">$48</span>
                <span className="font-heading text-[10px] font-bold uppercase tracking-widest bg-[#1E201E] text-[#F4F4F0] px-3 py-1">
                  FOUNDING BATCH
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Absorbs in 15 seconds",
                  "Matte finish all day",
                  "Replaces 3 products",
                  "Fragrance-free",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-3 font-body text-sm text-[#1E201E]/80">
                    <span className="text-[#F95D1A] font-bold text-base">&#10003;</span>
                    {b}
                  </li>
                ))}
              </ul>

              <CtaButton className="w-full mb-6" />

              <div className="flex items-center justify-between border-t border-[#1E201E]/10 pt-4 mb-4">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#1E201E]/60">
                    <rect x="3" y="11" width="18" height="11" rx="0" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span className="font-body text-[10px] text-[#1E201E]/50 uppercase tracking-wider">Secure Checkout</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 border-x border-[#1E201E]/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#1E201E]/60">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                  <span className="font-body text-[10px] text-[#1E201E]/50 uppercase tracking-wider">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-[#1E201E]/60">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="font-body text-[10px] text-[#1E201E]/50 uppercase tracking-wider">30-Day Guarantee</span>
                </div>
              </div>

              <p className="font-body text-xs text-[#1E201E]/40 text-center">
                No subscription. Buy once.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: TESTIMONIALS ──────────────────────────────── */}
      {/* TODO: Replace with real beta tester reviews before launch */}
      <section className="bg-[#1A2F4C] py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#FFFFFF] mb-4">
              WHAT MEN ARE SAYING
            </h2>
            <div className="flex items-center justify-center gap-3">
              <Stars />
              <span className="font-body text-sm text-[#FFFFFF]/60">50 early testers. Zero refund requests.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {testimonials.map((t) => (
              <div key={t.name} className="border border-[#FFFFFF]/10 p-6 md:p-8">
                <Stars className="mb-4" />
                <blockquote className="font-body text-base md:text-lg text-[#FFFFFF] leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFFFFF]/50">
                  {t.name}, {t.age} &middot; {t.skin} skin
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <CtaButton />
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: COMPARISON ────────────────────────────────── */}
      <section className="bg-[#F4F4F0] py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#1E201E] text-center mb-12">
            BASE LAYER VS. THE OTHERS
          </h2>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center border-b-2 border-[#1E201E] pb-4 mb-0">
            <span />
            <span className="font-heading text-xs font-black uppercase tracking-widest text-[#FFFFFF] bg-[#F95D1A] px-4 py-2 text-center min-w-[120px]">
              BASE LAYER
            </span>
            <span className="font-heading text-xs font-black uppercase tracking-widest text-[#1E201E]/60 px-4 py-2 text-center min-w-[120px]">
              THE OTHERS
            </span>
          </div>

          {/* Table rows */}
          {comparisonRows.map((row, i) => (
            <div
              key={row}
              className={`grid grid-cols-[1fr_auto_auto] items-center py-4 border-b border-[#1E201E]/10 ${
                i % 2 === 0 ? "bg-[#F4F4F0]" : "bg-[#E8EAE6]/50"
              }`}
            >
              <span className="font-body text-sm text-[#1E201E]/80 pr-4">{row}</span>
              <span className="text-center min-w-[120px] font-bold text-[#F95D1A] text-lg">&#10003;</span>
              <span className="text-center min-w-[120px] font-bold text-[#1E201E]/30 text-lg">&#10007;</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION 6: KEY INGREDIENTS ───────────────────────────── */}
      <section className="bg-[#F4F4F0] py-20 md:py-28 px-6 md:px-12 border-t border-[#1E201E]/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#1E201E] mb-4">
              WHAT'S INSIDE
            </h2>
            <p className="font-body text-base text-[#1E201E]/60 max-w-md mx-auto">
              Every ingredient earns its place. No filler. No fragrance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredients.map((ing) => (
              <div key={ing.name} className="bg-[#1E201E] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-heading text-sm font-black uppercase tracking-wider text-[#FFFFFF]">
                    {ing.name}
                  </h3>
                  {ing.pct && (
                    <span className="font-heading text-[10px] font-bold uppercase tracking-widest bg-[#F95D1A] text-[#FFFFFF] px-2 py-0.5">
                      {ing.pct}
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-[#FFFFFF]/60 leading-relaxed">
                  {ing.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: RESULTS TIMELINE ──────────────────────────── */}
      <section className="bg-[#1A2F4C] py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#FFFFFF] text-center mb-16">
            WHAT TO EXPECT
          </h2>

          <div className="relative">
            {/* Vertical connector line (hidden on mobile) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#FFFFFF]/10 -translate-x-1/2" />

            <div className="flex flex-col gap-12 md:gap-16">
              {timeline.map((stage, i) => (
                <div key={stage.label} className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10">
                  {/* Week label */}
                  <div className={`md:w-1/3 ${i % 2 === 0 ? "md:text-right" : "md:text-right"}`}>
                    <span className="font-heading text-2xl md:text-3xl font-black text-[#F95D1A] uppercase tracking-tight">
                      {stage.label}
                    </span>
                  </div>

                  {/* Connector dot */}
                  <div className="hidden md:flex items-center justify-center relative z-10">
                    <span className="w-4 h-4 bg-[#F95D1A] block" />
                  </div>

                  {/* Description */}
                  <div className="md:w-1/2">
                    <p className="font-body text-base md:text-lg text-[#FFFFFF]/80 leading-relaxed">
                      {stage.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: HOW TO USE ────────────────────────────────── */}
      <section className="bg-[#F4F4F0] py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#1E201E] text-center mb-16">
            15 SECONDS. EVERY MORNING.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {[
              { num: "1", title: "WASH", desc: "Splash your face with water. Pat dry." },
              { num: "2", title: "APPLY", desc: "Two pumps. Spread evenly -- forehead, cheeks, chin, neck." },
              { num: "3", title: "DONE", desc: "That's it. No toner. No serum. Move on with your day." },
            ].map((step) => (
              <div key={step.num} className="text-center md:text-left">
                <span className="font-heading text-6xl md:text-7xl font-black text-[#F95D1A] leading-none block mb-4">
                  {step.num}
                </span>
                <h3 className="font-heading text-xl font-black uppercase tracking-wider text-[#1E201E] mb-3">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-[#1E201E]/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: RISK REVERSAL + FINAL CTA ────────────────── */}
      <section className="bg-[#F4F4F0] py-20 md:py-28 px-6 md:px-12 border-t border-[#1E201E]/10">
        <div className="max-w-[680px] mx-auto text-center">
          <ShieldIcon />

          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#1E201E] mb-6">
            30 DAYS. FULL REFUND. KEEP THE BOTTLE.
          </h2>

          <p className="font-body text-base text-[#1E201E]/70 leading-relaxed mb-8 max-w-lg mx-auto">
            If you don't notice a difference in how your skin looks and feels, we refund every cent. No questions. No hassle.
          </p>

          <Price className="justify-center mb-6" />

          <CtaButton className="mb-6" />

          <p className="font-body text-xs text-[#1E201E]/50">
            Founding batch &mdash; 500 bottles at $38. When they're gone, price goes to $48.
          </p>
        </div>
      </section>

      {/* ─── SECTION 10: FAQ ──────────────────────────────────────── */}
      <section className="bg-[#F4F4F0] py-20 md:py-28 px-6 md:px-12 border-t border-[#1E201E]/10">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-black tracking-tight uppercase text-[#1E201E] text-center mb-12">
            QUICK ANSWERS
          </h2>

          <div className="border-t-2 border-[#1E201E]">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-[#1E201E]/20 group">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between py-6 md:py-8 text-left transition-colors hover:text-[#F95D1A]"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`font-heading text-lg md:text-xl font-bold uppercase tracking-tight pr-6 transition-colors duration-300 ${
                        isOpen ? "text-[#F95D1A]" : "text-[#1E201E]"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <div
                      className={`relative w-8 h-8 rounded-none border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? "border-[#F95D1A] bg-[#F95D1A] text-[#FFFFFF]"
                          : "border-[#1E201E]/20 text-[#1E201E] group-hover:border-[#F95D1A] group-hover:text-[#F95D1A]"
                      }`}
                    >
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                    </div>
                  </button>

                  <div
                    className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="font-body text-base md:text-lg text-[#1E201E]/70 leading-relaxed pb-8 md:pb-10 max-w-2xl pr-12">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 11: MINIMAL FOOTER ───────────────────────────── */}
      <footer className="bg-[#F4F4F0] py-12 px-6 md:px-12 border-t border-[#1E201E]/10">
        <div className="max-w-[800px] mx-auto text-center space-y-3">
          <p className="font-body text-xs text-[#1E201E]/60 tracking-wide">
            Base Layer Skin &middot; Breckenridge, CO 80424
          </p>
          <p className="font-body text-xs text-[#1E201E]/60">
            <a href="mailto:contact@baselayerskin.co" className="hover:text-[#1E201E] transition-colors">
              contact@baselayerskin.co
            </a>
          </p>
          <p className="font-body text-xs text-[#1E201E]/40">
            &copy; 2026 Base Layer. All rights reserved.
          </p>
          <p className="font-body text-[10px] text-[#1E201E]/30 max-w-md mx-auto leading-relaxed pt-4">
            These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
