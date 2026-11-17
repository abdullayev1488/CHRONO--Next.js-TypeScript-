import { OrdersPage } from "@/admin/views/OrdersPage";

// Giriş yoxlaması brauzerdə aparıldığı üçün anında naviqasiya yoxlaması tətbiq olunmur
export const instant = false;

export default function Page() {
  return <OrdersPage />;
}
