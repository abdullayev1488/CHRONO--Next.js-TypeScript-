import { createSlice } from "@reduxjs/toolkit"

// localStorage əlçatmaz və ya məlumat korlanıbsa, boş səbətlə başlayırıq.
// Köhnə formatlı (MongoDB _id olmayan) məhsulları da atırıq.
export const loadCart = () => {
    try {
        const savedCart = JSON.parse(localStorage.getItem("cart"));

        if (!Array.isArray(savedCart)) return [];

        return savedCart.filter(
            (item) =>
                item &&
                typeof item._id === "string" &&
                typeof item.price === "number" &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
        );
    } catch {
        return [];
    }
};


// Server bir məhsuldan maksimum bu qədər qəbul edir
export const MAX_LINE_QUANTITY = 10;

// Stok məlumatı yoxdursa (köhnə səbət) yalnız ümumi limit tətbiq olunur,
// son yoxlamanı sifariş zamanı server aparır
export const getMaxQuantity = (item) =>
    Math.min(MAX_LINE_QUANTITY, Number.isInteger(item.stock) ? item.stock : MAX_LINE_QUANTITY);

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [] // SSR ilə uyğunluq: localStorage-dan CartHydrator yükləyir
    },
    reducers: {
        addToCart: (state, action) => {
            const existingProduct = state.items.find(
                item => item._id === action.payload._id
            );

            if (!existingProduct && action.payload.stock > 0) {
                state.items.push({
                    ...action.payload,
                    quantity: 1
                });
            }
        },

        increaseQuantity: (state, action) => {
            const product = state.items.find(item => item._id === action.payload);

            if (product && product.quantity < getMaxQuantity(product)) {
                product.quantity++;
            }
        },

        decreaseQuantity: (state, action) => {
            const product = state.items.find(item => item._id === action.payload)
            if (product && product.quantity > 1) {
                product.quantity--;
            } else if (product) {
                state.items = state.items.filter(item => item._id !== action.payload)
            }
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
        },

        hydrateCart: (state, action) => {
            state.items = action.payload;
        },

        clearCart: (state) => {
            state.items = [];
        }
    }
})

export const cartReducer = cartSlice.reducer;

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, hydrateCart } = cartSlice.actions;
