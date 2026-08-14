import type { ProductGalleryImage } from "@/components/ProductGallery";

const galleryAssets = import.meta.glob(
  [
    "../assets/product-carousel/*.webp",
    "../assets/product-carousel/responsive/*.webp",
    "../assets/product-carousel/thumbnails/*.webp",
  ],
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

function galleryAsset(path: string) {
  const asset = galleryAssets[path];
  if (!asset) throw new Error(`Missing product gallery asset: ${path}`);
  return asset;
}

const galleryContent = [
  {
    stem: "base-layer-carousel-01-primary",
    alt: "Base Layer Daily Face Cream bottle and carton on white background",
  },
  {
    stem: "base-layer-carousel-05-lifestyle-v2",
    alt: "Man applying Base Layer face cream in morning bathroom light",
  },
  {
    stem: "base-layer-carousel-02-positioning",
    alt: "Base Layer bottle on charcoal stone — Daily Moisture. Active Recovery.",
  },
  {
    stem: "base-layer-carousel-03-ingredients",
    alt: "Ingredient callout — 5% Niacinamide + Copper Peptides",
  },
  {
    stem: "base-layer-carousel-04-one-step",
    alt: "One Step. Every Day. — Base Layer bottle with cream ribbon",
  },
  {
    stem: "base-layer-carousel-06-design",
    alt: "Base Layer bottle and carton on graphite — Simple by Design.",
  },
  {
    stem: "base-layer-carousel-07-recap",
    alt: "Daily Face Cream — 5% Niacinamide + Copper Peptides — 50 ml / 1.7 fl oz",
  },
] as const;

export const PRODUCT_GALLERY_IMAGES: ProductGalleryImage[] = galleryContent.map(({ stem, alt }, index) => {
  const responsiveBase = `../assets/product-carousel/responsive/${stem}`;
  return {
    id: index + 1,
    src: galleryAsset(`${responsiveBase}-768w.webp`),
    srcSet: [480, 768, 1200]
      .map((width) => `${galleryAsset(`${responsiveBase}-${width}w.webp`)} ${width}w`)
      .join(", "),
    thumbnailSrc: galleryAsset(`../assets/product-carousel/thumbnails/${stem}-120w.webp`),
    alt,
    width: 1254,
    height: 1254,
  };
});
