"use client";

import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type { Admin, AdminCredentials } from "@/admin/types/admin";

const ADMIN_KEY = ["admin", "me"] as const;

export const useAdminSession = () =>
  useQuery({
    queryKey: ADMIN_KEY,
    queryFn: async (): Promise<Admin | null> => {
      try {
        const response = await api.get<{ admin: Admin }>("/api/admin/me");
        return response.data.admin;
      } catch (error) {
        // Giriş edilməyib — bu xəta deyil, login səhifəsinə yönləndirmə üçün null qaytarırıq
        if (isAxiosError(error) && error.response?.status === 401) return null;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: AdminCredentials): Promise<Admin> => {
      const response = await api.post<{ admin: Admin }>("/api/admin/login", credentials);
      return response.data.admin;
    },
    onSuccess: (admin) => {
      queryClient.setQueryData(ADMIN_KEY, admin);
    },
  });
};

export const useAdminLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/api/admin/logout"),
    onSettled: () => {
      // Çıxışdan sonra admin məlumatları cache-də qalmasın
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "admin",
      });
      queryClient.setQueryData(ADMIN_KEY, null);
    },
  });
};
