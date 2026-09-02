import { ArrowUpRight } from "lucide-react";
import { PRODUCT_REVIEW_URL } from "@/config/reviews";

const ReviewCollectionCta = () => (
  <div className="mt-12 border border-[#CBD5E1] bg-white px-6 py-7 text-center">
    <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
      For Base Layer customers
    </p>
    <p className="mt-2 font-heading text-[17px] font-semibold text-[#1A2F4C]">
      Share what worked—and what didn&apos;t.
    </p>
    <a
      href={PRODUCT_REVIEW_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Write a product review for Performance Daily Face Cream on Judge.me (opens in a new tab)"
      className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#1A2F4C] bg-[#1A2F4C] px-7 py-3 font-body text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-[#1A2F4C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2"
    >
      Write a review
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  </div>
);

export default ReviewCollectionCta;
