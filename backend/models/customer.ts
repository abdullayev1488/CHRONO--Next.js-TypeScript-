import { Schema, model, models, type Model } from "mongoose";

export interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  /** Email sahibliyi təsdiqlənənə qədər həmişə false-dur */
  emailVerified: boolean;
}

const customerSchema = new Schema<ICustomer>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Customer =
  (models.Customer as Model<ICustomer> | undefined) ?? model<ICustomer>("Customer", customerSchema);
