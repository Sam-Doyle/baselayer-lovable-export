import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { getIngredients } from "@/lib/queries";
import { type Ingredient } from "@/lib/sanity";
import { trackEvent } from "@/lib/analytics";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, buildItemListSchema, BASE_URL } from "@/components/SEO";
import { toPlainText } from "@/lib/utils";

const Ingredients = () => {
  const { data: ingredients, isLoading, error } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();
  useMetaTags({
    title: "Skincare Ingredients For Men | What Each Ingredient Actually Does",
    description: "Learn about the clinically-proven ingredients in Base Layer face cream: niacinamide, copper peptide, hyaluronic acid, and more.",
    image: "https://baselayerskin.co/og-ingredients.jpg",
  });

  useEffect(() => {
    trackEvent("view_item", { content_name: "Ingredients", content_type: "listing" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[
        buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Ingredients" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Skincare Ingredients For Men",
          description: "Learn about the clinically-proven ingredients in Base Layer face cream: niacinamide, copper peptide, hyaluronic acid, and more.",
          url: "https://baselayerskin.co/ingredients",
        },
        ...(ingredients && ingredients.length > 0
          ? [buildItemListSchema(
              "Skincare Ingredients For Men",
              ingredients.map((ing) => ({
                name: ing.name,
                url: `${BASE_URL}/ingredients/${ing.slug.current}`,
              })),
            )]
          : []),
      ]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-16 text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">
              Ingredients That Earn Their Place
            </h1>
            <p className="font-body text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              If you do not know what an ingredient does in real life, it does not belong on your shelf.
            </p>
          </header>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          )}

          {error && <p className="text-center py-20 font-body text-muted-foreground">Unable to load ingredients.</p>}

          {ingredients && ingredients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ingredients.map((ing) => (
                <Link
                  key={ing._id}
                  to={`/ingredients/${ing.slug.current}`}
                  className="group block bg-card p-0 rounded-lg hover:bg-muted transition-colors border border-border overflow-hidden flex flex-col h-full"
                >
                  {ing.heroImage?.asset?.url ? (
                    <div className="w-full h-48 bg-muted relative overflow-hidden shrink-0 border-b border-border/50">
                      <img
                        src={ing.heroImage.asset.url}
                        alt={ing.heroImage.alt || `${ing.name} microscopic or texture view`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted border-b border-border/50 flex items-center justify-center shrink-0">
                      <span className="font-heading text-4xl text-foreground/10 uppercase font-black">{ing.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-heading text-lg font-bold group-hover:underline underline-offset-4">
                      {ing.name}
                    </h2>
                    {(ing as any).tagline && (
                      <p className="font-body text-xs text-muted-foreground mt-1 italic">{(ing as any).tagline}</p>
                    )}
                    {((ing as any).overview || ing.extractableSummary) && (
                      <p className="font-body text-sm text-muted-foreground mt-3 line-clamp-3">
                        {toPlainText((ing as any).overview) || ing.extractableSummary}
                      </p>
                    )}
                  </div>
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

export default Ingredients;
