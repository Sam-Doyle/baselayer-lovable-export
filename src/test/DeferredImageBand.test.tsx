import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeferredImageBand from "@/components/DeferredImageBand";

describe("DeferredImageBand", () => {
  let observerCallback: IntersectionObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    observe.mockClear();
    disconnect.mockClear();

    vi.stubGlobal("IntersectionObserver", class {
      readonly root = null;
      readonly rootMargin = "600px 0px";
      readonly thresholds = [0];

      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }

      observe = observe;
      disconnect = disconnect;
      takeRecords = () => [];
      unobserve = vi.fn();
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("withholds the image URL until the reserved band approaches the viewport", () => {
    const { container } = render(
      <DeferredImageBand
        src="/texture.png"
        alt="Cream spread across dark stone"
        width={1200}
        height={800}
      />,
    );

    expect(container.firstChild).toHaveAttribute("data-deferred-image", "waiting");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(observe).toHaveBeenCalledTimes(1);

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByRole("img", { name: "Cream spread across dark stone" })).toHaveAttribute(
      "src",
      "/texture.png",
    );
    expect(container.firstChild).toHaveAttribute("data-deferred-image", "loaded");
    expect(disconnect).toHaveBeenCalled();
  });
});
