import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getIngredientBySlug } from "@/lib/queries";
import PortableText from "@/components/PortableText";
import { trackEvent } from "@/lib/analytics";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema, buildArticleSchema } from "@/components/SEO";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { isPortableText, toPlainText } from "@/lib/utils";
import copperPeptideHero from "@/assets/generated-creatives/content_visual_ingredient_copper_peptide_1772738726598.png";
import niacinamideHero from "@/assets/generated-creatives/content_visual_ingredient_niacinamide_1772738739613.png";
import haTexture from "@/assets/generated-creatives/ingredient_texture_hyaluronic_1772743658803.png";
import haGraphic from "@/assets/generated-creatives/ingredient_graphic_hyaluronic_1772743670341.png";
import squalaneTexture from "@/assets/generated-creatives/ingredient_texture_squalane_1772743684424.png";
import squalaneGraphic from "@/assets/generated-creatives/ingredient_graphic_squalane_1772743695227.png";
import pumpDispensing from "@/assets/generated-creatives/asset_texture_pump_dispensing_1772750527399.png";
import absorbedSkin from "@/assets/generated-creatives/asset_texture_absorbed_skin_1772750556117.png";

const ingredientHeroImages: Record<string, string> = {
  "copper-peptide-ghk-cu": copperPeptideHero,
  "copper-peptide": copperPeptideHero,
  "niacinamide": niacinamideHero,
};

const ingredientSupplementaryImages: Record<string, { texture: { src: string; alt: string }; graphic: { src: string; alt: string } }> = {
  "hyaluronic-acid": {
    texture: { src: haTexture, alt: "Hyaluronic acid texture: crystal-clear water droplet on charcoal stone" },
    graphic: { src: haGraphic, alt: "Hyaluronic acid: best for deep hydration" },
  },
  "squalane": {
    texture: { src: squalaneTexture, alt: "Squalane texture: weightless oil drop instantly absorbing" },
    graphic: { src: squalaneGraphic, alt: "Squalane: best for barrier repair and moisture locking" },
  },
};

const generalTextureImages = {
  texture: { src: pumpDispensing, alt: "Base Layer pump dispensing — lightweight gel-cream texture" },
  graphic: { src: absorbedSkin, alt: "Base Layer moisturizer absorbed into skin — no residue" },
};

const ingredientMetaDescriptions: Record<string, string> = {
  "niacinamide": "Niacinamide at 5% controls oil, shrinks pores, and evens skin tone for men. See the clinical research and how Base Layer uses it.",
  "squalane": "Squalane absorbs in 15 seconds and locks in moisture without greasiness. Learn why Base Layer chose it as the formula base.",
  "copper-peptide": "Copper peptide GHK-Cu at 0.03% stimulates collagen and firms skin. Discover the anti-aging science behind Base Layer's key active.",
  "copper-peptide-ghk-cu": "Copper peptide GHK-Cu at 0.03% stimulates collagen and firms skin. Discover the anti-aging science behind Base Layer's key active.",
  "hyaluronic-acid": "Hyaluronic acid holds 1,000x its weight in water for deep hydration without surface shine. See how Base Layer delivers it.",
  "panthenol": "Panthenol at 2% calms post-shave irritation and repairs your skin barrier fast. Learn why Base Layer includes it for men.",
  "centella-asiatica": "Centella asiatica reduces redness and rebuilds your moisture barrier. See the research behind this Base Layer ingredient.",
};

