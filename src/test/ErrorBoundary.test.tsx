import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

function Bomb(): never {
  throw new Error("boom");
}

const Fine = () => <div>all good</div>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("uncovers recovery controls when the PDP fails before its handoff", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const snapshot = document.createElement("div");
    snapshot.id = "bl-prerender-root";
    snapshot.dataset.prerenderPath = "/face-cream";
    snapshot.innerHTML = "Stale purchase page";
    const liveRoot = document.createElement("div");
    liveRoot.id = "root";
    liveRoot.dataset.prerenderHandoff = "active";
    document.body.append(snapshot, liveRoot);
    const view = render(<MemoryRouter><ErrorBoundary><Bomb /></ErrorBoundary></MemoryRouter>, { container: liveRoot });
    try {
      expect(snapshot.style.display).toBe("none");
      expect(liveRoot).not.toHaveAttribute("data-prerender-handoff");
      expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
    } finally {
      view.unmount();
      snapshot.remove();
      liveRoot.remove();
    }
  });

  it("renders children normally when nothing throws", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Fine />
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("catches a render-time throw and shows the fallback instead of white-screening", () => {
    // React logs the caught error to console itself (in addition to our
    // componentDidCatch) — expected noise for this test, not a real failure.
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByText(/something broke/i)).toBeInTheDocument();
    expect(screen.queryByText("all good")).not.toBeInTheDocument();
  });

  it("logs the caught error to console", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>
    );

    const loggedOurs = consoleSpy.mock.calls.some(
      (call) => typeof call[0] === "string" && call[0].includes("[ErrorBoundary]")
    );
    expect(loggedOurs).toBe(true);
  });

  it("the fallback renders no <nav>/<footer> — prerender safety: the Puppeteer build step (vite.config.ts) only captures a page once both exist inside #root, so a fallback that can never contain them can never satisfy that check and get baked into dist/ for a page that actually threw", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>
    );

    expect(container.querySelector("nav")).toBeNull();
    expect(container.querySelector("footer")).toBeNull();
  });

  it("offers a reload control and a link back to the homepage", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
    const homeLink = screen.getByRole("link", { name: /back to the store/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
