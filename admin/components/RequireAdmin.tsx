"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/admin/hooks/useAdmin";

// Sessiya yoxlanılmadan heç bir admin səhifəsi göstərilmir
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: admin, isLoading, isError, refetch } = useAdminSession();

  const isLoggedOut = !isLoading && !isError && !admin;

  useEffect(() => {
    if (isLoggedOut) router.replace("/admin/login");
  }, [isLoggedOut, router]);

  if (isLoading || isLoggedOut) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#FAF8F4]">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[#B08D57]">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#FAF8F4] px-5 text-center">
        <p className="text-[13px] text-[#AD4944]">Could not reach the server.</p>

        <button
          type="button"
          onClick={() => refetch()}
          className="cursor-pointer bg-[#171717] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B08D57]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
