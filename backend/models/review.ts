import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  product: Types.ObjectId;
  customer: Types.ObjectId;
  /** Ad və soyadın baş hərfi (məs. "John D."), yaradılma anında hesablanır */
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "", maxlength: 80 },
    comment: { type: String, required: true, minlength: 10, maxlength: 1000 },
  },
  { timestamps: true }
);

// Bir müştəri eyni məhsula yalnız bir rəy yaza bilər
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ createdAt: -1 });

export const Review =
  (models.Review as Model<IReview> | undefined) ?? model<IReview>("Review", reviewSchema);
