import { API_URL } from "../api/axios.js";

// DB-də şəkil yolu "/images/watches/..." formasında saxlanılır, şəkilləri isə backend verir
export const getImageUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;

    return `${API_URL}${encodeURI(path)}`;
};
