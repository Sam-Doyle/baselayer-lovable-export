import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useMetaTags, JsonLd, buildBreadcrumbSchema } from "@/components/SEO";
import { LEGAL } from "@/config/legal";

/*
 * PRIVACY POLICY
 *
 * The cookie table and sub-processor list below describe what the Site actually
 * loads — GA4 via gtag, the Meta Pixel via fbq, Brevo's subscriber lifecycle
 * tracker, the first-party bl_session cookie, and Shopify's hosted checkout. If a tag is added or removed, update
 * this page AND src/lib/consent.ts's CONSENT_VERSION in the same change (bumping
 * the version re-shows the banner so returning visitors make a fresh, informed
 * choice), or the disclosure stops being accurate.
 *
 * CONSENT MECHANISM (see src/components/CookieConsentBanner.tsx and
 * src/lib/consent.ts): the model is region-dependent, and the copy below
 * has to keep saying so.
 *
 * In opt-in regions — the EEA, the UK and Switzerland, detected by timezone
 * in requiresOptIn() — GA4, the Meta Pixel, Meta CAPI, the Brevo lifecycle
 * tracker and the bl_session
 * cookie are off until the visitor clicks Accept on the banner. Everywhere
 * else, which is effectively all of this store's traffic, the model is
 * notice plus opt-out: those tags run by default and the footer's "Cookie
 * Preferences" link opens the same banner so Reject is always one click
 * away. An explicit Reject is honored identically in both regions.
 *
 * Shopify's checkout cookies are unaffected either way — they're strictly
 * necessary to place an order and aren't gated. The choice is stored in
 * localStorage.
 *
 * If a tag is added, this file, the table below, and CONSENT_VERSION all
 * move together. Nothing here may claim a stricter default than
 * hasAnalyticsConsent() actually enforces.
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
                waitlist, sign up for updates, complete a skin-concern quiz, or otherwise submit an email address on the
                Site, we store that information using Supabase, our backend data platform, and send it to Brevo to deliver
                the emails you requested.
              </p>
              <p className="mt-3">
                <strong className="text-foreground">Automatically collected information.</strong> Unless you turn it off
                (see Cookies &amp; Tracking Technologies below), we use Google Analytics 4 and the Meta
                (Facebook/Instagram) advertising pixel to understand how visitors use the Site and to measure the
                performance of our advertising. This includes pages viewed, links and buttons clicked, approximate
                location derived from IP address, device and browser type, and referring source. We also send certain
                purchase and add-to-cart events to Meta server-side through the Meta Conversions API. Turning tracking
                off stops all of it, browser-side and server-side alike.
              </p>
              <p className="mt-3">
                <strong className="text-foreground">Email lifecycle information.</strong> After you submit a marketing
                opt-in and allow optional cookies, Brevo can associate your product views and current shopping-cart
                contents with your email contact so we can send relevant welcome, cart-recovery, and replenishment
                messages. Cart events do not contain your email address; Brevo associates them using its visitor cookie.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide mb-3 text-foreground">Cookies &amp; Tracking Technologies</h2>
              <p>
                What runs before you choose depends on where you are. If you're visiting from the European Economic
                Area, the United Kingdom or Switzerland, a banner asks you to Accept or Reject on your first visit, and
                nothing in the table below marked "Yes" is set until you Accept. Everywhere else, including the United
                States, those cookies are set from your first visit and you can switch them off at any time using
                "Cookie Preferences" in the footer, which opens the same banner.
              </p>
              <p className="mt-3">
                Reject works identically wherever you are: choose it and GA4, the Meta Pixel, Meta CAPI, the Brevo
                lifecycle tracker and the
                bl_session cookie all stop, leaving only the cookies marked "Required" below. Accept and Reject are one
                click each, and neither is preselected or visually favored over the other. Your choice is stored on your
                device and you can change it as often as you like. Durations below are the values set by each provider
                and may change if a provider updates its defaults.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Cookie</th>
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Set by</th>
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Purpose</th>
                      <th className="py-2 pr-4 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Duration</th>
                      <th className="py-2 font-heading text-xs uppercase tracking-wide text-foreground font-bold">Can you turn it off?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">bl_session</code></td>
                      <td className="py-2 pr-4">Base Layer (first-party)</td>
                      <td className="py-2 pr-4">Recognizes repeat visits and attributes conversions to the visit that produced them.</td>
                      <td className="py-2 pr-4">30 days</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">_ga</code>, <code className="text-foreground">_ga_*</code></td>
                      <td className="py-2 pr-4">Google Analytics 4</td>
                      <td className="py-2 pr-4">Distinguishes visitors and retains session state for analytics reporting.</td>
                      <td className="py-2 pr-4">2 years</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">_fbp</code></td>
                      <td className="py-2 pr-4">Meta</td>
                      <td className="py-2 pr-4">Identifies browsers for advertising delivery and conversion measurement.</td>
                      <td className="py-2 pr-4">90 days</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">_fbc</code></td>
                      <td className="py-2 pr-4">Meta</td>
                      <td className="py-2 pr-4">Stores the ad click identifier when you arrive from a Meta ad.</td>
                      <td className="py-2 pr-4">90 days</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4"><code className="text-foreground">visitor_id</code></td>
                      <td className="py-2 pr-4">Brevo</td>
                      <td className="py-2 pr-4">Associates an opted-in subscriber with product and cart activity used for email follow-up.</td>
                      <td className="py-2 pr-4">Provider-controlled</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Checkout cookies</td>
                      <td className="py-2 pr-4">Shopify</td>
                      <td className="py-2 pr-4">Maintain your cart and secure the checkout session. Set on Shopify's checkout domain.</td>
                      <td className="py-2 pr-4">Session to 2 years</td>
                      <td className="py-2">No — required</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                You can change your Accept/Reject choice at any time using "Cookie Preferences" in the site footer. You
                can also block or delete cookies through your browser settings, opt out of Google Analytics using Google's
                browser add-on, and adjust how Meta uses your data for advertising in your Meta account ad preferences.
                Blocking cookies may affect how parts of the Site function.
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
                <li><strong className="text-foreground">Brevo</strong> — email list management, marketing email delivery, and opted-in subscriber lifecycle automation.</li>
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
                local supervisory authority. You can withdraw or change your cookie consent at any time using "Cookie
                Preferences" in the site footer — see Cookies &amp; Tracking Technologies above.
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
