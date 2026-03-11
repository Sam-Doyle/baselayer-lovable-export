import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getSkinConcernBySlug } from "@/lib/queries";
import PortableText from "@/components/PortableText";
import { trackEvent } from "@/lib/analytics";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema, buildArticleSchema } from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isPortableText, toPlainText } from "@/lib/utils";
import oilyTzoneHero from "@/assets/generated-creatives/asset_skin_oily_tzone_1772750833743.png";
import deskDrawer from "@/assets/generated-creatives/asset_environment_desk_drawer_1772750775737.png";
import absorbedSkin from "@/assets/generated-creatives/asset_texture_absorbed_skin_1772750556117.png";
import dryTightHero from "@/assets/generated-creatives/asset_skin_dry_tight_1772750846168.png";
import environmentCommute from "@/assets/generated-creatives/asset_environment_commute_1772750787920.png";
import tiredUndereye from "@/assets/generated-creatives/asset_skin_tired_undereye_1772750857898.png";
import mildRedness from "@/assets/generated-creatives/asset_skin_mild_redness_1772750869168.png";
import texture35 from "@/assets/generated-creatives/asset_skin_35_texture_1772750881164.png";

const skinConcernHeroImages: Record<string, string> = {
  "oily-skin-men": oilyTzoneHero,
  "dry-dehydrated-skin-men": dryTightHero,
  "dark-circles-men": tiredUndereye,
  "sensitive-skin-men": mildRedness,
  "post-shave-irritation": mildRedness,
  "aging-wrinkles-men": texture35,
  "acne-prone-skin-men": oilyTzoneHero,
};

const skinConcernMetaDescriptions: Record<string, string> = {
  "sensitive-skin-men": "Sensitive skin care for men: calm redness, avoid irritation, and strengthen your barrier. Fragrance-free solutions from Base Layer.",
  "post-shave-irritation": "Stop razor burn and post-shave redness with panthenol and centella asiatica. Men's post-shave care guide from Base Layer.",
  "oily-skin-men": "Control oily skin and shine with niacinamide at 5%. A men's guide to managing excess sebum without drying out. Try Base Layer.",
  "aging-wrinkles-men": "Fight fine lines and wrinkles with copper peptide GHK-Cu. Men's anti-aging skincare backed by clinical research. Try Base Layer.",
  "dark-circles-men": "Reduce dark circles and tired-looking eyes with copper peptide and hyaluronic acid. Men's under-eye care guide from Base Layer.",
  "acne-prone-skin-men": "Clear acne-prone skin without harsh chemicals. Non-comedogenic, fragrance-free men's skincare with niacinamide. Try Base Layer.",
  "dry-dehydrated-skin-men": "Fix dry, dehydrated skin with hyaluronic acid and squalane. Men's hydration guide for flaky, tight skin. Try Base Layer.",
};

const skinConcernSupportImages: Record<string, { src: string; alt: string }[]> = {
  "oily-skin-men": [
    { src: deskDrawer, alt: "Mid-day office context — oil control that lasts through the workday" },
    { src: absorbedSkin, alt: "Base Layer moisturizer fully absorbed — matte finish, no residue" },
  ],
  "dry-dehydrated-skin-men": [
    { src: environmentCommute, alt: "Cold weather commute — protecting skin from harsh dry air" },
  ],
};

