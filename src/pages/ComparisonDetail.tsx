import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getComparisonBySlug } from "@/lib/queries";
import PortableText from "@/components/PortableText";
import { trackEvent } from "@/lib/analytics";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { Button } from "@/components/ui/button";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildFaqSchema, buildArticleSchema } from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { isPortableText, toPlainText } from "@/lib/utils";
import comparisonChart from "@/assets/generated-creatives/content_visual_comparison_chart_1772738708119.png";
import comparisonLuxury from "@/assets/generated-creatives/comparison_vs_luxury_1772743730945.png";
import comparisonDrugstore from "@/assets/generated-creatives/comparison_vs_drugstore_1772743742942.png";
import comparisonLineup from "@/assets/generated-creatives/asset_comparison_lineup_1772750914688.png";
import comparisonTextures from "@/assets/generated-creatives/asset_comparison_textures_1772750928241.png";

const comparisonSlugImages: Record<string, { src: string; alt: string }> = {
  "base-layer-vs-kiehls": { src: comparisonLuxury, alt: "Base Layer ($38) vs luxury skincare regimens ($200+)" },
  "base-layer-vs-brickell": { src: comparisonLuxury, alt: "Base Layer ($38) vs premium skincare setups ($200+)" },
  "base-layer-vs-cerave": { src: comparisonDrugstore, alt: "Base Layer matte finish vs drugstore greasy residue" },
  "base-layer-vs-cetaphil": { src: comparisonDrugstore, alt: "Base Layer matte finish vs drugstore greasy residue" },
  "base-layer-vs-neutrogena": { src: comparisonDrugstore, alt: "Base Layer matte finish vs drugstore greasy residue" },
  "best-mens-face-moisturizers-compared": { src: comparisonLineup, alt: "Base Layer vs multi-step regimen product lineup comparison" },
  "cerave-vs-base-layer": { src: comparisonTextures, alt: "Texture comparison: Base Layer matte finish vs generic heavy cream" },
};

