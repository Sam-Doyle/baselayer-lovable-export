import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useMetaTags, JsonLd, organizationSchema, buildBreadcrumbSchema } from "@/components/SEO";
import { getArticles } from "@/lib/queries";
import { type Article } from "@/lib/sanity";
import { trackEvent } from "@/lib/analytics";
import { format } from "date-fns";
import founderMountain from "@/assets/generated-creatives/asset_founder_mountain_1772750599903.png";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sam",
  jobTitle: "Founder, Base Layer Skin",
  description: "Founder of Base Layer. Former professional skier. Builds evidence-based skincare for men.",
  url: "https://baselayerskin.co/about",
  worksFor: { "@type": "Organization", name: "Base Layer" },
};

const About = () => {
  const { data: articles } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: getArticles,
    staleTime: 5 * 60 * 1000,
  });

  useCanonical();
  useMetaTags({
    title: "About Base Layer | Men's Skincare Built Around Performance",
    description: "Base Layer: men's skincare engineered in Breckenridge, Colorado. One product, six active ingredients, zero complexity. Learn our story.",
  });

  useEffect(() => {
    trackEvent("view_item", { content_name: "About", content_type: "page" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[organizationSchema, personSchema, buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "About" },
      ])]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">About</span>
          </nav>

          <div className="aspect-[16/9] overflow-hidden rounded-lg bg-muted mb-10">
            <img src={founderMountain} alt="Base Layer founder in the Colorado mountains" className="w-full h-full object-cover" width={1200} height={675} decoding="async" loading="eager" />
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">Why Base Layer Exists</h1>

          <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">Base Layer started with a simple problem: most moisturizers either felt greasy, did nothing, or demanded a full routine to earn their keep.</strong>
            </p>
            <p>
              I lived in Breckenridge, Colorado — 9,600 feet, UV 60% stronger than sea level, humidity around 15%. After a day of skiing, my skin was cracked and raw. I'd put on whatever moisturizer was available. The ones that actually hydrated left my face greasy under my goggles. The lightweight ones didn't do anything noticeable. And nothing on the shelf seemed to account for the fact that men's skin is different — thicker, oilier, constantly irritated by shaving.
            </p>
            <p>
              That's what made the problem obvious. At altitude, with dry air and intense UV, you find out fast whether a product actually works or just feels like it does. Most didn't survive a morning.
            </p>
            <p>
              So I started reading the research — not marketing copy, the actual dermatology studies. Men's skin is about 25% thicker than women's, produces significantly more sebum, and takes daily damage from shaving. But almost nothing on the market is formulated for that biology. It's either a women's formula in a darker bottle, or a basic moisturizer with nothing active in it.
            </p>
            <p>
              Base Layer is the result: six active ingredients at the concentrations where clinical studies showed measurable results. Niacinamide at 5% to control oil. Copper peptide at 1% to rebuild collagen. Squalane that absorbs in seconds. No fragrance — because fragrance is the number one cause of skincare irritation and does nothing functional.
            </p>
            <p>
              What the brand refuses to do: add fragrance for marketing appeal, dilute actives to cut costs, create unnecessary products to upsell, or lock anyone into a subscription. One product. It either works for you or you get your money back.
            </p>
            <p className="text-foreground font-medium italic">
              I built this for men who want their skin to look better without turning it into a project.
            </p>
          </div>

          <div className="mt-12 p-6 bg-card rounded-lg border border-border">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3">Sam</h2>
            <p className="font-body text-sm text-muted-foreground mb-1">Founder</p>
            <p className="font-body text-sm text-muted-foreground">
              Based in Breckenridge, Colorado. Built Base Layer because he couldn't find a moisturizer that absorbed fast, controlled oil, and didn't require three other products to work.
            </p>
          </div>

          {/* Formulation Philosophy */}
          <section className="mt-16 pt-10 border-t border-border">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Formulation Philosophy</h2>
            <div className="space-y-5 font-body text-muted-foreground leading-relaxed">
              <p>
                Every ingredient in Base Layer is chosen for one reason: peer-reviewed clinical evidence that it works at the concentration we use. We don't add ingredients for label appeal or marketing narratives.
              </p>
              <p>
                Our formulation process starts with the dermatological literature. We identify the active compounds with the strongest evidence for men's specific skin concerns — oil control, barrier repair, collagen support, hydration — then build a stable delivery system around them at clinically effective doses.
              </p>
              <p>
                The result is a single product that replaces a multi-step routine without compromising on any individual function. Fewer products, fewer irritants, better outcomes.
              </p>
            </div>
          </section>

          {/* Ingredient Sourcing */}
          <section className="mt-12">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Ingredient Sourcing</h2>
            <div className="space-y-5 font-body text-muted-foreground leading-relaxed">
              <p>
                We source pharmaceutical-grade raw materials and validate purity before formulation. Each active — from our GHK-Cu copper peptide to plant-derived squalane — is selected for bioavailability and stability, not just marketing claims.
              </p>
              <p>
                Base Layer is manufactured in the United States under GMP (Good Manufacturing Practice) standards. Every batch is tested for consistency, potency, and microbiological safety before it ships.
              </p>
            </div>
          </section>

          {/* Trust Signals */}
          <section className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-foreground">Fragrance-Free</p>
                <p className="font-body text-[11px] text-muted-foreground mt-1">Zero synthetic fragrance</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-foreground">Dermatologist-Friendly</p>
                <p className="font-body text-[11px] text-muted-foreground mt-1">Formulated for sensitive skin</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-foreground">Made in USA</p>
                <p className="font-body text-[11px] text-muted-foreground mt-1">GMP-certified facilities</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border text-center">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-foreground">Clinical Doses</p>
                <p className="font-body text-[11px] text-muted-foreground mt-1">Evidence-backed concentrations</p>
              </div>
            </div>
          </section>

          {/* Articles by author */}
          {articles && articles.length > 0 && (
            <section className="mt-16 pt-10 border-t border-border">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-6">Articles</h2>
              <div className="space-y-4">
                {articles.map((a) => (
                  <Link key={a._id} to={`/articles/${a.slug.current}`} className="block group">
                    <h3 className="font-heading font-bold group-hover:underline underline-offset-4">{a.title}</h3>
                    <div className="flex items-center gap-3 font-body text-xs text-muted-foreground mt-1">
                      {(a as any).publishDate && <span>{format(new Date((a as any).publishDate), "MMM d, yyyy")}</span>}
                      {a.author?.name && <span>By {a.author.name}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
