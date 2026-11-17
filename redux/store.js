import { configureStore } from "@reduxjs/toolkit"
import { cartReducer } from "./slice/cartSlice"
import { wishlistReducer, WISHLIST_STORAGE_KEY } from "./slice/wishlistSlice"
import { saveIds } from "./persist"

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        wishlist: wishlistReducer,
    }
});

let previousItems = store.getState().cart.items;
let previousWishlist = store.getState().wishlist.ids;

store.subscribe(() => {
    const state = store.getState();

    // Yalnız dəyişən hissə yazılır
    if (state.cart.items !== previousItems) {
        previousItems = state.cart.items;

        try {
            localStorage.setItem("cart", JSON.stringify(previousItems));
        } catch {
            // Yaddaş doludur və ya əlçatmazdır - səbət yalnız cari sessiyada qalacaq
        }
    }

    if (state.wishlist.ids !== previousWishlist) {
        previousWishlist = state.wishlist.ids;
        saveIds(WISHLIST_STORAGE_KEY, previousWishlist);
    }

})
