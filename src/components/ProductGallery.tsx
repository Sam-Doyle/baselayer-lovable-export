import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductGalleryImage {
  id: string | number;
  src: string;
  srcSet?: string;
  avifSrcSet?: string;
  sizes?: string;
  thumbnailSrc: string;
  alt: string;
  width?: number;
  height?: number;
  objectPosition?: string;
}

interface ProductGalleryProps {
  images: ProductGalleryImage[];
  label?: string;
  initialIndex?: number;
  className?: string;
  onActiveImageChange?: (index: number) => void;
}

const DEFAULT_IMAGE_SIZES = "(max-width: 768px) 100vw, min(50vw, 576px)";

function normalizeIndex(index: number, length: number) {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

function nearbyIndexes(index: number, length: number) {
  if (length === 0) return [];
  return [
    normalizeIndex(index - 1, length),
    normalizeIndex(index, length),
    normalizeIndex(index + 1, length),
  ];
}

/**
 * One responsive image track for every breakpoint. Mobile gets native
 * scroll-snap and dots; desktop adds arrow controls and lightweight
 * thumbnails. Only the active image and its neighbors are mounted initially.
 */
const ProductGallery = ({
  images,
  label = "Product image gallery",
  initialIndex = 0,
  className,
  onActiveImageChange,
}: ProductGalleryProps) => {
  const imageCount = images.length;
  const startingIndex = imageCount
    ? Math.min(Math.max(initialIndex, 0), imageCount - 1)
    : 0;
  const [activeIndex, setActiveIndex] = useState(startingIndex);
  const [loadedIndexes, setLoadedIndexes] = useState(
    () => new Set(nearbyIndexes(startingIndex, imageCount)),
  );
  const viewportRef = useRef<HTMLDivElement>(null);

  const prepareIndex = useCallback((index: number) => {
    setLoadedIndexes((current) => {
      const next = new Set(current);
      nearbyIndexes(index, imageCount).forEach((nearbyIndex) => next.add(nearbyIndex));
      return next.size === current.size ? current : next;
    });
  }, [imageCount]);

  const selectIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    if (imageCount === 0) return;
    const nextIndex = normalizeIndex(index, imageCount);
    prepareIndex(nextIndex);
    setActiveIndex(nextIndex);
    onActiveImageChange?.(nextIndex);

    const scrollToImage = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollTo({ left: viewport.clientWidth * nextIndex, behavior });
    };

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(scrollToImage);
    } else {
      scrollToImage();
    }
  }, [imageCount, onActiveImageChange, prepareIndex]);

  useEffect(() => {
    if (activeIndex < imageCount) return;
    const fallbackIndex = Math.max(imageCount - 1, 0);
    setActiveIndex(fallbackIndex);
    prepareIndex(fallbackIndex);
  }, [activeIndex, imageCount, prepareIndex]);

  useEffect(() => {
    const alignActiveImage = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollTo({ left: viewport.clientWidth * activeIndex, behavior: "auto" });
    };

    window.addEventListener("resize", alignActiveImage);
    return () => window.removeEventListener("resize", alignActiveImage);
  }, [activeIndex]);

  const handleScroll = (scrollLeft: number, width: number) => {
    if (!width || imageCount === 0) return;
    const nextIndex = Math.min(Math.round(scrollLeft / width), imageCount - 1);
    if (nextIndex === activeIndex) return;
    prepareIndex(nextIndex);
    setActiveIndex(nextIndex);
    onActiveImageChange?.(nextIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectIndex(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectIndex(activeIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectIndex(imageCount - 1);
    }
  };

  if (imageCount === 0) return null;

  return (
    <section
      className={cn("flex w-full flex-col gap-4", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-[#E2E8F0]">
        <div
          ref={viewportRef}
          className="hide-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onScroll={(event) => handleScroll(event.currentTarget.scrollLeft, event.currentTarget.clientWidth)}
          data-product-gallery-track
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative h-full w-full flex-none snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${imageCount}`}
              aria-hidden={index !== activeIndex}
              data-gallery-slide={index}
            >
              {loadedIndexes.has(index) ? (
                <picture className="block h-full w-full">
                  {image.avifSrcSet && (
                    <source
                      type="image/avif"
                      srcSet={image.avifSrcSet}
                      sizes={image.sizes ?? DEFAULT_IMAGE_SIZES}
                    />
                  )}
                  <img
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes={image.srcSet ? image.sizes ?? DEFAULT_IMAGE_SIZES : undefined}
                    alt={image.alt}
                    className="h-full w-full bg-[#E2E8F0] object-cover"
                    style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                    {...(index === 0 ? { fetchpriority: "high" } : {})}
                    width={image.width ?? 1254}
                    height={image.height ?? 1254}
                  />
                </picture>
              ) : (
                <div className="h-full w-full bg-[#E2E8F0]" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {imageCount > 1 && (
          <>
            <button
              type="button"
              onClick={() => selectIndex(activeIndex - 1)}
              className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2 md:flex"
              aria-label="Previous product image"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => selectIndex(activeIndex + 1)}
              className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2 md:flex"
              aria-label="Next product image"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full bg-black/15 px-1 backdrop-blur-[2px] md:hidden">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => selectIndex(index)}
                  aria-label={`Show product image ${index + 1} of ${imageCount}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  className="flex h-11 w-11 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full ring-1 ring-black/10",
                      activeIndex === index ? "bg-[#1A2F4C]" : "bg-white/80",
                    )}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {imageCount > 1 && (
        <div
          className="hide-scrollbar mt-4 hidden max-w-full gap-3 overflow-x-auto pb-1 md:flex"
          aria-label="Choose a product image"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => selectIndex(index)}
              aria-label={`View product image ${index + 1} of ${imageCount}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={cn(
                "relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-[2px] bg-[#E2E8F0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2",
                activeIndex === index ? "border-2 border-[#1A2F4C]" : "border border-transparent",
              )}
            >
              <img
                src={image.thumbnailSrc}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                width={120}
                height={120}
              />
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Image {activeIndex + 1} of {imageCount}: {images[activeIndex]?.alt}
      </p>
    </section>
  );
};

export default ProductGallery;
