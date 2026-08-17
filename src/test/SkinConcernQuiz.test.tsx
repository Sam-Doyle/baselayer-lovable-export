import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SkinConcernQuiz from "@/components/SkinConcernQuiz";
import { SKIN_QUIZ_PROMOTION } from "@/config/promotions";

const mockSubmitSkinQuizLead = vi.fn();
const mockApplyDiscountCode = vi.fn();

vi.mock("@/lib/skinQuiz", () => ({
  submitSkinQuizLead: (...args: unknown[]) => mockSubmitSkinQuizLead(...args),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  setCapturedEmail: vi.fn(),
}));

vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector: (state: { applyDiscountCode: typeof mockApplyDiscountCode }) => unknown) =>
    selector({ applyDiscountCode: mockApplyDiscountCode }),
}));

describe("SkinConcernQuiz", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockSubmitSkinQuizLead.mockReset();
    mockApplyDiscountCode.mockReset();
    mockSubmitSkinQuizLead.mockResolvedValue(undefined);
    mockApplyDiscountCode.mockResolvedValue({ success: true, applicable: true });
  });

  it("captures a concern and email before revealing and applying the 15% code", async () => {
    render(
      <MemoryRouter initialEntries={["/?quiz=preview"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    expect(await screen.findByText("What's your main skin concern?")).toBeInTheDocument();
    expect(screen.getByText("15% off", { selector: "strong" })).toHaveClass("font-black");
    fireEvent.click(screen.getByRole("button", { name: /oily \/ shiny/i }));

    expect(screen.getByText(/daily hydration designed to stay matte/i)).toBeInTheDocument();
    expect(screen.getByText("15% off", { selector: "strong" })).toHaveClass("font-bold");
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: " Test@Example.com " } });
    fireEvent.click(screen.getByRole("button", { name: /unlock 15% off/i }));

    await waitFor(() => {
      expect(mockSubmitSkinQuizLead).toHaveBeenCalledWith({
        email: "Test@Example.com",
        concern: "shine",
      });
    });
    expect(mockApplyDiscountCode).toHaveBeenCalledWith(SKIN_QUIZ_PROMOTION.code);
    expect(await screen.findByText(SKIN_QUIZ_PROMOTION.code)).toBeInTheDocument();
    expect(localStorage.getItem(SKIN_QUIZ_PROMOTION.storageKey)).toBe(SKIN_QUIZ_PROMOTION.code);
    expect(localStorage.getItem("bl_skin_quiz_completed")).toBe("true");
  });

  it("does not claim automatic application when Shopify marks the code inapplicable", async () => {
    mockApplyDiscountCode.mockResolvedValueOnce({ success: true, applicable: false });
    render(
      <MemoryRouter initialEntries={["/face-cream?quiz=preview"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /texture \/ fine lines/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /unlock 15% off/i }));

    expect(await screen.findByText(/use this code on your first one-time order/i)).toBeInTheDocument();
    expect(screen.queryByText(/applied automatically/i)).not.toBeInTheDocument();
  });

  it("keeps the email step open with a useful recovery message when capture fails", async () => {
    mockSubmitSkinQuizLead.mockRejectedValueOnce(new Error("offline"));
    render(
      <MemoryRouter initialEntries={["/face-cream?quiz=preview"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /dry \/ tight/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /unlock 15% off/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Check your email and try again");
    expect(screen.queryByText(SKIN_QUIZ_PROMOTION.code)).not.toBeInTheDocument();
    expect(mockApplyDiscountCode).not.toHaveBeenCalled();
  });
});
