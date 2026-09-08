import type { BuyTier } from "@/config/product";

interface PurchaseOptionsProps {
  options: readonly BuyTier[];
  selectedId: number;
  onSelect: (id: number) => void;
}

/** Native radios preserve arrow-key navigation and explicit purchase selection. */
const PurchaseOptions = ({ options, selectedId, onSelect }: PurchaseOptionsProps) => (
  <fieldset className="mb-3 min-w-0">
    <legend className="sr-only">Choose your purchase option</legend>
    <div className="grid gap-2">
      {options.map((option) => (
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
  </fieldset>
);

export default PurchaseOptions;
