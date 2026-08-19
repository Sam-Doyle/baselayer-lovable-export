export function parseBrevoEmailSendability(payload: unknown): boolean {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("brevo_contact_suppression_malformed");
  }
  const emailBlacklisted = (payload as { emailBlacklisted?: unknown }).emailBlacklisted;
  if (typeof emailBlacklisted !== "boolean") {
    throw new Error("brevo_contact_suppression_malformed");
  }
  return emailBlacklisted === false;
}