const IngredientDetail = () => {
  const { openModal } = useEarlyAccess();
  const { slug } = useParams<{ slug: string }>();
  const { data: ingredient, isLoading, error } = useQuery({
    queryKey: ["ingredient", slug],
    queryFn: () => getIngredientBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();

  const title = (ingredient as any)?.metaTitle || (ingredient ? `${ingredient.name} — Skincare Ingredient Guide | Base Layer` : "Ingredient | Base Layer");
  const description = (ingredient as any)?.metaDescription || (slug && ingredientMetaDescriptions[slug]) || toPlainText((ingredient as any)?.overview) || "";
  const ogImage = (ingredient as any)?.heroImage?.asset?.url || (slug ? ingredientHeroImages[slug] : undefined);
  useMetaTags({ title, description, image: ogImage });

  useEffect(() => {
    if (ingredient) {
      trackEvent("view_item", { content_name: ingredient.name, content_type: "ingredient" });
    }
  }, [ingredient]);

  const ing = ingredient as any;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {ingredient && (
        <JsonLd data={[
          buildArticleSchema({
            title: `${ingredient.name} — Skincare Ingredient Guide`,
            description: description || `Learn how ${ingredient.name} works in skincare, its benefits, and the research behind it.`,
            slug: `ingredients/${ing?.slug?.current || slug || ""}`,
            imageUrl: ogImage,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Ingredients", path: "/ingredients" },
            { name: ingredient.name },
          ]),
          ...(ing?.faqs?.length ? [buildFaqSchema(ing.faqs)] : []),
        ]} />
      )}
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10 min-h-[1.25rem]">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/ingredients" className="hover:text-foreground transition-colors">Ingredients</Link>
            {ingredient && <><span>/</span><span className="text-foreground">{ingredient.name}</span></>}
          </nav>

          {isLoading && <div className="space-y-4 min-h-[60vh]"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load ingredient.</p>}
          {!isLoading && !error && !ingredient && <p className="text-center py-20 font-body text-muted-foreground">Ingredient not found.</p>}

          {ingredient && ing && (
            <div className="min-h-[60vh]">
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{ingredient.name}</h1>
              {ing.tagline && <p className="font-body text-lg text-muted-foreground mb-4">{ing.tagline}</p>}
              <p className="font-body text-sm text-muted-foreground mb-6">
                By <Link to="/about" className="underline hover:text-foreground">The Base Layer Team</Link>
              </p>

              {/* Hero image — CMS image or local fallback */}
              {(ing.heroImage?.asset?.url || (slug && ingredientHeroImages[slug!])) && (
                <div className="aspect-[16/9] overflow-hidden rounded-lg bg-muted mb-10">
                  <img
                    src={ing.heroImage?.asset?.url || ingredientHeroImages[slug!]}
                    alt={ing.heroImage?.alt || ingredient.name}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={675}
                    decoding="async"
                    loading="eager"
                  />
                </div>
              )}

              {/* Overview — may be a plain string (legacy) or Portable Text array */}
              {ing.overview && (
                isPortableText(ing.overview) ? (
                  <PortableText value={ing.overview} className="font-body text-base text-muted-foreground mb-8" />
                ) : (
                  <p className="font-body text-base text-muted-foreground mb-8">{ing.overview}</p>
                )
              )}

              {/* Body — full rich text content */}
              <div className="min-h-[200px]">
                <PortableText value={ing.body} className="prose prose-invert max-w-none font-body prose-headings:font-heading prose-p:text-foreground/70 prose-li:text-foreground/70 mb-10" />
              </div>

              {/* Texture macro + Best For graphic — slug-mapped local assets */}
              {slug && ingredientSupplementaryImages[slug] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="rounded-lg border border-border overflow-hidden bg-card aspect-square">
                    <img
                      src={ingredientSupplementaryImages[slug].texture.src}
                      alt={ingredientSupplementaryImages[slug].texture.alt}
                      className="w-full h-full object-cover"
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden bg-card aspect-square">
                    <img
                      src={ingredientSupplementaryImages[slug].graphic.src}
                      alt={ingredientSupplementaryImages[slug].graphic.alt}
                      className="w-full h-full object-cover"
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              )}

              {/* General texture evidence — for ingredients without specific supplementary images */}
              {slug && !ingredientSupplementaryImages[slug] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="rounded-lg border border-border overflow-hidden bg-card aspect-square">
                    <img
                      src={generalTextureImages.texture.src}
                      alt={generalTextureImages.texture.alt}
                      className="w-full h-full object-cover"
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden bg-card aspect-square">
                    <img
                      src={generalTextureImages.graphic.src}
                      alt={generalTextureImages.graphic.alt}
                      className="w-full h-full object-cover"
                      width={640}
                      height={640}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              )}

              {/* How It Works — may be string or Portable Text */}
              {ing.howItWorks && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">How It Works</h2>
                  {isPortableText(ing.howItWorks) ? (
                    <PortableText value={ing.howItWorks} className="font-body text-muted-foreground leading-relaxed" />
                  ) : (
                    <p className="font-body text-muted-foreground leading-relaxed">{ing.howItWorks}</p>
                  )}
                </section>
              )}

              {/* Benefits */}
              {ing.benefits && ing.benefits.length > 0 && (
                <section className="mb-10 min-h-[120px]">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Benefits</h2>
                  <ul className="space-y-3">
                    {ing.benefits.map((b: any) => (
                      <li key={b._key} className="bg-card p-4 rounded-lg border border-border">
                        <span className="font-body font-semibold">{b.benefit}</span>
                        {b.description && <p className="font-body text-sm text-muted-foreground mt-1">{b.description}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Research Citations */}
              {ing.researchCitations && ing.researchCitations.length > 0 && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Research</h2>
                  <ul className="space-y-3">
                    {ing.researchCitations.map((c: any) => (
                      <li key={c._key} className="bg-card p-4 rounded-lg border border-border">
                        <p className="font-body font-semibold">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{c.title}</a>
                          ) : c.title}
                        </p>
                        <p className="font-body text-sm text-muted-foreground mt-1">
                          {c.journal && <span>{c.journal}</span>}
                          {c.year && <span> ({c.year})</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Related Concerns */}
              {ing.relatedConcerns && ing.relatedConcerns.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Related Skin Concerns</h2>
                  <div className="flex flex-wrap gap-3">
                    {ing.relatedConcerns.map((c: any) => (
                      <Link key={c.slug} to={`/skin-concerns/${c.slug}`} className="bg-card px-4 py-2 rounded-lg font-body text-sm hover:bg-muted transition-colors border border-border">{c.name}</Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Articles */}
              {ing.relatedArticles && ing.relatedArticles.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Related Articles</h2>
                  <div className="space-y-3">
                    {ing.relatedArticles.map((a: any) => (
                      <Link key={a.slug} to={`/articles/${a.slug}`} className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                        <h3 className="font-heading font-bold">{a.title}</h3>
                        {a.excerpt && <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{typeof a.excerpt === "string" ? a.excerpt : toPlainText(a.excerpt)}</p>}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Explore More */}
              <section className="mt-10 pt-10 border-t border-border">
                <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Explore More</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link to="/skin-concerns/aging-wrinkles-men" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Aging & Wrinkles in Men</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">How clinical actives fight fine lines and loss of firmness.</p>
                  </Link>
                  <Link to="/skin-concerns/sensitive-skin-men" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Sensitive Skin Care for Men</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">Calm redness and irritation with fragrance-free formulas.</p>
                  </Link>
                  <Link to="/skin-concerns/dark-circles-men" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Dark Circles Under Eyes</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">Reduce tired-looking eyes with peptides and hydration.</p>
                  </Link>
                  <Link to="/comparisons/best-mens-face-moisturizers-compared" className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                    <h3 className="font-heading font-bold text-sm">Best Men's Moisturizers Compared</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">Side-by-side comparison of top moisturizers for men.</p>
                  </Link>
                </div>
              </section>

              {/* FAQs */}
              {ing.faqs && ing.faqs.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border min-h-[120px]">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">FAQs</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {ing.faqs.map((faq: any) => (
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
            </div>
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
              trackEvent("cta_click", { source: "ingredient_detail" });
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

export default IngredientDetail;
