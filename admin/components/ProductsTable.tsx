"use client";

import { Pencil, Trash2, Watch } from "lucide-react";
import { useProducts } from "@/admin/hooks/useProducts";
import { getImageUrl } from "@/admin/utils/format";
import type { Product } from "@/admin/types/products";

interface ProductsTableProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const COLUMNS = ["Product", "Brand", "Category", "Price", "Stock", "Actions"];

const formatStock = (stock: number): string | number => (stock === 0 ? "Out of stock" : stock);

const formatPrice = (price: number): string => `$${price.toLocaleString("en-US")}`;

interface ProductImageProps {
  product: Product;
  iconSize: number;
}

const ProductImage = ({ product, iconSize }: ProductImageProps) =>
  product.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getImageUrl(product.image)}
      alt={product.name}
      className="h-full w-full object-contain"
    />
  ) : (
    <Watch size={iconSize} className="text-[#B08D57]" />
  );

export const ProductsTable = ({ onEdit, onDelete }: ProductsTableProps) => {
  const { data: products = [], isLoading, isError } = useProducts();

  if (isLoading) {
    return (
      <div className="border border-[#E8E2D8] bg-white p-8 text-center text-[#777]">
        Loading products...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-[#E8E2D8] bg-white p-8 text-center text-red-600">
        Failed to load products.
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* DESKTOP TABLE */}
      <div className="hidden overflow-hidden border border-[#E8E2D8] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-[#F7F4EE]">
              <tr>
                {COLUMNS.map((title) => (
                  <th key={title} className="px-5 py-4 text-[12px] font-medium text-[#666]">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-t border-[#E8E2D8] transition-colors hover:bg-[#FAF8F4]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#FAF8F4]">
                        <ProductImage product={product} iconSize={23} />
                      </div>

                      <span className="text-[13px] font-medium text-[#171717]">{product.name}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[12px] text-[#555]">{product.brand}</td>

                  <td className="px-5 py-4 text-[12px] text-[#555]">{product.category}</td>

                  <td className="px-5 py-4 text-[12px] font-medium">{formatPrice(product.price)}</td>

                  <td className="px-5 py-4 text-[12px] text-[#555]">{formatStock(product.stock)}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onEdit(product)}
                        className="cursor-pointer text-[#777] hover:text-[#B08D57]"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => onDelete(product)}
                        className="cursor-pointer text-[#777] hover:text-[#B45342]"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((product) => (
          <div key={product._id} className="min-w-0 border border-[#E8E2D8] bg-white p-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-[#FAF8F4] p-2">
                <ProductImage product={product} iconSize={28} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#B08D57]">
                  {product.brand}
                </p>

                <h3 className="mt-1 wrap-break-word text-[13px] font-medium leading-5 text-[#171717]">
                  {product.name}
                </h3>

                <span className="mt-2 inline-block bg-[#F7F4EE] px-2 py-1 text-[10px] text-[#666]">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#E8E2D8] pt-4">
              <div>
                <p className="text-[10px] text-[#888]">Price</p>
                <p className="mt-1 text-[15px] font-semibold text-[#171717]">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-[#888]">Stock</p>
                <p className="mt-1 text-[13px] font-medium text-[#555]">{formatStock(product.stock)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Edit ${product.name}`}
                  onClick={() => onEdit(product)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[#E8E2D8] text-[#777] transition-colors hover:border-[#B08D57] hover:text-[#B08D57]"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  aria-label={`Delete ${product.name}`}
                  onClick={() => onDelete(product)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[#E8E2D8] text-[#777] transition-colors hover:border-[#B45342] hover:text-[#B45342]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="border border-[#E8E2D8] bg-white p-8 text-center text-[13px] text-[#777]">
          No products found.
        </p>
      )}
    </div>
  );
};
