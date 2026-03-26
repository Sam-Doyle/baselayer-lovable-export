import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { CheckCircle2, ChevronRight, Star } from "lucide-react";

import mirrorGuyImg from "@/assets/generated-creatives/step2-mirror-cream.jpg";
import productInHand from "@/assets/generated-creatives/product-in-hand.jpg";
import faceCloseup from "@/assets/images/benefits-face-closeup.png"; // or use imported webp if preferred
import howToUseImg from "@/assets/generated-creatives/how-to-use-lifestyle.png";
import productBoxBottle from "@/assets/generated-creatives/product-box-bottle.jpg";

const LISTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "My Girlfriend Said My Skin Has Never Looked Better—Here’s the 2-Minute Routine I Secretly Started Using",
  "image": "https://baselayerskin.com/og-image.jpg",
  "datePublished": new Date().toISOString().split('T')[0],
  "author": { "@type": "Organization", "name": "Base Layer" }
};

const ListicleGirlfriend = () => {
  useCanonical();
  useMetaTags({
    title: "The 2-Minute Routine I Secretly Started Using",
    description: "Most guys are destroying their face with the same harsh soap they use on their armpits. Here is why upgrading your routine is the easiest win you'll have all year."
  });

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { page: 'listicle_girlfriend_test', type: 'advertorial' });

    const handleScroll = () => {
      setShowSticky(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = () => trackEvent('listicle_cta_click', { action: 'navigate_to_product' });

  return (
    <div className="bg-white min-h-screen font-body selection:bg-[#F35D1A] selection:text-white pb-24 md:pb-0">
      <JsonLd data={LISTICLE_SCHEMA} />

      {/* Editorial Navigation */}
      <nav className="w-full h-16 border-b border-gray-100 flex items-center justify-center px-4 bg-white sticky top-0 z-40">
        <div className="font-heading font-black tracking-widest text-[#1A2F4C] text-[11px] md:text-[13px] uppercase flex gap-4 md:gap-8 items-center">
          <span>Men's Grooming</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Health</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>Performance</span>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-5 sm:px-6 py-10 md:py-16">
        
        {/* Header Area */}
        <header className="mb-10 text-center">
          <div className="text-[#F35D1A] font-bold text-[11px] tracking-widest uppercase mb-4 inline-block bg-orange-50 px-3 py-1 rounded-full">
            Sponsored Review
          </div>
          <h1 className="font-heading font-extrabold text-[34px] md:text-[46px] text-[#1A2F4C] leading-[1.15] mb-6 tracking-tight">
            My Girlfriend Said My Skin Has Never Looked Better—Here's the 2-Minute Routine I Secretly Started Using
          </h1>
          <p className="text-gray-600 text-lg md:text-[20px] leading-relaxed mb-6 font-medium">
            Most guys are destroying their face with the same harsh soap they use on their armpits. Here is why upgrading your routine is the easiest win you'll have all year.
          </p>
          <div className="flex items-center justify-center gap-3 py-4 text-left border-y border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#1A2F4C] text-white flex items-center justify-center font-bold text-sm">
              MG
            </div>
            <div>
              <div className="font-bold text-sm text-[#1A2F4C]">Michael G.</div>
              <div className="text-xs text-gray-500">Updated: Today</div>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="mb-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 relative pt-[100%] md:pt-[65%]">
          <img 
            src={mirrorGuyImg} 
            alt="Guy looking in the mirror checking his face" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Article Body */}
        <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed font-body">
          
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            The Wake-Up Call
          </h2>
          <p className="min-h-[1.6em]">
            I've never been a "skincare guy." For years, my routine consisted of splashing water on my face and scrubbing with whatever generic bar soap was left in the shower.
          </p>
          <p>
            Between being outside on the golf course, running, the dry winter air, and long hours staring at screens, I didn't think much of it—until my girlfriend made a passing comment about how "tired" and "weathered" my face was starting to look.
          </p>

          <div className="w-12 h-1 bg-[#F35D1A] my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            The Harsh Truth About Your Soap
          </h2>
          <p>
            Turns out, generic body wash and bar soap are practically industrial degreasers. They completely strip your face of its natural oils, leaving it tight, dry, and prone to aging way faster than it should. 
          </p>
          <p>
            Men's skin is roughly 20% thicker than women's and produces significantly more sweat and sebum. It needs a specific foundation—a base layer of protection that normal soap just obliterates.
          </p>

          <div className="w-12 h-1 bg-[#F35D1A] my-10"></div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4">
            Enter Base Layer Skin
          </h2>
          <div className="float-right w-1/2 md:w-1/3 ml-6 mb-6 rounded-lg overflow-hidden shadow-sm">
             <img src={howToUseImg} alt="Base Layer" className="w-full h-auto object-cover" />
          </div>
          <p>
            She handed me a simple, no-nonsense kit from a brand called <Link to="/face-cream" className="text-[#F35D1A] font-bold no-underline hover:underline">Base Layer Skin</Link>. I was heavily skeptical. I had zero interest in starting a shiny, 7-step skincare routine that takes 20 minutes and leaves you smelling like a department store perfume counter.
          </p>
          <p>
            But I promised her I'd try it for exactly one week. 
          </p>
          
          <div className="clear-both"></div>

          <div className="bg-[#FAF9F6] border border-gray-100 rounded-xl p-8 my-10">
            <h3 className="font-heading font-bold text-2xl text-[#1A2F4C] mb-6 text-center">
              The 5 Reasons This Actually Worked For Me
            </h3>
            
            <div className="space-y-8">
              <div>
                <h4 className="font-heading font-bold text-lg text-[#D94E12] flex items-center gap-2 mb-2">
                  <span className="bg-[#D94E12] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  It Takes Exactly 60 Seconds
                </h4>
                <p className="text-[16px] m-0 text-gray-700">
                  This is built for guys who want to get in and out of the bathroom. Wash in the shower, moisturize immediately after. It adds exactly one minute to your morning routine. Zero complications.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-lg text-[#D94E12] flex items-center gap-2 mb-2">
                  <span className="bg-[#D94E12] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Built Strictly for the Male Epidermis
                </h4>
                <p className="text-[16px] m-0 text-gray-700">
                  This isn't repurposed women's skincare. Base Layer is engineered specifically for thicker, oilier male skin to clear out pores deep down without drying your face out like a desert.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-lg text-[#D94E12] flex items-center gap-2 mb-2">
                  <span className="bg-[#D94E12] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Zero 'Greasy' Feeling
                </h4>
                <p className="text-[16px] m-0 text-gray-700">
                  The absolute biggest dealbreaker for me was the feeling of heavy, wet lotion. Base Layer's moisturizer absorbs completely in about 10 seconds. Your face feels hydrated and totally matte—never shiny, never sticky.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-lg text-[#D94E12] flex items-center gap-2 mb-2">
                  <span className="bg-[#D94E12] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Ultimate Defense Against the Elements
                </h4>
                <p className="text-[16px] m-0 text-gray-700">
                  Whether you are skiing, putting in miles on the pavement, or just dealing with harsh winter wind, it acts as a literal "base layer" of armor for your face, repairing the barrier that the elements tear down every single day.
                </p>
              </div>

              <div>
                <h4 className="font-heading font-bold text-lg text-[#D94E12] flex items-center gap-2 mb-2">
                  <span className="bg-[#D94E12] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                  The Undeniable Results
                </h4>
                <p className="text-[16px] m-0 text-gray-700">
                  Within two weeks, the redness on my cheeks was gone, the tight feeling after a shower disappeared, and the dark bags under my eyes faded drastically. Most importantly? My girlfriend noticed immediately.
                </p>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <Link to="/face-cream" onClick={handleCTAClick}>
                 <Button className="w-full sm:w-auto px-10 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-[#D94E12] text-white hover:bg-[#C04510] border-none transition-all duration-300 rounded-[4px] shadow-lg shadow-orange-500/20 h-auto">
                   CLAIM MY BASE LAYER STARTER KIT →
                 </Button>
              </Link>
            </div>
          </div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#1A2F4C] mb-4 mt-12 text-center">
            The Verdict & A Special Offer
          </h2>
          <p className="text-center">
            If you want to stop looking tired and actually protect your face, you need a proper foundation. Base Layer Skin is currently offering a solid entry point for guys who want to upgrade.
          </p>

          <div className="bg-[#1A2F4C] text-white p-8 md:p-12 rounded-xl text-center shadow-xl mt-10 mb-8 border-t-4 border-[#F35D1A]">
            <img src={productBoxBottle} alt="Base Layer product" className="w-32 h-32 object-cover rounded-full mx-auto mb-6 border-4 border-[#2A4469]" />
            <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4 text-white">The "Better Skin Guarantee"</h3>
            <p className="text-[#ABB3BB] mb-8 max-w-md mx-auto text-base">
              The best part of all this? They have an iron-clad guarantee. If you (or your partner) don't notice a visible difference in 30 days, they'll refund you. No questions asked. 
              <br/><br/>
              <strong>Stop washing your face with the same soap you use on your body.</strong>
            </p>
            <Link to="/face-cream" onClick={handleCTAClick}>
              <Button className="w-full sm:w-auto px-12 py-7 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-[#D94E12] text-white hover:bg-[#8B2F08] border-none transition-all duration-300 rounded-[4px] h-auto">
                CHECK AVAILABILITY & CLAIM KIT
              </Button>
            </Link>
          </div>
          
        </article>

      </main>

      {/* Sticky Mobile CTA */}
      <div className={`fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transition-transform duration-300 md:hidden ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}>
        <Link to="/face-cream" onClick={handleCTAClick}>
          <Button className="w-full px-6 py-6 font-heading font-bold tracking-[0.1em] text-[14px] uppercase bg-[#D94E12] text-white hover:bg-[#C04510] border-none transition-all duration-300 rounded-[4px] h-auto flex items-center justify-between">
            <span>START YOUR ROUTINE</span>
            <span className="bg-black/10 flex items-center p-1 rounded-full"><ChevronRight className="w-4 h-4"/></span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ListicleGirlfriend;
