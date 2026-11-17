import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type {
  CustomerDetails,
  CustomersParams,
  CustomersResponse,
} from "@/admin/types/customers";

export const useCustomers = (params: CustomersParams) =>
  useQuery({
    queryKey: ["customers", params],
    queryFn: async () => {
      const response = await api.get<CustomersResponse>("/api/admin/customers", { params });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

export const useCustomer = (id: string) =>
  useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: async () => {
      const response = await api.get<CustomerDetails>(`/api/admin/customers/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
