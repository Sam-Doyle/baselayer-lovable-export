import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FaceCream from "@/pages/FaceCream";
import { AVAILABLE_TIERS, buildCartItem, tierCtaLabel } from "@/config/product";

const state = vi.hoisted(() => ({
  addItem: vi.fn(), isLoading: false, items: [], toggleCart: vi.fn(),
}));
const trackEvent = vi.hoisted(() => vi.fn());
vi.mock("@/stores/cartStore", () => ({
  useCartStore: Object.assign((selector: (store: typeof state) => unknown) => selector(state), { getState: () => state }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent }));
vi.mock("@/lib/lifecycle", () => ({ trackLifecycleProductViewed: vi.fn() }));
vi.mock("@/components/SEO", () => ({
  useCanonical: vi.fn(), useMetaTags: vi.fn(), JsonLd: () => null,
  buildBreadcrumbSchema: vi.fn(), buildFaqSchema: vi.fn(),
}));

const observers: Array<{ callback: IntersectionObserverCallback; target?: Element }> = [];
class MockObserver {
  record: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback };
    observers.push(this.record);
  }
  observe(target: Element) { this.record.target = target; }
  disconnect() {}
  unobserve() {}
}

function Navigation() {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/face-cream?offer=single")}>Open advertised single offer</button>;
}

beforeEach(() => {
  vi.clearAllMocks();
  observers.length = 0;
  state.isLoading = false;
  state.addItem.mockResolvedValue({ success: true });
  vi.stubGlobal("IntersectionObserver", MockObserver);
});

describe("PDP purchase journey", () => {
  it.each([
    ["single", 1], ["two", 2], ["subscription", 3], ["unknown", 2],
  ])("honors offer=%s and sends the exact selected Shopify line", async (offer, tierId) => {
    const tier = AVAILABLE_TIERS.find(t => t.id === tierId)!;
    const { container } = render(<MemoryRouter initialEntries={[`/face-cream?offer=${offer}`]}><FaceCream /></MemoryRouter>);
    expect(container.querySelector(`input[value="${tierId}"]`)).toBeChecked();
    const cta = container.querySelector("[data-pdp-primary-cta]")!;
    expect(cta).toHaveTextContent(tierCtaLabel(tier));
    expect(container.querySelector("[data-pdp-sticky-cta] button")).toHaveTextContent(tierCtaLabel(tier));
    fireEvent.click(cta);
    await waitFor(() => expect(state.addItem).toHaveBeenCalledWith(buildCartItem(tier)));
    expect(trackEvent).toHaveBeenCalledWith("add_to_cart", expect.objectContaining({ value: tier.price, source: "buy_box" }));
  });

  it("updates every CTA when switching options and strips the selling plan for one-time purchases", async () => {
    const { container } = render(<MemoryRouter initialEntries={["/face-cream?offer=single"]}><FaceCream /></MemoryRouter>);
    for (const tier of [AVAILABLE_TIERS[2], AVAILABLE_TIERS[1], AVAILABLE_TIERS[0]]) {
      fireEvent.click(container.querySelector(`input[value="${tier.id}"]`)!);
      expect(container.querySelector("[data-pdp-primary-cta]")).toHaveTextContent(tierCtaLabel(tier));
      const sticky = container.querySelector("[data-pdp-sticky-cta] button")!;
      expect(sticky).toHaveTextContent(tierCtaLabel(tier));
      fireEvent.click(sticky);
      await waitFor(() => expect(state.addItem).toHaveBeenLastCalledWith(buildCartItem(tier)));
    }
    expect(state.addItem.mock.lastCall?.[0].sellingPlanId).toBeNull();
  });

  it("updates the offer after same-page navigation, not only the first mount", async () => {
    const { container } = render(<MemoryRouter initialEntries={["/face-cream?offer=subscription"]}><Navigation /><FaceCream /></MemoryRouter>);
    fireEvent.click(screen.getByText("Open advertised single offer"));
    await waitFor(() => expect(container.querySelector('input[value="1"]')).toBeChecked());
    expect(container.querySelector("[data-pdp-primary-cta]")).toHaveTextContent("ADD 1 BOTTLE · $38");
  });

  it("does not report a successful cart add when Shopify rejects it", async () => {
    state.addItem.mockResolvedValue({ success: false });
    const { container } = render(<MemoryRouter><FaceCream /></MemoryRouter>);
    fireEvent.click(container.querySelector("[data-pdp-primary-cta]")!);
    await act(async () => {});
    expect(trackEvent.mock.calls.filter(([event]) => event === "add_to_cart")).toHaveLength(0);
  });

  it("disables all purchase buttons while a cart request is in flight", () => {
    state.isLoading = true;
    const { container } = render(<MemoryRouter><FaceCream /></MemoryRouter>);
    expect(container.querySelector("[data-pdp-primary-cta]")).toBeDisabled();
    expect(container.querySelector("[data-pdp-sticky-cta] button")).toBeDisabled();
    fireEvent.click(container.querySelector("[data-pdp-primary-cta]")!);
    expect(state.addItem).not.toHaveBeenCalled();
  });

  it("hides the sticky button only when the complete inline CTA is visible", () => {
    const { container } = render(<MemoryRouter><FaceCream /></MemoryRouter>);
    const observer = observers.find(o => o.target?.hasAttribute("data-pdp-primary-cta"))!;
    const sticky = container.querySelector("[data-pdp-sticky-cta]")!;
    for (const ratio of [0, 0.5, 1, 0]) {
      act(() => observer.callback([{ intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver));
      expect(sticky).toHaveAttribute("aria-hidden", String(ratio === 1));
      expect(sticky.querySelector("button")).toHaveAttribute("tabindex", ratio === 1 ? "-1" : "0");
    }
  });

  it("places verified customer proof immediately after purchase reassurance, before ingredient detail", () => {
    const { container } = render(<MemoryRouter><FaceCream /></MemoryRouter>);
    const proof = container.querySelector("[data-pdp-customer-proof]")!;
    const primary = container.querySelector("[data-pdp-primary-cta]")!;
    expect(primary.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof.compareDocumentPosition(container.querySelector("#formula")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof).toHaveTextContent("Verified Purchase");
    const link = proof.querySelector("a")!;
    expect(container.querySelector(link.getAttribute("href")!)).toBeInTheDocument();
  });
});
