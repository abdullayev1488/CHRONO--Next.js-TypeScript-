import { CustomersPage } from "@/admin/views/CustomersPage";

// Giriş yoxlaması brauzerdə aparıldığı üçün anında naviqasiya yoxlaması tətbiq olunmur
export const instant = false;

export default function Page() {
  return <CustomersPage />;
}
