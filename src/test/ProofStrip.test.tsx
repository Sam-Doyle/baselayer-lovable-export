import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProofStrip from "@/components/ProofStrip";

describe("ProofStrip", () => {
  it("leads with published formula concentrations", () => {
    render(<ProofStrip />);

    expect(screen.getByText("5% Niacinamide")).toBeInTheDocument();
    expect(screen.getByText("2% Panthenol")).toBeInTheDocument();
    expect(screen.getAllByText("Published concentration")).toHaveLength(2);
    expect(screen.queryByText("Early testers")).not.toBeInTheDocument();
  });
});
