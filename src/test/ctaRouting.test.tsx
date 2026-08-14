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

// Site-wide policy under test: every buy-intent CTA routes to the PDP rather
// than adding to cart directly. Homepage CTAs include offer=single so the PDP
// honors the $38 price on the button; other routes preserve the PDP's global
// default. Both paths retain view_item / Meta ViewContent before add-to-cart.
// For deep-scroll CTAs, a direct add also
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
const mockToggleCart = vi.fn();
vi.mock("@/stores/cartStore", () => ({
  useCartStore: Object.assign(
    (selector: (state: { items: never[]; toggleCart: typeof mockToggleCart }) => unknown) =>
      selector({ items: [], toggleCart: mockToggleCart }),
    { getState: () => ({ addItem: mockAddItem, isLoading: false }) },
  ),
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
  mockToggleCart.mockClear();
  mockOpenModal.mockClear();
});

/** Shared assertion: a purchase link routes to the PDP and never touches the cart. */
function expectPdpLinkNoCartAdd(link: Element | null, source: string, expectedHref = "/face-cream") {
  expect(link).not.toBeNull();
  expect(link).toHaveAttribute("href", expectedHref);

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
  it("HeroSection leads with a verified individual review instead of a weak aggregate count", () => {
    const { getByRole, getByText, queryByText } = render(<HeroSection />, { wrapper: MemoryRouter });

    expect(
      getByRole("link", { name: /rated 5 out of 5 by mark, verified buyer/i }),
    ).toHaveAttribute("href", "/face-cream#reviews");
    expect(getByText(/so smooth going on, no grease or shine/i)).toBeInTheDocument();
    expect(queryByText(/from 5 customer reviews/i)).not.toBeInTheDocument();
  });

  it("HeroSection primary CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getByRole } = render(<HeroSection />, { wrapper: MemoryRouter });
    const link = getByRole("link", { name: /get base layer/i });
    expectPdpLinkNoCartAdd(link, "hero", "/face-cream?offer=single");
  });

  it("StickyMobileCTA links to the PDP and never calls the add-to-cart path", () => {
    const { container } = render(<StickyMobileCTA />, { wrapper: MemoryRouter });
    const link = container.querySelector('a[href="/face-cream?offer=single"]');
    expectPdpLinkNoCartAdd(link, "home_sticky_mobile", "/face-cream?offer=single");
  });

  it("MidPageCTA links to the PDP and never calls the add-to-cart path, passing through its source prop", () => {
    const { getByRole } = render(
      <MidPageCTA
        headline="Test Headline"
        subhead="Test subhead"
        ctaLabel="GET BASE LAYER · $38 →"
        source="home_post_why"
      />,
      { wrapper: MemoryRouter }
    );
    const link = getByRole("link", { name: /get base layer/i });
    expectPdpLinkNoCartAdd(link, "home_post_why", "/face-cream?offer=single");
  });

  it("OurOriginSection CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getByRole } = render(<OurOriginSection />, { wrapper: MemoryRouter });
    const link = getByRole("link", { name: /get base layer/i });
    expectPdpLinkNoCartAdd(link, "origin_section", "/face-cream?offer=single");
  });

  it("A content page (MatteMoisturizer) GRAB YOURS CTA links to the PDP and never calls the add-to-cart path", () => {
    const { getAllByRole } = render(<MatteMoisturizer />, { wrapper: MemoryRouter });
    const links = getAllByRole("link", { name: /grab yours/i });
    // Hero + bottom CTA, both present on this page.
    expect(links.length).toBeGreaterThanOrEqual(2);
    expectPdpLinkNoCartAdd(links[0], "matte_moisturizer_hero");
  });

  it("Navbar GET BASE LAYER routes to the matching homepage offer on desktop and mobile", () => {
    const firstRender = render(<Navbar />, { wrapper: MemoryRouter });
    // Both controls remain mounted for responsive layout even when visually
    // hidden, so query the DOM rather than the accessibility tree.
    const links = Array.from(firstRender.container.querySelectorAll('a[href="/face-cream?offer=single"]'))
      .filter((link) => link.textContent?.includes("GET BASE LAYER"));
    expect(links).toHaveLength(2);
    expectPdpLinkNoCartAdd(links[0], "navbar", "/face-cream?offer=single");
    firstRender.unmount();

    // Clicking the first link changes MemoryRouter's location and intentionally
    // removes the homepage-only query from Navbar, so mount fresh for mobile.
    const secondRender = render(<Navbar />, { wrapper: MemoryRouter });
    const mobileLink = Array.from(secondRender.container.querySelectorAll('a[href="/face-cream?offer=single"]'))
      .filter((link) => link.textContent?.includes("GET BASE LAYER"))[1];
    expectPdpLinkNoCartAdd(mobileLink, "navbar_mobile", "/face-cream?offer=single");
  });

  it("LandingPage (/lp) CTA routes to the PDP — the coldest traffic on the site", () => {
    const { getAllByRole } = render(<LandingPage />, { wrapper: MemoryRouter });
    const links = getAllByRole("link", { name: /try it risk-free/i });
    // Four CtaButton instances render down the page; all share one component.
    expect(links.length).toBeGreaterThanOrEqual(4);
    expectPdpLinkNoCartAdd(links[0], "landing_page");
  });
});
