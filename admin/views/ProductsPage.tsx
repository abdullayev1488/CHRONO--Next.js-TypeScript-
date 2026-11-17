"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { ProductsTable } from "@/admin/components/ProductsTable";
import { ProductModal } from "@/admin/components/ProductModal";
import { ConfirmDeleteModal } from "@/admin/components/ConfirmDeleteModal";
import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/admin/hooks/useProductMutations";
import { getErrorMessage } from "@/admin/utils/errors";
import type { Product, ProductFormData } from "@/admin/types/products";

const NOTICE_DURATION_MS = 3500;

export const ProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const activeMutation = editingProduct ? updateProduct : createProduct;

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), NOTICE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [notice]);

  const openAddModal = () => {
    createProduct.reset();
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    updateProduct.reset();
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (activeMutation.isPending) return;

    setIsModalOpen(false);
  };

  const handleSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct._id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setNotice("Product updated successfully.");
          },
        }
      );

      return;
    }

    createProduct.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
        setNotice("Product added successfully.");
      },
    });
  };

  const openDeleteModal = (product: Product) => {
    deleteProduct.reset();
    setDeletingProduct(product);
  };

  const closeDeleteModal = () => {
    if (deleteProduct.isPending) return;

    setDeletingProduct(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct || deleteProduct.isPending) return;

    deleteProduct.mutate(deletingProduct._id, {
      onSuccess: (result) => {
        setDeletingProduct(null);
        setNotice(
          result.archived
            ? "Product archived. It has orders, so its history is preserved."
            : "Product deleted."
        );
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-8 pt-6 sm:px-6 md:px-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] text-[#171717]">Products</h1>

          <p className="mt-1 text-[12px] text-[#777]">Manage your watch collection</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex cursor-pointer items-center gap-2 bg-[#B08D57] px-5 py-3 text-[12px] text-white transition-colors hover:bg-[#967445]"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-5 flex items-center gap-2 border border-[#CFE3D2] bg-[#E4F0E3] px-4 py-3 text-[12px] text-[#367546]"
        >
          <CheckCircle2 size={16} />
          {notice}
        </p>
      )}

      <ProductsTable onEdit={openEditModal} onDelete={openDeleteModal} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={editingProduct}
        onSubmit={handleSubmit}
        isSubmitting={activeMutation.isPending}
        error={activeMutation.isError ? getErrorMessage(activeMutation.error) : ""}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(deletingProduct)}
        productName={deletingProduct?.name}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteProduct.isPending}
        error={deleteProduct.isError ? getErrorMessage(deleteProduct.error) : ""}
      />
    </div>
  );
};
