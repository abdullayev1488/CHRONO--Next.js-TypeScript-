"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

const StarRow = ({ size, className }) =>
  STARS.map((star) => (
    <Star key={star} size={size} strokeWidth={1.5} className={className} />
  ));

/** Yalnız oxumaq üçün ulduz reytinqi (kəsr dəyərləri də dəstəklənir). */
export const StarRating = ({ value, count, size = 14, showValue = false, className = "" }) => {
  const t = useTranslations("Rating");
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="img"
      aria-label={t("outOf", { value })}
    >
      <span className="relative inline-flex shrink-0 gap-0.5" aria-hidden="true">
        <span className="inline-flex gap-0.5 text-[#171717]/20">
          <StarRow size={size} />
        </span>

        <span
          className="absolute inset-y-0 left-0 inline-flex gap-0.5 overflow-hidden text-[#B08D57]"
          style={{ width: `${percent}%` }}
        >
          <StarRow size={size} className="shrink-0 fill-current" />
        </span>
      </span>

      {showValue && (
        <span className="text-xs font-semibold text-[#171717]">{value.toFixed(1)}</span>
      )}

      {typeof count === "number" && (
        <span className="text-xs text-[#171717]/50">({count})</span>
      )}
    </div>
  );
};
