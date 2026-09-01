import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductGallery, { type ProductGalleryImage } from "@/components/ProductGallery";
import { PRODUCT_GALLERY_IMAGES } from "@/data/productGallery";
import { HOW_TO_USE_MEDIA } from "@/data/howToUseMedia";

const images: ProductGalleryImage[] = Array.from({ length: 5 }, (_, index) => ({
  id: `image-${index}`,
  src: `/image-${index}.webp`,
  srcSet: `/image-${index}-480w.webp 480w, /image-${index}-768w.webp 768w`,
  thumbnailSrc: `/image-${index}-thumb.webp`,
  alt: `Product view ${index + 1}`,
}));

describe("ProductGallery", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("uses one responsive image track and initially mounts only the active image and its neighbors", () => {
    const { container } = render(<ProductGallery images={images} />);

    expect(container.querySelectorAll("[data-product-gallery-track]")).toHaveLength(1);
    expect(container.querySelectorAll("[data-gallery-slide]")).toHaveLength(5);
    expect(container.querySelector('[data-gallery-slide="0"] img')).toBeInTheDocument();
    expect(container.querySelector('[data-gallery-slide="1"] img')).toBeInTheDocument();
    expect(container.querySelector('[data-gallery-slide="4"] img')).toBeInTheDocument();
    expect(container.querySelector('[data-gallery-slide="2"] img')).not.toBeInTheDocument();
    expect(container.querySelector('[data-gallery-slide="3"] img')).not.toBeInTheDocument();
  });

  it("ships responsive sources and lightweight thumbnails for every PDP image", () => {
    expect(PRODUCT_GALLERY_IMAGES).toHaveLength(7);
    PRODUCT_GALLERY_IMAGES.forEach((image) => {
      expect(image.srcSet?.match(/\s(?:480|768|1200)w/g)).toHaveLength(3);
      expect(image.thumbnailSrc).toMatch(/120w\.webp$/);
    });
  });

  it("ships AVIF and WebP candidates for the below-fold how-to image", () => {
    expect(HOW_TO_USE_MEDIA.avifSrcSet.match(/\s(?:480|768|1200|1920)w/g)).toHaveLength(4);
    expect(HOW_TO_USE_MEDIA.webpSrcSet.match(/\s(?:480|768|1200|1920)w/g)).toHaveLength(4);
    expect(HOW_TO_USE_MEDIA.src).toMatch(/1200w\.webp$/);
  });

  it("supports arrow buttons, keyboard navigation, and accessible active-state controls", () => {
    const onActiveImageChange = vi.fn();
    render(<ProductGallery images={images} onActiveImageChange={onActiveImageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Next product image" }));
    expect(screen.getByRole("button", { name: "View product image 2 of 5" })).toHaveAttribute("aria-current", "true");
    expect(onActiveImageChange).toHaveBeenLastCalledWith(1);

    const track = document.querySelector("[data-product-gallery-track]") as HTMLElement;
    fireEvent.keyDown(track, { key: "End" });
    expect(screen.getByRole("button", { name: "View product image 5 of 5" })).toHaveAttribute("aria-current", "true");
    expect(onActiveImageChange).toHaveBeenLastCalledWith(4);

    fireEvent.keyDown(track, { key: "Home" });
    expect(screen.getByRole("button", { name: "View product image 1 of 5" })).toHaveAttribute("aria-current", "true");
    expect(onActiveImageChange).toHaveBeenLastCalledWith(0);
  });

  it("keeps all seven mobile pagination targets inside a 320px viewport", () => {
    const { container } = render(<ProductGallery images={PRODUCT_GALLERY_IMAGES} />);
    const pagination = container.querySelector("[data-product-gallery-pagination]");

    expect(pagination).toBeInTheDocument();
    expect(pagination?.querySelectorAll("button")).toHaveLength(7);
    expect(pagination?.querySelector("button")).toHaveClass("w-10", "min-[360px]:w-11");
  });

  it("renders nothing for an empty image list", () => {
    const { container } = render(<ProductGallery images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
