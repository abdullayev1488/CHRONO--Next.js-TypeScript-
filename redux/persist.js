// localStorage-dan məhsul ID siyahısı oxuyur; məlumat korlanıbsa boş siyahı qaytarır
export const loadIds = (key) => {
    try {
        const saved = JSON.parse(localStorage.getItem(key));

        if (!Array.isArray(saved)) return [];

        return [...new Set(saved.filter((id) => typeof id === "string"))];
    } catch {
        return [];
    }
};

export const saveIds = (key, ids) => {
    try {
        localStorage.setItem(key, JSON.stringify(ids));
    } catch {
        // Yaddaş doludur və ya əlçatmazdır - siyahı yalnız cari sessiyada qalacaq
    }
};
