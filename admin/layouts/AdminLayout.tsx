"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAdminLogout, useAdminSession } from "@/admin/hooks/useAdmin";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Reviews", path: "/admin/reviews", icon: Star },
];

const isActivePath = (pathname: string, path: string): boolean =>
  path === "/admin" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: admin } = useAdminSession();
  const logout = useAdminLogout();

  return (
    <div className="flex h-dvh overflow-hidden bg-[#FAF8F4]">
      {/* Mobil overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed mr-[20px] inset-y-0 left-0 z-50
          flex w-[250px] flex-col bg-[#171717] text-white
          transition-transform duration-300
          md:relative md:z-auto md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="relative border-b border-white/10 px-8 py-8">
          <div>
            <h1 className="font-serif text-[28px] tracking-[0.12em]">CHRONO</h1>

            <p className="mt-1 text-[10px] tracking-[0.3em] text-[#B08D57]">ADMIN PANEL</p>
          </div>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute cursor-pointer right-3 top-3 flex h-8 w-8 items-center justify-center text-white/70 transition-colors hover:text-white md:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto py-5">
          {MENU_ITEMS.map(({ name, path, icon: Icon }) => (
            <Link
              key={name}
              href={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 border-l-[3px] px-8 py-4 text-[13px] transition-colors ${
                isActivePath(pathname, path)
                  ? "border-[#B08D57] bg-[#B08D57]/20 text-white"
                  : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.6} />
              {name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 px-8 py-6">
          <p className="text-[13px]">Admin</p>

          <p className="mt-1 truncate text-[11px] text-white/40">{admin?.email}</p>

          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="mt-5 flex cursor-pointer items-center gap-3 text-[12px] text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed"
          >
            <LogOut size={17} />
            <span>{logout.isPending ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* SAĞ TƏRƏF */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil menyu düyməsi */}
        <div className="flex h-14 shrink-0 items-center border-b border-[#E8E2D8] bg-[#FAF8F4] px-5 md:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
            className="text-[#171717] cursor-pointer"
          >
            <Menu size={23} strokeWidth={1.7} />
          </button>

          <span className="ml-4 font-serif text-[19px] tracking-[0.12em]">CHRONO</span>
        </div>

        {/* Yalnız burası scroll olur */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#FAF8F4]">{children}</main>
      </div>
    </div>
  );
};
