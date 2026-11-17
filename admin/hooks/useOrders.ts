import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type { Order, OrderChanges, OrdersParams, OrdersResponse } from "@/admin/types/orders";

export const useOrders = (params: OrdersParams) =>
  useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const response = await api.get<OrdersResponse>("/api/admin/orders", { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

interface UpdateOrderVariables {
  id: string;
  changes: OrderChanges;
}

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, changes }: UpdateOrderVariables) => {
      const response = await api.patch<Order>(`/api/admin/orders/${id}`, changes);
      return response.data;
    },
    onSuccess: () => {
      // Sifariş statusu müştəri məbləğlərinə, statistikaya və stoka təsir edir
      for (const key of ["orders", "customers", "stats", "products"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
};
