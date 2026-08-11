import { useState } from "react";
import { Star, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import {
  aggregateOf,
  submitReview,
  WRITE_REVIEW_ANCHOR,
  type PublicReview,
} from "@/config/reviews";

/*
 * PDP review section: the published reviews, and the form that collects new
 * ones.
 *
 * The empty state is the important part of this component. Sales opened
 * 2026-08-10, so for a while this will render zero reviews, and the honest
 * version of that is a section that says "no reviews yet" and invites the first
 * one. It must never fall back to seeded quotes, sample ratings, or a borrowed
 * average — the testers quoted elsewhere on this page are labelled as testers
 * for the same reason.
 *
 * Nothing submitted here appears immediately. The edge function proves the
 * order is real; a human still reads the text before it publishes. The form
 * says so, because a shopper who writes 300 words and then sees nothing appear
 * will assume it broke.
 */

interface ProductReviewsProps {
  productHandle: string;
  reviews: PublicReview[];
  loading: boolean;
}

const EMPTY_FORM = {
  rating: 0,
  title: "",
  body: "",
  displayName: "",
  email: "",
  orderName: "",
};

const inputClass =
  "w-full border border-[#CBD5E0] rounded-[4px] px-3 py-2 font-body text-[15px] text-[#1A2F4C] bg-white focus:outline-none focus:border-[#1A2F4C] focus:ring-1 focus:ring-[#1A2F4C]";
const labelClass = "block font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-[#1A2F4C] mb-1.5";

/*
 * The post-purchase email links to /face-cream?order=1001#write-review. Landing
 * on that anchor has to open the form — scrolling someone to a collapsed
 * section after they clicked "leave a review" is how you get zero reviews. The
 * order number rides in the query string because it isn't personal data on its
 * own; the email is still required and is never put in a URL.
 */
function initialFormState() {
  if (typeof window === "undefined") return { open: false, orderName: "" };
  const orderName = new URLSearchParams(window.location.search).get("order")?.trim() ?? "";
  return {
    open: window.location.hash === `#${WRITE_REVIEW_ANCHOR}` || orderName !== "",
    orderName: orderName.slice(0, 32),
  };
}

const ProductReviews = ({ productHandle, reviews, loading }: ProductReviewsProps) => {
  const [initial] = useState(initialFormState);
  const [formOpen, setFormOpen] = useState(initial.open);
  const [form, setForm] = useState({ ...EMPTY_FORM, orderName: initial.orderName });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { rating, count } = aggregateOf(reviews);
  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (form.rating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const result = await submitReview(productHandle, {
      rating: form.rating,
      title: form.title,
      body: form.body,
      displayName: form.displayName,
      email: form.email,
      orderName: form.orderName,
    });

    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } else {
      setError(result.error);
    }
  };

  return (
    <section id="reviews" className="px-6 py-20 bg-[#F7F8FA] border-t border-[#E2E8F0]">
      <div className="max-w-[760px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wide text-[#1A2F4C] mb-2">
              Reviews
            </h2>
            {/* Renders nothing at count 0 — no rating is shown until one is earned. */}
            <StarRating rating={rating} count={count} />
          </div>
          {!formOpen && !submitted && (
            <Button
              variant="outline"
              className="font-heading text-[12px] font-bold uppercase tracking-[0.1em] border-[#1A2F4C] text-[#1A2F4C] hover:bg-[#1A2F4C] hover:text-white"
              onClick={() => setFormOpen(true)}
            >
              Write a review
            </Button>
          )}
        </div>

        {loading ? (
          <p className="font-body text-[15px] text-[#6B7280]">Loading reviews.</p>
        ) : count === 0 ? (
          <p className="font-body text-[15px] text-[#4A5568] mb-8">
            No reviews yet. We only publish reviews from people who actually bought a bottle, so if
            that's you, you get to write the first one.
          </p>
        ) : (
          <ul className="space-y-6 mb-8">
            {reviews.map((review) => (
              <li key={review.id} className="bg-white border border-[#E2E8F0] rounded-[6px] p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                  <StarRating rating={review.rating} />
                  <span className="inline-flex items-center gap-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-[#2E7D32] bg-[#E8F5E9] px-2 py-1 rounded-[4px]">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    Verified buyer
                  </span>
                </div>
                <p className="font-heading text-[16px] font-bold text-[#1A2F4C] mb-1">{review.title}</p>
                <p className="font-body text-[15px] text-[#4A5568] leading-[1.6] mb-3 whitespace-pre-line">
                  {review.body}
                </p>
                <p className="font-body text-[13px] text-[#6B7280]">
                  {review.display_name} &middot;{" "}
                  <time dateTime={review.created_at.slice(0, 10)}>
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </p>
              </li>
            ))}
          </ul>
        )}

        <div id={WRITE_REVIEW_ANCHOR} className="scroll-mt-24">
          {submitted && (
            <div className="bg-white border border-[#E2E8F0] rounded-[6px] p-6">
              <h3 className="font-heading text-[16px] font-bold uppercase tracking-wide text-[#1A2F4C] mb-2">
                Got it
              </h3>
              <p className="font-body text-[15px] text-[#4A5568]">
                Your order checked out. We read every review before it goes live, so give it a day or
                two to appear. We don't edit them and we don't delete the bad ones.
              </p>
            </div>
          )}

          {formOpen && !submitted && (
            <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-[6px] p-6">
              <h3 className="font-heading text-[16px] font-bold uppercase tracking-wide text-[#1A2F4C] mb-2">
                Write a review
              </h3>
              <p className="font-body text-[14px] text-[#4A5568] mb-6">
                We check your order number against our system before anything posts, which is what
                lets us put "verified buyer" on it. Your email and order number stay private.
              </p>

              <div className="mb-5">
                <span className={labelClass} id="rating-label">Rating</span>
                <div className="flex items-center gap-1" role="group" aria-labelledby="rating-label">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set("rating", value)}
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                      aria-pressed={form.rating === value}
                      className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#1A2F4C]"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          value <= form.rating
                            ? "text-[#FBBF24] fill-[#FBBF24]"
                            : "text-[#CBD5E0] fill-[#F1F5F9]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className={labelClass} htmlFor="review-title">Headline</label>
                <input
                  id="review-title"
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  minLength={3}
                  maxLength={80}
                  required
                  placeholder="Sum it up in a few words"
                />
              </div>

              <div className="mb-5">
                <label className={labelClass} htmlFor="review-body">Your review</label>
                <textarea
                  id="review-body"
                  className={`${inputClass} min-h-[120px] resize-y`}
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  minLength={20}
                  maxLength={2000}
                  required
                  placeholder="What changed, how long it took, whether it did what you wanted."
                />
                <p className="font-body text-[12px] text-[#6B7280] mt-1">
                  At least 20 characters. {form.body.length}/2000.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className={labelClass} htmlFor="review-name">Display name</label>
                  <input
                    id="review-name"
                    className={inputClass}
                    value={form.displayName}
                    onChange={(e) => set("displayName", e.target.value)}
                    minLength={2}
                    maxLength={40}
                    required
                    placeholder="Mike D."
                  />
                  <p className="font-body text-[12px] text-[#6B7280] mt-1">Shown on the review.</p>
                </div>
                <div>
                  <label className={labelClass} htmlFor="review-order">Order number</label>
                  <input
                    id="review-order"
                    className={inputClass}
                    value={form.orderName}
                    onChange={(e) => set("orderName", e.target.value)}
                    required
                    placeholder="1001"
                    inputMode="numeric"
                  />
                  <p className="font-body text-[12px] text-[#6B7280] mt-1">
                    Top of your order confirmation email.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className={labelClass} htmlFor="review-email">Email you ordered with</label>
                <input
                  id="review-email"
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <p className="font-body text-[12px] text-[#6B7280] mt-1">Never published.</p>
              </div>

              {error && (
                <p role="alert" className="font-body text-[14px] text-[#C04510] mb-4">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand text-white hover:bg-brand/90 font-heading text-[12px] font-bold uppercase tracking-[0.1em] px-6"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit review"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setError(null); }}
                  className="font-body text-[14px] text-[#6B7280] underline underline-offset-4 hover:text-[#1A2F4C]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductReviews;
