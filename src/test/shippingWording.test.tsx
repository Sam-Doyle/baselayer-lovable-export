import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import type { CartItem } from "@/stores/cartStore";
import { BUY_TIERS, buildCartItem, tierCtaLabel } from "@/config/product";
import { FREE_SHIPPING_PHRASE, FREE_SHIPPING_SUBSCRIPTION_TERMS, FREE_SHIPPING_TERMS, LEGAL } from "@/config/legal";
import { merchantOfferFields } from "@/config/merchantSchema";
import { metaFor } from "@/config/pageSeo";
import Navbar from "@/components/Navbar";
import ProofStrip from "@/components/ProofStrip";
import HeroSection from "@/components/HeroSection";
import OurOriginSection from "@/components/OurOriginSection";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import ShopifyCartDrawer from "@/components/ShopifyCartDrawer";
import ShippingPolicy from "@/pages/ShippingPolicy";
import FaceCream from "@/pages/FaceCream";
import LandingPage from "@/pages/LandingPage";
import OneBottleExperiment from "@/pages/advertorials/OneBottleExperiment";
import ConcentrationTest from "@/pages/advertorials/ConcentrationTest";
import PeptideStack from "@/pages/advertorials/PeptideStack";
import AllInOneSkincare from "@/pages/AllInOneSkincare";
import NonGreasyMoisturizer from "@/pages/NonGreasyMoisturizer";

