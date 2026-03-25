import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TrustpilotStars from "@/components/TrustpilotStars";

const testimonials = [
  {
    image: "/images/testimonials/sean.webp",
    fallback: "/images/testimonials/sean.png",
    stars: 5,
    quote: "I used to blot my forehead before every afternoon meeting. After about a week on Base Layer, I just stopped. My skin stays matte all day and it doesn't feel dry or tight.",
    name: "Sean, 34",
    detail: "Oily skin · Denver, CO",
    tag: "BEST FOR OILY SKIN",
  },
  {
    image: "/images/testimonials/marcus.webp",
    fallback: "/images/testimonials/marcus.png",
    stars: 5,
    quote: "My girlfriend kept saying my skin looked different, like clearer and healthier. I hadn't even told her I was trying anything new. That's when I figured it was actually working.",
    name: "Marcus, 28",
    detail: "Combination skin · Austin, TX",
    tag: "MOST NOTICED",
  },
  {
    image: "/images/testimonials/cooper.webp",
    fallback: "/images/testimonials/cooper.png",
    stars: 5,
    quote: "Hotel air, airplane cabins, hiking in January. Everything used to wreck my skin. Now I throw one bottle in my bag and forget about it. Goes on fast, no grease, done.",
    name: "Cooper, 27",
    detail: "Dry skin · Boulder, CO",
    tag: "BEST FOR TRAVEL",
  },
];

const TestimonialCard = ({ t, index, isVisible }: { t: typeof testimonials[0], index: number, isVisible: boolean }) => {
  return (
    <div 
      className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-lg p-8 flex flex-col h-full transition-all duration-500 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? "0" : "20px"})`,
        transitionDelay: `${index * 150}ms`
      }}
    >
      {/* Optional Tag */}
      {t.tag && (
        <div className="self-start bg-[#F35D1A]/15 px-[10px] py-[4px] rounded-[12px] mb-4 flex items-center justify-center">
          <span className="text-[#F35D1A] font-heading font-semibold text-[10px] tracking-[0.1em] uppercase block leading-none">
            {t.tag}
          </span>
        </div>
      )}

      {/* Stars */}
      <div className="mb-4">
        <TrustpilotStars size={14} />
      </div>

      {/* Quote */}
      <p className="font-body text-[16px] leading-[1.65] text-white/90 font-normal mb-6 flex-grow" style={{ fontStyle: "normal" }}>
        "{t.quote}"
      </p>

      {/* Author Info */}
      <div className="flex items-center mt-auto">
        <picture className="w-[48px] h-[48px] rounded-[50%] overflow-hidden border-[2px] border-[rgba(255,255,255,0.15)] shrink-0 mr-4">
          <source type="image/webp" srcSet={t.image} />
          <img src={t.fallback} alt={t.name} loading="lazy" width={48} height={48} className="w-full h-full object-cover object-[center_top]" />
        </picture>
        <div className="flex flex-col">
          <span className="font-heading font-semibold text-[14px] text-white leading-tight mb-[2px]">
            {t.name}
          </span>
          <span className="font-body text-[12px] text-[#ABB3BB] leading-tight">
            {t.detail}
          </span>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ref = sectionRef.current;
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Trigger once
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-[60px] md:py-[100px] px-5 md:px-12 bg-[#1A2F4C] text-[#FFFFFF] relative overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-[48px]">
          <span className="block font-heading font-normal text-[11px] tracking-[0.2em] text-[#F35D1A] uppercase mb-3">
            REAL RESULTS
          </span>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-bold tracking-tight text-white uppercase leading-[1.1]">
            DON'T TAKE OUR WORD FOR IT<span className="text-[#F35D1A]">.</span>
          </h2>
          <p className="font-body text-[17px] text-[#ABB3BB] mt-2">
            Hear from guys who switched.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full">
          {testimonials.map((t, index) => (
            <TestimonialCard key={t.name} t={t} index={index} isVisible={isVisible} />
          ))}
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-[48px] text-center flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <TrustpilotStars size={16} />
            <span className="font-body text-[14px] text-[#ABB3BB] ml-2 leading-none">
              4.8/5 from 1,000+ men
            </span>
          </div>

          <Link
            to="/face-cream"
            className="inline-flex items-center justify-center px-[36px] py-[14px] bg-[#D94E12] text-white font-heading font-bold text-[14px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-[#C04510] transition-colors duration-300 w-full sm:w-auto mt-2"
          >
            GET STARTED · $38 →
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
