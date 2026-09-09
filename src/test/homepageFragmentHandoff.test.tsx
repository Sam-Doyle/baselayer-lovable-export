import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter, Link, MemoryRouter, Route, Routes, useNavigate, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Index from "@/pages/Index";
import OurOriginSection from "@/components/OurOriginSection";
import { completeHomepageFragmentHandoff } from "@/lib/prerenderHandoff";

const gate = vi.hoisted(() => ({ pending: null as Promise<void> | null }));
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/HeroSection", () => ({
  default: () => <section id="hero"><Link to="/#formula">Formula link</Link></section>,
}));
vi.mock("@/components/StickyMobileCTA", () => ({ default: () => null }));
vi.mock("@/components/ProofStrip", () => ({ default: () => null }));
vi.mock("@/components/ScrollProgressBar", () => ({ default: () => null }));
vi.mock("@/analytics/ScrollDepthTracker", () => ({ default: () => null }));
vi.mock("@/analytics/SectionViewTracker", () => ({ default: () => null }));
vi.mock("@/components/SEO", () => ({ useCanonical: () => {}, useMetaTags: () => {}, JsonLd: () => null }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/components/HomeBelowFold", async () => {
  const { default: IngredientsShowcase } = await import("@/components/IngredientsShowcase");
  return {
    default: () => {
      if (gate.pending) throw gate.pending;
      return <><IngredientsShowcase /><section id="origin">Live origin</section><div id="literal[id]">Literal target</div></>;
    },
  };
});

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const bootstrap = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).find(script => script.includes("bl-prerender-root"))!;
const originalUrl = window.location.href;
const scrolls: Element[] = [];
let navigate: NavigateFunction;
const observers = new Map<Element, () => void>();

function NavigationHandle() {
  navigate = useNavigate();
  return null;
}

function installSnapshot(url = "/") {
  window.history.replaceState(null, "", url);
  document.body.innerHTML = '<div id="root"><!--SSR--><main><section id="hero">Static hero</section><section id="formula"><h2 style="opacity:0">Static formula</h2></section></main><!--/SSR--></div>';
  new Function("document", "location", bootstrap)(document, window.location);
  return document.getElementById("bl-prerender-root")!;
}

async function renderHome(url = "/") {
  const snapshot = installSnapshot(url);
  await act(async () => {
    render(<MemoryRouter initialEntries={[url]}>
      <NavigationHandle />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/other" element={<p>Other route</p>} />
      </Routes>
    </MemoryRouter>, { container: document.getElementById("root")! });
  });
  if (!vi.isFakeTimers()) await act(async () => { await vi.dynamicImportSettled(); });
  return snapshot;
}

beforeEach(() => {
  scrolls.length = 0;
  gate.pending = null;
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
  vi.stubGlobal("requestIdleCallback", vi.fn((callback: IdleRequestCallback) => {
    callback({ didTimeout: false, timeRemaining: () => 5 });
    return 7;
  }));
  vi.stubGlobal("cancelIdleCallback", vi.fn());
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      observers.set(target, () => this.callback(
        [{ target, isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ));
    }
    disconnect() { observers.clear(); }
    unobserve(target: Element) { observers.delete(target); }
  });
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(function(this: Element) { scrolls.push(this); }),
  });
});

afterEach(() => {
  cleanup();
  gate.pending = null;
  observers.clear();
  document.body.replaceChildren();
  window.history.replaceState(null, "", originalUrl);
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
});

