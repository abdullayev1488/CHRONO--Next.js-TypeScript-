import { Schema, model, models, type Model } from "mongoose";
import {
  BADGES,
  CATEGORIES,
  MECHANISMS,
  type Badge,
  type Category,
  type Mechanism,
} from "../constants";

/** Texniki xüsusiyyətlər; təyin olunmayan sahələr null-dır */
export interface IProductSpecs {
  mechanism: Mechanism | null;
  /** Korpus diametri, mm */
  caseSize: number | null;
  caseMaterial: string | null;
  strap: string | null;
  /** Suya davamlılıq, metr */
  waterResistance: number | null;
  glass: string | null;
}

export interface IProduct {
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice: number | null;
  image: string;
  /** Əlavə qalereya şəkilləri (əsas şəkil `image`-dir) */
  images: string[];
  specs: IProductSpecs;
  badge: Badge | null;
  featured: boolean;
  stock: number;
  /** Sifarişi olan məhsullar silinmir, arxivlənir */
  archived: boolean;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: CATEGORIES },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: null, min: 0 },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  specs: {
    mechanism: { type: String, enum: MECHANISMS, default: null },
    caseSize: { type: Number, min: 20, max: 60, default: null },
    caseMaterial: { type: String, trim: true, default: null },
    strap: { type: String, trim: true, default: null },
    waterResistance: { type: Number, min: 0, max: 1000, default: null },
    glass: { type: String, trim: true, default: null },
  },
  badge: { type: String, default: null, enum: BADGES },
  featured: { type: Boolean, default: false },
  stock: { type: Number, required: true, min: 0, default: 0 },
  archived: { type: Boolean, default: false },
});

export const Product =
  (models.Product as Model<IProduct> | undefined) ?? model<IProduct>("Product", productSchema);
