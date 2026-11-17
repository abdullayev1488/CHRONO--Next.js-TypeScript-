import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type { ReviewsParams, ReviewsResponse } from "@/admin/types/reviews";

export const useReviews = (params: ReviewsParams) =>
  useQuery({
    queryKey: ["reviews", params],
    queryFn: async () => {
      const response = await api.get<ReviewsResponse>("/api/admin/reviews", { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/reviews/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
};
