import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios.js";

// initialData: serverdən render olunmuş məhsul (placeholderData kimi: initialData prerender-də Date.now() çağırır)
export const useProduct = (id, initialData) => {
    return useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const response = await api.get(`/api/products/${id}`);
            return response.data;
        },
        enabled: Boolean(id),
        placeholderData: initialData ?? undefined,
        staleTime: 1000 * 60 * 5,
        // 404 / 400 cavabında təkrar sorğu göndərməyin mənası yoxdur
        retry: (failureCount, error) => {
            const status = error?.response?.status;
            if (status === 404 || status === 400) return false;
            return failureCount < 2;
        },
    });
};
