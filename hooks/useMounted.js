import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Brauzerdə mount olunandan sonra true qaytarır (SSR/hydration zamanı false);
// localStorage-dan yüklənən vəziyyətin boş "flash"-ının qarşısını almaq üçün
export const useMounted = () =>
    useSyncExternalStore(subscribe, () => true, () => false);
