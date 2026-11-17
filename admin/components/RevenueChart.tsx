import { BarChart3 } from "lucide-react";
import { formatMoney } from "@/admin/utils/format";
import type { SeriesPoint } from "@/admin/types/stats";

const MAX_VISIBLE_LABELS = 8;

export const RevenueChart = ({ points = [] }: { points?: SeriesPoint[] }) => {
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 0);
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const hasSales = maxRevenue > 0;

  // Çox nöqtə olanda etiketlər üst-üstə düşməsin deyə seyrək göstərilir
  const labelStep = Math.ceil(points.length / MAX_VISIBLE_LABELS);

  return (
    <div className="border border-[#E8E2D8] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[20px] text-[#171717]">Revenue & Orders</h2>

        <BarChart3 size={20} strokeWidth={1.6} className="text-[#B08D57]" />
      </div>

      {hasSales ? (
        <div className="mt-6">
          <div
            role="img"
            aria-label={`Revenue chart, total ${formatMoney(totalRevenue)}`}
            className="flex h-[220px] items-end gap-1 border-b border-[#E8E2D8]"
          >
            {points.map((point) => (
              <div
                key={point.key}
                title={`${point.label}: ${formatMoney(point.revenue)} · ${point.orders} ${point.orders === 1 ? "order" : "orders"}`}
                className="group flex h-full min-w-0 flex-1 items-end"
              >
                <div
                  className="w-full bg-[#B08D57]/70 transition-colors group-hover:bg-[#B08D57]"
                  style={{
                    height: `${point.revenue > 0 ? Math.max((point.revenue / maxRevenue) * 100, 2) : 0}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex h-4 gap-1" aria-hidden="true">
            {points.map((point, index) => (
              <span key={point.key} className="relative min-w-0 flex-1">
                {index % labelStep === 0 && (
                  <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-[#888]">
                    {point.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-[#888]">
            Peak: {formatMoney(maxRevenue)} · Cancelled orders are excluded
          </p>
        </div>
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
          <BarChart3 size={40} strokeWidth={1.2} className="text-[#B08D57]" />

          <p className="text-[13px] text-[#777]">No sales in this period yet</p>
        </div>
      )}
    </div>
  );
};
