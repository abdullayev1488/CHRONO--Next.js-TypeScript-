"use client";

import { useMemo, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { DashboardHeader } from "@/admin/components/DashboardHeader";
import { KpiCard } from "@/admin/components/KpiCard";
import { LowStockAlerts } from "@/admin/components/LowStockAlerts";
import { RecentOrders } from "@/admin/components/RecentOrders";
import { RevenueChart } from "@/admin/components/RevenueChart";
import { SalesByCategory } from "@/admin/components/SalesByCategory";
import { TopSellingBrands } from "@/admin/components/TopSellingBrands";
import { TopSellingProducts } from "@/admin/components/TopSellingProducts";
import { useStats } from "@/admin/hooks/useStats";
import type { StatsPeriod } from "@/admin/types/stats";
import { formatMoney } from "@/admin/utils/format";
import { buildSeries } from "@/admin/utils/series";

const formatCount = (value: number): string => value.toLocaleString("en-US");

export const DashboardPage = () => {
  const [period, setPeriod] = useState<StatsPeriod>("30");
  const { data: stats, isLoading, isError, refetch } = useStats(period);

  const points = useMemo(
    () => (stats ? buildSeries(period, stats.granularity, stats.series) : []),
    [stats, period]
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-8 pt-4 sm:px-6 md:px-8">
      <DashboardHeader period={period} onPeriodChange={setPeriod} />

      {isLoading && (
        <div className="border border-[#E8E2D8] bg-white p-8 text-center text-[13px] text-[#777]">
          Loading dashboard...
        </div>
      )}

      {isError && (
        <div className="border border-[#E8E2D8] bg-white p-8 text-center">
          <p className="text-[13px] text-red-600">Failed to load dashboard data.</p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 cursor-pointer bg-[#171717] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#B08D57]"
          >
            Try Again
          </button>
        </div>
      )}

      {stats && (
        <>
          {/* Statistik kartlar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Revenue"
              value={formatMoney(stats.kpis.revenue.value)}
              change={stats.kpis.revenue.change}
              icon={DollarSign}
            />

            <KpiCard
              title="Orders"
              value={formatCount(stats.kpis.orders.value)}
              change={stats.kpis.orders.change}
              icon={ShoppingBag}
            />

            <KpiCard
              title="Average Order Value"
              value={formatMoney(stats.kpis.averageOrderValue.value)}
              change={stats.kpis.averageOrderValue.change}
              icon={TrendingUp}
            />

            <KpiCard
              title="New Customers"
              value={formatCount(stats.kpis.newCustomers.value)}
              change={stats.kpis.newCustomers.change}
              icon={Users}
            />
          </div>

          {/* Revenue və kateqoriyalar */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
            <RevenueChart points={points} />
            <SalesByCategory categories={stats.salesByCategory} />
          </div>

          {/* Brendlər, məhsullar, stok və sifarişlər */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <TopSellingBrands brands={stats.topBrands} />
            <TopSellingProducts products={stats.topProducts} />
            <LowStockAlerts products={stats.lowStock} />
            <RecentOrders orders={stats.recentOrders} />
          </div>
        </>
      )}
    </div>
  );
};