const state = vi.hoisted(() => ({
  items: [] as CartItem[], cost: null, isOpen: true, isLoading: false,
  isSyncing: false, needsSync: false, addItem: vi.fn(), updateQuantity: vi.fn(),
  removeItem: vi.fn(), getCheckoutUrl: vi.fn(), syncCart: vi.fn(), toggleCart: vi.fn(),
}));
vi.mock("@/stores/cartStore", () => ({
  useCartStore: Object.assign((selector?: (store: typeof state) => unknown) => selector ? selector(state) : state, { getState: () => state }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/lifecycle", () => ({ trackLifecycleProductViewed: vi.fn() }));
vi.mock("@/components/SEO", () => ({
  useCanonical: vi.fn(), useMetaTags: vi.fn(), JsonLd: () => null,
  buildBreadcrumbSchema: vi.fn(), buildFaqSchema: vi.fn(),
}));

class MockObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

function renderRoute(element: ReactElement, route = "/") {
  return render(<MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>);
}

beforeEach(() => {
  vi.clearAllMocks();
  state.items = [];
  vi.stubGlobal("IntersectionObserver", MockObserver);
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Shipping copy verification forbids network"); }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("verified SHIP26 copy", () => {
  it("states the exact rate exclusion and subscription limit without changing rates or guarantee", () => {
    expect(FREE_SHIPPING_PHRASE).toBe("Free eligible U.S. shipping");
    expect(FREE_SHIPPING_TERMS).toBe("Free eligible U.S. shipping with SHIP26. Shipping rates over $10 are excluded. No minimum purchase. For subscriptions, SHIP26 applies to the first payment only, not renewals.");
    expect(LEGAL.freeShippingOnAllOrders).toBe(false);
    expect(LEGAL.standardShippingPriceUsd).toBe(5.95);
    expect(LEGAL.freeShippingThresholdUsd).toBe(60);
    expect(LEGAL.guaranteeDays).toBe(30);
    expect(LEGAL.guaranteeStart).toBe("purchase");
    expect(LEGAL.requiresReturn).toBe(false);
    // These are initial one-time Offer fields, not a subscription schedule.
    expect(merchantOfferFields("38.00").shippingDetails.shippingRate).toEqual({
      "@type": "MonetaryAmount", value: "0", currency: "USD",
    });
  });

  it("renders rate eligibility, not a standard-only or $10-credit promise, in Shipping Costs", () => {
    renderRoute(<ShippingPolicy />, "/shipping-policy");
    const section = screen.getByRole("heading", { name: "Shipping Costs" }).closest("section")!;
    expect(section).toHaveTextContent(FREE_SHIPPING_TERMS);
    expect(section).toHaveTextContent("$5.95");
    expect(section).toHaveTextContent("$60");
    expect(section).toHaveTextContent("excluded from the promotion, not reduced by $10");
    expect(section).toHaveTextContent("Shopify confirms eligibility and the final shipping charge at checkout");
    expect(section).not.toHaveTextContent(/standard U\.S\. shipping only|free regardless of order value/i);
    expect(screen.getByText("Effective date: September 9, 2026")).toBeInTheDocument();
  });

  it("shares the qualified shipping description between browser and prerender metadata", () => {
    const description = metaFor("/shipping-policy").description;
    expect(description).toContain("free eligible U.S. shipping");
    expect(description).toContain("Rates over $10 excluded; no minimum");
    expect(description).toContain("first payment only");
    expect(description).not.toContain("standard shipping");
  });

  it("links the concise announcement to terms without changing its 28px container", () => {
    renderRoute(<Navbar />);
    const link = screen.getByRole("link", { name: /SHIP26.*shipping terms/i });
    expect(link).toHaveAttribute("href", "/shipping-policy");
    expect(link).toHaveTextContent("FREE ELIGIBLE U.S. SHIPPING");
    expect(link.parentElement).toHaveClass("h-[28px]");
  });

  it("replaces the homepage proof-strip free assertion with a terms link", () => {
    render(<ProofStrip />);
    expect(screen.getByRole("link", { name: "SHIP26 shipping terms" })).toHaveAttribute("href", "/shipping-policy");
    expect(screen.getByText("Free eligible U.S. shipping")).toBeInTheDocument();
    expect(screen.queryByText("Free", { exact: true })).not.toBeInTheDocument();
    expect(screen.getAllByText("Published concentration")).toHaveLength(2);
  });

  it.each([
    ["hero", <HeroSection />], ["origin", <OurOriginSection />], ["landing page", <LandingPage />],
  ])("qualifies the existing shared phrase in %s without editing its component", (_name, element) => {
    const { container } = renderRoute(element as ReactElement);
    expect(container.textContent?.toLowerCase()).toContain(FREE_SHIPPING_PHRASE.toLowerCase());
  });

  it("keeps the hidden homepage sticky shipping link out of the tab order", () => {
    const { container } = renderRoute(<StickyMobileCTA />);
    const terms = container.querySelector('a[href="/shipping-policy"]')!;
    expect(terms).toHaveTextContent("Shipping terms");
    expect(terms).toHaveAttribute("tabindex", "-1");
    expect(container).not.toHaveTextContent("Free shipping");
    expect(container.querySelector('a[href="/face-cream?offer=single"]')).toHaveTextContent("GET 1 BOTTLE · $38");
  });

  it("switches PDP offers without promising renewal shipping or changing purchase labels", () => {
    const { container } = renderRoute(<FaceCream />, "/face-cream?offer=single");
    fireEvent.click(screen.getByRole("button", { name: "See 2-bottle & subscription options" }));
    for (const tier of [BUY_TIERS[0], BUY_TIERS[2], BUY_TIERS[1]]) {
      fireEvent.click(container.querySelector(`input[value="${tier.id}"]`)!);
      expect(container.querySelector("[data-pdp-primary-cta]")).toHaveTextContent(tierCtaLabel(tier));
      const terms = container.querySelector('[data-pdp-sticky-cta] a[href="/shipping-policy"]')!;
      expect(terms).toHaveTextContent("Shipping terms");
      expect(terms).toHaveAttribute("tabindex", "0");
      if (tier.kind === "subscription") {
        expect(screen.getByText((_content, element) => element?.tagName === "P" && element.textContent === `${tier.subCopy} ${FREE_SHIPPING_SUBSCRIPTION_TERMS}`)).toBeInTheDocument();
      }
    }
    fireEvent.click(screen.getByRole("button", { name: "Shipping & returns" }));
    expect(screen.getByText((_, element) => element?.hasAttribute("data-state") === true && element.textContent?.startsWith(FREE_SHIPPING_TERMS) === true)).toBeInTheDocument();
    expect(state.addItem).not.toHaveBeenCalled();
  });

  it.each(["single", "subscription", "mixed"])("does not quote FREE before checkout for a %s cart", kind => {
    state.items = (kind === "single" ? [BUY_TIERS[0]] : kind === "subscription" ? [BUY_TIERS[2]] : [BUY_TIERS[0], BUY_TIERS[2]])
      .map(tier => ({ ...buildCartItem(tier), lineId: `test-${tier.id}` }));
    const { container } = render(<ShopifyCartDrawer />);
    expect(container).toHaveTextContent("Calculated at checkout");
    expect(container).toHaveTextContent(FREE_SHIPPING_TERMS);
    expect(screen.getByRole("link", { name: "Shipping terms" })).toHaveAttribute("href", "/shipping-policy");
    expect(screen.getByRole("link", { name: "Shipping terms" })).toHaveClass("whitespace-nowrap");
    expect(container).not.toHaveTextContent(/FREE · SHIP26|Same free shipping either way/);
    expect(screen.getByRole("button", { name: "Checkout" })).toBeEnabled();
    expect(state.addItem).not.toHaveBeenCalled();
  });

  it.each([
    ["one bottle", <OneBottleExperiment />], ["concentration", <ConcentrationTest />], ["peptide", <PeptideStack />],
  ])("renders full shipping terms beside %s advertorial offers", (_name, element) => {
    const { container } = renderRoute(element as ReactElement);
    expect(container).toHaveTextContent(FREE_SHIPPING_TERMS);
    expect(screen.getByRole("link", { name: "Shipping terms" })).toHaveAttribute("href", "/shipping-policy");
    expect(container).not.toHaveTextContent(/shipping on every order|Every order ships free/i);
  });

  it.each([
    ["all in one", <AllInOneSkincare />], ["non greasy", <NonGreasyMoisturizer />],
  ])("qualifies the %s subscription FAQ while retaining the offer prices", (_name, element) => {
    renderRoute(element as ReactElement);
    fireEvent.click(screen.getByRole("button", { name: "Is there a subscription?" }));
    const panel = screen.getByRole("region", { name: "Is there a subscription?" });
    expect(panel).toHaveTextContent(FREE_SHIPPING_TERMS);
    expect(panel).toHaveTextContent("$38");
    expect(panel).toHaveTextContent("$68");
    expect(panel).toHaveTextContent("$35 every delivery");
    expect(within(panel).queryByText(/shipping is free (?:on both|either way)/)).not.toBeInTheDocument();
  });
});
