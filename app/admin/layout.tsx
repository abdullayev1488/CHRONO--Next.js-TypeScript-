import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminProviders } from "@/admin/components/AdminProviders";
import "../globals.css";

export const metadata: Metadata = {
  title: "CHRONO Admin",
  icons: { icon: "/favicon.png" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
