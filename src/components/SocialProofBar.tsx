import { useEffect, useState, useRef } from "react";
import { Shield, Star, FlaskConical, BadgeCheck } from "lucide-react";

/*
 * SOCIAL PROOF BAR
 *
 * Horizontal scrolling strip of trust signals that sits between sections.
 * Designed for IG ad traffic that needs rapid trust-building.
 *
 * Placement: Between Hero and Testimonials in Index.tsx
 * (i.e., the first thing after the hero CTA zone)
 *
 * Contains:
 * - Aggregate star rating
 * - "Tested by 50 real guys" badge
 * - Dermatologist-tested claim
 * - Cruelty-free
 * - 30-day money-back
 *
 * Auto-fades in on scroll into viewport.
 */

const proofItems = [
  { icon: Star, text: "5.0 from early testers", highlight: true },
  { icon: BadgeCheck, text: "Works on oily, dry, and sensitive skin" },
  { icon: FlaskConical, text: "Dermatologist-reviewed formula" },
  { icon: Shield, text: "30-day money-back guarantee" },
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
      className="bg-secondary border-y border-border/30 py-4 overflow-hidden transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: `translateY(${visible ? "0" : "10px"})` }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-6 md:gap-10 flex-wrap">
        {proofItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <item.icon className={`w-4 h-4 ${item.highlight ? "text-amber-400" : "text-muted-foreground"}`} />
            <span className={`font-body text-xs uppercase tracking-wider ${item.highlight ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialProofBar;
