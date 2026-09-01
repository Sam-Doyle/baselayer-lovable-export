import { useEffect, useRef, useState } from "react";

interface DeferredImageBandProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  rootMargin?: string;
  width: number;
  height: number;
}

/**
 * Reserves the band's layout space but withholds the image URL until the band
 * is near the viewport. This is intentionally stricter than loading="lazy",
 * whose mobile preload distance can still reach several screens below fold.
 */
const DeferredImageBand = ({
  src,
  alt,
  className,
  imageClassName,
  rootMargin = "600px 0px",
  width,
  height,
}: DeferredImageBandProps) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-deferred-image={shouldLoad ? "loaded" : "waiting"}
    >
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          decoding="async"
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default DeferredImageBand;
