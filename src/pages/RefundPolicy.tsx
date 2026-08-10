import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";
import { LEGAL, GUARANTEE_WINDOW_PHRASE } from "@/config/legal";

/*
 * REFUND POLICY
 *
 * This page has to keep matching the marketing claims made elsewhere on the
 * site, specifically "30-day guarantee" and "Hate it? Keep the bottle. Full
 * refund." (HeroSection, MidPageCTA, OurOriginSection, FaceCream). A refund
 * policy that is stricter than the advertised promise is a deceptive-practice
 * problem under FTC Act Section 5, not just a copy inconsistency. If the
 * guarantee terms change, change them in src/config/legal.ts and in the
 * marketing copy together.
 */

const RefundPolicy = () => {
  useCanonical();
  useMetaTags({
    title: "Refund Policy | Base Layer",
    description: "Our 30-day money-back guarantee. Keep the bottle, get a full refund.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Refund Policy" },
      ])]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Refund Policy</span>
          </nav>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Refund Policy</h1>

          <p className="font-body text-sm text-muted-foreground mb-10">
            Effective date: {LEGAL.effectiveDate}
          </p>

          <div className="space-y-10 font-body text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">{LEGAL.guaranteeDays}-Day Money-Back Guarantee</h2>
              <p>
                Every order of the Performance Daily Face Cream is covered by our {LEGAL.guaranteeDays}-day money-back
                guarantee. Try it for {LEGAL.guaranteeDays} days — if you're not satisfied, we'll issue a full refund. You
                keep the bottle. We don't want it back, and no return shipment is required. No questions asked.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">How to Request a Refund</h2>
              <p>
                To request a refund, email{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>{" "}
                within {GUARANTEE_WINDOW_PHRASE}. Include the email address you used at checkout or your order number so we
                can find the order. You do not need to give a reason.
              </p>
              <p className="mt-3">
                We approve refund requests within {LEGAL.processingDays} of receiving them. Refunds are issued to your
                original payment method. Once we issue the refund, it typically takes {LEGAL.refundProcessingDays} for your
                bank or card issuer to post it to your account — that part is outside our control.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Return Shipping</h2>
              <p>
                No return shipment is required to receive your refund. There is nothing to send back and no return
                shipping cost to you.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Guarantee Terms</h2>
              <p>
                The guarantee covers one refunded order per customer or household. It is intended for people trying Base
                Layer for the first time and deciding it isn't for them, not as a way to receive repeat free product. We may
                decline requests where there is evidence of abuse, such as repeated orders and refunds to the same person,
                household, or payment method.
              </p>
              <p className="mt-3">
                On multi-bottle orders, the guarantee covers the full order value. If you later purchase on a subscription,
                the guarantee applies to your first subscription order; you can cancel a subscription at any time before the
                next renewal, and cancellation stops future charges rather than refunding past ones.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Exchanges</h2>
              <p>
                We currently sell a single product, so there is nothing to exchange it for. If your order arrives damaged,
                defective, or incorrect, email us and we'll send a replacement at no cost — that is separate from the
                money-back guarantee and doesn't use it up.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Requests Outside the {LEGAL.guaranteeDays}-Day Window</h2>
              <p>
                Requests made after {GUARANTEE_WINDOW_PHRASE} fall outside the guarantee, but we'd still rather hear from
                you than not. Email us and we'll review it case by case. Damaged, defective, or incorrect orders are always
                worth reporting regardless of how much time has passed.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Contact Us</h2>
              <p>
                Questions about this Refund Policy can be sent to{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
