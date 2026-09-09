import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormulaEvidenceSection from "@/components/FormulaEvidenceSection";
import IngredientsShowcase from "@/components/IngredientsShowcase";

const ingredients = [
  { name: "Niacinamide", slug: "niacinamide", concentration: "5%" },
  { name: "Copper Peptide GHK-Cu", slug: "copper-peptide", concentration: "0.03%" },
  { name: "Panthenol", slug: "panthenol", concentration: "2%" },
  { name: "Centella Asiatica", slug: "centella-asiatica", concentration: "1%" },
  { name: "Squalane", slug: "squalane", concentration: null },
  { name: "Hyaluronic Acid", slug: "hyaluronic-acid", concentration: null },
] as const;

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    disconnect() {}
    unobserve() {}
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe.each([
  { name: "FormulaEvidenceSection", Component: FormulaEvidenceSection, cardSelector: "article" },
  { name: "IngredientsShowcase", Component: IngredientsShowcase, cardSelector: "a" },
])("$name ingredient disclosure", ({ Component, cardSelector }) => {
  const renderSection = () => render(<MemoryRouter><Component /></MemoryRouter>);

  it.each(ingredients)("publishes only the confirmed concentration for $name", (ingredient) => {
    renderSection();
    const card = screen.getByRole("heading", { name: ingredient.name, level: 3 }).closest(cardSelector);
    expect(card).not.toBeNull();
    const scoped = within(card as HTMLElement);

    if (ingredient.concentration) {
      expect(scoped.getByText(ingredient.concentration, { exact: true })).toBeInTheDocument();
      expect(card?.textContent?.match(/\d+(?:\.\d+)?%/g)).toEqual([ingredient.concentration]);
    } else {
      expect(card).not.toHaveTextContent(/\d+(?:\.\d+)?%/);
      expect(scoped.queryByText("Formula concentration")).not.toBeInTheDocument();
    }
  });

  it("does not promise a published concentration for every ingredient", () => {
    const { container } = renderSection();
    expect(container).not.toHaveTextContent(/every dose disclosed|every concentration disclosed|concentration of every highlighted ingredient|six key ingredients at disclosed concentrations/i);
  });

  it("retains all six ingredient detail links and the ingredient index link", () => {
    const { container } = renderSection();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(7);
    for (const ingredient of ingredients) {
      expect(container.querySelectorAll(`a[href="/ingredients/${ingredient.slug}"]`)).toHaveLength(1);
    }
    expect(container.querySelectorAll('a[href="/ingredients"]')).toHaveLength(1);
  });
});

it("uses factual formula copy and preserves the full INCI", () => {
  render(<MemoryRouter><FormulaEvidenceSection /></MemoryRouter>);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Six key ingredients. One daily formula.");
  expect(screen.getByText("See why each ingredient is included. Full INCI below.")).toBeInTheDocument();
  expect(screen.getByText("Water (Aqua), Simmondsia Chinensis (Jojoba) Seed Oil, Niacinamide, Polyacrylamide, Panthenol, Copper Tripeptide-1, Centella Asiatica Extract, Sodium Hyaluronate, Prunus Armeniaca (Apricot) Kernel Oil, Squalane, Glycerin, C13-14 Isoparaffin, Laureth-7, Phenoxyethanol, Ethylhexylglycerin, Disodium EDTA.")).toBeInTheDocument();
});

it("preserves all six lazy-loaded ingredient images", () => {
  render(<MemoryRouter><IngredientsShowcase /></MemoryRouter>);
  expect(screen.getAllByRole("img")).toHaveLength(6);
  for (const ingredient of ingredients) {
    const image = screen.getByRole("img", { name: ingredient.name });
    const imageName = ingredient.slug === "centella-asiatica" ? "centella" : ingredient.slug;
    expect(image).toHaveAttribute("src", `/images/ingredients/${imageName}.png`);
    expect(image).toHaveAttribute("srcset", `/images/ingredients/responsive/${imageName}-240w.webp 240w, /images/ingredients/responsive/${imageName}-480w.webp 480w`);
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("width", "500");
    expect(image).toHaveAttribute("height", "500");
  }
});
