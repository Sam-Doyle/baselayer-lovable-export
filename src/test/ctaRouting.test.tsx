import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import MidPageCTA from "@/components/MidPageCTA";
import OurOriginSection from "@/components/OurOriginSection";
import MatteMoisturizer from "@/pages/MatteMoisturizer";
import Navbar from "@/components/Navbar";
import LandingPage from "@/pages/LandingPage";

// Site-wide policy under test: every buy-intent CTA that ships — hero, sticky
// mobile bar, mid-page bands, the origin section, every content-page CTA, the
// navbar GET STARTED, and the /lp landing page — must route to the PDP
// (/face-cream) rather than adding to cart directly. A direct add locks the
// conversion to the $38 DEFAULT_TIER, skips the PDP's higher tiers and its
// view_item / Meta ViewContent signal, and (for deep-scroll CTAs specifically)
// fires Meta AddToCart with no preceding ViewContent. These tests exist to stop
// any of these buttons being "simplified" back to a direct add-to-cart call.
//
// Scope note: this covers every component reachable from a route, which is now
// all of them — the unreferenced components that still carried direct
// add-to-cart CTAs were deleted rather than converted. Any new buy CTA belongs
// in this file; nothing else enforces the policy.

// analytics.ts is being edited concurrently by another agent — mock it.
const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  setCapturedEmail: vi.fn(),
}));

// No component under test should import these anymore — mocked defensively so
// that if someone reintroduces a direct add-to-cart call (via
// useEarlyAccess().openModal() or the cart store directly), the test fails
// instead of silently passing.
const mockAddItem = vi.fn();
vi.mock("@/stores/cartStore", () => ({
  useCartStore: { getState: () => ({ addItem: mockAddItem, isLoading: false }) },
}));

const mockOpenModal = vi.fn();
vi.mock("@/context/EarlyAccessContext", () => ({
  useEarlyAccess: () => ({ isOpen: false, openModal: mockOpenModal, closeModal: vi.fn() }),
  EarlyAccessProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// jsdom has no IntersectionObserver. OurOriginSection uses one purely for a
// scroll-in-view animation, unrelated to the routing behavior under test —
// stub it so the component can mount.
beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  mockTrackEvent.mockClear();
  mockAddItem.mockClear();
  mockOpenModal.mockClear();
});

/** Shared assertion: a GRAB YOURS link routes to the PDP and never touches the cart. */
function expectPdpLinkNoCartAdd(link: Element | null, source: string) {
  expect(link).not.toBeNull();
  expect(link).toHaveAttribute("href", "/face-cream");

  fireEvent.click(link as Element);

  expect(mockTrackEvent).toHaveBeenCalledWith(
    "select_item",
    expect.objectContaining({ source })
  );
  expect(mockTrackEvent).not.toHaveBeenCalledWith("add_to_cart", expect.anything());
  expect(mockAddItem).not.toHaveBeenCalled();
  expect(mockOpenModal).not.toHaveBeenCalled();
}

describe("CTA funnel routing", () => {
  it("HeroSection primary CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getByRole } = render(<HeroSection />, { wrapper: MemoryRouter });
    const link = getByRole("link", { name: /grab yours/i });
    expectPdpLinkNoCartAdd(link, "hero");
  });

  it("StickyMobileCTA links to the PDP and never calls the add-to-cart path", () => {
    const { container } = render(<StickyMobileCTA />, { wrapper: MemoryRouter });
    const link = container.querySelector('a[href="/face-cream"]');
    expectPdpLinkNoCartAdd(link, "home_sticky_mobile");
  });

  it("MidPageCTA links to the PDP and never calls the add-to-cart path, passing through its source prop", () => {
    const { getByRole } = render(
      <MidPageCTA
        headline="Test Headline"
        subhead="Test subhead"
        ctaLabel="GRAB YOURS · $38 →"
        source="home_post_why"
      />,
      { wrapper: MemoryRouter }
    );
    const link = getByRole("link", { name: /grab yours/i });
    expectPdpLinkNoCartAdd(link, "home_post_why");
  });

  it("OurOriginSection CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getByRole } = render(<OurOriginSection />, { wrapper: MemoryRouter });
    const link = getByRole("link", { name: /grab yours/i });
    expectPdpLinkNoCartAdd(link, "origin_section");
  });

  it("A content page (MatteMoisturizer) GRAB YOURS CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getAllByRole } = render(<MatteMoisturizer />, { wrapper: MemoryRouter });
    const links = getAllByRole("link", { name: /grab yours/i });
    // Hero + bottom CTA, both present on this page.
    expect(links.length).toBeGreaterThanOrEqual(2);
    expectPdpLinkNoCartAdd(links[0], "matte_moisturizer_hero");
  });

  it("Navbar GET STARTED routes to the PDP on both desktop and mobile", () => {
    const { getAllByRole } = render(<Navbar />, { wrapper: MemoryRouter });
    // The mobile dropdown is always mounted (it animates via max-h), so both
    // the desktop and mobile CTAs are in the tree regardless of viewport.
    const links = getAllByRole("link", { name: /get started/i });
    expect(links).toHaveLength(2);
    expectPdpLinkNoCartAdd(links[0], "navbar");
    expectPdpLinkNoCartAdd(links[1], "navbar_mobile");
  });

  it("LandingPage (/lp) CTA routes to the PDP — the coldest traffic on the site", () => {
    const { getAllByRole } = render(<LandingPage />, { wrapper: MemoryRouter });
    const links = getAllByRole("link", { name: /try it risk-free/i });
    // Four CtaButton instances render down the page; all share one component.
    expect(links.length).toBeGreaterThanOrEqual(4);
    expectPdpLinkNoCartAdd(links[0], "landing_page");
  });
});
