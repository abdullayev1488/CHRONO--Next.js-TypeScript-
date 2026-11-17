import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios.js";

// initialData: serverdən render olunmuş siyahı. placeholderData kimi verilir: initialData prerender zamanı
// react-query-nin Date.now() çağırmasına səbəb olur (Cache Components bunu qadağan edir)
export const useProducts = (initialData) => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await api.get("/api/products");

            // Yanlış ünvan və ya server xətası halında massiv gəlməyə bilər
            if (!Array.isArray(response.data)) {
                throw new Error("Invalid products response");
            }

            return response.data;
        },
        placeholderData: initialData?.length ? initialData : undefined,
        staleTime: 1000 * 60 * 5,
    });
};
