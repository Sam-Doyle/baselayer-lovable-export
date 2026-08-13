import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProofStrip from "@/components/ProofStrip";

describe("ProofStrip", () => {
  it("leads with the clinical-actives proof point", () => {
    render(<ProofStrip />);

    expect(screen.getByText("Niacinamide + Peptides")).toBeInTheDocument();
    expect(screen.getByText("Clinical Actives")).toBeInTheDocument();
    expect(screen.queryByText("Early testers")).not.toBeInTheDocument();
  });
});
