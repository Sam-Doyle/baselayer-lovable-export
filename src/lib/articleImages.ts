const SANITY_IMAGE_HOST = "cdn.sanity.io";

export const ARTICLE_HERO_SIZES = "(max-width: 767px) calc(100vw - 48px), 720px";
export const ARTICLE_HERO_WIDTHS = [480, 768, 1200] as const;

/*
 * This comparison graphic is embedded in seven activity-specific articles.
 * The Sanity blocks predate the alt field, so the asset identity is the only
 * durable way to give the already-published image an accurate accessible name
 * without assigning the same generic description to every future image.
 */
const KNOWN_PORTABLE_IMAGE_ALTS: Record<string, string> = {
  "6b0b626ab04a3ef8f9ff037c51e9db357a4028db":
    "Side-by-side graphic contrasting a matte black Base Layer bottle with a spilled generic skin lotion",
};

interface PortableImageAsset {
  _ref?: unknown;
  url?: unknown;
}

interface PortableImageValue {
  alt?: unknown;
  caption?: unknown;
  asset?: PortableImageAsset;
  image?: {
    alt?: unknown;
    asset?: PortableImageAsset;
  };
}

function nonEmptyText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/**
 * Add Sanity CDN transforms without touching local fallbacks or external
 * images. The original CMS URL is always retained for an unexpected URL.
 */
export function optimizedSanityImageUrl(
  sourceUrl: string,
  width: number,
  height?: number,
): string {
  try {
    const url = new URL(sourceUrl);
    if (url.hostname !== SANITY_IMAGE_HOST) return sourceUrl;

    url.searchParams.set("w", String(width));
    if (height) {
      url.searchParams.set("h", String(height));
      url.searchParams.set("fit", "crop");
    }
    url.searchParams.set("auto", "format");
    url.searchParams.set("q", "80");
    return url.toString();
  } catch {
    return sourceUrl;
  }
}

export function buildArticleHeroImage(sourceUrl: string) {
  const candidate = (width: number) =>
    optimizedSanityImageUrl(sourceUrl, width, Math.round((width * 9) / 16));

  return {
    src: candidate(1200),
    srcSet: ARTICLE_HERO_WIDTHS.map((width) => `${candidate(width)} ${width}w`).join(", "),
    sizes: ARTICLE_HERO_SIZES,
  };
}

function portableImageIdentity(value: PortableImageValue): string {
  const asset = value?.asset ?? value?.image?.asset;
  return [asset?._ref, asset?.url, value?.image?.asset?._ref, value?.image?.asset?.url]
    .filter((identity): identity is string => typeof identity === "string" && identity.length > 0)
    .join(" ");
}

/**
 * Prefer editorially-authored alt text, then a caption, then an exact known
 * asset fallback. Unknown missing-alt assets stay decorative instead of being
 * assigned a misleading description.
 */
export function portableArticleImageAlt(value: PortableImageValue): string {
  const authored = nonEmptyText(value?.alt) ?? nonEmptyText(value?.image?.alt);
  if (authored) return authored;

  const caption = nonEmptyText(value?.caption);
  if (caption) return caption;

  const identity = portableImageIdentity(value);
  const match = Object.entries(KNOWN_PORTABLE_IMAGE_ALTS).find(([assetId]) =>
    identity.includes(assetId),
  );
  return match?.[1] ?? "";
}
