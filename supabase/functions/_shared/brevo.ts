import { buildBrevoAttributes, type BrevoSyncPayload } from "./lead-capture.ts";

export class BrevoSyncError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly status: number | null = null,
  ) {
    super(message);
    this.name = "BrevoSyncError";
  }
}

interface BrevoErrorBody {
  code?: unknown;
}

export async function syncBrevoContact(
  payload: BrevoSyncPayload,
  apiKey: string,
  listId: number,
  fetcher: typeof fetch = fetch,
  timeoutMs = 3_000,
): Promise<void> {
  if (!Number.isInteger(listId) || listId <= 0) {
    throw new BrevoSyncError("Brevo list is not configured", false);
  }

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    response = await fetcher("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: payload.email,
        listIds: [listId],
        updateEnabled: true,
        attributes: buildBrevoAttributes(payload),
      }),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = controller.signal.aborted
      || (error instanceof Error && error.name === "AbortError");
    throw new BrevoSyncError(timedOut ? "Brevo request timed out" : "Brevo network request failed", true);
  } finally {
    clearTimeout(timeout);
  }

  if (response.ok) return;

  let errorBody: BrevoErrorBody = {};
  try {
    errorBody = (await response.json()) as BrevoErrorBody;
  } catch {
    // Provider HTML/plain-text errors are intentionally not persisted because
    // they can echo submitted contact data.
  }
  const providerCode = typeof errorBody.code === "string" ? errorBody.code.slice(0, 80) : "provider_error";
  const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
  throw new BrevoSyncError(`Brevo ${response.status}: ${providerCode}`, retryable, response.status);
}
