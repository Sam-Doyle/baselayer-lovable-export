import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getComparisons } from "@/lib/queries";
import { type Comparison } from "@/lib/sanity";
import { trackEvent } from "@/lib/analytics";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildItemListSchema, BASE_URL } from "@/components/SEO";

const Comparisons = () => {
  const { data: comparisons, isLoading, error } = useQuery<Comparison[]>({
    queryKey: ["comparisons"],
    queryFn: getComparisons,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();
  useMetaTags({
    title: "Men's Moisturizer Comparisons | Base Layer vs CeraVe, Kiehl's, Cetaphil",
    description: "See how Base Layer stacks up against Cetaphil, Neutrogena, CeraVe, and Kiehl's in side-by-side comparisons.",
    image: "https://baselayerskin.co/og-comparisons.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", { content_name: "Comparisons", content_type: "listing" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[
        buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Comparisons" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Men's Moisturizer Comparisons",
          description: "See how Base Layer stacks up against Cetaphil, Neutrogena, CeraVe, and Kiehl's in side-by-side comparisons.",
          url: "https://baselayerskin.co/comparisons",
        },
        ...(comparisons && comparisons.length > 0
          ? [buildItemListSchema(
              "Men's Moisturizer Comparisons",
              comparisons.map((c) => ({
                name: c.title,
                url: `${BASE_URL}/comparisons/${c.slug.current}`,
              })),
            )]
          : []),
      ]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-16 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">Compare What You're Actually Buying</h1>
            <p className="font-body text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Price matters. Texture matters. Results matter. Compare moisturizers based on what you care about most.
            </p>
          </header>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
            </div>
          )}
          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load comparisons.</p>}

          {comparisons && comparisons.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map((c) => (
                <Link key={c._id} to={`/comparisons/${c.slug.current}`} className="group block bg-card p-6 rounded-lg hover:bg-muted transition-colors border border-border">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{c.comparisonType}</span>
                  <h2 className="font-heading text-lg font-bold mt-2 group-hover:underline underline-offset-4">{c.title}</h2>
                  {c.extractableSummary && <p className="font-body text-sm text-muted-foreground mt-3 line-clamp-3">{c.extractableSummary}</p>}
                </Link>
              ))}
              <div className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border bg-transparent opacity-60">
                 <span className="font-heading text-lg font-bold uppercase tracking-wide text-center text-muted-foreground">More VS Guides Coming Soon</span>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Comparisons;
