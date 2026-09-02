import { useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import ReviewCollectionCta from "@/components/ReviewCollectionCta";
import { reviews, reviewAggregate, hasReviews, histogram } from "@/lib/reviews";

/**
 * Customer reviews on the PDP, from Judge.me via the build-time fetch.
 *
 * The aggregate/list are gated below REVIEW_GATE (src/lib/reviews.ts), but the
 * section and collection CTA remain available even when there are no reviews.
 * Product schema still omits a zero-count aggregate.
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

/*
 * Minimum number of customer photos before the gallery strip renders.
 *
 * The strip repeats images that already appear inline further down, so it earns
 * its place only by reading as a row. Two thumbnails read as a mistake. Unlike
 * the star breakdown this is not gated on review count — a handful of photos is
 * persuasive at any sample size, which is why the block below the fold sorts
 * photo reviews first in the fetch script.
 */
const PHOTO_STRIP_MIN = 3;

const ReviewsSection = () => {
  /*
   * Filter state, not sort state. The list order is fixed in the fetch script
   * (photos first, then newest) and nothing here reorders by rating — burying
   * negatives is the 16 CFR 465 problem the whole module is written around.
   * Filtering is different in kind: it is user-initiated, every populated
   * rating is offered including the bad ones, and clearing restores the full
   * list. Default state is unfiltered, which matters beyond taste because
   * Puppeteer prerenders this component — whatever renders at useState's
   * initial value is the review text Google reads.
   */
  const [starFilter, setStarFilter] = useState<number | null>(null);

  if (!hasReviews) {
    return (
      <section id="reviews" className="scroll-mt-[160px] px-6 py-20 bg-[#F8FAFC]">
        <div className="max-w-[860px] mx-auto">
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-8 text-[#1A2F4C]">
            Customer Reviews
          </h2>
          <div className="mx-auto max-w-[560px] border border-[#E2E8F0] bg-white px-6 py-8 text-center">
            <p className="font-heading text-[18px] font-semibold text-[#1A2F4C]">
              Be the first to share your experience.
            </p>
            <p className="mt-2 font-body text-[14px] leading-[1.65] text-[#64748B]">
              Already using Base Layer? Your honest feedback helps the next customer decide.
            </p>
          </div>
          <ReviewCollectionCta />
        </div>
      </section>
    );
  }

  const shown = starFilter === null ? reviews : reviews.filter((r) => r.rating === starFilter);

  /*
   * One flat list of every photo across the displayed reviews. Each thumbnail
   * links to its own review rather than opening a lightbox: the same URL is
   * already loaded for the inline image below, so the strip costs no extra
   * request, and sending someone to the words attached to the photo is worth
   * more than showing them the photo bigger.
   */
  const photos = reviews.flatMap((r) =>
    r.pictures.map((src) => ({ src, reviewer: r.reviewer, reviewId: r.id }))
  );

  return (
    <section id="reviews" className="scroll-mt-[160px] px-6 py-20 bg-[#F8FAFC]">
      <div className="max-w-[860px] mx-auto">
        <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-center mb-8 text-[#1A2F4C]">
          Customer Reviews
        </h2>

        {/* Aggregate summary */}
        <div className="mb-12 pb-8 border-b border-[#E2E8F0]">
          <div
            className={`flex flex-col items-center gap-6 ${
              histogram ? "md:flex-row md:justify-center md:gap-12" : ""
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-heading text-[40px] font-bold text-[#1A2F4C] leading-none">
                {reviewAggregate.rating.toFixed(1)}
              </span>
              <ReviewStars rating={Math.round(reviewAggregate.rating)} />
              <span className="font-body text-[14px] text-[#6B7280]">
                Based on {reviewAggregate.count.toLocaleString()}{" "}
                {reviewAggregate.count === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/*
              Star breakdown. Each row filters the list below to that rating —
              including the 1-stars, which is the whole point: the shopper who
              goes looking for them is the one closest to buying, and making him
              hunt for them costs more trust than the bad reviews do.

              Rows with no reviews are disabled rather than hidden, so the shape
              of the distribution stays readable.
            */}
            {histogram && (
              <div className="w-full max-w-[320px] flex flex-col gap-[3px]">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = histogram[star - 1];
                  const pct = reviewAggregate.count ? (n / reviewAggregate.count) * 100 : 0;
                  const active = starFilter === star;
                  return (
                    <button
                      key={star}
                      type="button"
                      disabled={n === 0}
                      aria-pressed={active}
                      onClick={() => setStarFilter(active ? null : star)}
                      className={`flex items-center gap-2 w-full rounded-[2px] px-1 py-[3px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] ${
                        n === 0 ? "opacity-45 cursor-default" : "hover:bg-[#EEF2F7]"
                      } ${active ? "bg-[#EEF2F7]" : ""}`}
                    >
                      <span className="font-body text-[12px] tabular-nums text-[#4A5568] w-[8px]">
                        {star}
                      </span>
                      <Star
                        className="w-[11px] h-[11px] text-[#FBBF24] fill-[#FBBF24] shrink-0"
                        aria-hidden="true"
                      />
                      <span className="flex-1 h-[8px] rounded-full bg-[#E2E8F0] overflow-hidden">
                        <span
                          className="block h-full bg-[#FBBF24] transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="font-body text-[12px] tabular-nums text-[#6B7280] w-[22px] text-right">
                        {n}
                      </span>
                      <span className="sr-only">
                        {n === 1 ? "review" : "reviews"} rated {star} out of 5
                        {n > 0 && (active ? ", currently filtered" : ", filter to these")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/*
            Customer photo strip. Same URLs the inline images below already
            request, so the browser serves these from cache and the row costs no
            extra bytes — the fetch script sizes every photo to width=320, which
            covers 160px inline and is oversized but free here.
          */}
          {photos.length >= PHOTO_STRIP_MIN && (
            <ul className="flex gap-2 overflow-x-auto mt-8 -mx-1 px-1 pb-1 snap-x">
              {photos.map((photo) => (
                <li key={photo.src} className="shrink-0 snap-start">
                  <a
                    href={`#review-${photo.reviewId}`}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2"
                    aria-label={`Jump to ${photo.reviewer}'s review`}
                  >
                    <img
                      src={photo.src}
                      alt={`Customer photo from ${photo.reviewer}'s review`}
                      loading="lazy"
                      width={72}
                      height={72}
                      className="w-[72px] h-[72px] object-cover rounded-[2px] border border-[#E2E8F0] transition-opacity hover:opacity-80"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {starFilter !== null && (
          <div role="status" className="flex flex-wrap items-center justify-center gap-3 -mt-4 mb-8">
            <span className="font-body text-[13px] text-[#6B7280]">
              Showing {shown.length} {shown.length === 1 ? "review" : "reviews"} rated {starFilter}{" "}
              {starFilter === 1 ? "star" : "stars"}
            </span>
            <button
              type="button"
              onClick={() => setStarFilter(null)}
              className="font-body text-[13px] font-semibold text-[#1A2F4C] underline underline-offset-2 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C]"
            >
              Show all
            </button>
          </div>
        )}

        <ul className="flex flex-col gap-8">
          {shown.map((review) => (
            <li
              key={review.id}
              id={`review-${review.id}`}
              className="scroll-mt-[96px] border-b border-[#E2E8F0] pb-8 last:border-b-0 last:pb-0"
            >
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

        <ReviewCollectionCta />

        <p className="font-body text-[12px] text-[#6B7280] text-center mt-10 leading-[1.5]">
          Reviews are collected by Judge.me. Every published review is shown, including critical ones,
          and none are edited or reordered by rating. Filtering by star rating is yours to
          apply and clear; every rating with reviews behind it can be filtered to. The
          Verified Purchase badge appears only where Judge.me matched the reviewer to a
          confirmed order.
        </p>
      </div>
    </section>
  );
};

export default ReviewsSection;
