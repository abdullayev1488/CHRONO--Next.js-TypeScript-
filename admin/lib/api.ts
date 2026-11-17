import axios, { isAxiosError } from "axios";
import { queryClient } from "./queryClient";

// API eyni tətbiqdə (/api) işlədiyi üçün sorğular nisbi ünvanlıdır
export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

const AUTH_CHECK_URLS = ["/api/admin/login", "/api/admin/me"];

// Sessiya bitibsə (401) admin vəziyyəti sıfırlanır və route guard login-ə yönləndirir
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const isAuthCheck = AUTH_CHECK_URLS.includes(error.config?.url ?? "");

      if (error.response?.status === 401 && !isAuthCheck) {
        queryClient.setQueryData(["admin", "me"], null);
      }
    }

    return Promise.reject(error);
  }
);
