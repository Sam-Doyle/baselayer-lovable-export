import type { BuyTier } from "@/config/product";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

interface PurchaseOptionsProps {
  options: readonly BuyTier[];
  selectedId: number;
  onSelect: (id: number) => void;
  collapseAlternatives?: boolean;
}

/** Native radios preserve arrow-key navigation and explicit purchase selection. */
const PurchaseOptions = ({ options, selectedId, onSelect, collapseAlternatives = false }: PurchaseOptionsProps) => {
  const [expanded, setExpanded] = useState(false);
  const optionsId = useId();
  const showAll = !collapseAlternatives || expanded;
  const visibleOptions = showAll ? options : options.filter(option => option.id === selectedId);
  const singleSelected = options.some(option => option.id === selectedId && option.kind === "one-time" && option.bottles === 1);

  return <fieldset className="mb-3 min-w-0">
    <legend className="sr-only">Choose your purchase option</legend>
    {collapseAlternatives && options.length > 1 && (
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={optionsId}
        onClick={() => setExpanded(value => !value)}
        className="mb-1 flex min-h-11 w-full items-center justify-between gap-2 px-1 text-left font-body text-[12px] text-[#4A5568] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
      >
        {expanded ? "Show fewer purchase options" : singleSelected ? "See 2-bottle & subscription options" : "Change purchase option"}
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
    )}
    <div id={optionsId} className="grid gap-2">
      {visibleOptions.map((option) => (
        <label
          key={option.id}
          className={`flex min-h-16 cursor-pointer items-center gap-3 border-2 px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-[#1A2F4C] focus-within:ring-offset-2 ${selectedId === option.id ? "border-[#1A2F4C] bg-[#F1F5F9]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]"}`}
        >
          <input
            type="radio"
            name="pdp-purchase-option"
            value={option.id}
            checked={selectedId === option.id}
            onChange={() => onSelect(option.id)}
            className="h-4 w-4 shrink-0 accent-[#1A2F4C]"
          />
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2 font-heading font-bold text-[#1A2F4C]">
              <span className="text-[14px]">{option.label}</span>
              <span className="shrink-0 text-[18px] leading-6">${option.price}</span>
            </span>
            <span className="block font-body text-[12px] leading-[1.5] text-[#4A5568]">
              {option.kind === "subscription"
                ? `1 bottle ${option.duration} · cancel anytime`
                : option.bottles > 1
                  ? `$${option.price / option.bottles} each · save $${option.savings} · one-time`
                  : "One-time purchase · no subscription"}
            </span>
          </span>
        </label>
      ))}
    </div>
  </fieldset>;
};

export default PurchaseOptions;
