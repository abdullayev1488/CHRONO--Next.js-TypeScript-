"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Save, Plus, UploadCloud, ImagePlus } from "lucide-react";
import type { Badge, Category } from "@/backend/constants";
import { useModalBehavior } from "@/admin/hooks/useModalBehavior";
import { getImageUrl } from "@/admin/utils/format";
import { ALLOWED_IMAGE_TYPES, getImageFileError } from "@/admin/utils/imageUpload";
import type {
  Product,
  ProductFormData,
  ProductSpecs,
  ProductSpecsFormState,
} from "@/admin/types/products";
import { ProductGalleryField, type GalleryValue } from "./ProductGalleryField";
import { ProductSpecsFields } from "./ProductSpecsFields";

/** Input-lar string saxlayır; göndərməzdən əvvəl rəqəmə çevrilir */
interface FormState extends ProductSpecsFormState {
  name: string;
  brand: string;
  category: Category;
  price: string | number;
  oldPrice: string | number;
  badge: Badge | "";
  featured: boolean;
  stock: string | number;
}

const initialForm: FormState = {
  name: "",
  brand: "",
  category: "Luxury",
  price: "",
  oldPrice: "",
  badge: "",
  featured: false,
  stock: "",
  mechanism: "",
  caseSize: "",
  caseMaterial: "",
  strap: "",
  waterResistance: "",
  glass: "",
};

const buildForm = (product: Product | null): FormState =>
  product
    ? {
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        oldPrice: product.oldPrice ?? "",
        badge: product.badge ?? "",
        featured: product.featured,
        stock: product.stock,
        mechanism: product.specs.mechanism ?? "",
        caseSize: product.specs.caseSize ?? "",
        caseMaterial: product.specs.caseMaterial ?? "",
        strap: product.specs.strap ?? "",
        waterResistance: product.specs.waterResistance ?? "",
        glass: product.specs.glass ?? "",
      }
    : initialForm;

type SpecsResult = { specs: ProductSpecs } | { error: string };

const optionalText = (value: string): string | null => value.trim() || null;

/** Texniki xüsusiyyət input-larını yoxlayıb API formatına çevirir (boş sahələr null olur). */
const parseSpecs = (form: ProductSpecsFormState): SpecsResult => {
  const caseSize = form.caseSize === "" ? null : Number(form.caseSize);
  const waterResistance = form.waterResistance === "" ? null : Number(form.waterResistance);

  if (caseSize !== null && !(caseSize >= 20 && caseSize <= 60)) {
    return { error: "Case size must be between 20 and 60 mm." };
  }

  if (waterResistance !== null && !(Number.isInteger(waterResistance) && waterResistance >= 0 && waterResistance <= 1000)) {
    return { error: "Water resistance must be a whole number between 0 and 1000 m." };
  }

  return {
    specs: {
      mechanism: form.mechanism || null,
      caseSize,
      caseMaterial: optionalText(form.caseMaterial),
      strap: optionalText(form.strap),
      waterResistance,
      glass: optionalText(form.glass),
    },
  };
};

const inputClass =
  "w-full border border-[#E8E2D8] bg-white px-3 py-2.5 text-[13px] text-[#171717] outline-none transition-colors placeholder:text-[#AAA] focus:border-[#B08D57]";

const labelClass = "mb-1.5 block text-[11px] font-medium text-[#555]";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSubmit: (data: ProductFormData) => void;
  isSubmitting?: boolean;
  error?: string;
}

type ContentProps = Omit<ProductModalProps, "isOpen" | "product"> & {
  product: Product | null;
  isSubmitting: boolean;
  error: string;
};

