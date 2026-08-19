import { describe, expect, it } from "vitest";
import { parseBrevoEmailSendability } from "../../supabase/functions/_shared/brevo-suppression";

describe("Brevo suppression parsing", () => {
  it("allows only an explicit non-blocklisted response", () => {
    expect(parseBrevoEmailSendability({ emailBlacklisted: false })).toBe(true);
    expect(parseBrevoEmailSendability({ emailBlacklisted: true })).toBe(false);
  });

  it.each([
    null,
    {},
    { emailBlacklisted: "false" },
    { emailBlacklisted: 0 },
  ])("fails closed for malformed provider payload %#", (payload) => {
    expect(() => parseBrevoEmailSendability(payload)).toThrow(
      "brevo_contact_suppression_malformed",
    );
  });
});
