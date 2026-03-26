import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { Star, CheckCircle2 } from "lucide-react";

import productBoxBottle from "@/assets/generated-creatives/product-box-bottle.jpg";
import productInHand from "@/assets/generated-creatives/product-in-hand.jpg";
import productMacroText from "@/assets/generated-creatives/product-macro-text.jpg";
import productBathroom from "@/assets/generated-creatives/product-bathroom-counter.jpg";
import textureSmear from "@/assets/generated-creatives/asset_texture_smear_stone_1772750541116.png";
import step2MirrorImg from "@/assets/generated-creatives/step2-mirror-cream.jpg";

const LISTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "5 Reasons Men Are Switching From Drugstore Face Creams To Base Layer",
  "image": "https://baselayerskin.com/og-image.jpg",
  "datePublished": new Date().toISOString().split('T')[0],
  "author": { "@type": "Organization", "name": "Base Layer" }
};

const Listicle = () => {
  useCanonical();
  useMetaTags({
    title: "5 Reasons Men Are Switching From Drugstore Face Creams",
    description: "Discover why men are ditching oily drugstore moisturizers for this one-step clinical alternative."
  });

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { page: 'listicle_5_reasons_v2', type: 'advertorial' });

    const handleScroll = () => {
      if (window.scrollY > 800) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = () => trackEvent('listicle_cta_click', { action: 'navigate_to_product' });

  // Reusable Step Component
  const ZigZagStep = ({ num, title, text, img, cta, reverse = false }: { num: string, title: string, text: string, img: string, cta: string, reverse?: boolean }) => (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 max-w-[1100px] mx-auto py-16 px-6`}>
      <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg aspect-square md:aspect-[4/5] relative">
        <img src={img} alt={title} className="w-full h-full object-cover absolute inset-0" />
      </div>
      <div className="w-full md:w-1/2 flex flex-col items-start text-left">
        <div className="w-10 h-10 rounded-full bg-[#E5F5E9] flex items-center justify-center mb-6">
          <span className="text-[#2E7D32] font-heading font-black text-xl leading-none">{num}</span>
        </div>
        <h3 className="font-heading font-bold text-3xl md:text-4xl text-[#1A2F4C] mb-4 leading-tight">
          {title}
        </h3>
        <p className="font-body text-gray-600 text-[17px] leading-relaxed mb-8">
          {text}
        </p>
        <Link to="/face-cream" onClick={handleCTAClick}>
          <Button className="px-8 py-6 font-heading font-bold tracking-[0.1em] text-[13px] uppercase bg-[#1A2F4C] text-white hover:bg-[#D94E12] border-none transition-all duration-300 rounded-[4px] h-auto group flex items-center gap-2">
            {cta} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-body selection:bg-[#F35D1A] selection:text-white pb-24 md:pb-0">
      <JsonLd data={LISTICLE_SCHEMA} />

      {/* Hero Section */}
      <section className="bg-[#1A2F4C] w-full relative overflow-hidden flex flex-col md:flex-row min-h-[600px] md:h-auto items-stretch">
        <div className="w-full md:w-[55%] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-16 md:py-24 z-10">
          <div className="flex items-center gap-1 mb-6">
            <div className="flex bg-[#F35D1A] px-2 py-1 rounded-sm gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-white fill-white" />)}
            </div>
            <span className="text-white/80 font-body text-[13px] ml-3">1,000+ verified reviews</span>
          </div>
          <h1 className="font-heading font-extrabold text-[36px] md:text-[52px] leading-[1.1] text-white mb-6">
            5 reasons high-performers are switching from drugstore face creams to this
          </h1>
          <p className="font-body text-white/80 text-[16px] md:text-[18px] leading-relaxed mb-10 max-w-[480px]">
            Base Layer is engineered with clinical focus-boosting ingredients like Niacinamide and Copper Peptides that give your skin a clean, matte finish. Same morning ritual, drastically better results.
          </p>
          <Link to="/face-cream" onClick={handleCTAClick} className="self-start">
            <Button className="px-10 py-7 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-[#D94E12] hover:bg-[#C04510] text-white border-none transition-all duration-300 rounded-[4px] h-auto group flex items-center gap-2">
              TRY BASE LAYER RISK FREE <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>
        <div className="w-full md:w-[45%] h-[400px] md:h-auto relative">
          <img src={productInHand} alt="Base Layer in Hand" className="absolute inset-0 w-full h-full object-cover object-center" />
          {/* Subtle gradient overlay to blend into the left column on desktop */}
          <div className="hidden md:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#1A2F4C] to-transparent"></div>
        </div>
      </section>

      {/* Main Content / Steps */}
      <section className="bg-white">
        <ZigZagStep 
          num="1" 
          title="Zero shine, completely invisible" 
          text="Drugstore creams give your face a greasy spike, then break you out by 5 PM. You know the feeling. Jittery pores, trapped sweat, then the shiny forehead crash that kills your momentum. Base Layer delivers smooth, sustained hydration that dries completely matte in 15 seconds. No spike. No crash. Just steady fuel for your best skin."
          img={productBathroom} 
          cta="GET A MATTE FINISH" 
          reverse={false} 
        />
        
        <ZigZagStep 
          num="2" 
          title="Takes literally 5 seconds" 
          text="Most people hit a wall with 3-step skincare routines. The serum takes too long, the eye cream is annoying, and suddenly you are skipping the whole thing. Base Layer combines all three steps into one focused pump. It keeps your routine clear and sharp well into your life. No midday slump. No reaching for a second product just to function."
          img={step2MirrorImg} 
          cta="SIMPLIFY YOUR MORNING" 
          reverse={true} 
        />
        
        <ZigZagStep 
          num="3" 
          title="Premium ingredients that actually do something" 
          text="Base Layer combines precise hydration with proven clinical ingredients at effective doses. No fairy dusting. No filler ingredients like cheap glycerin or mineral oil. Just what actually works, backed by research and tested in every batch. We publish exactly what is inside because we have nothing to hide."
          img={productMacroText} 
          cta="SEE WHAT IS INSIDE" 
          reverse={false} 
        />

        <ZigZagStep 
          num="4" 
          title="Clear skin without the breakouts" 
          text="Men’s skin is structurally different—it’s 25% thicker and produces twice as much sebum. Using heavy, pore-clogging butters leads to trapped dirt and acne. Our formulation exclusively uses non-comedogenic Squalane and Hyaluronic Acid to hydrate deeply without ever resting heavy on your face."
          img={textureSmear} 
          cta="GET CLEARER SKIN" 
          reverse={true} 
        />

        <ZigZagStep 
          num="5" 
          title="Fair pricing directly to you" 
          text="If you go to a luxury department store to find a cream with Niacinamide and Copper Peptides, you will easily pay over $150. By selling directly to guys online, we pass the savings directly to you. Premium clinical performance for just $38. You aren't paying the retail markup 'fluff' tax."
          img={productBoxBottle} 
          cta="TRY IT FOR $38" 
          reverse={false} 
        />
      </section>

      {/* Testimonials */}
      <section className="bg-[#FAF9F6] py-20 px-6">
        <div className="max-w-[1100px] mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex bg-[#F35D1A] px-2 py-1 rounded-sm gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-white fill-white" />)}
            </div>
            <span className="font-body text-[13px] text-gray-500 font-medium">Rated 4.8/5 by 1,000+ men</span>
          </div>
          <h2 className="font-heading font-extrabold text-[32px] md:text-[40px] text-[#1A2F4C] mb-4">
            What high-performers are saying
          </h2>
          <p className="font-body text-gray-600 text-[16px]">
            Real results from professionals who upgraded their morning routine.
          </p>
        </div>

        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tag1: "Matte finish", tag2: "No crash", quote: "I used to need three different products just to feel normal. Now one pump and I am locked in until dinner. No greasy shine, no crash. Just clean focus.", author: "David - Founder" },
            { tag1: "Productivity", tag2: "Focus", quote: "The 3-step routine was killing my morning momentum. Base Layer changed that. I actually get my best work done before noon now instead of struggling through it.", author: "Mike - Attorney" },
            { tag1: "Great feel", tag2: "Sharper", quote: "I was skeptical because I hate lotion. But this feels great and the finish is noticeably invisible. My team even asked what I was doing differently. The unfair advantage I needed.", author: "James - VP Sales" }
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-start p-8">
              <div className="flex gap-2 mb-6">
                <span className="bg-[#E5F5E9] text-[#2E7D32] px-3 py-1 text-[11px] font-bold uppercase rounded">{t.tag1}</span>
                <span className="bg-[#E5F5E9] text-[#2E7D32] px-3 py-1 text-[11px] font-bold uppercase rounded">{t.tag2}</span>
              </div>
              <div className="flex gap-1 mb-4 text-[#F35D1A]">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="font-body text-[15px] leading-[1.6] text-gray-800 mb-8 flex-grow">
                {t.quote}
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="font-heading font-bold text-[12px] text-[#1A2F4C] uppercase">{t.author}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span className="text-[10px] text-gray-400 font-medium">Verified buyer</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Wrap Section */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-[1100px] mx-auto bg-[#F7F8FA] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm border border-gray-100">
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
            <h2 className="font-heading font-extrabold text-[32px] md:text-[40px] text-[#1A2F4C] mb-6 leading-tight">
              Same morning ritual. Better results.
            </h2>
            <p className="font-body text-gray-600 text-[16px] mb-8 leading-relaxed">
              Base Layer delivers the hydration, oil-control, and clarity you need to win your mornings. 30-day money back guarantee if you do not feel the difference.
            </p>
            <ul className="space-y-4 mb-10">
              {["Clean, matte hydration without oily shine.", "Razor-sharp oil control that helps you lock in.", "Anti-aging peptides that last well past dinner."].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1A2F4C] shrink-0 mt-0.5" />
                  <span className="font-body text-[15px] text-gray-800 tracking-tight">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/face-cream" onClick={handleCTAClick}>
              <Button className="w-full sm:w-auto px-10 py-7 font-heading font-bold tracking-[0.1em] text-[13px] uppercase bg-[#1A2F4C] text-white hover:bg-[#D94E12] border-none transition-all duration-300 rounded-[4px] h-auto group flex items-center justify-center gap-2">
                TRY BASE LAYER RISK FREE <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </div>
          <div className="w-full md:w-1/2 h-[400px] md:h-auto">
            <img src={productBoxBottle} alt="Base Layer product shot" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 md:hidden ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <Link to="/face-cream" onClick={handleCTAClick}>
          <Button className="w-full px-6 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-[#D94E12] text-white hover:bg-[#C04510] border-none transition-all duration-300 rounded-[4px] h-auto flex items-center justify-between">
            <span>TRY IT RISK FREE</span>
            <span className="bg-black/10 px-2 py-1 rounded text-xs">→</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Listicle;
