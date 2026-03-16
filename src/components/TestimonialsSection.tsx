import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
  {
    quote:
      "I used to blot my forehead before every afternoon meeting. One week on Base Layer and I stopped.",
    name: "Sean, 34",
    skin: "oily skin",
  },
  {
    quote:
      "Everything I tried after shaving either stung or left a film. This absorbs fast and feels calm.",
    name: "Matt, 36",
    skin: "combination skin",
  },
  {
    quote:
      "Hotel air usually wrecks my skin. This is the one bottle I pack every trip.",
    name: "Cooper, 27",
    skin: "dry skin",
  },
];

const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { openModal } = useEarlyAccess();
  
  const AUTOPLAY_INTERVAL = 6000;

  // Next/Prev functions
  const handleNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Set up intersection observer for initial fade in
  useEffect(() => {
    const ref = sectionRef.current;
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!isVisible || isHovered) return;
    const interval = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [isVisible, isHovered, handleNext]);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-24 md:py-32 px-6 md:px-12 bg-[#1A2F4C] text-[#FFFFFF] relative overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Subtle Header */}
        <div
          className="mb-16 md:mb-24 transition-all duration-[1000ms] ease-out flex flex-col md:flex-row md:items-end justify-between gap-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? "0" : "40px"})`,
          }}
        >
          <div>
            <p className="font-body text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#FFFFFF]/50 mb-3 flex items-center gap-4">
              <span className="w-8 h-px bg-[#FFFFFF]/30"></span>
              Field Testing
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight uppercase leading-[0.95] max-w-2xl">
              BUILT FOR HARSH ELEMENTS.<br/>
              <span className="text-[#F95D1A]">TESTED ON REAL SKIN.</span>
            </h2>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <span className="font-heading text-[10px] tracking-widest text-[#FFFFFF]/40 uppercase">
              0{activeIndex + 1} / 0{testimonials.length}
            </span>
          </div>
        </div>

        {/* Cinematic Carousel Area */}
        <div 
          className="relative min-h-[400px] md:min-h-[360px] flex flex-col justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {testimonials.map((t, i) => {
            const isActive = activeIndex === i;
            return (
              <div
                key={t.name}
                className="absolute inset-0 flex flex-col justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: `translateX(${isActive ? "0" : "20px"})`,
                  pointerEvents: isActive ? "auto" : "none",
                  zIndex: isActive ? 10 : 0
                }}
              >
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <svg key={starIndex} className="w-5 h-5 md:w-6 md:h-6 text-[#F95D1A] fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                
                <blockquote className="font-heading font-black text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-[1.1] md:leading-[1.1] uppercase tracking-tight max-w-[900px]">
                  "{t.quote}"
                </blockquote>
                
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 border-l-2 border-[#F95D1A] pl-5 opacity-90">
                  <span className="font-heading text-lg font-bold uppercase tracking-wider">
                    {t.name}
                  </span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#FFFFFF]/30"></span>
                  <span className="font-body text-sm text-[#FFFFFF]/60 tracking-widest uppercase">
                    {t.skin}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls & CTA */}
        <div className="mt-16 md:mt-24 flex flex-col-reverse md:flex-row md:items-center justify-between gap-10">
          
          <Button
            size="lg"
            className="w-full md:w-auto px-12 py-6 font-heading font-black tracking-widest text-[14px] uppercase bg-[#F95D1A] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#F95D1A] border-none transition-all duration-300 rounded-none shadow-[0_0_40px_rgba(249,93,26,0.15)]"
            onClick={() => openModal("testimonials")}
          >
            TRY IT RISK-FREE — $38
          </Button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <button
              onClick={handlePrev}
              className="w-12 h-12 flex items-center justify-center border border-[#FFFFFF]/30 text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#1A2F4C] transition-colors rounded-none"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 flex items-center justify-center border border-[#FFFFFF]/30 text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#1A2F4C] transition-colors rounded-none"
              aria-label="Next testimonial"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
