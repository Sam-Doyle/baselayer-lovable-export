import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

/*
 * LIVE WAITLIST COUNTER
 *
 * Queries Supabase for the current waitlist count, then animates the
 * number up from 0. Uses Supabase Realtime to increment live when
 * new signups occur (the number ticks up while user is on the page).
 *
 * Placement: Import into TestimonialsSection or any CTA zone.
 *
 * Performance: Single lightweight count query, no full table scan.
 * Falls back gracefully if query fails (hidden entirely).
 */

interface WaitlistCounterProps {
  className?: string;
  /** Minimum display count — prevents showing embarrassingly low numbers early on */
  floor?: number;
}

const WaitlistCounter = ({ className = "", floor = 0 }: WaitlistCounterProps) => {
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch initial count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count: total, error } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true });
        if (!error && total !== null) {
          setCount(Math.max(total, floor));
        }
      } catch {
        // Silent fail — component just won't render
      }
    };
    fetchCount();
  }, [floor]);

  // Subscribe to realtime inserts for live counter
  useEffect(() => {
    const channel = supabase
      .channel("waitlist_counter")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "waitlist" }, () => {
        setCount((prev) => (prev !== null ? prev + 1 : null));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Animate count up
  useEffect(() => {
    if (count === null) return;

    const duration = 1200; // ms
    const steps = 30;
    const stepTime = duration / steps;
    const increment = count / steps;
    let current = 0;

    if (animRef.current) clearInterval(animRef.current);

    animRef.current = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        if (animRef.current) clearInterval(animRef.current);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, stepTime);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [count]);

  if (count === null) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Users className="w-4 h-4" />
      <span className="font-body text-sm">
        <span className="font-heading font-bold tabular-nums">{displayCount.toLocaleString()}</span>
        {" "}on the waitlist
      </span>
    </div>
  );
};

export default WaitlistCounter;
