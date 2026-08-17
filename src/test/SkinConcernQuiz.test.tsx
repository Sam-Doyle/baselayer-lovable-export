import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SkinConcernQuiz from "@/components/SkinConcernQuiz";
import { SKIN_QUIZ_PROMOTION } from "@/config/promotions";
import { SKIN_QUIZ_CONSENT_VERSION } from "@/lib/skinQuiz";

const mockSubmitSkinQuizLead = vi.fn();
const mockApplyDiscountCode = vi.fn();
let mockCartOpen = false;

vi.mock("@/lib/skinQuiz", () => ({
  SKIN_QUIZ_CONSENT_VERSION: "skin-quiz-email-v1",
  createSkinQuizSubmissionId: () => "09b3f156-9005-4dcc-b821-79ee70a4f90f",
  submitSkinQuizLead: (...args: unknown[]) => mockSubmitSkinQuizLead(...args),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
  setCapturedEmail: vi.fn(),
}));

vi.mock("@/stores/cartStore", () => ({
  useCartStore: (selector: (state: { applyDiscountCode: typeof mockApplyDiscountCode; isOpen: boolean }) => unknown) =>
    selector({ applyDiscountCode: mockApplyDiscountCode, isOpen: mockCartOpen }),
}));

describe("SkinConcernQuiz", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockSubmitSkinQuizLead.mockReset();
    mockApplyDiscountCode.mockReset();
    mockCartOpen = false;
    mockSubmitSkinQuizLead.mockResolvedValue(undefined);
    mockApplyDiscountCode.mockResolvedValue({ success: true, applicable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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
        submissionId: "09b3f156-9005-4dcc-b821-79ee70a4f90f",
        email: "Test@Example.com",
        concern: "shine",
        consent: {
          capturedAt: expect.any(String),
          disclosureVersion: SKIN_QUIZ_CONSENT_VERSION,
        },
        botSignals: {
          website: "",
          formStartedAt: expect.any(Number),
        },
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

    expect(await screen.findByRole("alert")).toHaveTextContent("check your connection and try again");
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText(SKIN_QUIZ_PROMOTION.code)).not.toBeInTheDocument();
    expect(mockApplyDiscountCode).not.toHaveBeenCalled();
  });

  it("reuses the submission ID when a durable write loses its browser response", async () => {
    mockSubmitSkinQuizLead
      .mockRejectedValueOnce(new Error("response lost"))
      .mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter initialEntries={["/face-cream?quiz=preview"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /dry \/ tight/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /unlock 15% off/i }));
    fireEvent.click(await screen.findByRole("button", { name: /try again/i }));

    await screen.findByText(SKIN_QUIZ_PROMOTION.code);
    expect(mockSubmitSkinQuizLead).toHaveBeenCalledTimes(2);
    const firstId = mockSubmitSkinQuizLead.mock.calls[0][0].submissionId;
    const retryId = mockSubmitSkinQuizLead.mock.calls[1][0].submissionId;
    expect(retryId).toBe(firstId);
  });

  it("waits for meaningful engagement instead of interrupting on page load", async () => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockReturnValue(0);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    expect(screen.queryByText("What's your main skin concern?")).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(14_999));
    expect(screen.queryByText("What's your main skin concern?")).not.toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.getByText("What's your main skin concern?")).toBeInTheDocument();
  });

  it("suppresses the quiz after a completed opt-in", async () => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockReturnValue(0);
    localStorage.setItem("bl_skin_quiz_completed", "true");
    render(
      <MemoryRouter initialEntries={["/"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    await act(async () => vi.advanceTimersByTime(20_000));
    expect(screen.queryByText("What's your main skin concern?")).not.toBeInTheDocument();
  });

  it("defers the engaged popup while the cart is open", async () => {
    vi.useFakeTimers();
    vi.spyOn(performance, "now").mockReturnValue(0);
    mockCartOpen = true;
    const { rerender } = render(
      <MemoryRouter initialEntries={["/"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );

    await act(async () => vi.advanceTimersByTime(15_000));
    expect(screen.queryByText("What's your main skin concern?")).not.toBeInTheDocument();

    mockCartOpen = false;
    rerender(
      <MemoryRouter initialEntries={["/"]}>
        <SkinConcernQuiz />
      </MemoryRouter>,
    );
    expect(screen.getByText("What's your main skin concern?")).toBeInTheDocument();
  });
});