// Modal açılanda mount olur: form state-i props-dan başlanğıc dəyər kimi alınır
const ProductModalContent = ({ onClose, product, onSubmit, isSubmitting, error }: ContentProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Bağlanma animasiyası zamanı başlıq dəyişməsin deyə ilk dəyər saxlanılır
  const [original] = useState(product);
  const isEditing = Boolean(original);

  const [form, setForm] = useState(() => buildForm(original));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(() => getImageUrl(original?.image));
  const [gallery, setGallery] = useState<GalleryValue>({
    kept: original?.images ?? [],
    files: [],
  });
  const [localError, setLocalError] = useState("");

  useModalBehavior(dialogRef, onClose, !isSubmitting);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

    setForm((previous) => ({ ...previous, [name]: nextValue }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const problem = getImageFileError(file);

    if (problem) {
      setLocalError(problem);
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    previewUrlRef.current = URL.createObjectURL(file);

    setLocalError("");
    setImageFile(file);
    setPreview(previewUrlRef.current);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!imageFile && !original?.image) {
      setLocalError("Please select a product image.");
      return;
    }

    const price = Number(form.price);
    const oldPrice = form.oldPrice === "" ? null : Number(form.oldPrice);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      setLocalError("Please enter a valid price.");
      return;
    }

    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
      setLocalError("Please enter a valid old price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setLocalError("Stock must be a whole number, 0 or more.");
      return;
    }

    const specsResult = parseSpecs(form);

    if ("error" in specsResult) {
      setLocalError(specsResult.error);
      return;
    }

    setLocalError("");

    onSubmit({
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price,
      oldPrice,
      badge: form.badge || null,
      featured: form.featured,
      stock,
      specs: specsResult.specs,
      imageFile,
      galleryFiles: gallery.files,
      removeGallery: (original?.images ?? []).filter((url) => !gallery.kept.includes(url)),
    });
  };

  const message = localError || error;

  return (
    <motion.div
      key="product-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex max-h-[92dvh] w-full max-w-[620px] flex-col overflow-hidden bg-[#FAF8F4] shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8E2D8] px-5 py-4 sm:px-7">
          <div>
            <h2 id="product-modal-title" className="font-serif text-[24px] text-[#171717]">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>

            <p className="mt-1 text-[11px] text-[#888]">
              {isEditing ? "Update your watch information" : "Add a new watch to your collection"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="cursor-pointer p-2 text-[#777] transition-colors hover:text-[#171717] disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="product-name" className={labelClass}>
                Product Name *
              </label>

              <input
                id="product-name"
                data-autofocus
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rolex Submariner Date"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="product-brand" className={labelClass}>
                Brand *
              </label>

              <input
                id="product-brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="ROLEX"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="product-category" className={labelClass}>
                Category *
              </label>

              <select
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
                required
              >
                <option value="Luxury">Luxury</option>
                <option value="Classic">Classic</option>
                <option value="Modern">Modern</option>
              </select>
            </div>

            <div>
              <label htmlFor="product-price" className={labelClass}>
                Price ($) *
              </label>

              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="1299"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="product-old-price" className={labelClass}>
                Old Price ($)
              </label>

              <input
                id="product-old-price"
                name="oldPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.oldPrice}
                onChange={handleChange}
                placeholder="1599"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="product-stock" className={labelClass}>
                Stock *
              </label>

              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="product-badge" className={labelClass}>
                Badge
              </label>

              <select
                id="product-badge"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Popular">Popular</option>
                <option value="Sale">Sale</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>

            {/* IMAGE UPLOAD */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Product Image *</label>

              <label
                htmlFor="product-image"
                className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-[#CFC5B5] bg-white p-5 text-center transition-colors hover:border-[#B08D57]"
              >
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Product preview" className="h-28 w-full object-contain" />

                    <span className="flex items-center gap-2 text-[12px] font-medium text-[#B08D57]">
                      <ImagePlus size={16} />
                      Change Image
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-[#B08D57]" />

                    <div>
                      <p className="text-[13px] font-medium text-[#171717]">Upload Product Image</p>

                      <p className="mt-1 text-[11px] text-[#888]">Choose from your phone or laptop</p>
                    </div>

                    <span className="border border-[#B08D57] px-4 py-2 text-[11px] text-[#B08D57]">
                      Choose Image
                    </span>
                  </>
                )}

                <input
                  id="product-image"
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {imageFile && (
                <p className="mt-2 break-all text-[11px] text-[#777]">Selected: {imageFile.name}</p>
              )}

              <p className="mt-2 text-[10px] text-[#999]">Supported formats: PNG, JPG, WEBP</p>
            </div>

            <ProductGalleryField
              initial={original?.images ?? []}
              onChange={setGallery}
              onError={setLocalError}
            />

            <ProductSpecsFields values={form} onChange={handleChange} />

            {/* FEATURED */}
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 border border-[#E8E2D8] bg-white p-3">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer accent-[#B08D57]"
                />

                <div>
                  <p className="text-[12px] font-medium text-[#171717]">Featured Product</p>

                  <p className="mt-0.5 text-[10px] text-[#888]">
                    Display this watch in featured collections
                  </p>
                </div>
              </label>
            </div>
          </div>
        </form>

        {message && (
          <p
            role="alert"
            className="shrink-0 border-t border-[#E8E2D8] bg-[#F8E2DF] px-5 py-3 text-[12px] text-[#AD4944] sm:px-7"
          >
            {message}
          </p>
        )}

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E8E2D8] bg-white px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer border border-[#E8E2D8] px-5 py-2.5 text-[12px] text-[#555] transition-colors hover:bg-[#FAF8F4] disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="flex cursor-pointer items-center gap-2 bg-[#B08D57] px-5 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-[#967445] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditing ? <Save size={15} /> : <Plus size={15} />}

            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ProductModal = ({
  isOpen,
  onClose,
  product = null,
  onSubmit,
  isSubmitting = false,
  error = "",
}: ProductModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <ProductModalContent
        key="product-modal"
        onClose={onClose}
        product={product}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    )}
  </AnimatePresence>
);
