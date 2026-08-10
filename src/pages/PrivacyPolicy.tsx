import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";
import { LEGAL } from "@/config/legal";

/*
 * PRIVACY POLICY
 *
 * The cookie table and sub-processor list below describe what the Site actually
 * loads — GA4 via gtag, the Meta Pixel via fbq, the first-party bl_session
 * cookie, and Shopify's hosted checkout. If a tag is added or removed, update
 * this page in the same change, or the disclosure stops being accurate.
 *
 * KNOWN GAP: there is no cookie-consent banner anywhere on the Site, and GA4,
 * the Meta Pixel, and bl_session all fire unconditionally on first paint. That
 * is a live compliance exposure for EU/UK/EEA visitors under ePrivacy and GDPR,
 * and for the opt-out-of-sharing right under CPRA and similar state laws. This
 * page discloses the tags honestly and gives opt-out routes, but disclosure is
 * not the same as consent. A consent gate is still owed if you run paid traffic
 * into those regions. Flagged deliberately rather than papered over.
 */

const PrivacyPolicy = () => {
  useCanonical();
  useMetaTags({
    title: "Privacy Policy | Base Layer",
    description: "How Base Layer collects, uses, and protects your personal information.",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={[buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Privacy Policy" },
      ])]} />
      <Navbar />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-10">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Privacy Policy</span>
          </nav>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>

          <p className="font-body text-sm text-muted-foreground mb-10">
            Effective date: {LEGAL.effectiveDate}
          </p>

          <div className="space-y-10 font-body text-muted-foreground leading-relaxed">
            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Who We Are</h2>
              <p>
                This Privacy Policy explains how {LEGAL.entityName} ("Base Layer," "we," "us," or "our") collects, uses, and
                shares information when you visit {LEGAL.siteDomain} (the "Site") or purchase our products.
              </p>
              <p className="mt-3">
                {LEGAL.entityName} operates from {LEGAL.entityState}, United States, and is the party responsible for the
                information described in this policy. You can reach us at any time at{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Information We Collect</h2>
              <p>
                <strong className="text-foreground">Order information.</strong> Checkout is processed by Shopify. When you
                place an order, Shopify collects the information needed to fulfill it, such as your name, email, shipping
                address, and payment details. Payment card numbers are handled by Shopify and its payment processors and are
                never stored on our servers.
              </p>
              <p className="mt-3">
                <strong className="text-foreground">Contact and waitlist information.</strong> If you join our early-access
                waitlist, sign up for updates, or otherwise submit an email address on the Site, we store that information
                using Supabase, our backend data platform.
              </p>
              <p className="mt-3">
                <strong className="text-foreground">Automatically collected information.</strong> We use Google Analytics 4
                and the Meta (Facebook/Instagram) advertising pixel to understand how visitors use the Site and to measure
                the performance of our advertising. This includes pages viewed, links and buttons clicked, approximate
                location derived from IP address, device and browser type, and referring source. We also send certain
                purchase and add-to-cart events to Meta server-side through the Meta Conversions API.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Cookies &amp; Tracking Technologies</h2>
              <p>
                The Site sets the following cookies and similar technologies. Durations are the values set by each provider
                and may change if a provider updates its defaults.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Cookie</th>
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Set by</th>
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Purpose</th>
                      <th className="py-2 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">bl_session</code></td>
                      <td className="py-2 pr-4">Base Layer (first-party)</td>
                      <td className="py-2 pr-4">Recognizes repeat visits and attributes conversions to the visit that produced them.</td>
                      <td className="py-2">30 days</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">_ga</code>, <code className="text-foreground">_ga_*</code></td>
                      <td className="py-2 pr-4">Google Analytics 4</td>
                      <td className="py-2 pr-4">Distinguishes visitors and retains session state for analytics reporting.</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">_fbp</code></td>
                      <td className="py-2 pr-4">Meta</td>
                      <td className="py-2 pr-4">Identifies browsers for advertising delivery and conversion measurement.</td>
                      <td className="py-2">90 days</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">_fbc</code></td>
                      <td className="py-2 pr-4">Meta</td>
                      <td className="py-2 pr-4">Stores the ad click identifier when you arrive from a Meta ad.</td>
                      <td className="py-2">90 days</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Checkout cookies</td>
                      <td className="py-2 pr-4">Shopify</td>
                      <td className="py-2 pr-4">Maintain your cart and secure the checkout session. Set on Shopify's checkout domain.</td>
                      <td className="py-2">Session to 2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                You can block or delete cookies through your browser settings. You can opt out of Google Analytics using
                Google's browser add-on, and you can adjust how Meta uses your data for advertising in your Meta account ad
                preferences. Blocking cookies may affect how parts of the Site function.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">How We Use Information</h2>
              <p>
                We use the information above to process and fulfill orders, respond to customer service inquiries, operate
                and improve the Site, and measure and personalize our marketing and advertising.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">How We Share Information</h2>
              <p>
                We do not sell your personal information for money. We share it with the service providers who help us run
                the Site and our business:
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-5">
                <li><strong className="text-foreground">Shopify</strong> — checkout, payment processing, and order fulfillment.</li>
                <li><strong className="text-foreground">Supabase</strong> — backend storage for waitlist and contact submissions.</li>
                <li><strong className="text-foreground">Netlify</strong> — website hosting and delivery.</li>
                <li><strong className="text-foreground">Google</strong> — analytics and measurement.</li>
                <li><strong className="text-foreground">Meta</strong> — advertising delivery and conversion measurement, including server-side events.</li>
                <li><strong className="text-foreground">Sanity</strong> — content management for articles and product education pages.</li>
              </ul>
              <p className="mt-3">
                Sharing information with Meta and Google for advertising measurement may be treated as "sharing" for
                cross-context behavioral advertising under certain state privacy laws. See Your Privacy Rights below for how
                to opt out. We may also disclose information where required by law or to protect our legal rights.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Data Retention</h2>
              <p>
                We keep order records for as long as needed to fulfill the order and meet tax, accounting, and legal
                obligations, which is generally seven years. Waitlist and marketing email addresses are kept until you
                unsubscribe or ask us to delete them. Analytics data is retained according to each provider's settings,
                which is up to 14 months for Google Analytics and up to 90 days for Meta's event-level data. When a
                retention period ends, we delete or anonymize the information.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Your Privacy Rights</h2>
              <p>
                Depending on where you live, you may have the right to request access to the personal information we hold
                about you, request that we correct it, request that we delete it, opt out of the sale or sharing of your
                personal information for targeted advertising, and receive a copy of it in a portable format. You have the
                right not to be discriminated against for exercising any of these rights.
              </p>
              <p className="mt-3">
                If you are in the European Economic Area or the United Kingdom, you may also have the right to object to or
                restrict certain processing, to withdraw consent where we rely on it, and to lodge a complaint with your
                local supervisory authority.
              </p>
              <p className="mt-3">
                To exercise any of these rights, email{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>{" "}
                with the request and the email address you used with us. We will respond within the timeframe required by
                applicable law, generally 45 days. We may need to verify your identity before acting on a request. An
                authorized agent may submit a request on your behalf with proof of authorization.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Children's Privacy</h2>
              <p>
                The Site is intended for adults and is not directed to children. We do not knowingly collect personal
                information from anyone under {LEGAL.minimumAge}. If you believe a child has provided us personal
                information, contact us at{" "}
                <a href={`mailto:${LEGAL.contactEmail}`} className="text-foreground underline underline-offset-4 hover:no-underline">
                  {LEGAL.contactEmail}
                </a>{" "}
                and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">International Data Transfers</h2>
              <p>
                We operate in the United States, and the service providers listed above process information in the United
                States and other countries. If you access the Site from outside the United States, you understand that your
                information will be transferred to and processed in the United States, where data protection law may differ
                from the law in your country.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Security</h2>
              <p>
                The Site is served over HTTPS, and all traffic between your browser and our hosting and checkout providers
                is encrypted in transit. Payment card details are collected and processed by Shopify on its own PCI-DSS
                compliant infrastructure and never reach our servers. Access to the systems holding customer data is
                restricted to the people who need it to operate the business. No method of transmission or storage is
                completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Material changes will be reflected by an updated
                effective date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Contact Us</h2>
              <p>
                Questions about this Privacy Policy can be sent to{" "}
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

export default PrivacyPolicy;
