import { BadgeCheck } from "lucide-react";
import StarRating from "@/components/StarRating";
import { selectCustomerProofReview } from "@/lib/customerProof";
import { hasReviews, reviewAggregate, reviews } from "@/lib/reviews";

/**
 * Compact, near-offer social proof sourced only from the committed Judge.me
 * snapshot. Compensated product testers intentionally remain in the separate
 * testimonial section, where their material connection is disclosed.
 */
const CustomerProofStrip = () => {
  if (!hasReviews) return null;

  const review = selectCustomerProofReview(reviews);
  if (!review) return null;

  const photo = review.pictures[0];

  return (
    <aside
      aria-label="Customer review highlight"
      className="border border-[#D8DEE7] bg-[#F8FAFC] p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        {photo && (
          <img
            src={photo}
            alt={`Customer photo from ${review.reviewer}'s review`}
            loading="lazy"
            width={72}
            height={72}
            className="h-[72px] w-[72px] shrink-0 object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">
              Customer review
            </span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 font-body text-[11px] font-semibold text-[#1F7A4D]">
                <BadgeCheck className="h-[13px] w-[13px]" aria-hidden="true" />
                Verified Purchase
              </span>
            )}
          </div>

          <div className="mt-1.5">
            <StarRating rating={review.rating} />
          </div>

          <blockquote className="mt-2 font-body text-[13px] leading-[1.5] text-[#2D3748] sm:text-[14px]">
            “{review.body}”
          </blockquote>

          <p className="mt-2 font-heading text-[12px] font-semibold text-[#1A2F4C]">
            {review.reviewer}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[#E2E8F0] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="#reviews"
          className="w-fit font-body text-[12px] font-semibold text-[#1A2F4C] underline decoration-[#AAB4C3] underline-offset-[3px] hover:decoration-[#1A2F4C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C]"
          aria-label={`${reviewAggregate.rating.toFixed(1)} from ${reviewAggregate.count} ${reviewAggregate.count === 1 ? "review" : "reviews"} · Read all customer reviews`}
        >
          {reviewAggregate.rating.toFixed(1)} from {reviewAggregate.count}{" "}
          {reviewAggregate.count === 1 ? "review" : "reviews"} · Read all
        </a>
        <p className="font-body text-[10px] leading-[1.4] text-[#6B7280] sm:text-right">
          Customer reviews via Judge.me.
        </p>
      </div>
    </aside>
  );
};

export default CustomerProofStrip;
