import type { CategorySale } from "@/admin/types/stats";

export const SalesByCategory = ({ categories = [] }: { categories?: CategorySale[] }) => (
  <div className="h-full border border-[#E8E2D8] bg-white p-5">
    <h2 className="font-serif text-[20px] text-[#171717]">Sales by Category</h2>

    {categories.length === 0 ? (
      <p className="mt-8 text-[13px] text-[#777]">No sales in this period yet</p>
    ) : (
      <div className="mt-8 space-y-7">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="mb-3 flex items-center justify-between text-[13px]">
              <span className="text-[#555]">{category.name}</span>

              <span className="font-semibold text-[#171717]">{category.percentage}%</span>
            </div>

            <div className="h-[7px] bg-[#F1EDE6]">
              <div
                className="h-full bg-[#B08D57]"
                style={{ width: `${category.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
