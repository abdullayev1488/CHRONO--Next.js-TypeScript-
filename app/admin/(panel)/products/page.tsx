import { ProductsPage } from "@/admin/views/ProductsPage";

// Giriş yoxlaması brauzerdə aparıldığı üçün anında naviqasiya yoxlaması tətbiq olunmur
export const instant = false;

export default function Page() {
  return <ProductsPage />;
}
