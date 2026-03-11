import { useEffect, useState } from "react";

/*
 * SCROLL PROGRESS BAR
 *
 * Thin 2px bar at the very top of the viewport showing how far down
 * the page the user has scrolled. Serves two conversion purposes:
 *
 * 1. Gamification: Users subconsciously want to "complete" the bar,
 *    which encourages deeper scrolling (= more CTA exposure).
 *
 * 2. Page length signal: On a long-scroll DTC page, this prevents
 *    the "will this ever end?" feeling that causes bounce.
 *
 * Performance: Uses passive scroll listener + CSS width transition.
 * No reflows — only transforms the width of a fixed element.
 */

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress(Math.min((scrollTop / docHeight) * 100, 100));
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Don't render until user has scrolled at least a little
  if (progress < 1) return null;

  return (
    <div
      className="scroll-progress-bar"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
};

export default ScrollProgressBar;
