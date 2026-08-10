import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  /**
   * Aggregate review count. Omit entirely when displaying a single
   * person's rating (e.g. an individual tester's star score) rather than
   * an aggregate across many reviews — in that case no count text is
   * shown. Pass 0 explicitly for an aggregate slot that has no real
   * review data yet; the component renders nothing in that case.
   */
  count?: number;
}

/**
 * Presentational star rating, optionally with an aggregate review count.
 *
 * Renders nothing when no rating is supplied, or when an aggregate
 * `count` of 0 is explicitly passed. This component must never display a
 * default/fake rating — when `count` is used it exists so the slot is
 * ready the moment real aggregate review data is wired in. When `count`
 * is omitted, it simply renders the given rating as stars (e.g. a single
 * tester's own 5-star score), with no "reviews" text.
 */
const StarRating = ({ rating, count }: StarRatingProps) => {
  if (!rating) return null;
  if (count === 0) return null;

  const filledStars = Math.round(rating);
  const ariaLabel = count === undefined
    ? `Rated ${rating} out of 5 stars`
    : `Rated ${rating} out of 5 from ${count} reviews`;

  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < filledStars ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E2E8F0] fill-[#E2E8F0]"}`}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="font-body text-[13px] text-[#6B7280]">
          {rating.toFixed(1)} ({count.toLocaleString()} reviews)
        </span>
      )}
    </div>
  );
};

export default StarRating;
