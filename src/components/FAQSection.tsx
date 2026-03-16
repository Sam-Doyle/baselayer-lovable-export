import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Will it feel greasy?",
    answer: "No. It absorbs fast and dries down matte.",
  },
  {
    question: "Can I use it after shaving?",
    answer: "Yes. It's built to calm post-shave irritation without stinging.",
  },
  {
    question: "Is it scented?",
    answer: "No. It's fragrance-free.",
  },
  {
    question: "Do I need other products?",
    answer: "No. This is made for men who want one product, not a full routine.",
  },
  {
    question: "How long does one bottle last?",
    answer: "About 6 to 8 weeks with daily use.",
  },
  {
    question: "When will it ship?",
    answer: "First batch ships April 2026.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 px-6 md:px-12 bg-[#F4F4F0] border-t border-[#1E201E]/10">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          
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
                      className="w-full flex items-center justify-between py-6 md:py-8 text-left transition-colors hover:text-[#F95D1A]"
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
                      className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
