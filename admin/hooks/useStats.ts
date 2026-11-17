"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type { Stats, StatsPeriod } from "@/admin/types/stats";

export const getRangeStart = (period: StatsPeriod): Date => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (period === "today" ? 0 : Number(period) - 1));

  return date;
};

export const useStats = (period: StatsPeriod) =>
  useQuery({
    queryKey: ["stats", period],
    queryFn: async (): Promise<Stats> => {
      const response = await api.get<Stats>("/api/admin/stats", {
        params: {
          from: getRangeStart(period).toISOString(),
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      return response.data;
    },
    staleTime: 1000 * 30,
  });
