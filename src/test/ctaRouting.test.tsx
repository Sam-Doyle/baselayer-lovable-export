import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import StickyMobileCTA from "@/components/StickyMobileCTA";

// Deliberate architecture decision under test: the hero and sticky mobile
// bar must route cold traffic to the PDP (/face-cream) rather than adding
// to cart directly — direct-to-cart locks conversions to the $38
// DEFAULT_TIER, skips the PDP's higher tiers, and fires Meta AddToCart with
// no preceding ViewContent. These tests exist to stop that being
// "simplified" back to a direct add-to-cart button.

// analytics.ts is being edited concurrently by another agent — mock it.
const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  setCapturedEmail: vi.fn(),
}));

// Neither component currently imports these — mocked defensively so that if
// someone reintroduces a direct add-to-cart call (the pattern used by other
// CTAs on the page, via useEarlyAccess().openModal() or the cart store
// directly), the test fails instead of silently passing.
const mockAddItem = vi.fn();
vi.mock("@/stores/cartStore", () => ({
  useCartStore: { getState: () => ({ addItem: mockAddItem, isLoading: false }) },
}));

const mockOpenModal = vi.fn();
vi.mock("@/context/EarlyAccessContext", () => ({
  useEarlyAccess: () => ({ isOpen: false, openModal: mockOpenModal, closeModal: vi.fn() }),
  EarlyAccessProvider: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  mockTrackEvent.mockClear();
  mockAddItem.mockClear();
  mockOpenModal.mockClear();
});

describe("CTA funnel routing", () => {
  it("HeroSection primary CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getByRole } = render(<HeroSection />, { wrapper: MemoryRouter });
    const link = getByRole("link", { name: /grab yours/i });

    expect(link).toHaveAttribute("href", "/face-cream");

    fireEvent.click(link);

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "select_item",
      expect.objectContaining({ source: "hero" })
    );
    expect(mockTrackEvent).not.toHaveBeenCalledWith("add_to_cart", expect.anything());
    expect(mockAddItem).not.toHaveBeenCalled();
    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it("StickyMobileCTA links to the PDP and never calls the add-to-cart path", () => {
    const { container } = render(<StickyMobileCTA />, { wrapper: MemoryRouter });
    const link = container.querySelector('a[href="/face-cream"]');

    expect(link).not.toBeNull();

    fireEvent.click(link as Element);

    expect(mockTrackEvent).toHaveBeenCalledWith(
      "select_item",
      expect.objectContaining({ source: "home_sticky_mobile" })
    );
    expect(mockTrackEvent).not.toHaveBeenCalledWith("add_to_cart", expect.anything());
    expect(mockAddItem).not.toHaveBeenCalled();
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});
