import { Schema, model, models, type Model } from "mongoose";

export type SessionKind = "admin" | "customer";

export interface ISession {
  _id: string;
  kind: SessionKind;
  userId: string;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>({
  _id: { type: String },
  kind: { type: String, enum: ["admin", "customer"], required: true },
  userId: { type: String, required: true },
  // MongoDB TTL indeksi vaxtı bitmiş sessiyaları özü silir
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const Session =
  (models.Session as Model<ISession> | undefined) ??
  model<ISession>("Session", sessionSchema, "sessions");
