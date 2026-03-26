import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ROWS = [
  { feature: "Niacinamide", benefit: "Oil control", bl: true, blText: "5%", cal: false, kie: false, bri: false },
  { feature: "Copper Peptide GHK-Cu", benefit: "Collagen + firming", bl: true, cal: false, kie: false, bri: false },
  { feature: "Centella Asiatica", benefit: "Post-shave soothing", bl: true, cal: false, kie: false, bri: false },
  { feature: "Hyaluronic Acid", benefit: "Deep hydration", bl: true, cal: false, kie: false, bri: true },
  { feature: "Squalane", benefit: "Fast absorption", bl: true, cal: false, kie: false, bri: false },
  { feature: "Panthenol (B5)", benefit: "Barrier repair", bl: true, cal: false, kie: false, bri: false },
  { feature: "Fragrance-Free", benefit: "", bl: true, cal: true, kie: false, bri: true },
  { feature: "All-in-One Formula", benefit: "Replaces 3 products", bl: true, cal: false, kie: false, bri: false },
];

const ComparisonTable = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const end = 6;
      const duration = 800; // ms
      const increment = end / (duration / 16); // 60fps
      
      // Delay before starting counting
      const timer = setTimeout(() => {
        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            setScore(end);
            clearInterval(counter);
          } else {
            setScore(Math.floor(start));
          }
        }, 16);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const dash = <span className="text-[16px] text-[#D1D5DB] font-bold">—</span>;
  
  const checkBL = (index: number) => (
    <div className={`w-[20px] h-[20px] rounded-full bg-[#4ADE80] flex items-center justify-center mx-auto transition-all duration-[400ms] cubic-bezier(0.175,0.885,0.32,1.275) ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ transitionDelay: `${400 + index * 80 + 100}ms` }}>
      <Check className="w-3 h-3 text-white" strokeWidth={4} />
    </div>
  );

  const checkCompetitor = () => (
    <div className="w-[20px] h-[20px] rounded-full bg-[#4ADE80]/30 flex items-center justify-center mx-auto">
      <Check className="w-3 h-3 text-white" strokeWidth={4} />
    </div>
  );

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full bg-white py-[80px] overflow-hidden"
    >
      {/* Topographic Background */}
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='topography' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 60c20-10 40-5 60-15M0 45c20-10 40-5 60-15M0 30c20-10 40-5 60-15' fill='none' stroke='rgba(26,47,76,0.04)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23topography)'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-6">
        
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="font-body text-[11px] font-semibold text-[#F35D1A] tracking-[0.2em] uppercase mb-2">
            PRECISION SKINCARE
          </div>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-bold text-[#1A2F4C] uppercase tracking-[0.05em] leading-tight flex items-center justify-center">
            HOW WE COMPARE
          </h2>
          <p className="font-body text-[16px] text-[#6B7280] mt-2">
            Same price range. Six clinical actives. One step.
          </p>
        </div>

        {/* Table Container - Mobile Scrollable */}
        <div className="w-full overflow-x-auto hide-scrollbar pb-6 relative">
          
          <div className="min-w-[700px] grid grid-cols-[140px_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)] md:grid-cols-[200px_repeat(4,1fr)] gap-0 w-full">
            
            {/* --- COLUMN HEADERS --- */}
            <div className={`sticky left-0 z-20 bg-[#1A2F4C] border-b border-[#E2E8F0] opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: 'opacity 500ms 200ms' }}></div>
            
            {/* Base Layer Header */}
            <div className={`col-start-2 bg-[#F35D1A]/[0.06] border-t-[3px] border-[#F35D1A] py-4 px-2 text-center border-b border-[#E2E8F0] opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: 'opacity 500ms 200ms' }}>
              <div className="font-heading font-bold text-[13px] md:text-[15px] text-[#1A2F4C]">
                BASE LAYER<span className="text-[#F35D1A]">.</span>
              </div>
              <div className="font-body text-[9px] md:text-[10px] text-[#1A2F4C]/50 mt-0.5 leading-tight italic">Daily Face Cream</div>
              <div className="font-body text-[11px] md:text-[12px] text-[#6B7280] mt-1">
                $38 / 1.7 oz
              </div>
            </div>

            {/* Competitor Headers — specific products verified via INCIDecoder March 2026 */}
            <div className={`col-start-3 py-4 px-2 text-center border-b border-[#E2E8F0] opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: 'opacity 500ms 200ms' }}>
              <div className="font-body font-semibold text-[12px] md:text-[13px] text-[#ABB3BB]">Caldera Lab</div>
              <div className="font-body text-[9px] md:text-[10px] text-[#ABB3BB]/70 mt-0.5 leading-tight italic">The Good Serum</div>
              <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] mt-1">$89 / 1 oz</div>
            </div>
            <div className={`col-start-4 py-4 px-2 text-center border-b border-[#E2E8F0] opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: 'opacity 500ms 200ms' }}>
              <div className="font-body font-semibold text-[12px] md:text-[13px] text-[#ABB3BB]">Kiehl's</div>
              <div className="font-body text-[9px] md:text-[10px] text-[#ABB3BB]/70 mt-0.5 leading-tight italic">Age Defender Cream</div>
              <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] mt-1">$63 / 2.5 oz</div>
            </div>
            <div className={`col-start-5 py-4 px-2 text-center border-b border-[#E2E8F0] opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: 'opacity 500ms 200ms' }}>
              <div className="font-body font-semibold text-[12px] md:text-[13px] text-[#ABB3BB]">Brickell</div>
              <div className="font-body text-[9px] md:text-[10px] text-[#ABB3BB]/70 mt-0.5 leading-tight italic">Revitalizing Anti-Aging</div>
              <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] mt-1">$40 / 2 oz</div>
            </div>

            {/* --- DATA ROWS --- */}
            {ROWS.map((row, i) => (
              <div key={i} className={`contents opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: `opacity 500ms ${400 + i * 80}ms` }}>
                {/* Feature Column (Sticky on mobile) */}
                <div className={`sticky left-0 z-20 flex flex-col justify-center py-[16px] px-[12px] md:px-[20px] ${i % 2 === 1 ? 'bg-[#F7F8FA]' : 'bg-white'} border-b border-[#E2E8F0] h-full`}>
                  <div className="font-body font-semibold text-[12px] md:text-[14px] text-[#1A2F4C] leading-tight">{row.feature}</div>
                  {row.benefit && <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] mt-1 leading-tight">{row.benefit}</div>}
                </div>
                
                {/* Score Cells */}
                <div className={`flex flex-col items-center justify-center py-[16px] px-[12px] md:px-[20px] ${i % 2 === 1 ? 'bg-[#F7F8FA]' : ''} bg-[#F35D1A]/[0.06] border-b border-[#E2E8F0]`}>
                  {row.bl ? (
                    row.blText ? (
                      <div className="flex items-center gap-2">
                        {checkBL(i)} <span className="font-body text-[13px] text-[#1A2F4C] font-semibold">{row.blText}</span>
                      </div>
                    ) : checkBL(i)
                  ) : dash}
                </div>
                <div className={`flex items-center justify-center py-[16px] px-[12px] md:px-[20px] ${i % 2 === 1 ? 'bg-[#F7F8FA]' : ''} border-b border-[#E2E8F0]`}>
                  {row.cal ? checkCompetitor() : dash}
                </div>
                <div className={`flex items-center justify-center py-[16px] px-[12px] md:px-[20px] ${i % 2 === 1 ? 'bg-[#F7F8FA]' : ''} border-b border-[#E2E8F0]`}>
                  {row.kie ? checkCompetitor() : dash}
                </div>
                <div className={`flex items-center justify-center py-[16px] px-[12px] md:px-[20px] ${i % 2 === 1 ? 'bg-[#F7F8FA]' : ''} border-b border-[#E2E8F0]`}>
                  {row.bri ? checkCompetitor() : dash}
                </div>
              </div>
            ))}

            {/* --- SCORE ROW --- */}
            <div className={`contents opacity-0 ${isVisible ? 'opacity-100' : ''}`} style={{ transition: 'opacity 800ms 1200ms' }}>
              <div className="sticky left-0 z-20 flex items-center py-[24px] px-[12px] md:px-[20px] bg-white">
                <div className="font-body font-semibold text-[12px] md:text-[13px] text-[#ABB3BB]">Active Ingredients</div>
              </div>
              <div className="flex flex-col items-center justify-center py-[24px] px-[12px] md:px-[20px] bg-[#F35D1A]/[0.06] md:bg-white/[0.04] text-center">
                <div className="font-heading font-bold text-[28px] md:text-[32px] text-[#4ADE80] leading-none mb-1">
                  {score}/6
                </div>
                <div className="font-body text-[10px] md:text-[11px] text-[#6B7280] leading-tight">Complete formula</div>
              </div>
              <div className="flex flex-col items-center justify-center py-[24px] px-[12px] md:px-[20px] bg-[#F7F8FA] text-center">
                <div className="font-heading font-bold text-[18px] md:text-[20px] text-[#D1D5DB] leading-none mb-1">
                  0/6
                </div>
                <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] leading-tight">Botanical oils</div>
              </div>
              <div className="flex flex-col items-center justify-center py-[24px] px-[12px] md:px-[20px] bg-[#F7F8FA] text-center">
                <div className="font-heading font-bold text-[18px] md:text-[20px] text-[#D1D5DB] leading-none mb-1">
                  0/6
                </div>
                <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] leading-tight">Salicylic + caffeine</div>
              </div>
              <div className="flex flex-col items-center justify-center py-[24px] px-[12px] md:px-[20px] bg-[#F7F8FA] text-center">
                <div className="font-heading font-bold text-[18px] md:text-[20px] text-[#D1D5DB] leading-none mb-1">
                  1/6
                </div>
                <div className="font-body text-[10px] md:text-[11px] text-[#ABB3BB] leading-tight">DMAE + MSM based</div>
              </div>
            </div>

          </div>
          
          <div className="md:hidden mt-3 text-center opacity-70 animate-pulse text-[11px] text-[#ABB3BB] italic">
            Scroll →
          </div>
        </div>

        {/* --- BOTTOM CTA --- */}
        <div className={`mt-[32px] flex flex-col items-center text-center opacity-0 ${isVisible ? 'opacity-100 translate-y-0' : 'translate-y-4'}`} style={{ transition: 'all 800ms 1400ms' }}>
          <div className="font-heading font-semibold text-[15px] md:text-[16px] text-[#1A2F4C] mb-[20px]">
            Six clinical actives. One product. <span className="text-[#F35D1A]">$38.</span>
          </div>
          <Button 
            className="bg-[#D94E12] hover:bg-[#C04510] text-white font-heading font-bold text-[13px] tracking-[0.05em] px-[36px] py-[14px] h-auto rounded-[4px] w-full sm:w-auto"
            onClick={() => {
               document.querySelector('.buy-box-container')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            GET STARTED · $38 →
          </Button>
          <div className="font-body text-[10px] text-[#ABB3BB] mt-[24px]">
            Ingredient data via INCIDecoder.com and official product pages. March 2026.
          </div>
        </div>

      </div>
    </section>
  );
};

export default ComparisonTable;
