"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios.js";

const REVIEWS_PAGE_SIZE = 5;

/** Səhifələnmiş rəylər: hər səhifə { reviews, summary, total, page, pages } qaytarır. */
export const useReviews = (productId) =>
  useInfiniteQuery({
    queryKey: ["reviews", productId],
    queryFn: async ({ pageParam }) => {
      const response = await api.get(`/api/products/${productId}/reviews`, {
        params: { page: pageParam, limit: REVIEWS_PAGE_SIZE },
      });

      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
    enabled: Boolean(productId),
    staleTime: 1000 * 60,
  });

export const useCreateReview = (productId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review) => {
      const response = await api.post(`/api/products/${productId}/reviews`, review);

      return response.data;
    },
    onSuccess: () => {
      // Rəy reytinqi dəyişir: rəylər, məhsul və siyahı yenilənir
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