describe("homepage fragment ownership and live handoff", () => {
  it("removes static fragment IDs before React while retaining the normal-entry hero shell", () => {
    const snapshot = installSnapshot();
    expect(snapshot).toHaveTextContent("Static hero");
    expect(snapshot.querySelectorAll("[id]")).toHaveLength(0);
    expect(snapshot.style.display).not.toBe("none");
    expect(snapshot.style.position).toBe("absolute");
    expect(snapshot.style.overflow).toBe("hidden");
    expect(document.getElementById("formula")).toBeNull();
    expect(document.getElementById("root")).toBeEmptyDOMElement();
  });

  it("leaves no-JS static IDs and content untouched when bootstrap does not run", () => {
    document.body.innerHTML = '<div id="root"><!--SSR--><section id="formula">Static formula</section><!--/SSR--></div>';
    expect(document.getElementById("formula")).toHaveTextContent("Static formula");
    expect(document.getElementById("bl-prerender-root")).toBeNull();
  });

  it("keeps the no-fragment delay and never retires its hero shell just for mounting below-fold", async () => {
    const schedule = vi.spyOn(globalThis, "setTimeout");
    const snapshot = await renderHome();
    expect(document.getElementById("root")!.querySelector("#formula")).toBeNull();
    const delayCall = schedule.mock.calls.findIndex(([, delay]) => delay === 3000);
    expect(delayCall).toBeGreaterThanOrEqual(0);
    // Exercise the scheduled callback without putting Vite's cold dynamic
    // import machinery on a fake clock or dropping its pending timers.
    clearTimeout(schedule.mock.results[delayCall].value);
    const revealAfterDelay = schedule.mock.calls[delayCall][0];
    expect(typeof revealAfterDelay).toBe("function");
    await act(async () => {
      if (typeof revealAfterDelay === "function") revealAfterDelay();
    });
    // React must commit the reveal first so its lazy import has started.
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(window.requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(document.getElementById("root")!.querySelector("#formula")).not.toBeNull();
    expect(snapshot.style.display).not.toBe("none");
    expect(scrolls).toEqual([]);
  });

  it.each(["#formula", "#%66ormula"])("direct /%s reveals and scrolls only the committed live target", async hash => {
    const snapshot = await renderHome("/" + hash);
    const live = document.getElementById("root")!.querySelector<HTMLElement>("#formula");
    expect(live).not.toBeNull();
    expect(document.querySelectorAll("#formula")).toHaveLength(1);
    expect(scrolls).toEqual([live]);
    expect(snapshot.style.display).toBe("none");
    expect(snapshot.inert).toBe(true);
    await act(async () => { observers.get(live!)?.(); });
    expect(live!.querySelector("h2")!.parentElement!.style.opacity).toBe("1");
    expect(live!.querySelectorAll("img[src]")).toHaveLength(6);
  });

  it("honors an in-page link without waiting for the normal idle delay", async () => {
    const snapshot = await renderHome();
    await act(async () => { fireEvent.click(screen.getByRole("link", { name: "Formula link" })); });
    const live = document.getElementById("root")!.querySelector("#formula");
    expect(live).not.toBeNull();
    expect(scrolls).toEqual([live]);
    expect(snapshot.style.display).toBe("none");
  });

  it("handles a native anchor/hashchange through BrowserRouter, not just MemoryRouter", async () => {
    const snapshot = installSnapshot();
    await act(async () => {
      render(<BrowserRouter><a href="#formula">Native formula</a><Index /></BrowserRouter>,
        { container: document.getElementById("root")! });
      await vi.dynamicImportSettled();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("link", { name: "Native formula" }));
      await new Promise(resolve => window.setTimeout(resolve, 10));
      await vi.dynamicImportSettled();
    });
    expect(window.location.hash).toBe("#formula");
    const live = document.getElementById("root")!.querySelector("#formula");
    expect(live).not.toBeNull();
    expect(scrolls).toEqual([live]);
    expect(snapshot.style.display).toBe("none");
  });

  it("handles a later fragment, same-fragment navigation and browser-history back", async () => {
    await renderHome("/#formula");
    await act(async () => { navigate("/#origin"); });
    expect(scrolls.at(-1)?.id).toBe("origin");
    await act(async () => { navigate(-1); });
    expect(scrolls.at(-1)?.id).toBe("formula");
    const count = scrolls.length;
    await act(async () => { navigate("/#formula"); });
    expect(scrolls).toHaveLength(count + 1);
    expect(scrolls.at(-1)?.id).toBe("formula");
  });

  it("scrolls the homepage target after returning from another SPA route", async () => {
    await renderHome();
    await act(async () => { navigate("/other"); });
    await act(async () => { navigate("/#formula"); });
    expect(scrolls.at(-1)).toBe(document.getElementById("root")!.querySelector("#formula"));
  });

  it("does not scroll or retire while the lazy boundary is pending, or jump back after navigation away", async () => {
    let resolvePending!: () => void;
    gate.pending = new Promise<void>(resolve => { resolvePending = resolve; });
    const snapshot = await renderHome("/#formula");
    expect(scrolls).toEqual([]);
    expect(snapshot.style.display).not.toBe("none");
    await act(async () => { navigate("/other"); });
    await act(async () => { gate.pending = null; resolvePending(); });
    expect(scrolls).toEqual([]);
    expect(screen.getByText("Other route")).toBeInTheDocument();
  });

  it("waits for a suspended live target, then hands off once it commits", async () => {
    let resolvePending!: () => void;
    gate.pending = new Promise<void>(resolve => { resolvePending = resolve; });
    const snapshot = await renderHome("/#formula");
    expect(scrolls).toEqual([]);
    await act(async () => { gate.pending = null; resolvePending(); });
    expect(scrolls).toEqual([document.getElementById("root")!.querySelector("#formula")]);
    expect(snapshot.style.display).toBe("none");
  });

  it.each(["#", "#%E0%A4%A", "#does-not-exist", "#formula%5D%5B"])("handles %s without throwing, retiring the shell, or forced scroll", async hash => {
    const snapshot = await renderHome("/" + hash);
    expect(scrolls).toEqual([]);
    expect(snapshot.style.display).not.toBe("none");
  });

  it("treats decoded fragment IDs literally instead of as CSS selectors", async () => {
    await renderHome("/#literal%5Bid%5D");
    expect(scrolls.at(-1)?.id).toBe("literal[id]");
  });

  it("never targets an ID outside the live root or performs a PDP handoff", () => {
    const snapshot = installSnapshot();
    const foreign = document.createElement("div");
    foreign.id = "formula";
    document.body.append(foreign);
    expect(completeHomepageFragmentHandoff("/", "#formula")).toBe(false);
    const live = document.createElement("section");
    live.id = "formula";
    document.getElementById("root")!.append(live);
    expect(completeHomepageFragmentHandoff("/face-cream", "#formula")).toBe(false);
    expect(scrolls).toEqual([]);
    expect(snapshot.style.display).not.toBe("none");
    expect(completeHomepageFragmentHandoff("/", "#formula")).toBe(true);
    expect(scrolls).toEqual([live]);
  });
});

it("removes the origin disclosure promise without repeating the daily-formula phrase", () => {
  render(<MemoryRouter><OurOriginSection /></MemoryRouter>);
  expect(screen.getByText("Six key ingredients. One daily formula. $38.")).toBeInTheDocument();
  expect(document.body).not.toHaveTextContent(/every concentration disclosed/i);
});
