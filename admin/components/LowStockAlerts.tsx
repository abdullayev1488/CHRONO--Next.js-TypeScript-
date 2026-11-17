import { AlertTriangle, Watch } from "lucide-react";
import { getImageUrl } from "@/admin/utils/format";
import type { LowStockProduct } from "@/admin/types/stats";

export const LowStockAlerts = ({ products = [] }: { products?: LowStockProduct[] }) => (
  <div className="border border-[#E8E2D8] bg-white p-5">
    <div className="flex items-center gap-3">
      <h2 className="font-serif text-[20px] text-[#171717]">Low Stock Alerts</h2>

      <AlertTriangle size={18} className="text-[#B08D57]" />
    </div>

    {products.length === 0 ? (
      <p className="mt-6 text-[13px] text-[#777]">All products are well stocked</p>
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
                <Watch size={22} strokeWidth={1.5} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{product.name}</p>
              <p className="mt-1 text-[11px] text-[#B45342]">
                {product.stock === 0 ? "Out of stock" : `Only ${product.stock} left in stock`}
              </p>
            </div>

            <span className="shrink-0 bg-[#F8ECE8] px-3 py-1 text-[11px] text-[#B45342]">
              {product.stock === 0 ? "Sold Out" : "Low Stock"}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);