const SkinConcernDetail = () => {
  const { openModal } = useEarlyAccess();
  const { slug } = useParams<{ slug: string }>();
  const { data: concern, isLoading, error } = useQuery({
    queryKey: ["skin-concern", slug],
    queryFn: () => getSkinConcernBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();

  const sc = concern as any;
  const title = sc?.metaTitle || (sc ? `${sc.name} — Men's Skin Guide | Base Layer` : "Skin Concern | Base Layer");
  const description = sc?.metaDescription || (slug && skinConcernMetaDescriptions[slug]) || toPlainText(sc?.overview) || "";
  const ogImage = sc?.heroImage?.asset?.url || (slug ? skinConcernHeroImages[slug] : undefined);
  useMetaTags({ title, description, image: ogImage });

  useEffect(() => {
    if (sc) {
      trackEvent("view_item", { content_name: sc.name, content_type: "skin_concern" });
    }
  }, [sc]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sc && (
        <JsonLd data={[
          buildArticleSchema({
            title: `${sc.name} — Men's Skin Guide`,
            description,
            slug: `skin-concerns/${sc.slug?.current || slug || ""}`,
            imageUrl: ogImage,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Skin Concerns", path: "/skin-concerns" },
            { name: sc.name },
          ]),
          ...(sc.faqs?.length ? [buildFaqSchema(sc.faqs)] : []),
        ]} />
      )}
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/skin-concerns" className="hover:text-foreground transition-colors">Skin Concerns</Link>
            {sc && <><span>/</span><span className="text-foreground">{sc.name}</span></>}
          </nav>

          {isLoading && <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-4 w-full" /></div>}
          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load.</p>}
          {!isLoading && !error && !sc && <p className="text-center py-20 font-body text-muted-foreground">Not found.</p>}

          {sc && (
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{sc.name}</h1>
              {sc.tagline && <p className="font-body text-lg text-muted-foreground mb-4">{sc.tagline}</p>}
              <p className="font-body text-sm text-muted-foreground mb-6">
                By <Link to="/about" className="underline hover:text-foreground">The Base Layer Team</Link>
              </p>

              {/* Hero image — CMS image or local fallback */}
              {(sc.heroImage?.asset?.url || (slug && skinConcernHeroImages[slug!])) && (
                <div className="aspect-[16/9] overflow-hidden rounded-lg bg-muted mb-10">
                  <img
                    src={sc.heroImage?.asset?.url || skinConcernHeroImages[slug!]}
                    alt={sc.heroImage?.alt || sc.name}
                    className="w-full h-full object-cover"
                    width={1200}
                    height={675}
                    decoding="async"
                    loading="eager"
                  />
                </div>
              )}

              {/* Overview — may be a plain string (legacy) or Portable Text array (new schema) */}
              {sc.overview && (
                isPortableText(sc.overview) ? (
                  <PortableText value={sc.overview} className="font-body text-base text-muted-foreground mb-8" />
                ) : (
                  <p className="font-body text-base text-muted-foreground mb-8">{sc.overview}</p>
                )
              )}

              {/* Body — full rich text content (legacy schema) */}
              {sc.body && (
                <PortableText value={sc.body} className="prose prose-invert max-w-none font-body prose-headings:font-heading prose-p:text-foreground/70 prose-li:text-foreground/70 mb-10" />
              )}

              {/* Root Causes — Portable Text (new schema) */}
              {sc.rootCauses && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Common Causes</h2>
                  <PortableText value={sc.rootCauses} className="prose prose-invert max-w-none font-body prose-headings:font-heading prose-p:text-foreground/70 prose-li:text-foreground/70" />
                </section>
              )}

              {/* Causes — string array (legacy schema) */}
              {!sc.rootCauses && sc.causes && sc.causes.length > 0 && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Common Causes</h2>
                  <ul className="space-y-2">
                    {sc.causes.map((cause: string, i: number) => (
                      <li key={i} className="bg-card p-3 rounded-lg border border-border font-body text-sm text-muted-foreground">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Symptoms — string array (legacy schema) */}
              {sc.symptoms && sc.symptoms.length > 0 && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Symptoms</h2>
                  <ul className="list-disc pl-6 space-y-1 font-body text-sm text-muted-foreground">
                    {sc.symptoms.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Prevention Tips — Portable Text (new schema) */}
              {sc.preventionTips && isPortableText(sc.preventionTips) && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Prevention Tips</h2>
                  <PortableText value={sc.preventionTips} className="prose prose-invert max-w-none font-body prose-headings:font-heading prose-p:text-foreground/70 prose-li:text-foreground/70" />
                </section>
              )}

              {/* Routine Tips — string (legacy schema) */}
              {sc.routineTips && typeof sc.routineTips === "string" && (
                <section className="mb-10">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Routine Tips</h2>
                  <p className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">{sc.routineTips}</p>
                </section>
              )}

              {/* Support images */}
              {slug && skinConcernSupportImages[slug] && (
                <div className={`grid grid-cols-1 ${skinConcernSupportImages[slug].length > 1 ? 'md:grid-cols-2' : ''} gap-6 mb-10`}>
                  {skinConcernSupportImages[slug].map((img, i) => (
                    <div key={i} className="rounded-lg border border-border overflow-hidden bg-card">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-auto"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Ingredients */}
              {sc.recommendedIngredients && sc.recommendedIngredients.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Recommended Ingredients</h2>
                  <div className="flex flex-wrap gap-3">
                    {sc.recommendedIngredients.map((ing: any) => (
                      <Link key={ing.slug} to={`/ingredients/${ing.slug}`} className="bg-card px-4 py-2 rounded-lg font-body text-sm hover:bg-muted transition-colors border border-border">{ing.name}</Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Articles */}
              {sc.relatedArticles && sc.relatedArticles.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Related Articles</h2>
                  <div className="space-y-3">
                    {sc.relatedArticles.map((a: any) => (
                      <Link key={a.slug} to={`/articles/${a.slug}`} className="block bg-card p-4 rounded-lg hover:bg-muted transition-colors border border-border">
                        <h3 className="font-heading font-bold">{a.title}</h3>
                        {a.excerpt && <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{typeof a.excerpt === "string" ? a.excerpt : toPlainText(a.excerpt)}</p>}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQs */}
              {sc.faqs && sc.faqs.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">FAQs</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {sc.faqs.map((faq: any) => (
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
              trackEvent("cta_click", { source: "skin_concern_detail" });
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

export default SkinConcernDetail;
