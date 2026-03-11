import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";
import productShot from "@/assets/product-hero-rock.png";
import productShot480w from "@/assets/product-hero-rock-480w.webp";
import productShot768w from "@/assets/product-hero-rock-768w.webp";
import productShot1200w from "@/assets/product-hero-rock-1200w.webp";

const offerBullets = [
  "6 to 8 weeks per bottle",
  "Free shipping",
  "Free returns",
  "No subscription",
  "30-day money-back guarantee",
];

const GuaranteeSection = () => {
  const { openModal } = useEarlyAccess();

  return (
    <section id="guarantee" className="grid lg:grid-cols-2 bg-secondary">
      <div className="flex flex-col justify-center px-5 md:px-12 lg:px-16 xl:px-24 py-16 lg:py-24 order-2 lg:order-1">
        <div className="max-w-md">
          <p className="font-body text-[11px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
            Simple offer
          </p>
          <h2 className="font-heading text-[1.75rem] md:text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase leading-[0.95] mb-8">
            ONE BOTTLE. $38.<br />NO DOWNSIDE.
          </h2>

          <div className="space-y-3 mb-8">
            {offerBullets.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                <p className="font-body text-[15px] text-muted-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-border bg-background/50 p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-foreground" />
              <span className="font-heading text-sm font-bold text-foreground uppercase tracking-wider">
                30-Day Guarantee
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
              Use it for 30 days. If your skin doesn't look better and feel
              better, email us and we'll refund you.
            </p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              No return shipping. No hassle.
            </p>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full sm:w-auto px-10 py-5 text-xs"
            onClick={() => openModal("guarantee")}
          >
            RESERVE MY BOTTLE &mdash; $38
          </Button>
        </div>
      </div>

      <div className="relative h-[35vh] lg:h-full order-1 lg:order-2">
        <picture>
          <source
            type="image/webp"
            srcSet={`${productShot480w} 480w, ${productShot768w} 768w, ${productShot1200w} 1200w`}
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
          <img
            src={productShot}
            alt="Base Layer Performance Daily Face Cream bottle"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
      </div>
    </section>
  );
};

export default GuaranteeSection;
