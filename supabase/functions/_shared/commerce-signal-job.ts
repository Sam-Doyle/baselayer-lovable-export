export interface CommerceSignalJob {
  id: string;
  shop_domain: string;
  email: string;
  payload: Record<string, unknown>;
  attempts: number;
  lease_token: string;
}

export interface CommerceSignalJobDependencies {
  contactIsSendable(email: string): Promise<boolean>;
  beginDispatch(id: string, leaseToken: string): Promise<boolean>;
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

  // This fenced transition rechecks consent, commerce state, the current shop
  // allowlist, and the claim lease in one database statement immediately
  // before the provider request. A dispatch that reaches Brevo is never
  // automatically reclaimed if its final acknowledgement becomes uncertain.
  if (!await dependencies.beginDispatch(job.id, job.lease_token)) {
    return {
      outcome: "suppressed",
      retryable: false,
      errorMessage: "Commerce consent or lifecycle state changed before publish",
    };
  }

  await dependencies.publish(job.payload);
  return { outcome: "succeeded", retryable: false, errorMessage: null };
}
