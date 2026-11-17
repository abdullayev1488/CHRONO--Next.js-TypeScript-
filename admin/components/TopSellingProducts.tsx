import { Watch } from "lucide-react";
import { formatMoney, getImageUrl } from "@/admin/utils/format";
import type { TopProduct } from "@/admin/types/stats";

export const TopSellingProducts = ({ products = [] }: { products?: TopProduct[] }) => (
  <div className="h-full border border-[#E8E2D8] bg-white p-5">
    <h2 className="font-serif text-[20px] text-[#171717]">Top Selling Products</h2>

    {products.length === 0 ? (
      <p className="mt-6 text-[13px] text-[#777]">No sales in this period yet</p>
    ) : (
      <div className="mt-6 divide-y divide-[#E8E2D8]">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#FAF8F4] text-[#B08D57]">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Watch size={23} strokeWidth={1.4} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-[#171717]">
                {product.name}
              </p>

              <p className="mt-1 text-[11px] text-[#888]">
                {product.brand} · {product.sold} {product.sold === 1 ? "unit" : "units"} sold
              </p>
            </div>

            <p className="text-[13px] font-medium text-[#171717]">
              {formatMoney(product.revenue)}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);
