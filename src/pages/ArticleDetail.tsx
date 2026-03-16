import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticleBySlug } from "@/lib/queries";
import PortableText from "@/components/PortableText";
import { trackEvent } from "@/lib/analytics";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema, buildArticleSchema } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isPortableText, toPlainText } from "@/lib/utils";
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

const articleHeroImages: Record<string, string> = {
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

const ArticleDetail = () => {
  const { openModal } = useEarlyAccess();
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => getArticleBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();

  useEffect(() => {
    if (article) {
      trackEvent("view_item", { content_name: article.title, content_type: "article" });
    }
  }, [article]);

  const art = article as any;
  const title = art?.metaTitle || (article ? `${article.title} | Base Layer` : "Article | Base Layer");
  const description = art?.metaDescription || toPlainText(art?.excerpt) || art?.extractableSummary || "";
  const imageUrl = art?.heroImage?.asset?.url || (slug ? articleHeroImages[slug] : undefined) || environmentSink;

  useMetaTags({ title, description, type: "article", image: imageUrl });

  // Apply noindex for articles flagged in Sanity CMS
  useEffect(() => {
    if (art?.seo?.noIndex) {
      let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "robots";
        document.head.appendChild(meta);
      }
      meta.content = "noindex, nofollow";
      return () => { meta?.remove(); };
    }
  }, [art?.seo?.noIndex]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {article && (
        <JsonLd data={[
          buildArticleSchema({
            title: article.title,
            description,
            slug: art?.slug?.current || slug || "",
            publishedAt: art?.publishDate,
            updatedAt: art?.updatedAt,
            authorName: art?.author?.name || "The Base Layer Team",
            authorCredentials: art?.author?.credentials,
            imageUrl,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/articles" },
            { name: article.title },
          ]),
          ...(art?.faqs?.length ? [buildFaqSchema(art.faqs)] : []),
        ]} />
      )}
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10 min-h-[1.25rem]">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/articles" className="hover:text-foreground transition-colors">Articles</Link>
            {article && (
              <>
                <span>/</span>
                <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
              </>
            )}
          </nav>

          {isLoading && (
            <div className="space-y-6 min-h-[80vh]">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="aspect-[16/9] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load article.</p>}
          {!isLoading && !error && !article && <p className="text-center py-20 font-body text-muted-foreground">Article not found.</p>}

          {article && art && (
            <article className="min-h-[80vh]">
              {art.publishDate && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                  <span>
                    Published: <time dateTime={new Date(art.publishDate).toISOString().split("T")[0]}>
                      {format(new Date(art.publishDate), "MMMM d, yyyy")}
                    </time>
                  </span>
                  {art.updatedAt && art.updatedAt !== art.publishDate && (
                    <span>
                      Updated: <time dateTime={new Date(art.updatedAt).toISOString().split("T")[0]}>
                        {format(new Date(art.updatedAt), "MMMM d, yyyy")}
                      </time>
                    </span>
                  )}
                </div>
              )}
              <h1 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4">{article.title}</h1>
              <p className="font-body text-sm text-muted-foreground mb-8">
                By{" "}
                <Link to="/about" className="underline hover:text-foreground">
                  {art.author?.name || "The Base Layer Team"}
                </Link>
                {art.author?.credentials && `, ${art.author.credentials}`}
              </p>

              {/* Key Takeaways */}
              {(art.excerpt || art.extractableSummary) && (
                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                  <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Key Takeaways</h2>
                  {art.excerpt && isPortableText(art.excerpt) ? (
                    <PortableText value={art.excerpt} className="font-body text-sm text-muted-foreground leading-relaxed" />
                  ) : (
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {art.excerpt || art.extractableSummary}
                    </p>
                  )}
                </div>
              )}

              {imageUrl && (
                <div className="mb-10 rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                  <img
                    src={imageUrl}
                    alt={art.heroImage?.alt || article.title}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={675}
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
              )}
              <div className="min-h-[300px]">
                <PortableText
                  value={art.body}
                  className="prose prose-invert max-w-none font-body prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-primary prose-p:text-foreground/70 prose-li:text-foreground/70"
                />
              </div>

              {/* Related Ingredients */}
              {art.relatedIngredients && art.relatedIngredients.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Related Ingredients</h2>
                  <div className="flex flex-wrap gap-3">
                    {art.relatedIngredients.map((ing: any) => (
                      <Link key={ing.slug} to={`/ingredients/${ing.slug}`} className="bg-card px-4 py-2 rounded-lg font-body text-sm hover:bg-muted transition-colors border border-border">
                        {ing.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Concerns */}
              {art.relatedConcerns && art.relatedConcerns.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Related Skin Concerns</h2>
                  <div className="flex flex-wrap gap-3">
                    {art.relatedConcerns.map((c: any) => (
                      <Link key={c.slug} to={`/skin-concerns/${c.slug}`} className="bg-card px-4 py-2 rounded-lg font-body text-sm hover:bg-muted transition-colors border border-border">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* You Might Also Like — static cross-links for internal linking */}
              <section className="mt-10 pt-10 border-t border-border">
                <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/comparisons/best-mens-face-moisturizers-compared" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Best Men's Face Moisturizers Compared</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">Side-by-side comparison of the top moisturizers for men.</p>
                  </Link>
                  <Link to="/comparisons/cerave-vs-base-layer" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">CeraVe vs Base Layer</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">How drugstore moisturizer stacks up against clinical-grade actives.</p>
                  </Link>
                  <Link to="/skin-concerns/aging-wrinkles-men" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Aging & Wrinkles Guide for Men</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">Fight fine lines with copper peptide GHK-Cu and proven actives.</p>
                  </Link>
                  <Link to="/skin-concerns/dark-circles-men" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Dark Circles Under Eyes for Men</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">Reduce tired-looking eyes with peptides and hyaluronic acid.</p>
                  </Link>
                </div>
              </section>

              {/* FAQs */}
              {art.faqs && art.faqs.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border min-h-[120px]">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">FAQs</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {art.faqs.map((faq: any) => (
                      <AccordionItem key={faq._key} value={faq._key}>
                        <AccordionTrigger className="font-body text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="font-body text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}
              {/* Trust signal */}
              <div className="mt-10 pt-6 border-t border-border">
                <p className="font-body text-xs text-muted-foreground/60 italic">
                  Reviewed by the Base Layer skincare team. Based on published dermatological research and clinical ingredient data.
                </p>
              </div>
            </article>
          )}
        </div>
      </main>

      <section className="px-6 py-16 text-center bg-card border-t border-border">
        <div className="max-w-lg mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide mb-4">
            Ready to Try Base Layer?
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            6 clinical-grade actives. One step. $38. Shipping Spring 2026.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="px-12 py-6 text-sm"
            onClick={() => {
              trackEvent("cta_click", { source: "article_detail" });
              openModal("content_cta");
            }}
          >
            GET EARLY ACCESS — $38
          </Button>
          <p className="font-body text-[11px] text-muted-foreground/60 mt-3 uppercase tracking-wider">
            Pre-launch — shipping Spring 2026
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
