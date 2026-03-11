import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getSkinConcerns } from "@/lib/queries";
import { type SkinConcern } from "@/lib/sanity";
import { trackEvent } from "@/lib/analytics";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildItemListSchema, BASE_URL } from "@/components/SEO";
import { toPlainText } from "@/lib/utils";

const SkinConcerns = () => {
  const { data: concerns, isLoading, error } = useQuery<SkinConcern[]>({
    queryKey: ["skin-concerns"],
    queryFn: getSkinConcerns,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();
  useMetaTags({
    title: "Men's Skin Concerns | Oil, Redness, Breakouts, Dryness, Dark Circles",
    description: "Targeted skincare advice for men dealing with oily skin, dryness, acne, aging, and post-shave irritation. Find your solution.",
    image: "https://baselayerskin.co/og-skin-concerns.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", { content_name: "Skin Concerns", content_type: "listing" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[
        buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Skin Concerns" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Men's Skin Concerns",
          description: "Targeted skincare advice for men dealing with oily skin, dryness, acne, aging, and post-shave irritation. Find your solution.",
          url: "https://baselayerskin.co/skin-concerns",
        },
        ...(concerns && concerns.length > 0
          ? [buildItemListSchema(
              "Men's Skin Concerns",
              concerns.map((c) => ({
                name: (c as any).name || c.title,
                url: `${BASE_URL}/skin-concerns/${c.slug.current}`,
              })),
            )]
          : []),
      ]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-16 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">Start With The Problem You Notice First</h1>
            <p className="font-body text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Most guys do not need more products. They need the right answer to the skin issue that is bothering them now.
            </p>
          </header>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
            </div>
          )}
          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load skin concerns.</p>}

          {concerns && concerns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {concerns.map((c) => (
                <Link key={c._id} to={`/skin-concerns/${c.slug.current}`} className="group block bg-card p-6 rounded-lg hover:bg-muted transition-colors border border-border">
                  <h2 className="font-heading text-lg font-bold group-hover:underline underline-offset-4">{(c as any).name || c.title}</h2>
                  {(c as any).tagline && <p className="font-body text-xs text-muted-foreground mt-1 italic">{(c as any).tagline}</p>}
                  {((c as any).overview || c.extractableSummary) && <p className="font-body text-sm text-muted-foreground mt-3 line-clamp-3">{toPlainText((c as any).overview) || c.extractableSummary}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SkinConcerns;
