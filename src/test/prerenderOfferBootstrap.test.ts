import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const bootstrap = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(script => script.includes("bl-prerender-root"))!;
const headGuard = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(script => script.includes('pdpSnapshotOffer = "alternate"'))!;
const criticalCss = html.match(/<style>([\s\S]*?)<\/style>/)![1];
const originalUrl = window.location.href;

afterEach(() => {
  document.body.replaceChildren();
  document.head.querySelector("[data-test-critical]")?.remove();
  delete document.documentElement.dataset.pdpSnapshotOffer;
  window.history.replaceState(null, "", originalUrl);
});

describe("query-offer snapshot before React loads", () => {
  it.each(["single", "subscription", "two", "unknown", ""])("handles offer=%s without a stale acquisition offer", offer => {
    window.history.replaceState(null, "", `/face-cream?offer=${offer}`);
    const style = document.createElement("style");
    style.dataset.testCritical = "";
    style.textContent = criticalCss;
    document.head.append(style);
    new Function("document", "location", headGuard)(document, window.location);
    document.body.innerHTML = `<div id="root"><!--SSR--><nav>Navigation</nav><main>
      <section id="offer"><div data-product-gallery-track>Gallery</div>
        <div id="purchase-options"><h1>Face Cream</h1><p>$68 total · 2 bottles</p></div>
      </section>
      <div data-pdp-sticky-cta>$68 <button>Add 2 bottles</button></div>
      <section><button>Add 2 bottles</button></section>
    </main><!--/SSR--></div>`;
    const mismatched = offer === "single" || offer === "subscription";
    expect(getComputedStyle(document.querySelector("#purchase-options")!).visibility).toBe(mismatched ? "hidden" : "visible");
    expect(getComputedStyle(document.querySelector("[data-product-gallery-track]")!).visibility).toBe("visible");
    new Function("document", "location", bootstrap)(document, window.location);
    const snapshot = document.getElementById("bl-prerender-root")!;
    expect(document.documentElement).not.toHaveAttribute("data-pdp-snapshot-offer");
    for (const element of snapshot.querySelectorAll<HTMLElement>("#purchase-options, main > :not(#offer)")) {
      expect(element.style.visibility).toBe(mismatched ? "hidden" : "");
    }
    expect(snapshot.querySelector<HTMLElement>("#offer")!.style.visibility).toBe("");
    expect(snapshot.querySelector<HTMLElement>("[data-product-gallery-track]")!.style.visibility).toBe("");
    expect(snapshot.querySelector<HTMLElement>("nav")!.style.visibility).toBe("");
    expect(snapshot).toHaveTextContent("$68 total · 2 bottles"); // no invented static offer/copy
    expect(snapshot.inert).toBe(true);
    expect(snapshot.style.pointerEvents).toBe("none");
  });

  it("clears the head guard for non-SSR development/fallback shells", () => {
    window.history.replaceState(null, "", "/face-cream?offer=single");
    new Function("document", "location", headGuard)(document, window.location);
    document.body.innerHTML = '<div id="root"><!--SKELETON--></div>';
    new Function("document", "location", bootstrap)(document, window.location);
    expect(document.documentElement).not.toHaveAttribute("data-pdp-snapshot-offer");
  });
});
