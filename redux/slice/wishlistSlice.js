import { createSlice } from "@reduxjs/toolkit";

export const WISHLIST_STORAGE_KEY = "wishlist";

export const wishlistSlice = createSlice({
    name: "wishlist",
    // SSR ilə uyğunluq üçün boş başlayır; localStorage-dan Providers yükləyir
    initialState: { ids: [] },
    reducers: {
        toggleWishlist: (state, action) => {
            const id = action.payload;

            state.ids = state.ids.includes(id)
                ? state.ids.filter((savedId) => savedId !== id)
                : [...state.ids, id];
        },

        removeFromWishlist: (state, action) => {
            state.ids = state.ids.filter((id) => id !== action.payload);
        },

        clearWishlist: (state) => {
            state.ids = [];
        },

        hydrateWishlist: (state, action) => {
            state.ids = action.payload;
        },
    },
});

export const wishlistReducer = wishlistSlice.reducer;

export const {
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    hydrateWishlist,
} = wishlistSlice.actions;
