export interface CommerceSignalJob {
  id: string;
  email: string;
  payload: Record<string, unknown>;
  attempts: number;
}

export interface CommerceSignalJobDependencies {
  contactIsSendable(email: string): Promise<boolean>;
  jobIsStillEligible(id: string): Promise<boolean>;
  publish(payload: Record<string, unknown>): Promise<void>;
}

export type CommerceSignalJobResult =
  | { outcome: "succeeded"; retryable: false; errorMessage: null }
  | { outcome: "suppressed"; retryable: false; errorMessage: string };

export async function processCommerceSignalJob(
  job: CommerceSignalJob,
  dependencies: CommerceSignalJobDependencies,
): Promise<CommerceSignalJobResult> {
  if (!await dependencies.contactIsSendable(job.email)) {
    return {
      outcome: "suppressed",
      retryable: false,
      errorMessage: "Brevo contact missing or email-blocklisted at send time",
    };
  }

  // This check intentionally happens after the provider blocklist lookup and
  // immediately before event publication. It closes the material Shopify /
  // Supabase state window without weakening Brevo's authoritative suppression.
  if (!await dependencies.jobIsStillEligible(job.id)) {
    return {
      outcome: "suppressed",
      retryable: false,
      errorMessage: "Commerce consent or lifecycle state changed before publish",
    };
  }

  await dependencies.publish(job.payload);
  return { outcome: "succeeded", retryable: false, errorMessage: null };
}
