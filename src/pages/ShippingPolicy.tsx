import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";
import { LEGAL } from "@/config/legal";

/*
 * SHIPPING POLICY
 *
 * The processing and delivery windows come from src/config/legal.ts and are set
 * to Shopify's standard defaults. They are representations to the customer, not
 * marketing copy: under the FTC Mail, Internet, or Telephone Order Merchandise
 * Rule (16 CFR Part 435) you must ship within the stated window, or within 30
 * days if you state none, or else notify the buyer and offer a refund. Confirm
 * these against actual fulfilment before running paid traffic.
 *
 * No carrier is named on purpose. Naming one you don't always use is a false
 * statement, and the customer gets the carrier from the tracking email anyway.
 *
 * The shipping charges below mirror rules that live in Shopify admin (the
 * shipping profile rate plus the two automatic free-shipping discounts), not
 * anything this codebase enforces. Checkout is the authority; this page is a
 * representation of it. If the admin rules change, change LEGAL's shipping
 * fields in the same pass.
 */

const ShippingPolicy = () => {
  useCanonical();
  useMetaTags({
    title: "Shipping Policy | Base Layer",
    description: `Free US shipping over $${LEGAL.freeShippingThreshold} or on any subscription, order processing times, tracking, and how we handle lost or damaged packages.`,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Shipping Policy" },
      ])]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Shipping Policy</span>
          </nav>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Shipping Policy</h1>

          <p className="font-body text-sm text-muted-foreground mb-10">
            Effective date: {LEGAL.effectiveDate}
          </p>

          <div className="space-y-10 font-body text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Shipping Costs</h2>
              <p>
                Standard shipping is free on orders of ${LEGAL.freeShippingThreshold} or more, and free on every
                Subscribe &amp; Save order regardless of order value. Orders below ${LEGAL.freeShippingThreshold} that
                are not subscriptions are charged a flat ${LEGAL.flatShippingRate.toFixed(2)} for standard shipping.
                The exact amount is shown at checkout before you pay.
              </p>
              <p className="mt-3">
                We currently ship to addresses within the United States, including Alaska and Hawaii. We do not ship to PO
                boxes, APO/FPO addresses, or US territories at this time. We're working on expanding where we ship — if we
                don't reach you yet, email us and we'll let you know when we do.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Order Processing Time</h2>
              <p>
                Orders are processed and handed to the carrier within {LEGAL.processingDays} of being placed. Orders placed
                on weekends or holidays are processed the next business day. If something delays your order beyond this
                window, we'll email you and you can wait or cancel for a full refund.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Delivery Times</h2>
              <p>
                Once shipped, standard delivery within the continental United States typically takes{" "}
                {LEGAL.deliveryWindow}. Alaska and Hawaii can take longer. These are carrier estimates, not guarantees —
                weather, holiday volume, and carrier delays can push a delivery past the estimate.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Order Tracking</h2>
              <p>
                You'll get an email with a tracking number as soon as your order ships. If you haven't received that email
                within {LEGAL.processingDays} of ordering, check your spam folder first, then email us at{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>{" "}
                and we'll track it down.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">International Orders &amp; Customs</h2>
              <p>
                We do not currently ship outside the United States. If we begin accepting international orders, this page
                will be updated with the countries we serve and with who is responsible for any customs duties, import
                taxes, or brokerage fees.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Incorrect Addresses</h2>
              <p>
                Please double-check your shipping address at checkout. If a package is returned to us because the address
                was incorrect or incomplete, we'll reship it once at no cost to you. If you catch the mistake before the
                order ships, email us right away and we'll correct it.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Lost, Delayed, or Damaged Packages</h2>
              <p>
                If tracking shows no movement for seven business days, or your package arrives damaged, email{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>{" "}
                with your order number and, for damage, a photo. We'll send a replacement or issue a full refund. We handle
                the carrier claim ourselves — that isn't your problem to chase.
              </p>
              <p className="mt-3">
                If tracking shows a package was delivered but you can't find it, check with neighbors and your building
                first, then contact us within seven days of the delivery scan and we'll work it out with you.
              </p>
              <p className="mt-3">
                None of this affects your{" "}
                <Link to="/refund-policy" className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.guaranteeDays}-day money-back guarantee
                </Link>, which is separate and always available.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Contact Us</h2>
              <p>
                Questions about shipping can be sent to{" "}
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

export default ShippingPolicy;
