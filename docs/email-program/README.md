# Base Layer email measurement and QA

This directory is the operating contract for lifecycle-email measurement and
release safety. Shopify and Supabase remain authoritative for commerce and
consent. Brevo remains the system of engagement. Nothing in this package
changes a live Brevo automation, Shopify Flow, Supabase secret, or Netlify
environment value.

## Package contents

- `email-link-manifest.json` — machine-readable message, destination, UTM, and
  exact-cart restoration contract.
- `current-state-audit.md` — implemented controls, known gaps, and ownership.
- `measurement-contract.md` — attribution rules and the human-readable landing
  link matrix.
- `lifecycle-test-matrix.md` — required scenario coverage and evidence.
- `launch-runbook.md` — ordered gates, rollback, and incident ownership.
- `kpi-dashboard.md` — exact 30/60/90-day metric definitions.

## Automated checks

Validate the manifest and all three checked-in master templates:

```bash
npm run test:email-program
```

Validate a separate set of exported Brevo HTML instead:

```bash
node scripts/verify-email-program.mjs --templates path/to/exported-html
```

The HTML check is intentionally strict. Each file must contain the Base Layer
name, a preheader, the Denver postal address, visible unsubscribe content, a
primary CTA marked with `data-bl-primary-cta`, non-empty image alt text, and
only links listed in the manifest. The exported HTML must remain under 90 KB.

## Change control

1. Change the manifest before changing a Brevo link.
2. Run the verifier.
3. Send the production-format message only to the seed list.
4. Click every link from the delivered message and capture evidence.
5. A second operator reviews the evidence before activation.

Do not import historical contacts into a newly activated automation. Do not
release held audit rows. Do not use customer email addresses for QA.
