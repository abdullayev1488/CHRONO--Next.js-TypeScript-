"use client";

import { useState, type ReactNode } from "react";
import { Star, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/admin/components/ConfirmDeleteModal";
import { Pagination } from "@/admin/components/Pagination";
import { useDeleteReview, useReviews } from "@/admin/hooks/useReviews";
import type { Review } from "@/admin/types/reviews";
import { getErrorMessage } from "@/admin/utils/errors";
import { formatDate, getImageUrl } from "@/admin/utils/format";

const PAGE_SIZE = 10;
const MAX_RATING = 5;

const TABLE_HEADINGS = ["Product", "Author", "Rating", "Review", "Date", ""];

const Message = ({
  children,
  tone = "text-[#777]",
}: {
  children: ReactNode;
  tone?: string;
}) => (
  <div className={`border border-[#E8E2D8] bg-white p-8 text-center text-[13px] ${tone}`}>
    {children}
  </div>
);

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of ${MAX_RATING} stars`}>
    {Array.from({ length: MAX_RATING }, (_, index) => (
      <Star
        key={index}
        size={14}
        className={index < rating ? "fill-[#B08D57] text-[#B08D57]" : "text-[#D8D2C6]"}
      />
    ))}
  </span>
);

const ProductCell = ({ review }: { review: Review }) => {
  if (!review.product) return <span className="text-[12px] text-[#999]">Deleted product</span>;

  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getImageUrl(review.product.image)}
        alt=""
        className="h-10 w-10 shrink-0 bg-[#F7F4EE] object-cover"
      />
      <span className="text-[13px] font-medium text-[#171717]">{review.product.name}</span>
    </div>
  );
};

const ReviewText = ({ review }: { review: Review }) => (
  <>
    {review.title && <p className="text-[12px] font-semibold text-[#171717]">{review.title}</p>}
    <p className="text-[12px] leading-5 text-[#555]">{review.comment}</p>
  </>
);

const DeleteButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[#E8E2D8] text-[#B45342] transition-colors hover:bg-[#F8E2DF]"
  >
    <Trash2 size={15} />
  </button>
);

export const ReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const { data, isLoading, isError, isFetching } = useReviews({ page, limit: PAGE_SIZE });
  const deleteReview = useDeleteReview();

  const reviews = data?.reviews ?? [];

  const closeDeleteModal = () => {
    deleteReview.reset();
    setReviewToDelete(null);
  };

  const confirmDelete = () => {
    if (!reviewToDelete) return;

    deleteReview.mutate(reviewToDelete._id, {
      onSuccess: () => {
        // Son səhifədəki yeganə rəy silinibsə əvvəlki səhifəyə qayıdırıq
        if (reviews.length === 1 && page > 1) setPage(page - 1);
        closeDeleteModal();
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-8 pt-6 sm:px-6 md:px-8">
      <div className="mb-7">
        <h1 className="font-serif text-[30px] text-[#171717]">Reviews</h1>
        <p className="mt-1 text-[12px] text-[#777]">Customer reviews and ratings, newest first</p>
      </div>

      {isLoading && <Message>Loading reviews...</Message>}

      {isError && <Message tone="text-red-600">Failed to load reviews.</Message>}

      {!isLoading && !isError && reviews.length === 0 && <Message>No reviews yet.</Message>}

      {data && reviews.length > 0 && (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden border border-[#E8E2D8] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-[#F7F4EE]">
                  <tr>
                    {TABLE_HEADINGS.map((title, index) => (
                      <th key={index} className="px-5 py-4 text-[12px] font-medium text-[#666]">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id} className="border-t border-[#E8E2D8] align-top">
                      <td className="px-5 py-4">
                        <ProductCell review={review} />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#555]">{review.authorName}</td>
                      <td className="px-5 py-4">
                        <Stars rating={review.rating} />
                      </td>
                      <td className="max-w-[420px] px-5 py-4">
                        <ReviewText review={review} />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#777]">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <DeleteButton
                          label={`Delete review by ${review.authorName}`}
                          onClick={() => setReviewToDelete(review)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {reviews.map((review) => (
              <div key={review._id} className="min-w-0 border border-[#E8E2D8] bg-white p-4">
                <ProductCell review={review} />

                <div className="mt-3 flex items-center justify-between">
                  <Stars rating={review.rating} />
                  <span className="text-[12px] text-[#777]">{formatDate(review.createdAt)}</span>
                </div>

                <div className="mt-3 space-y-1">
                  <ReviewText review={review} />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E8E2D8] pt-3">
                  <span className="text-[12px] text-[#555]">{review.authorName}</span>
                  <DeleteButton
                    label={`Delete review by ${review.authorName}`}
                    onClick={() => setReviewToDelete(review)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={reviewToDelete !== null}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={deleteReview.isPending}
        error={deleteReview.isError ? getErrorMessage(deleteReview.error) : ""}
      />
    </div>
  );
};
