import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";
import { LEGAL, GUARANTEE_WINDOW_PHRASE } from "@/config/legal";

/*
 * TERMS OF SERVICE
 *
 * Conventional DTC e-commerce drafting. NOT reviewed by an attorney. The
 * liability cap, warranty disclaimer, and indemnification clauses below have
 * real legal effect and should be read by counsel before you scale spend.
 *
 * DELIBERATELY OMITTED: a binding arbitration clause with class-action waiver.
 * Those are standard in DTC terms and would likely help you, but they are also
 * the clauses most often struck down when drafted loosely — enforceability
 * turns on Federal Arbitration Act mechanics, notice, cost allocation, and an
 * opt-out window, and a defective one is worse than none because it can void
 * the whole dispute-resolution section. What is here instead is governing law,
 * venue, an informal-resolution step, and a small-claims carve-out, all of
 * which are safe to publish unreviewed. Add arbitration with counsel.
 */

const TermsOfService = () => {
  useCanonical();
  useMetaTags({
    title: "Terms of Service | Base Layer",
    description: "The terms that govern your use of baselayerskin.co and your purchase of Base Layer products.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Terms of Service" },
      ])]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Terms of Service</span>
          </nav>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>

          <p className="font-body text-sm text-muted-foreground mb-10">
            Effective date: {LEGAL.effectiveDate}
          </p>

          <div className="space-y-10 font-body text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Acceptance of Terms</h2>
              <p>
                By accessing or using {LEGAL.siteDomain} (the "Site") or purchasing from {LEGAL.entityName} ("Base Layer,"
                "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree, do not use the
                Site or purchase our products.
              </p>
              <p className="mt-3">
                {LEGAL.entityName} operates from {LEGAL.entityState}, United States. You can reach us at{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Eligibility</h2>
              <p>
                You must be at least {LEGAL.minimumAge} years old, or the age of majority where you live, to purchase from
                the Site. By placing an order you represent that you meet this requirement and that the information you
                provide is accurate and complete.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Products &amp; Pricing</h2>
              <p>
                We currently sell one product, the Performance Daily Face Cream (50 mL, SKU BL-PDFC-50ML), at a founding
                price of $38 with a planned retail price of $48. Prices, product availability, and offers are subject to
                change without notice.
              </p>
              <p className="mt-3">
                We try to describe our products and display pricing accurately, but errors happen. If a product is listed at
                an incorrect price or with materially incorrect information, we may cancel the order and issue a full refund,
                whether or not the order has been confirmed.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Cosmetic Product Notice</h2>
              <p>
                Base Layer products are cosmetics, not drugs. They are intended to moisturize and improve the appearance of
                skin. They are not intended to diagnose, treat, cure, or prevent any disease, and these statements have not
                been evaluated by the Food and Drug Administration. Review the ingredient list before use, patch test if you
                have sensitive or reactive skin, and discontinue use if irritation occurs. Consult a physician or
                dermatologist about any skin condition or before use if you are pregnant or nursing.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Orders &amp; Payment</h2>
              <p>
                Checkout is hosted by our e-commerce provider, Shopify. Your order and payment are subject to Shopify's own
                terms and payment-processing safeguards in addition to these Terms. All orders are offers to purchase and are
                subject to our acceptance. We may refuse or cancel any order, including where we suspect fraud or where a
                product is unavailable.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Shipping</h2>
              <p>
                We offer free shipping within the United States. See our{" "}
                <Link to="/shipping-policy" className="text-foreground underline underline-offset-4 hover:no-underline">
                  Shipping Policy
                </Link>{" "}
                for details.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Returns &amp; Refunds</h2>
              <p>
                We offer a {LEGAL.guaranteeDays}-day money-back guarantee, measured {GUARANTEE_WINDOW_PHRASE}. See our{" "}
                <Link to="/refund-policy" className="text-foreground underline underline-offset-4 hover:no-underline">
                  Refund Policy
                </Link>{" "}
                for details.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Intellectual Property</h2>
              <p>
                The Site and everything on it — including text, photography, graphics, logos, product names, and the
                arrangement of all of it — is owned by {LEGAL.entityName} or its licensors and is protected by copyright,
                trademark, and other intellectual property law. "Base Layer" and our logos are our trademarks and may not be
                used without our prior written permission.
              </p>
              <p className="mt-3">
                We grant you a limited, personal, non-exclusive, non-transferable, revocable license to view and use the Site
                for your own non-commercial purposes. You may not copy, reproduce, republish, scrape, or create derivative
                works from Site content without our written permission.
              </p>
              <p className="mt-3">
                If you send us reviews, photos, comments, or other content, you grant us a non-exclusive, worldwide,
                royalty-free, perpetual license to use, reproduce, and display that content in connection with our business,
                and you confirm that you own it and that it does not infringe anyone else's rights.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Acceptable Use</h2>
              <p>
                You agree not to misuse the Site, attempt to gain unauthorized access to it or its related systems, or use
                the Site for any unlawful purpose.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Third-Party Services</h2>
              <p>
                The Site integrates with third-party services, including Shopify (checkout), for the functions described
                above. We are not responsible for the content, terms, or practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Disclaimer of Warranties</h2>
              <p>
                THE SITE AND ALL PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER
                EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL IMPLIED WARRANTIES, INCLUDING THE
                IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-3">
                We do not warrant that the Site will be uninterrupted, secure, or error-free, or that results from using our
                products will meet your expectations. Skin responds differently from person to person, and we make no promise
                of any particular outcome. Some jurisdictions do not allow the exclusion of implied warranties, so some of
                these exclusions may not apply to you. Nothing here limits your rights under the{" "}
                <Link to="/refund-policy" className="text-foreground underline underline-offset-4 hover:no-underline">
                  money-back guarantee
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL {LEGAL.entityName.toUpperCase()}, ITS OWNERS,
                EMPLOYEES, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
                PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THESE
                TERMS, THE SITE, OR ANY PRODUCT, WHETHER BASED IN CONTRACT, TORT, STRICT LIABILITY, OR ANY OTHER THEORY, AND
                WHETHER OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="mt-3">
                OUR TOTAL LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR ANY PRODUCT WILL NOT EXCEED THE AMOUNT YOU
                ACTUALLY PAID FOR THE PRODUCT GIVING RISE TO THE CLAIM.
              </p>
              <p className="mt-3">
                Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law,
                including liability for fraud, personal injury, or death caused by negligence. Some jurisdictions do not
                allow certain limitations, so parts of this section may not apply to you.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless {LEGAL.entityName} and its owners and employees from any claims,
                losses, liabilities, and reasonable legal fees arising out of your misuse of the Site, your violation of
                these Terms, or your violation of any law or third-party right.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Governing Law &amp; Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of the State of {LEGAL.entityState}, without regard to its conflict-of-law
                rules. You and {LEGAL.entityName} agree that the state and federal courts located in {LEGAL.entityState} have
                exclusive jurisdiction over any dispute arising out of or relating to these Terms or any product, and you
                consent to venue in those courts.
              </p>
              <p className="mt-3">
                Before filing anything, please contact us at{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>{" "}
                and give us 30 days to resolve the issue directly. Most problems are a refund away. Either of us may still
                bring an individual claim in small claims court.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Severability &amp; Entire Agreement</h2>
              <p>
                If any provision of these Terms is held unenforceable, that provision will be limited or removed to the
                minimum extent necessary and the remaining provisions will stay in full force. Our failure to enforce any
                provision is not a waiver of it.
              </p>
              <p className="mt-3">
                These Terms, together with our{" "}
                <Link to="/privacy-policy" className="text-foreground underline underline-offset-4 hover:no-underline">Privacy Policy</Link>,{" "}
                <Link to="/refund-policy" className="text-foreground underline underline-offset-4 hover:no-underline">Refund Policy</Link>, and{" "}
                <Link to="/shipping-policy" className="text-foreground underline underline-offset-4 hover:no-underline">Shipping Policy</Link>,
                are the entire agreement between you and {LEGAL.entityName} regarding the Site and your purchase, and replace
                any prior understandings on that subject.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. Material changes will be reflected by an updated effective
                date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Contact Us</h2>
              <p>
                Questions about these Terms can be sent to{" "}
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

export default TermsOfService;
