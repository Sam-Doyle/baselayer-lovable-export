import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticles } from "@/lib/queries";
import { urlFor, type Article } from "@/lib/sanity";
import { trackEvent } from "@/lib/analytics";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildItemListSchema, BASE_URL } from "@/components/SEO";
import { toPlainText } from "@/lib/utils";
import minimalistRoutine from "@/assets/generated-creatives/article_visual_minimalist_routine_1772741436619.png";
import antiAging from "@/assets/generated-creatives/article_visual_anti_aging_1772741409831.png";
import shineControl from "@/assets/generated-creatives/article_visual_shine_control_1772741392147.png";
import clutteredSink from "@/assets/generated-creatives/article_hero_cluttered_sink_1772743561435.png";
import comparisonDrugstore from "@/assets/generated-creatives/comparison_vs_drugstore_1772743742942.png";
import comparisonLuxury from "@/assets/generated-creatives/comparison_vs_luxury_1772743730945.png";
import comparisonTextures from "@/assets/generated-creatives/asset_comparison_textures_1772750928241.png";
import shelfContext from "@/assets/generated-creatives/asset_packshot_shelf_context_1772750479858.png";
import handHeld from "@/assets/generated-creatives/asset_packshot_hand_held_1772750504601.png";
import founderMountain from "@/assets/generated-creatives/asset_founder_mountain_1772750599903.png";
import environmentSink from "@/assets/generated-creatives/asset_environment_sink_1772750764156.png";
import pumpDispensing from "@/assets/generated-creatives/asset_texture_pump_dispensing_1772750527399.png";
import skinMildRedness from "@/assets/generated-creatives/asset_skin_mild_redness_1772750869168.png";
import skinDryTight from "@/assets/generated-creatives/asset_skin_dry_tight_1772750846168.png";

const articleCardImages: Record<string, string> = {
  "3-step-skincare-routine": minimalistRoutine,
  "base-layer-vs-cetaphil": comparisonDrugstore,
  "base-layer-vs-kiehls": comparisonLuxury,
  "base-layer-vs-neutrogena": comparisonTextures,
  "no-subscription-model": shelfContext,
  "best-moisturizer-sensitive-skin-men": skinMildRedness,
  "best-moisturizer-dry-skin-men": skinDryTight,
  "best-moisturizer-for-men": handHeld,
  "skincare-ingredients": pumpDispensing,
  "skincare-mistakes": clutteredSink,
  "best-anti-aging-moisturizer-men": antiAging,
  "best-moisturizer-oily-skin-men": shineControl,
  "why-mens-skin-is-different": founderMountain,
};

const Articles = () => {
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: getArticles,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();
  useMetaTags({
    title: "Men's Skincare Articles | Simple Guides For Better Skin",
    description: "Expert men's skincare guides covering ingredients, routines, and product comparisons. Science-backed advice from Base Layer.",
    image: "https://baselayerskin.co/og-articles.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", { content_name: "Articles", content_type: "listing" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[
        buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Articles" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Men's Skincare Articles",
          description: "Expert men's skincare guides covering ingredients, routines, and product comparisons. Science-backed advice from Base Layer.",
          url: "https://baselayerskin.co/articles",
        },
        ...(articles && articles.length > 0
          ? [buildItemListSchema(
              "Men's Skincare Articles",
              articles.map((a) => ({
                name: a.title,
                url: `${BASE_URL}/articles/${a.slug.current}`,
              })),
            )]
          : []),
      ]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-16 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">
              Men's Skincare, Explained Clearly
            </h1>
            <p className="font-body text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Start with the problem you actually have, not the routine you think you need.
            </p>
          </header>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-center py-20 font-body text-muted-foreground">Unable to load articles.</p>
          )}

          {articles && articles.length === 0 && (
            <p className="text-center py-20 font-body text-muted-foreground">No articles yet.</p>
          )}

          {articles && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => {
                const slug = article.slug.current;
                const cardImage = (article as any).heroImage?.asset?.url
                  || (article.mainImage ? urlFor(article.mainImage).width(600).height(375).url() : null)
                  || articleCardImages[slug]
                  || environmentSink;
                return (
                <Link key={article._id} to={`/articles/${slug}`} className="group block">
                  <article className="space-y-4">
                    <div className="aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                      <img
                        src={cardImage}
                        alt={(article as any).heroImage?.alt || article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={375}
                      />
                    </div>
                    <div>
                      {article.author && (
                        <span className="font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                          {article.author.name}
                        </span>
                      )}
                      {((article as any).publishDate || article.publishedAt) && (
                        <span className="font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground ml-3">
                          {format(new Date((article as any).publishDate || article.publishedAt!), "MMM d, yyyy")}
                        </span>
                      )}
                      <h2 className="font-heading text-lg font-bold mt-1 group-hover:underline underline-offset-4">
                        {article.title}
                      </h2>
                      {((article as any).excerpt || article.extractableSummary) && (
                        <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-3">
                          {toPlainText((article as any).excerpt) || article.extractableSummary}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Articles;
