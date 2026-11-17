import { Suspense, type ReactNode } from "react";
import { RequireAdmin } from "@/admin/components/RequireAdmin";
import { AdminLayout } from "@/admin/layouts/AdminLayout";

// Admin paneli giriş yoxlaması (RequireAdmin) gözləyir, ona görə anında naviqasiya yoxlaması tətbiq olunmur
export const instant = false;

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      {/* AdminLayout usePathname() oxuyur: runtime məlumatı Suspense daxilində olmalıdır */}
      <Suspense>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </RequireAdmin>
  );
}
