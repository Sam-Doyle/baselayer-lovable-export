import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import FAQSection from "@/components/FAQSection";
import RefundPolicy from "@/pages/RefundPolicy";
import TermsOfService from "@/pages/TermsOfService";
import { FREE_SHIPPING_TERMS, GUARANTEE_WINDOW_PHRASE, LEGAL } from "@/config/legal";

// Policy text is real. Site chrome and head effects are outside this copy test.
vi.mock("@/components/Navbar", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/SEO", () => ({
  useCanonical: vi.fn(), useMetaTags: vi.fn(), JsonLd: () => null,
  buildBreadcrumbSchema: vi.fn(),
}));

afterEach(cleanup);

const expectedAnswer = "Your first order is covered by our 30-day guarantee. Contact us within 30 days from the date of purchase for a refund; no return shipment is required.";

describe("owner-approved purchase-date guarantee clock", () => {
  it("pins the chosen clock without changing duration or return requirements", () => {
    expect(LEGAL.guaranteeStart).toBe("purchase");
    expect(LEGAL.guaranteeDays).toBe(30);
    expect(LEGAL.requiresReturn).toBe(false);
    expect(GUARANTEE_WINDOW_PHRASE).toBe("30 days from the date of purchase");
  });

  it("opens and closes the actual homepage guarantee answer with purchase-date wording", () => {
    render(<FAQSection />);
    const trigger = screen.getByRole("button", { name: "What if it doesn't work for me?" });
    const answerContainer = trigger.nextElementSibling!;
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(answerContainer).toHaveStyle({ gridTemplateRows: "1fr" });
    expect(answerContainer).toHaveTextContent(expectedAnswer);
    expect(answerContainer).not.toHaveTextContent(/days (?:of|from|after) delivery/i);
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(answerContainer).toHaveStyle({ gridTemplateRows: "0fr" });
  });

  it("serializes the same purchase-date answer before any accordion input", () => {
    const markup = renderToStaticMarkup(<FAQSection />);
    expect(markup).toContain(expectedAnswer);
    expect(markup).not.toMatch(/30 days of delivery/i);
  });

  it("matches the existing refund request and out-of-window policy paragraphs", () => {
    render(<MemoryRouter><RefundPolicy /></MemoryRouter>);
    const request = screen.getByRole("heading", { name: "How to Request a Refund" }).closest("section")!;
    const outsideWindow = screen.getByRole("heading", { name: "Requests Outside the 30-Day Window" }).closest("section")!;
    expect(request).toHaveTextContent(`within ${GUARANTEE_WINDOW_PHRASE}`);
    expect(outsideWindow).toHaveTextContent(`after ${GUARANTEE_WINDOW_PHRASE}`);
    const coverage = screen.getByRole("heading", { name: "Guarantee Terms" }).closest("section")!;
    expect(coverage).toHaveTextContent("one refunded order per customer or household");
    expect(coverage).toHaveTextContent("first subscription order");
  });

  it("matches the existing terms-of-service guarantee clock", () => {
    render(<MemoryRouter><TermsOfService /></MemoryRouter>);
    const section = screen.getByRole("heading", { name: "Returns & Refunds" }).closest("section")!;
    expect(section).toHaveTextContent(`30-day money-back guarantee, measured ${GUARANTEE_WINDOW_PHRASE}`);
  });

  it("keeps the terms-page shipping promise conditional and linked to the full policy", () => {
    render(<MemoryRouter><TermsOfService /></MemoryRouter>);
    const section = screen.getByRole("heading", { name: "Shipping" }).closest("section")!;
    expect(section).toHaveTextContent(FREE_SHIPPING_TERMS);
    expect(section).not.toHaveTextContent(/Shipping is free on every order/i);
    expect(section.querySelector("a")).toHaveAttribute("href", "/shipping-policy");
  });
});
