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
    <section id="faq" className="py-16 md:py-20 px-5 md:px-8 bg-background">
      <div className="max-w-xl mx-auto">
        <span className="block font-body text-[11px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
          Common questions
        </span>
        <h2 className="font-heading text-2xl md:text-[1.75rem] font-black tracking-tight text-foreground uppercase leading-[0.95] mb-10">
          EVERYTHING YOU NEED TO KNOW.
        </h2>

        <div className="divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left group"
              >
                <span className="font-body text-[15px] text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-200"
                style={{
                  maxHeight: openIndex === i ? "120px" : "0",
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <p className="font-body text-sm text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
