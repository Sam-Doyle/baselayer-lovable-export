export const LEAD_CAPTURE_REQUEST_VERSION = 2 as const;

export const SKIN_CONCERN_IDS = ["dryness", "shine", "irritation", "texture"] as const;

export type SkinConcernId = (typeof SKIN_CONCERN_IDS)[number];

type UnknownRecord = Record<string, unknown>;

export interface ValidatedLeadCapture {
  requestVersion: 1 | 2;
  submissionId: string;
  email: string;
  source: string;
  concern: SkinConcernId | null;
  discountCode: string | null;
  attribution: {
    first_source: string;
    last_source: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    landing_path: string | null;
    referrer: string | null;
  };
  consent: {
    version: string;
    text: string;
    captured_at: string;
    source: string;
  } | null;
}

export class LeadCaptureValidationError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code = "invalid_request",
  ) {
    super(message);
    this.name = "LeadCaptureValidationError";
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const SOURCE_PATTERN = /^[a-z0-9][a-z0-9_.:-]*$/u;
const DISCOUNT_PATTERN = /^[A-Z0-9_-]+$/u;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new LeadCaptureValidationError(`${field} is required`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new LeadCaptureValidationError(`${field} is invalid`);
  }
  return normalized;
}

function optionalString(value: unknown, field: string, maxLength: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw new LeadCaptureValidationError(`${field} is invalid`);
  }
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) {
    throw new LeadCaptureValidationError(`${field} is invalid`);
  }
  return normalized;
}

function sourceValue(value: unknown, fallback: string, field: string): string {
  const source = optionalString(value, field, 64) ?? fallback;
  const normalized = source.toLowerCase();
  if (!SOURCE_PATTERN.test(normalized)) {
    throw new LeadCaptureValidationError(`${field} is invalid`);
  }
  return normalized;
}

function sanitizeLandingPath(value: unknown): string | null {
  const path = optionalString(value, "attribution.landing_path", 512);
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new LeadCaptureValidationError("attribution.landing_path is invalid");
  }
  return path;
}

function sanitizeReferrer(value: unknown): string | null {
  const referrer = optionalString(value, "attribution.referrer", 2_048);
  if (!referrer) return null;
  // The browser contract normally sends hostname only to avoid collecting
  // referrer query strings. Accept that preferred form directly.
  if (/^(?:[a-z0-9](?:[a-z0-9-]{0,62})\.)+[a-z]{2,63}$/iu.test(referrer)) {
    return referrer.toLowerCase();
  }
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("invalid protocol");
    // Query strings can contain email addresses or other identifiers. The
    // acquisition source and campaign are captured separately, so retain only
    // the non-sensitive origin and path.
    return `${url.origin}${url.pathname}`.slice(0, 2_048);
  } catch {
    throw new LeadCaptureValidationError("attribution.referrer is invalid");
  }
}

function parseIsoTimestamp(value: unknown, field: string, nowMs: number): string {
  const raw = requiredString(value, field, 64);
  const timestamp = Date.parse(raw);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1_000;
  if (!Number.isFinite(timestamp) || timestamp > nowMs + 10 * 60 * 1_000 || timestamp < nowMs - sevenDaysMs) {
    throw new LeadCaptureValidationError(`${field} is invalid`);
  }
  return new Date(timestamp).toISOString();
}

export function normalizeEmail(value: unknown): string {
  const email = requiredString(value, "email", 254).toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.includes("..")) {
    throw new LeadCaptureValidationError("email is invalid");
  }
  return email;
}

