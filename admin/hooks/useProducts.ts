import { useQuery } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type { Product } from "@/admin/types/products";

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get<Product[]>("/api/products");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
