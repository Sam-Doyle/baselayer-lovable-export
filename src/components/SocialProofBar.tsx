import { useEffect, useState, useRef } from "react";
import { Shield, Mountain, Wind, BadgeCheck } from "lucide-react";

/*
 * SOCIAL PROOF BAR
 *
 * Horizontal scrolling strip of trust signals that sits between sections.
 * Designed for IG ad traffic that needs rapid trust-building.
 *
 * Placement: Between Hero and Testimonials in Index.tsx
 * (i.e., the first thing after the hero CTA zone)
 *
 * Contains ruggedized outdoor-focused trust signals.
 */

const proofItems = [
  { icon: Shield, text: "Tested at 10,000 ft elevation" },
  { icon: Wind, text: "Protects against wind, cold, and UV reflection" },
  { icon: Mountain, text: "Built in Colorado for harsh environments" },
  { icon: BadgeCheck, text: "No subscription. No auto-ship." },
];

const SocialProofBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-[#1A2F4C] border-y border-[#1A2F4C]/50 py-5 overflow-hidden transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: `translateY(${visible ? "0" : "10px"})` }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-6 md:gap-10 flex-wrap">
        {proofItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <item.icon className={`w-4 h-4 text-[#FFFFFF]`} />
            <span className="font-body text-xs uppercase tracking-wider text-[#FFFFFF]">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialProofBar;
