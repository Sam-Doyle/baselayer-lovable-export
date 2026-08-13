import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import MetaRouterTracker from "@/analytics/MetaRouterTracker";
import { setConsent } from "@/lib/consent";

// Real consent.ts and analytics.ts are exercised here on purpose — this
// test exists to catch a regression of the actual leak (commit history:
// MetaRouterTracker fired a server-side Meta CAPI PageView, carrying user
// agent + session id + _fbc/_fbp, on every SPA route change regardless of
// the visitor's cookie-consent choice, guarded only by a bot/iframe flag
// that consent denial never sets). Mocking analytics.ts would hide exactly
// the bug this file is meant to prove is fixed.
//
// Uses the plain declarative <MemoryRouter> rather than
// createMemoryRouter()/<RouterProvider> (the data router) — the data
// router's navigate() builds an internal Request/AbortSignal that jsdom's
// realm rejects in this repo's test environment, an unrelated
// jsdom/@remix-run-router compatibility issue, not something to route
// around inside the component under test.
let currentNavigate: ((path: string) => void) | null = null;
function NavigateCapture() {
  currentNavigate = useNavigate();
  return null;
}

function renderTracker(initialPath = "/a") {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigateCapture />
      <MetaRouterTracker />
    </MemoryRouter>
  );
  return {
    navigate: (path: string) => {
      if (!currentNavigate) throw new Error("navigate() not ready");
      currentNavigate(path);
    },
  };
}

let fetchMock: ReturnType<typeof vi.fn>;
const originalFetch = global.fetch;

/*
 * With no stored decision, hasAnalyticsConsent() now answers from the
 * visitor's timezone (see requiresOptIn() in src/lib/consent.ts): opt-in
 * regions get nothing until they accept, everyone else is measured under
 * notice plus opt-out. That makes the no-decision cases below geo-dependent,
 * so they have to pin a timezone instead of inheriting whatever the machine
 * running the suite happens to be set to — otherwise the same test passes in
 * Denver and fails in Berlin.
 *
 * Stubbing Intl.DateTimeFormat wholesale is safe in this file because
 * nothing under test formats a date; setConsent() timestamps with
 * Date.toISOString(), which doesn't touch Intl.
 */
function pinTimezone(timeZone: string) {
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
    () => ({ resolvedOptions: () => ({ timeZone }) }) as unknown as Intl.DateTimeFormat
  );
}

const OPT_IN_TZ = "Europe/Berlin";   // prior-consent region: no decision means no tracking
const OPT_OUT_TZ = "America/Denver"; // notice plus opt-out: no decision means tracking runs

beforeEach(() => {
  window.localStorage.clear();
  fetchMock = vi.fn().mockResolvedValue({ ok: true });
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function capiCalls() {
  return fetchMock.mock.calls.filter(([url]) => String(url).includes("/functions/v1/fb-capi"));
}

describe("MetaRouterTracker — consent gate", () => {
  it("no consent decision yet in an opt-in region: a route change fires zero CAPI fetches", async () => {
    pinTimezone(OPT_IN_TZ);
    const router = renderTracker("/a");
    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(0);
  });

  it("no consent decision yet outside an opt-in region: a route change fires, because the model there is notice plus opt-out", async () => {
    pinTimezone(OPT_OUT_TZ);
    const router = renderTracker("/a");
    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(1);
  });

  it("consent rejected: a route change fires zero CAPI fetches, including where the default would have allowed it", async () => {
    pinTimezone(OPT_OUT_TZ);
    setConsent("rejected");
    const router = renderTracker("/a");
    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(0);
  });

  it("consent accepted before mount: a route change fires a CAPI PageView", async () => {
    setConsent("accepted");
    const router = renderTracker("/a");
    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(1);
    const [, init] = capiCalls()[0];
    expect(init).toMatchObject({ method: "POST" });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.event_name).toBe("PageView");
  });

  it("consent granted mid-session (after mount, no reload) starts firing on the next navigation — proves the gate reads consent at fire time, not a stale closure", async () => {
    // Opt-in region, so "no decision" genuinely blocks and the transition to
    // firing can only come from the accept below.
    pinTimezone(OPT_IN_TZ);
    const router = renderTracker("/a"); // no decision yet

    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(0);

    // Visitor accepts the cookie banner mid-session — same mounted
    // MetaRouterTracker instance, no remount/reload.
    setConsent("accepted");

    await act(async () => {
      await router.navigate("/c");
    });
    expect(capiCalls()).toHaveLength(1);
  });

  it("consent revoked mid-session stops future CAPI fetches without a reload", async () => {
    setConsent("accepted");
    const router = renderTracker("/a");

    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(1);

    setConsent("rejected");

    await act(async () => {
      await router.navigate("/c");
    });
    expect(capiCalls()).toHaveLength(1); // unchanged — no new fetch after revoke
  });

  it("__META_PIXEL_DISABLED__ alone (no consent) is not sufficient to allow tracking, and is not required to block it", async () => {
    // The bot/iframe flag is orthogonal to consent. With consent accepted
    // and the flag unset (the normal real-visitor case), tracking fires.
    setConsent("accepted");
    (window as unknown as { __META_PIXEL_DISABLED__?: boolean }).__META_PIXEL_DISABLED__ = false;
    const router = renderTracker("/a");
    await act(async () => {
      await router.navigate("/b");
    });
    expect(capiCalls()).toHaveLength(1);
  });
});
