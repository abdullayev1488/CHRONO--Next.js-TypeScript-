import type { HydratedDocument } from "mongoose";
import { Admin, type IAdmin } from "../models/admin";
import { Customer, type ICustomer } from "../models/customer";
import { Session, type SessionKind } from "../models/session";
import { ApiError } from "./errors";
import { getSessionUserId } from "./session";

// Sessiyası olan, lakin silinmiş istifadəçinin qalıq sessiyaları təmizlənir
const dropSessions = (kind: SessionKind, userId: string) => Session.deleteMany({ kind, userId });

export const requireAdmin = async (request: Request): Promise<HydratedDocument<IAdmin>> => {
  const adminId = await getSessionUserId(request, "admin");
  if (!adminId) throw ApiError.unauthorized();

  const admin = await Admin.findById(adminId);
  if (!admin) {
    await dropSessions("admin", adminId);
    throw ApiError.unauthorized();
  }

  return admin;
};

export const requireCustomer = async (request: Request): Promise<HydratedDocument<ICustomer>> => {
  const customerId = await getSessionUserId(request, "customer");
  if (!customerId) throw ApiError.unauthorized();

  const customer = await Customer.findById(customerId);
  if (!customer) {
    await dropSessions("customer", customerId);
    throw ApiError.unauthorized();
  }

  return customer;
};

/** Giriş etməyibsə də davam edir (qonaq sifarişi); giriş edibsə müştərini qaytarır. */
export const getOptionalCustomer = async (
  request: Request
): Promise<HydratedDocument<ICustomer> | null> => {
  const customerId = await getSessionUserId(request, "customer");
  return customerId ? Customer.findById(customerId) : null;
};
