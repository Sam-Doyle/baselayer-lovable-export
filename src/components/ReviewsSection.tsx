import { Star, BadgeCheck } from "lucide-react";
import { reviews, reviewAggregate, hasReviews } from "@/lib/reviews";

/**
 * Customer reviews on the PDP, from Judge.me via the build-time fetch.
 *
 * Renders nothing below REVIEW_GATE (src/lib/reviews.ts), which exists for the
 * zero-review case — an empty block reads worse than no block, and a
 * reviewCount of 0 errors in Google's Rich Results Test.
 *
 * The rating link in the FaceCream buy box targets this section's #reviews id,
 * so the scroll offset below has to clear the fixed Navbar.
 */

const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";

/*
 * Local star row rather than <StarRating>: that component is built for the
 * aggregate slot and hides itself on count === 0, which is wrong for a single
 * review where a genuine 1-star score must still render five outlined stars.
 */
const ReviewStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-[2px]" role="img" aria-label={`Rated ${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-[14px] h-[14px] ${
          i < rating ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"
        }`}
      />
    ))}
  </div>
);

/*
 * Judge.me's verified-buyer badge. Only rendered when Judge.me confirms the
 * reviewer's order — never applied blanket-style to the whole list, because
 * that is exactly the misrepresentation 16 CFR 465 exists to stop. The three
 * product testers in testimonialsData.ts stay out of this section for the same
 * reason: they are real, but they did not buy.
 */
const VerifiedBadge = () => (
  <span className="inline-flex items-center gap-1 text-[11px] font-body font-semibold text-[#1F7A4D] whitespace-nowrap">
    <BadgeCheck className="w-[13px] h-[13px]" aria-hidden="true" />
    Verified Purchase
  </span>
);

const ReviewsSection = () => {
  if (!hasReviews) return null;

  return (
    <section id="reviews" className="scroll-mt-[96px] px-6 py-20 bg-[#F8FAFC]">
      <div className="max-w-[860px] mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-8 text-[#1A2F4C]">
          Customer Reviews
        </h2>

        {/* Aggregate summary */}
        <div className="flex flex-col items-center gap-2 mb-12 pb-8 border-b border-[#E2E8F0]">
          <span className="font-heading text-[40px] font-bold text-[#1A2F4C] leading-none">
            {reviewAggregate.rating.toFixed(1)}
          </span>
          <ReviewStars rating={Math.round(reviewAggregate.rating)} />
          <span className="font-body text-[14px] text-[#6B7280]">
            Based on {reviewAggregate.count.toLocaleString()}{" "}
            {reviewAggregate.count === 1 ? "review" : "reviews"}
          </span>
        </div>

        <ul className="flex flex-col gap-8">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-[#E2E8F0] pb-8 last:border-b-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                <ReviewStars rating={review.rating} />
                <span className="font-heading font-semibold text-[14px] text-[#1A2F4C]">
                  {review.reviewer}
                </span>
                {review.verified && <VerifiedBadge />}
                <time
                  dateTime={review.createdAt}
                  className="font-body text-[12px] text-[#6B7280] ml-auto"
                >
                  {formatDate(review.createdAt)}
                </time>
              </div>

              {review.title && (
                <h3 className="font-heading font-semibold text-[15px] text-[#1A2F4C] mb-1">
                  {review.title}
                </h3>
              )}

              <p className="font-body text-[15px] leading-[1.65] text-[#4A5568] whitespace-pre-line">
                {review.body}
              </p>

              {/*
                Customer photos. 62% of shoppers are likelier to buy when they
                can see the product on a real face, and UGC-heavy review blocks
                correlate with ~15% fewer returns. Fixed dimensions because this
                sits above the fold on mobile after a long PDP and CLS here is
                expensive. Hosted on Judge.me's CDN, which is why img-src in the
                netlify.toml CSP has to allow it.
              */}
              {review.pictures.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {review.pictures.map((src) => (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2"
                      aria-label={`Open ${review.reviewer}'s review photo at full size`}
                    >
                      <img
                        src={src}
                        alt={`Customer photo from ${review.reviewer}'s review`}
                        loading="lazy"
                        width={160}
                        height={160}
                        className="w-[160px] h-[160px] object-cover rounded-[2px] border border-[#E2E8F0] transition-opacity hover:opacity-90"
                      />
                    </a>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="font-body text-[12px] text-[#6B7280] text-center mt-10 leading-[1.5]">
          Reviews are collected by Judge.me. Every review is shown, including critical ones,
          and none are edited or reordered by rating. The Verified Purchase badge appears only
          where Judge.me matched the reviewer to a confirmed order.
        </p>
      </div>
    </section>
  );
};

export default ReviewsSection;
