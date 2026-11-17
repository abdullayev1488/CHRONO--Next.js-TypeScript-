import type { Badge, Category, Mechanism } from "@/backend/constants";

/** Texniki xüsusiyyətlər (API cavabı); təyin olunmayanlar null-dır */
export interface ProductSpecs {
  mechanism: Mechanism | null;
  caseSize: number | null;
  caseMaterial: string | null;
  strap: string | null;
  waterResistance: number | null;
  glass: string | null;
}

/** Texniki xüsusiyyət input-ları string saxlayır; göndərməzdən əvvəl rəqəmə çevrilir */
export interface ProductSpecsFormState {
  mechanism: Mechanism | "";
  caseSize: string | number;
  caseMaterial: string;
  strap: string;
  waterResistance: string | number;
  glass: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice: number | null;
  image: string;
  /** Əlavə qalereya şəkilləri */
  images: string[];
  specs: ProductSpecs;
  badge: Badge | null;
  featured: boolean;
  stock: number;
}

/** Forma göndərilən məlumat; şəkil fayl kimi yüklənir */
export interface ProductFormData {
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice: number | null;
  badge: Badge | null;
  featured: boolean;
  stock: number;
  specs: ProductSpecs;
  imageFile: File | null;
  /** Qalereyaya əlavə olunacaq yeni fayllar */
  galleryFiles: File[];
  /** Qalereyadan silinəcək mövcud şəkil URL-ləri */
  removeGallery: string[];
}

export interface UpdateProductVariables {
  id: string;
  data: ProductFormData;
}

export interface DeleteProductResult {
  message: string;
  /** Sifarişi olan məhsul silinmir, arxivlənir */
  archived: boolean;
}
