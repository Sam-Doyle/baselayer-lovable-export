import { describe, expect, it } from "vitest";
import { hideSnapshotConsentBanner, hideSnapshotFixedUi, retirePrerenderSnapshot } from "@/lib/prerenderHandoff";

describe("homepage prerender handoff", () => {
  it("hides the inert snapshot consent banner once the live app owns it", () => {
    const snapshot = document.createElement("div");
    snapshot.innerHTML = `
      <main>Homepage shell</main>
      <div aria-label="Cookie consent"><button>Accept</button></div>
    `;

    hideSnapshotConsentBanner(snapshot);

    const banner = snapshot.querySelector<HTMLElement>('[aria-label="Cookie consent"]');
    expect(banner?.style.display).toBe("none");
    expect(banner).toHaveAttribute("aria-hidden", "true");
    expect(snapshot.querySelector("main")?.style.display).not.toBe("none");
  });

  it("is safe when a snapshot has no consent banner", () => {
    const snapshot = document.createElement("div");
    snapshot.innerHTML = "<main>Homepage shell</main>";

    expect(() => hideSnapshotConsentBanner(snapshot)).not.toThrow();
  });

  it("removes snapshot-owned fixed UI without removing the visual page shell", () => {
    const snapshot = document.createElement("div");
    snapshot.innerHTML = `
      <main><h1>Homepage shell</h1></main>
      <header data-prerender-handoff-hide>Stale fixed header</header>
      <aside data-prerender-handoff-hide>Stale fixed CTA</aside>
    `;

    hideSnapshotFixedUi(snapshot);

    const fixedUi = snapshot.querySelectorAll<HTMLElement>("[data-prerender-handoff-hide]");
    expect(fixedUi).toHaveLength(2);
    fixedUi.forEach((element) => {
      expect(element.style.display).toBe("none");
      expect(element).toHaveAttribute("aria-hidden", "true");
    });
    expect(snapshot.querySelector("main")?.style.display).not.toBe("none");
    expect(snapshot).toHaveTextContent("Homepage shell");
  });

  it("retires every stale homepage pixel when the SPA changes routes", () => {
    const snapshot = document.createElement("div");
    snapshot.innerHTML = "<main>Homepage shell</main>";

    retirePrerenderSnapshot(snapshot);

    expect(snapshot.style.display).toBe("none");
    expect(snapshot.style.pointerEvents).toBe("none");
    expect(snapshot).toHaveAttribute("aria-hidden", "true");
    expect(snapshot.inert).toBe(true);
  });
});
