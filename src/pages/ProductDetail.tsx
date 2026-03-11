import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductByHandle } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema, BASE_URL } from "@/components/SEO";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const { openModal } = useEarlyAccess();

  useCanonical();
  useMetaTags({
    title: product ? `${product.title} | Base Layer` : "Product | Base Layer",
    description: product?.description || "Base Layer men's skincare product.",
    type: "product",
  });

  useEffect(() => {
    if (!handle) return;
    fetchProductByHandle(handle).then(p => { setProduct(p); setLoading(false); }).catch(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center"><p className="text-muted-foreground">Product not found.</p></div>
      </main>
    );
  }

  const variant = product.variants.edges[selectedVariantIdx]?.node;
  const images = product.images.edges;

  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images[0]?.node?.url,
    url: `${BASE_URL}/products/${handle}`,
    brand: { "@type": "Brand", name: "Base Layer" },
    offers: variant ? {
      "@type": "Offer",
      price: parseFloat(variant.price.amount || "0").toFixed(2),
      priceCurrency: variant.price.currencyCode || "USD",
      availability: "https://schema.org/PreOrder",
      url: `${BASE_URL}/products/${handle}`,
    } : undefined,
  } : null;

  return (
    <main className="min-h-screen bg-background">
      {product && (
        <JsonLd data={[
          productSchema!,
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: product.title },
          ]),
        ]} />
      )}
      <Navbar />
      <div className="pt-20 pb-16 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mt-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              {images[selectedImage]?.node && (
                <img src={images[selectedImage].node.url} alt={images[selectedImage].node.altText || product.title} className="w-full h-full object-cover" />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 ${selectedImage === idx ? 'border-foreground' : 'border-border'}`}>
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <h1 className="font-heading text-3xl md:text-4xl font-black uppercase tracking-tight">{product.title}</h1>
            <p className="font-body text-2xl font-semibold">${parseFloat(variant?.price.amount || '0').toFixed(2)} {variant?.price.currencyCode}</p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Variant selector */}
            {product.variants.edges.length > 1 && (
              <div className="space-y-2">
                {product.options.map((option: any) => (
                  <div key={option.name}>
                    <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">{option.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.edges.map((v: any, idx: number) => {
                        const optVal = v.node.selectedOptions.find((o: any) => o.name === option.name)?.value;
                        return (
                          <button
                            key={v.node.id}
                            onClick={() => setSelectedVariantIdx(idx)}
                            className={`px-4 py-2 text-xs border rounded font-body uppercase tracking-wide transition-colors ${selectedVariantIdx === idx ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
                          >
                            {optVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="font-body text-xs text-muted-foreground mb-2">Pre-launch pricing — $38.</p>
            <p className="font-body text-[11px] text-muted-foreground/60 mb-4 uppercase tracking-wider">Pre-launch — shipping Spring 2026</p>
            <Button
              variant="hero"
              size="lg"
              className="w-full py-6 text-sm"
              onClick={() => openModal("product_detail")}
            >
              GET EARLY ACCESS — $38
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default ProductDetail;
