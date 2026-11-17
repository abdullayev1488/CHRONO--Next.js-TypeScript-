import { Schema, model, models, type Model } from "mongoose";

export interface IAdmin {
  email: string;
  passwordHash: string;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export const Admin =
  (models.Admin as Model<IAdmin> | undefined) ?? model<IAdmin>("Admin", adminSchema);
