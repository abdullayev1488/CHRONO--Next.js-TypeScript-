import { Types, type HydratedDocument } from "mongoose";
import { ApiError } from "../http/errors";
import { revalidateCatalog } from "../lib/revalidate";
import { cleanString, parsePagination } from "../lib/validation";
import type { ICustomer } from "../models/customer";
import { Product } from "../models/product";
import { Review } from "../models/review";

const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 1000;
const MAX_TITLE_LENGTH = 80;

export interface RatingSummary {
  average: number;
  count: number;
}

export interface ReviewSummary extends RatingSummary {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewInput {
  rating: number;
  title: string;
  comment: string;
}

const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

/** Ad + soyadın baş hərfi, məs. "John D." */
export const buildAuthorName = (customer: Pick<ICustomer, "firstName" | "lastName">): string => {
  const initial = customer.lastName.trim().charAt(0).toUpperCase();
  return initial ? `${customer.firstName.trim()} ${initial}.` : customer.firstName.trim();
};

/** Gövdəni yoxlayıb təmizləyir; yanlışdırsa 400 atır. */
export const parseReviewInput = (body: Record<string, unknown>): ReviewInput => {
  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw ApiError.badRequest("Rating must be an integer between 1 and 5");
  }

  const title = cleanString(body.title, MAX_TITLE_LENGTH + 1);
  if (title.length > MAX_TITLE_LENGTH) {
    throw ApiError.badRequest(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
  }

  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (comment.length < MIN_COMMENT_LENGTH || comment.length > MAX_COMMENT_LENGTH) {
    throw ApiError.badRequest(
      `Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters`
    );
  }

  return { rating, title, comment };
};

export const createReview = async (
  productId: string,
  customer: HydratedDocument<ICustomer>,
  input: ReviewInput
) => {
  const product = await Product.findOne({ _id: productId, archived: { $ne: true } });
  if (!product) throw ApiError.notFound("Product not found");

  try {
    const review = await Review.create({
      product: product._id,
      customer: customer._id,
      authorName: buildAuthorName(customer),
      ...input,
    });
    revalidateCatalog([productId]);
    return review;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict("You have already reviewed this product");
    }
    throw error;
  }
};

const emptyDistribution = (): ReviewSummary["distribution"] => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

export const getReviewSummary = async (productId: Types.ObjectId | string): Promise<ReviewSummary> => {
  const groups = await Review.aggregate<{ _id: 1 | 2 | 3 | 4 | 5; count: number }>([
    { $match: { product: new Types.ObjectId(String(productId)) } },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);

  const distribution = emptyDistribution();
  let count = 0;
  let sum = 0;

  for (const { _id: rating, count: amount } of groups) {
    distribution[rating] = amount;
    count += amount;
    sum += rating * amount;
  }

  return { average: count ? roundToOneDecimal(sum / count) : 0, count, distribution };
};

export const listProductReviews = async (productId: string, params: URLSearchParams) => {
  const { page, limit, skip } = parsePagination(params, 10);
  const filter = { product: productId };

  const [reviews, summary] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-customer"),
    getReviewSummary(productId),
  ]);

  return {
    reviews,
    summary,
    total: summary.count,
    page,
    pages: Math.max(1, Math.ceil(summary.count / limit)),
  };
};

/** Siyahılar üçün: bir aggregate ilə bir neçə məhsulun reytinqi. */
export const getRatingsForProducts = async (
  productIds: Types.ObjectId[]
): Promise<Map<string, RatingSummary>> => {
  const groups = await Review.aggregate<{ _id: Types.ObjectId; average: number; count: number }>([
    { $match: { product: { $in: productIds } } },
    { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  return new Map(
    groups.map(({ _id, average, count }) => [
      _id.toString(),
      { average: roundToOneDecimal(average), count },
    ])
  );
};

const NO_RATING: RatingSummary = { average: 0, count: 0 };

/** Məhsul sənədlərinə `rating: { average, count }` əlavə edir (rəyi olmayanlar üçün 0/0). */
export const withRatings = async <T extends { _id: Types.ObjectId; toObject(): object }>(
  products: T[]
) => {
  const ratings = await getRatingsForProducts(products.map((product) => product._id));

  return products.map((product) => ({
    ...product.toObject(),
    rating: ratings.get(product._id.toString()) ?? NO_RATING,
  }));
};

export const listReviewsForAdmin = async (params: URLSearchParams) => {
  const { page, limit, skip } = parsePagination(params);

  const [reviews, total] = await Promise.all([
    Review.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("product", "name image")
      .select("-customer"),
    Review.countDocuments(),
  ]);

  return { reviews, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
};

export const deleteReview = async (id: string): Promise<void> => {
  const deleted = await Review.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Review not found");
  revalidateCatalog([deleted.product.toString()]);
};
