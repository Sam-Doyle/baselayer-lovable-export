const howToUseAssets = import.meta.glob(
  "../assets/generated-creatives/responsive/how-to-use-lifestyle-*.{avif,webp}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

function howToUseAsset(width: number, format: "avif" | "webp") {
  const path = `../assets/generated-creatives/responsive/how-to-use-lifestyle-${width}w.${format}`;
  const asset = howToUseAssets[path];
  if (!asset) throw new Error(`Missing responsive how-to asset: ${path}`);
  return asset;
}

const widths = [480, 768, 1200, 1920] as const;

export const HOW_TO_USE_MEDIA = {
  src: howToUseAsset(1200, "webp"),
  webpSrcSet: widths.map((width) => `${howToUseAsset(width, "webp")} ${width}w`).join(", "),
  avifSrcSet: widths.map((width) => `${howToUseAsset(width, "avif")} ${width}w`).join(", "),
  sizes: "(max-width: 768px) calc(100vw - 48px), 500px",
  width: 2048,
  height: 2048,
  alt: "Base Layer Daily Face Cream on a bathroom counter",
} as const;