const ComparisonDetail = () => {
  const { openModal } = useEarlyAccess();
  const { slug } = useParams<{ slug: string }>();
  const { data: comparison, isLoading, error } = useQuery({
    queryKey: ["comparison", slug],
    queryFn: () => getComparisonBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();

  const comp = comparison as any;
  const title = comp?.metaTitle || (comp ? `${comp.title} | Base Layer` : "Compare | Base Layer");
  const description = comp?.metaDescription || toPlainText(comp?.intro) || "";
  useMetaTags({ title, description });

  useEffect(() => {
    if (comp) {
      trackEvent("view_item", { content_name: comp.title, content_type: "comparison" });
    }
  }, [comp]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {comp && (
        <JsonLd data={[
          buildArticleSchema({
            title: comp.title,
            description,
            slug: comp.slug?.current || slug || "",
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/comparisons" },
            { name: comp.title },
          ]),
          ...(comp.faqs?.length ? [buildFaqSchema(comp.faqs)] : []),
        ]} />
      )}
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10 min-h-[1.25rem]">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/comparisons" className="hover:text-foreground transition-colors">Compare</Link>
            {comp && <><span>/</span><span className="text-foreground truncate max-w-[200px]">{comp.title}</span></>}
          </nav>

          {isLoading && <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-4 w-full" /></div>}
          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load.</p>}
          {!isLoading && !error && !comp && <p className="text-center py-20 font-body text-muted-foreground">Not found.</p>}

          {comp && (
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">{comp.title}</h1>
              <p className="font-body text-sm text-muted-foreground mb-6">
                By <Link to="/about" className="underline hover:text-foreground">The Base Layer Team</Link>
              </p>
              {comp.intro && (
                isPortableText(comp.intro) ? (
                  <PortableText value={comp.intro} className="font-body text-muted-foreground mb-8" />
                ) : (
                  <p className="font-body text-muted-foreground mb-8">{comp.intro}</p>
                )
              )}

              {/* Visual comparison banner */}
              <div className="rounded-lg border border-border overflow-hidden bg-card mb-10 aspect-square">
                <img
                  src={comparisonChart}
                  alt="The Old Way: 5 separate products vs The Base Layer Way: 1 all-in-one solution"
                  className="w-full h-full object-cover"
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Comparison Table — desktop table, mobile cards */}
              {comp.comparisonTable && comp.comparisonTable.length > 0 && (() => {
                const parseBullets = (text: string) =>
                  text.split(/[.\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
                const formatIngredients = (v: any) =>
                  Array.isArray(v) ? v.slice(0, 4).join(", ") : (v || "—");

                return (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto mb-10">
                    <table className="w-full border-collapse text-left font-body text-xs">
                      <thead>
                        <tr className="bg-card border-b border-border">
                          <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wide w-[18%]">Product</th>
                          <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wide w-[8%]">Price</th>
                          <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wide w-[7%] text-center">Rating</th>
                          <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wide w-[30%]">Pros</th>
                          <th className="px-3 py-2.5 font-heading text-[10px] uppercase tracking-wide w-[30%]">Cons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comp.comparisonTable.map((row: any) => {
                          const isBaseLayer = row.productName?.toLowerCase().includes("base layer") || row.brand?.toLowerCase().includes("base layer");
                          return (
                            <tr key={row._key} className={`border-b border-border ${isBaseLayer ? "bg-primary/5" : ""}`}>
                              <td className="px-3 py-3 align-top">
                                <span className="font-heading font-bold text-sm leading-tight block">
                                  {isBaseLayer ? (
                                    <Link to="/face-cream" className="hover:underline underline-offset-4">{row.productName}</Link>
                                  ) : row.productName}
                                </span>
                                {row.brand && <span className="text-muted-foreground text-[10px] block mt-0.5">{row.brand}</span>}
                              </td>
                              <td className="px-3 py-3 align-top font-semibold whitespace-nowrap">{row.price || "—"}</td>
                              <td className="px-3 py-3 align-top text-center">
                                {row.rating ? (
                                  <span className="inline-flex items-center gap-1 font-semibold">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    {row.rating}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="px-3 py-3 align-top">
                                {row.prosText ? (
                                  <ul className="space-y-0.5">
                                    {parseBullets(row.prosText).map((pro: string, j: number) => (
                                      <li key={j} className="flex items-start gap-1">
                                        <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                        <span className="leading-snug">{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : "—"}
                              </td>
                              <td className="px-3 py-3 align-top">
                                {row.consText ? (
                                  <ul className="space-y-0.5">
                                    {parseBullets(row.consText).map((con: string, j: number) => (
                                      <li key={j} className="flex items-start gap-1">
                                        <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                        <span className="leading-snug">{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-4 mb-10">
                    {comp.comparisonTable.map((row: any) => {
                      const isBaseLayer = row.productName?.toLowerCase().includes("base layer") || row.brand?.toLowerCase().includes("base layer");
                      return (
                        <div key={row._key} className={`bg-card p-4 rounded-lg border ${isBaseLayer ? "border-primary/30 ring-1 ring-primary/10" : "border-border"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-heading font-bold text-sm">
                                {isBaseLayer ? <Link to="/face-cream" className="hover:underline">{row.productName}</Link> : row.productName}
                              </h3>
                              {row.brand && <p className="font-body text-[10px] text-muted-foreground">{row.brand}</p>}
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              {row.rating && (
                                <span className="flex items-center gap-1 font-body text-xs font-semibold">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  {row.rating}/10
                                </span>
                              )}
                              {row.price && <p className="font-body text-xs font-semibold mt-0.5">{row.price}</p>}
                            </div>
                          </div>
                          {row.keyIngredients && (
                            <p className="font-body text-[10px] text-muted-foreground mb-2 leading-snug">
                              {formatIngredients(row.keyIngredients)}
                            </p>
                          )}
                          {row.prosText && (
                            <div className="mb-2">
                              {parseBullets(row.prosText).map((pro: string, j: number) => (
                                <p key={j} className="flex items-start gap-1 font-body text-xs mb-0.5">
                                  <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                  <span className="leading-snug">{pro}</span>
                                </p>
                              ))}
                            </div>
                          )}
                          {row.consText && (
                            <div className="mb-2">
                              {parseBullets(row.consText).map((con: string, j: number) => (
                                <p key={j} className="flex items-start gap-1 font-body text-xs mb-0.5">
                                  <X className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                                  <span className="leading-snug">{con}</span>
                                </p>
                              ))}
                            </div>
                          )}
                          {row.bestFor && <p className="font-body text-[10px] text-muted-foreground mt-2">Best for: {row.bestFor}</p>}
                        </div>
                      );
                    })}
                  </div>
                </>
                );
              })()}

              {/* Body content */}
              <PortableText value={comp.body} className="prose prose-invert max-w-none font-body prose-headings:font-heading prose-p:text-foreground/70 prose-li:text-foreground/70 mb-12" />

              {/* Slug-specific comparison visual */}
              {slug && comparisonSlugImages[slug] && (
                <div className="rounded-lg border border-border overflow-hidden bg-card mb-12 aspect-square">
                  <img
                    src={comparisonSlugImages[slug].src}
                    alt={comparisonSlugImages[slug].alt}
                    className="w-full h-full object-cover"
                    width={640}
                    height={640}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}

              {/* Texture comparison evidence */}
              {slug && comparisonSlugImages[slug]?.src !== comparisonTextures && (
                <div className="rounded-lg border border-border overflow-hidden bg-card mb-12 aspect-square">
                  <img
                    src={comparisonTextures}
                    alt="Side-by-side texture comparison: Base Layer lightweight matte vs heavy cream residue"
                    className="w-full h-full object-cover"
                    width={640}
                    height={640}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}

              {/* Verdict */}
              {comp.verdict && (
                <section className="mb-12 bg-card p-6 rounded-lg border border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-4">Our Verdict</h2>
                  <PortableText value={comp.verdict} className="prose prose-invert max-w-none font-body" />
                </section>
              )}

              {/* FAQs */}
              {comp.faqs && comp.faqs.length > 0 && (
                <section className="mt-10 pt-10 border-t border-border">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">FAQs</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {comp.faqs.map((faq: any) => (
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
              trackEvent("cta_click", { source: "comparison_detail" });
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

export default ComparisonDetail;
