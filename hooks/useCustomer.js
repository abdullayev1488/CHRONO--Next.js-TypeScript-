import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios.js";

export const useCustomer = () => {
    return useQuery({
        queryKey: ["customer"],
        queryFn: async () => {
            const response = await api.get("/api/auth/me");
            return response.data.customer;
        },
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
};

export const useCustomerLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials) => {
            const response = await api.post("/api/auth/login", credentials);
            return response.data.customer;
        },
        onSuccess: (customer) => {
            queryClient.setQueryData(["customer"], customer);
        },
    });
};

export const useCustomerRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post("/api/auth/register", data);
            return response.data.customer;
        },
        onSuccess: (customer) => {
            queryClient.setQueryData(["customer"], customer);
        },
    });
};

export const useCustomerLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => api.post("/api/auth/logout"),
        onSettled: () => {
            queryClient.setQueryData(["customer"], null);
        },
    });
};
