"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useAdminSession } from "@/admin/hooks/useAdmin";
import type { StatsPeriod } from "@/admin/types/stats";

interface DashboardHeaderProps {
  period: StatsPeriod;
  onPeriodChange: (period: StatsPeriod) => void;
}

export const DashboardHeader = ({ period, onPeriodChange }: DashboardHeaderProps) => {
  const { data: admin } = useAdminSession();

  return (
    <div className="sticky top-0 z-20 mb-7 flex flex-wrap items-center justify-between gap-5 border-b border-[#E8E2D8] bg-[#FAF8F4] py-5">
      <div>
        <h1 className="font-serif text-[32px] text-[#171717]">Dashboard</h1>

        <p className="mt-1 text-[12px] text-[#777]">Overview of your store performance</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <select
            aria-label="Time period"
            value={period}
            onChange={(event) => onPeriodChange(event.target.value as StatsPeriod)}
            className="h-10 cursor-pointer appearance-none border border-[#E8E2D8] bg-white px-4 pr-9 text-[12px] text-[#171717] outline-none focus:border-[#B08D57]"
          >
            <option value="today">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>

          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-3 text-[#777]"
          />
        </div>

        <Bell size={20} strokeWidth={1.7} aria-hidden="true" className="text-[#171717]" />

        <div
          title={admin?.email}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE2D2] font-serif text-[17px] uppercase"
        >
          {admin?.email?.[0] ?? "A"}
        </div>
      </div>
    </div>
  );
};
