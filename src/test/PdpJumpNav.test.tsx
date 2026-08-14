import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PdpJumpNav from "@/components/PdpJumpNav";

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

let observerCallback: ObserverCallback | null = null;
const observe = vi.fn();
const disconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback;
  }

  observe = observe;
  disconnect = disconnect;
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}

describe("PdpJumpNav", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    observe.mockClear();
    disconnect.mockClear();
    observerCallback = null;
  });

  it("links to every PDP section and exposes the active location", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(
      <>
        {(["offer", "results", "formula", "reviews", "faq"] as const).map((id) => (
          <section id={id} key={id} />
        ))}
        <PdpJumpNav />
      </>,
    );

    expect(screen.getByRole("navigation", { name: "Product page sections" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Offer" })).toHaveAttribute("href", "#offer");
    expect(screen.getByRole("link", { name: "Results" })).toHaveAttribute("href", "#results");
    expect(screen.getByRole("link", { name: "Formula" })).toHaveAttribute("href", "#formula");
    expect(screen.getByRole("link", { name: "Reviews" })).toHaveAttribute("href", "#reviews");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "#faq");
    expect(screen.getByRole("link", { name: "Offer" })).toHaveAttribute("aria-current", "location");
    expect(observe).toHaveBeenCalledTimes(5);
  });

  it("updates the active link from section intersections and direct selection", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(
      <>
        {(["offer", "results", "formula", "reviews", "faq"] as const).map((id) => (
          <section id={id} key={id} />
        ))}
        <PdpJumpNav />
      </>,
    );

    const formula = document.getElementById("formula")!;
    act(() => {
      observerCallback?.(
        [
          {
            isIntersecting: true,
            target: formula,
            boundingClientRect: { top: 120 },
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link", { name: "Formula" })).toHaveAttribute("aria-current", "location");

    fireEvent.click(screen.getByRole("link", { name: "FAQ" }));
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("aria-current", "location");
  });

  it("omits the reviews jump target when the review section is gated off", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(<PdpJumpNav showReviews={false} />);

    expect(screen.queryByRole("link", { name: "Reviews" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "#faq");
  });
});
