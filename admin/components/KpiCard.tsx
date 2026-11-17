import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change: number | null;
  icon: LucideIcon;
}

export const KpiCard = ({ title, value, change, icon: Icon }: KpiCardProps) => {
  const isNegative = change !== null && change < 0;

  return (
    <div className="border border-[#E8E2D8] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#555]">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center bg-[#FAF8F4] text-[#B08D57]">
          <Icon size={20} strokeWidth={1.6} />
        </div>
      </div>

      <h2 className="mt-4 font-serif text-[32px] text-[#171717]">{value}</h2>

      <p className="mt-3 text-[11px] text-[#777]">
        {change !== null ? (
          <>
            <span
              className={`font-semibold ${isNegative ? "text-[#B45342]" : "text-[#398052]"}`}
            >
              {isNegative ? "" : "+"}
              {change}%
            </span>{" "}
            from previous period
          </>
        ) : (
          "No data for the previous period"
        )}
      </p>
    </div>
  );
};
