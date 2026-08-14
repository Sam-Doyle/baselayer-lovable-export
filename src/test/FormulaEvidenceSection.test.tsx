import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import FormulaEvidenceSection from "@/components/FormulaEvidenceSection";

const renderSection = () =>
  render(
    <MemoryRouter>
      <FormulaEvidenceSection />
    </MemoryRouter>,
  );

describe("FormulaEvidenceSection", () => {
  it("shows all six published formula concentrations", () => {
    const { container } = renderSection();

    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("0.03%")).toBeInTheDocument();
    expect(screen.getAllByText("2%")).toHaveLength(2);
    expect(screen.getByText("3%")).toBeInTheDocument();
    expect(screen.getByText("0.5%")).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/clinically proven/i);
  });

  it("publishes the full INCI without internal evidence disclaimers", () => {
    renderSection();

    expect(screen.getByText(/Water \(Aqua\).*Disodium EDTA/i)).toBeInTheDocument();
    expect(screen.queryByText(/concentration not published/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/finished-product clinical trial/i)).not.toBeInTheDocument();
  });

  it("links every highlighted ingredient to its existing detail route", () => {
    renderSection();

    const expectedRoutes = [
      "/ingredients/niacinamide",
      "/ingredients/copper-peptide",
      "/ingredients/panthenol",
      "/ingredients/centella-asiatica",
      "/ingredients/squalane",
      "/ingredients/hyaluronic-acid",
    ];

    for (const route of expectedRoutes) {
      expect(document.querySelector(`a[href="${route}"]`)).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: /see all ingredient details/i })).toHaveAttribute(
      "href",
      "/ingredients",
    );
  });
});
