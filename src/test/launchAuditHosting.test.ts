import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const repoFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

interface RedirectRule {
  from: string;
  to: string;
  status: string;
}

function redirectRules(path: string): RedirectRule[] {
  return repoFile(path)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });
}

describe("analytics consent markup", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document
      .querySelectorAll('script[src*="googletagmanager.com/gtag"], script[src*="connect.facebook.net"]')
      .forEach((node) => node.remove());
    delete (window as unknown as { fbq?: unknown }).fbq;
    delete (window as unknown as { _fbq?: unknown })._fbq;
    delete (window as unknown as { gtag?: unknown }).gtag;
    delete (window as unknown as { dataLayer?: unknown }).dataLayer;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has no no-JavaScript Meta request that can bypass the consent gate", () => {
    const html = repoFile("index.html");

    expect(html).not.toContain("facebook.com/tr");
    expect(html).not.toContain("noscript=1");
  });

  it("keeps GA4 and Meta scripts blocked after an explicit rejection", async () => {
    const { setConsent } = await import("@/lib/consent");
    setConsent("rejected");
    const { initAnalyticsScripts } = await import("@/lib/analytics");

    initAnalyticsScripts();

    expect(document.querySelector('script[src*="googletagmanager.com/gtag"]')).toBeNull();
    expect(document.querySelector('script[src*="connect.facebook.net"]')).toBeNull();
  });

  it("still loads GA4 and Meta after analytics consent is accepted", async () => {
    const { setConsent } = await import("@/lib/consent");
    setConsent("accepted");
    const { initAnalyticsScripts } = await import("@/lib/analytics");

    initAnalyticsScripts();

    expect(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')).not.toBeNull();
    expect(document.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')).not.toBeNull();
    expect((window as unknown as { fbq?: unknown }).fbq).toBeTypeOf("function");
  });
});

describe("canonical host redirects", () => {
  const expectedRules = [
    { from: "https://baselayer.skin/*", to: "https://baselayerskin.co/:splat", status: "301!" },
    { from: "https://www.baselayer.skin/*", to: "https://baselayerskin.co/:splat", status: "301!" },
    { from: "https://baselayerskin.netlify.app/*", to: "https://baselayerskin.co/:splat", status: "301!" },
    { from: "https://www.baselayerskin.co/*", to: "https://baselayerskin.co/:splat", status: "301!" },
  ];

  it("permanently redirects every duplicate HTTPS host while preserving the path splat", () => {
    const rules = redirectRules("public/_redirects");

    for (const rule of expectedRules) {
      expect(rules).toContainEqual(rule);
    }
  });

  it("puts host rules before all path-only rules and the catch-all", () => {
    const rules = redirectRules("public/_redirects");
    const firstPathOnlyRule = rules.findIndex((rule) => rule.from.startsWith("/"));

    expect(firstPathOnlyRule).toBe(expectedRules.length);
    expect(rules.slice(0, expectedRules.length)).toEqual(expectedRules);
    expect(rules.at(-1)).toEqual({ from: "/*", to: "/index.html", status: "200" });
  });
});
