import type { BrandSale } from "@/admin/types/stats";

export const TopSellingBrands = ({ brands = [] }: { brands?: BrandSale[] }) => {
  const maxSold = Math.max(...brands.map((brand) => brand.sold), 1);

  return (
    <div className="h-full border border-[#E8E2D8] bg-white p-5">
      <h2 className="font-serif text-[20px] text-[#171717]">Top Selling Brands</h2>

      {brands.length === 0 ? (
        <p className="mt-7 text-[13px] text-[#777]">No sales in this period yet</p>
      ) : (
        <div className="mt-7 space-y-5">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="grid grid-cols-[90px_1fr_30px] items-center gap-3"
            >
              <span className="truncate text-[12px] text-[#555]" title={brand.name}>
                {brand.name}
              </span>

              <div className="h-[8px] bg-[#F1EDE6]">
                <div
                  className="h-full bg-[#B08D57]"
                  style={{ width: `${(brand.sold / maxSold) * 100}%` }}
                />
              </div>

              <span className="text-right text-[12px] text-[#171717]">{brand.sold}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
