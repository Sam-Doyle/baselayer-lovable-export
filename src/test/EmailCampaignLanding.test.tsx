import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EmailCampaignLanding from "@/components/EmailCampaignLanding";
import { SKIN_QUIZ_PROMOTION } from "@/config/promotions";

const mockApplyDiscountCode = vi.fn();

vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector: (state: { applyDiscountCode: typeof mockApplyDiscountCode }) => unknown) =>
    selector({ applyDiscountCode: mockApplyDiscountCode }),
}));

describe("EmailCampaignLanding", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    mockApplyDiscountCode.mockReset();
    mockApplyDiscountCode.mockResolvedValue({ success: true, applicable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("scrolls the hydrated target instead of a duplicate prerender ID", async () => {
    document.body.innerHTML = '<div id="bl-prerender-root"><div id="formula"></div></div><div id="root"></div>';
    const root = document.getElementById("root")!;
    const scrollSpy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollSpy,
    });

    render(
      <MemoryRouter initialEntries={["/face-cream?utm_medium=email&utm_campaign=welcome#formula"]}>
        <EmailCampaignLanding />
        <div id="formula">Hydrated formula</div>
      </MemoryRouter>,
      { container: root },
    );

    await act(async () => vi.advanceTimersByTime(1));

    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy.mock.instances[0]).toBe(root.querySelector("#formula"));
    expect(scrollSpy.mock.instances[0]).not.toBe(document.querySelector("#bl-prerender-root #formula"));
  });

  it("persists and applies the promised SKIN15 code", async () => {
    document.body.innerHTML = '<div id="root"></div>';
    render(
      <MemoryRouter initialEntries={["/face-cream?utm_medium=email&discount=SKIN15#offer"]}>
        <EmailCampaignLanding />
        <div id="offer">Offer</div>
      </MemoryRouter>,
      { container: document.getElementById("root")! },
    );

    await act(async () => vi.advanceTimersByTime(1));

    expect(localStorage.getItem(SKIN_QUIZ_PROMOTION.storageKey)).toBe(SKIN_QUIZ_PROMOTION.code);
    expect(mockApplyDiscountCode).toHaveBeenCalledWith(SKIN_QUIZ_PROMOTION.code);
  });
});
