import { Button } from "@/components/ui/button";
import { useEarlyAccess } from "@/context/EarlyAccessContext";

const FinalCTASection = () => {
  const { openModal } = useEarlyAccess();

  return (
    <section id="final-cta" className="py-16 md:py-24 px-5 md:px-8 bg-secondary">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-heading text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase leading-[0.95] mb-4">
          BETTER SKIN IN 15 SECONDS A DAY.
        </h2>
        <p className="font-body text-[15px] text-muted-foreground leading-relaxed mb-6">
          Reserve your first bottle at the $38 prelaunch price.
        </p>
        <Button
          variant="hero"
          size="lg"
          className="w-full sm:w-auto px-12 py-5 text-xs"
          onClick={() => openModal("final_cta")}
        >
          RESERVE MY BOTTLE &mdash; $38
        </Button>
        <p className="font-body text-xs text-muted-foreground mt-4 uppercase tracking-wider">
          Free shipping &middot; free returns &middot; 30-day guarantee
        </p>
      </div>
    </section>
  );
};

export default FinalCTASection;
