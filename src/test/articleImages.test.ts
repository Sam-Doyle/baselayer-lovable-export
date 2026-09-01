import { describe, expect, it } from "vitest";
import {
  ARTICLE_HERO_SIZES,
  buildArticleHeroImage,
  optimizedSanityImageUrl,
  portableArticleImageAlt,
} from "@/lib/articleImages";

const rawSanityHero =
  "https://cdn.sanity.io/images/27quz10a/production/hero-640x640.png";

describe("article image delivery", () => {
  it("builds responsive, format-negotiated Sanity hero candidates", () => {
    const image = buildArticleHeroImage(rawSanityHero);

    expect(image.sizes).toBe(ARTICLE_HERO_SIZES);
    expect(image.srcSet).toContain("w=480");
    expect(image.srcSet).toContain("h=270");
    expect(image.srcSet).toContain("auto=format");
    expect(image.srcSet).toContain("q=80");
    expect(image.srcSet.match(/\s(?:480|768|1200)w/g)).toHaveLength(3);
    expect(image.src).toContain("w=1200");
    expect(image.src).toContain("h=675");
  });

  it("does not rewrite non-Sanity fallbacks", () => {
    expect(optimizedSanityImageUrl("/assets/article-fallback.webp", 480, 270)).toBe(
      "/assets/article-fallback.webp",
    );
  });

  it("uses authored alt text before captions or known-asset fallbacks", () => {
    expect(
      portableArticleImageAlt({
        alt: "Man applying face cream after a run",
        caption: "Post-run recovery",
        asset: { _ref: "image-6b0b626ab04a3ef8f9ff037c51e9db357a4028db-640x640-png" },
      }),
    ).toBe("Man applying face cream after a run");
  });

  it("describes the shared comparison graphic used by seven published articles", () => {
    expect(
      portableArticleImageAlt({
        asset: { _ref: "image-6b0b626ab04a3ef8f9ff037c51e9db357a4028db-640x640-png" },
      }),
    ).toBe(
      "Side-by-side graphic contrasting a matte black Base Layer bottle with a spilled generic skin lotion",
    );
  });
});
