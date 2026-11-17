import { getRangeStart } from "@/admin/hooks/useStats";
import type { Granularity, SeriesEntry, SeriesPoint, StatsPeriod } from "@/admin/types/stats";

const pad = (value: number): string => String(value).padStart(2, "0");

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const hourKey = (date: Date): string => `${dayKey(date)}T${pad(date.getHours())}`;

// Server yalnız satış olan vaxtları qaytarır; boş günləri/saatları 0 ilə doldururuq
export const buildSeries = (
  period: StatsPeriod,
  granularity: Granularity,
  series: SeriesEntry[]
): SeriesPoint[] => {
  const byKey = new Map(series.map((entry) => [entry.key, entry]));
  const now = new Date();
  const cursor = getRangeStart(period);
  const points: SeriesPoint[] = [];

  while (cursor <= now) {
    const isHourly = granularity === "hour";
    const key = isHourly ? hourKey(cursor) : dayKey(cursor);
    const entry = byKey.get(key);

    points.push({
      key,
      label: isHourly
        ? `${pad(cursor.getHours())}:00`
        : cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: entry?.revenue ?? 0,
      orders: entry?.orders ?? 0,
    });

    if (isHourly) {
      cursor.setHours(cursor.getHours() + 1);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return points;
};