export function validateLeadCapture(input: unknown, nowMs = Date.now()): ValidatedLeadCapture {
  if (!isRecord(input)) throw new LeadCaptureValidationError("request body is invalid");

  const requestVersion = input.request_version === LEAD_CAPTURE_REQUEST_VERSION ? 2 : 1;
  const email = normalizeEmail(input.email);
  const source = sourceValue(input.source, "website", "source");
  const concern = optionalString(input.concern, "concern", 32);
  if (concern && !SKIN_CONCERN_IDS.includes(concern as SkinConcernId)) {
    throw new LeadCaptureValidationError("concern is invalid");
  }

  const discountCode = optionalString(input.discount_code, "discount_code", 32)?.toUpperCase() ?? null;
  if (discountCode && !DISCOUNT_PATTERN.test(discountCode)) {
    throw new LeadCaptureValidationError("discount_code is invalid");
  }

  const attributionInput = isRecord(input.attribution) ? input.attribution : {};
  const firstSource = sourceValue(attributionInput.first_source, source, "attribution.first_source");
  const lastSource = sourceValue(attributionInput.last_source, source, "attribution.last_source");
  const attribution = {
    first_source: firstSource,
    last_source: lastSource,
    utm_source: optionalString(attributionInput.utm_source, "attribution.utm_source", 255),
    utm_medium: optionalString(attributionInput.utm_medium, "attribution.utm_medium", 255),
    utm_campaign: optionalString(attributionInput.utm_campaign, "attribution.utm_campaign", 255),
    utm_content: optionalString(attributionInput.utm_content, "attribution.utm_content", 255),
    utm_term: optionalString(attributionInput.utm_term, "attribution.utm_term", 255),
    landing_path: sanitizeLandingPath(attributionInput.landing_path),
    referrer: sanitizeReferrer(attributionInput.referrer),
  };

  if (requestVersion === 1) {
    return {
      requestVersion,
      submissionId: crypto.randomUUID(),
      email,
      source,
      concern: (concern as SkinConcernId | null) ?? null,
      discountCode,
      attribution,
      consent: null,
    };
  }

  const submissionId = requiredString(input.submission_id, "submission_id", 36);
  if (!UUID_PATTERN.test(submissionId)) {
    throw new LeadCaptureValidationError("submission_id is invalid");
  }

  if (!isRecord(input.client)) throw new LeadCaptureValidationError("client is required");
  if (typeof input.client.honeypot !== "string" || input.client.honeypot.length > 0) {
    throw new LeadCaptureValidationError("request rejected", 400, "request_rejected");
  }
  if (typeof input.client.form_started_at !== "number" || !Number.isFinite(input.client.form_started_at)) {
    throw new LeadCaptureValidationError("client.form_started_at is invalid");
  }
  const elapsedMs = nowMs - input.client.form_started_at;
  // Preserve an inexpensive bot signal without rejecting real shoppers using
  // browser autofill after selecting their concern.
  if (elapsedMs < 250 || elapsedMs > 24 * 60 * 60 * 1_000) {
    throw new LeadCaptureValidationError("request rejected", 400, "request_rejected");
  }

  if (!isRecord(input.consent)) throw new LeadCaptureValidationError("consent is required");
  const consentSource = sourceValue(input.consent.source, source, "consent.source");
  const consent = {
    version: requiredString(input.consent.version, "consent.version", 64),
    text: requiredString(input.consent.text, "consent.text", 1_000),
    captured_at: parseIsoTimestamp(input.consent.captured_at, "consent.captured_at", nowMs),
    source: consentSource,
  };

  return {
    requestVersion,
    submissionId: submissionId.toLowerCase(),
    email,
    source,
    concern: (concern as SkinConcernId | null) ?? null,
    discountCode,
    attribution,
    consent,
  };
}

function wildcardPattern(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/gu, "\\$&").replace(/\*/gu, "[^.]+");
  return new RegExp(`^${escaped}$`, "u");
}

export function isOriginAllowed(origin: string | null, allowedOrigins: readonly string[]): boolean {
  if (!origin) return false;
  let canonicalOrigin: string;
  try {
    canonicalOrigin = new URL(origin).origin;
  } catch {
    return false;
  }
  return allowedOrigins.some((allowed) => {
    const normalized = allowed.trim();
    if (!normalized) return false;
    return normalized.includes("*")
      ? wildcardPattern(normalized).test(canonicalOrigin)
      : normalized === canonicalOrigin;
  });
}

export interface BrevoSyncPayload {
  email: string;
  first_source: string;
  last_source: string;
  skin_concern?: string | null;
  discount_code?: string | null;
  first_seen_at: string;
  last_seen_at: string;
  consent_at?: string | null;
  consent_version?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  last_utm_source?: string | null;
  last_utm_medium?: string | null;
  last_utm_campaign?: string | null;
  last_utm_content?: string | null;
  last_utm_term?: string | null;
  landing_path?: string | null;
}

function dateOnly(value: string | null | undefined): string | null | undefined {
  return value ? value.slice(0, 10) : value;
}

export function buildBrevoAttributes(payload: BrevoSyncPayload): Record<string, string> {
  const attributes: Record<string, string | null | undefined> = {
    SOURCE: payload.last_source,
    FIRST_SOURCE: payload.first_source,
    LAST_SOURCE: payload.last_source,
    SKIN_CONCERN: payload.skin_concern,
    DISCOUNT_CODE: payload.discount_code,
    SIGNUP_AT: dateOnly(payload.first_seen_at),
    LAST_SIGNUP_AT: dateOnly(payload.last_seen_at),
    CONSENT_AT: dateOnly(payload.consent_at),
    CONSENT_VERSION: payload.consent_version,
    UTM_SOURCE: payload.utm_source,
    UTM_MEDIUM: payload.utm_medium,
    UTM_CAMPAIGN: payload.utm_campaign,
    UTM_CONTENT: payload.utm_content,
    UTM_TERM: payload.utm_term,
    LAST_UTM_SOURCE: payload.last_utm_source,
    LAST_UTM_MEDIUM: payload.last_utm_medium,
    LAST_UTM_CAMPAIGN: payload.last_utm_campaign,
    LAST_UTM_CONTENT: payload.last_utm_content,
    LAST_UTM_TERM: payload.last_utm_term,
    LANDING_PATH: payload.landing_path,
  };
  return Object.fromEntries(
    Object.entries(attributes).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0),
  );
}
