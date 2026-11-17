"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useCustomer } from "../../hooks/useCustomer";
import { useCreateReview, useReviews } from "../../hooks/useReviews";
import { getErrorMessage } from "../../utils/errors";
import { StarRating } from "./StarRating";

const RATINGS = [5, 4, 3, 2, 1];
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 1000;
const MAX_TITLE_LENGTH = 80;

const inputClassName =
  "w-full border border-[#171717]/15 bg-white px-4 py-3 text-sm text-[#171717] outline-none transition-colors placeholder:text-[#171717]/30 focus:border-[#B08D57]";

const DistributionBars = ({ summary }) => {
  const t = useTranslations("ProductReviews");

  return (
    <ul className="space-y-2">
      {RATINGS.map((rating) => {
        const count = summary.distribution?.[rating] ?? 0;
        const percent = summary.count > 0 ? (count / summary.count) * 100 : 0;

        return (
          <li key={rating} className="flex items-center gap-3 text-xs text-[#171717]/60">
            <span className="w-12 shrink-0">{t("starsLabel", { count: rating })}</span>

            <span className="h-1.5 flex-1 overflow-hidden bg-[#E8E2D8]">
              <span
                className="block h-full bg-[#B08D57]"
                style={{ width: `${percent}%` }}
              />
            </span>

            <span className="w-6 shrink-0 text-right">{count}</span>
          </li>
        );
      })}
    </ul>
  );
};

const StarInput = ({ value, onChange }) => {
  const t = useTranslations("ProductReviews");
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      role="radiogroup"
      aria-label={t("ratingLabel")}
      className="flex gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={t("starsLabel", { count: star })}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          className="cursor-pointer p-0.5 text-[#B08D57] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B08D57]"
        >
          <Star
            size={26}
            strokeWidth={1.5}
            className={star <= active ? "fill-current" : "text-[#171717]/25"}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ productId }) => {
  const t = useTranslations("ProductReviews");
  const tErrors = useTranslations("Errors");
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const getSubmitError = (submitError) => {
    const status = submitError.response?.status;

    if (status === 401) return t("loginRequired");
    if (status === 409) return t("alreadyReviewed");
    if (status === 429) return t("tooMany");

    return getErrorMessage(submitError, tErrors);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const trimmedComment = comment.trim();

    if (rating === 0) return setError(t("ratingRequired"));
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      return setError(t("commentTooShort", { min: MIN_COMMENT_LENGTH }));
    }

    createReview.mutate(
      { rating, title: title.trim(), comment: trimmedComment },
      {
        onSuccess: () => {
          toast.success(t("thanks"));
          setRating(0);
          setTitle("");
          setComment("");
        },
        onError: (submitError) => setError(getSubmitError(submitError)),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h3 className="font-serif text-xl text-[#171717]">{t("writeTitle")}</h3>

      <StarInput value={rating} onChange={setRating} />

      <div>
        <label htmlFor="review-title" className="sr-only">
          {t("titleLabel")}
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("titlePlaceholder")}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="review-comment" className="sr-only">
          {t("commentLabel")}
        </label>
        <textarea
          id="review-comment"
          rows={5}
          value={comment}
          maxLength={MAX_COMMENT_LENGTH}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t("commentPlaceholder")}
          className={`${inputClassName} resize-y`}
        />
        <p className="mt-1 text-right text-[11px] text-[#171717]/40">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#B45342]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={createReview.isPending}
        className="inline-flex cursor-pointer items-center justify-center bg-[#171717] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#B08D57] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createReview.isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
};

const ReviewItem = ({ review }) => {
  const format = useFormatter();

  return (
    <li className="border-b border-[#171717]/10 py-6 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StarRating value={review.rating} />

        <time dateTime={review.createdAt} className="text-[11px] text-[#171717]/40">
          {format.dateTime(new Date(review.createdAt), { dateStyle: "medium" })}
        </time>
      </div>

      {review.title && (
        <h4 className="mt-3 font-serif text-lg text-[#171717]">{review.title}</h4>
      )}

      <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-[#171717]/70">
        {review.comment}
      </p>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#B08D57]">
        {review.authorName}
      </p>
    </li>
  );
};

export const ProductReviews = ({ productId }) => {
  const t = useTranslations("ProductReviews");
  const { data: customer, isLoading: isCustomerLoading } = useCustomer();
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useReviews(productId);

  const summary = data?.pages[0]?.summary;
  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
      {/* Summary and form */}
      <div className="space-y-10">
        {summary && summary.count > 0 && (
          <div>
            <div className="flex items-end gap-3">
              <span className="font-serif text-5xl text-[#171717]">
                {summary.average.toFixed(1)}
              </span>
              <span className="pb-2 text-xs text-[#171717]/50">
                {t("basedOn", { count: summary.count })}
              </span>
            </div>

            <StarRating value={summary.average} size={18} className="mt-3" />

            <div className="mt-6">
              <DistributionBars summary={summary} />
            </div>
          </div>
        )}

        {isCustomerLoading ? null : customer ? (
          <ReviewForm productId={productId} />
        ) : (
          <p className="border border-[#B08D57]/25 bg-[#FAF8F4] p-5 text-sm leading-6 text-[#171717]/65">
            {t("loginPrompt")}
          </p>
        )}
      </div>

      {/* List */}
      <div>
        {isLoading && (
          <p className="text-xs uppercase tracking-[0.2em] text-[#B08D57]">{t("loading")}</p>
        )}

        {isError && <p className="text-sm text-[#B45342]">{t("loadError")}</p>}

        {!isLoading && !isError && reviews.length === 0 && (
          <p className="text-sm text-[#171717]/55">{t("empty")}</p>
        )}

        {reviews.length > 0 && (
          <ul>
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </ul>
        )}

        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mt-8 inline-flex cursor-pointer items-center justify-center border border-[#171717] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#171717] transition-colors hover:border-[#B08D57] hover:text-[#B08D57] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetchingNextPage ? t("loading") : t("loadMore")}
          </button>
        )}
      </div>
    </div>
  );
};
