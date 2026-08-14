import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Will it feel greasy?",
    answer: "It is designed to absorb quickly with a lightweight, matte finish. Skin varies, so the 30-day guarantee gives you time to judge the finish on your own face.",
  },
  {
    question: "Can I use it after shaving?",
    answer: "Yes. The formula includes 2% panthenol to help soothe skin and support its natural moisture barrier. If shaving leaves your skin raw or broken, let it settle before applying.",
  },
  {
    question: "Is it scented?",
    answer: "No. It's fragrance-free.",
  },
  {
    question: "Is this a subscription?",
    answer: "Only if you want it to be. One-time purchase is the default. There's an optional Subscribe & Save if you'd rather not think about reordering — cancel or pause in one click, no lock-in, no games.",
  },
  {
    question: "What if it doesn't work for me?",
    answer: "Your first order is covered by our 30-day guarantee. Contact us within 30 days of delivery for a refund; no return shipment is required.",
  },
  {
    question: "How long does one bottle last?",
    answer: "About six weeks when you use one pump morning and night. Actual duration varies with how much you apply.",
  },
  {
    question: "When will it ship?",
    answer: "Orders ship from Colorado within 1-2 business days.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-[#1E201E]/10 bg-[#F4F4F0] px-6 py-14 md:px-12 md:py-24">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-24">
          
          {/* Left Column (Sticky Header) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#1E201E]/50 mb-4 flex items-center gap-4">
              <span className="w-8 h-px bg-[#1E201E]/20"></span>
              The Details
            </p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-[64px] font-black tracking-tighter text-[#1E201E] uppercase leading-[0.9] mb-6">
              EVERYTHING YOU NEED TO KNOW.
            </h2>
            <p className="font-body text-base lg:text-lg text-[#1E201E]/70 max-w-sm leading-relaxed hidden lg:block">
              We cut the bullshit out of skincare. If you have questions about how Base Layer actually works, you'll find straight answers right here.
            </p>
          </div>

          {/* Right Column (Accordion List) */}
          <div className="lg:col-span-7">
            <div className="border-t-2 border-[#1E201E]">
              {faqs.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div key={i} className="border-b border-[#1E201E]/20 group">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex min-h-14 w-full items-center justify-between py-5 text-left transition-colors hover:text-[#F95D1A] md:py-7"
                      aria-expanded={isOpen}
                    >
                      <span className={`font-heading text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight pr-6 transition-colors duration-300 ${isOpen ? "text-[#F95D1A]" : "text-[#1E201E]"}`}>
                        {faq.question}
                      </span>
                      <div className={`relative w-8 h-8 rounded-none border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? "border-[#F95D1A] bg-[#F95D1A] text-[#FFFFFF]" : "border-[#1E201E]/20 text-[#1E201E] group-hover:border-[#F95D1A] group-hover:text-[#F95D1A]"}`}>
                        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                           <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                      </div>
                    </button>
                    
                    <div 
                      className="grid transition-all duration-300 ease-[cubic-bezier(0.4,_0,_0.2,_1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="font-body text-base md:text-lg text-[#1E201E]/70 leading-relaxed pb-8 md:pb-10 max-w-2xl pr-12">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
