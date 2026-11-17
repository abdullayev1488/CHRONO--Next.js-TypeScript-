"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch } from "react-redux";
import { Toaster } from "sonner";
import { store } from "../redux/store.js";
import { hydrateCart, loadCart } from "../redux/slice/cartSlice.js";
import {
  hydrateWishlist,
  WISHLIST_STORAGE_KEY,
} from "../redux/slice/wishlistSlice.js";
import { loadIds } from "../redux/persist.js";
import { CurrencyProvider } from "./CurrencyProvider";

// SSR ilə uyğunluq üçün səbət və sevimlilər yalnız brauzerdə localStorage-dan yüklənir
const StoreHydrator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const cart = loadCart();
    if (cart.length > 0) dispatch(hydrateCart(cart));

    const wishlist = loadIds(WISHLIST_STORAGE_KEY);
    if (wishlist.length > 0) dispatch(hydrateWishlist(wishlist));

  }, [dispatch]);

  return null;
};

// Hydrate zamanı server ilə eyni (boş) vəziyyət göstərilir, sonra real vəziyyətə keçilir
const SERVER_STATE = {
  cart: { items: [] },
  wishlist: { ids: [] },
};

export const Providers = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store} serverState={SERVER_STATE}>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <StoreHydrator />
          {children}
          <Toaster
            position="bottom-right"
            closeButton
            duration={2500}
            toastOptions={{
              style: {
                background: "#171717",
                color: "#FAF8F4",
                border: "1px solid #B08D57",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "500",
                padding: "16px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              },
            }}
          />
        </CurrencyProvider>
      </QueryClientProvider>
    </Provider>
  );
};
