import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/admin/lib/api";
import type {
  DeleteProductResult,
  Product,
  ProductFormData,
  UpdateProductVariables,
} from "@/admin/types/products";

const toFormData = (data: ProductFormData): FormData => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("brand", data.brand);
  formData.append("category", data.category);
  formData.append("price", String(data.price));
  formData.append("oldPrice", data.oldPrice === null ? "" : String(data.oldPrice));
  formData.append("badge", data.badge ?? "");
  formData.append("featured", String(data.featured));
  formData.append("stock", String(data.stock));

  formData.append("mechanism", data.specs.mechanism ?? "");
  formData.append("caseSize", data.specs.caseSize === null ? "" : String(data.specs.caseSize));
  formData.append("caseMaterial", data.specs.caseMaterial ?? "");
  formData.append("strap", data.specs.strap ?? "");
  formData.append(
    "waterResistance",
    data.specs.waterResistance === null ? "" : String(data.specs.waterResistance)
  );
  formData.append("glass", data.specs.glass ?? "");

  if (data.imageFile) formData.append("image", data.imageFile);
  data.galleryFiles.forEach((file) => formData.append("gallery", file));
  data.removeGallery.forEach((url) => formData.append("removeGallery", url));

  return formData;
};

const useInvalidateProducts = () => {
  const queryClient = useQueryClient();

  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });

    if (id) queryClient.invalidateQueries({ queryKey: ["product", id] });
  };
};

export const useCreateProduct = () => {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const response = await api.post<Product>("/api/admin/products", toFormData(data));
      return response.data;
    },
    onSuccess: () => invalidate(),
  });
};

export const useUpdateProduct = () => {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateProductVariables) => {
      const response = await api.put<Product>(`/api/admin/products/${id}`, toFormData(data));
      return response.data;
    },
    onSuccess: (product) => invalidate(product._id),
  });
};

export const useDeleteProduct = () => {
  const invalidate = useInvalidateProducts();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<DeleteProductResult>(`/api/admin/products/${id}`);
      return response.data;
    },
    onSuccess: (_result, id) => invalidate(id),
  });
};
