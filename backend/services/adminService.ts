import bcrypt from "bcrypt";
import type { HydratedDocument } from "mongoose";
import { Admin, type IAdmin } from "../models/admin";
import { isEmail, passwordError } from "../lib/validation";

const BCRYPT_ROUNDS = 12;

// Admin tapılmayanda da bcrypt işləsin ki, cavab müddəti email-in mövcudluğunu açmasın
const DUMMY_HASH = bcrypt.hashSync("chrono-dummy-password", BCRYPT_ROUNDS);

export interface PublicAdmin {
  id: string;
  email: string;
}

export const toPublicAdmin = (admin: HydratedDocument<IAdmin>): PublicAdmin => ({
  id: admin._id.toString(),
  email: admin.email,
});

/** Email və şifrəni yoxlayır; uyğun admini və ya null qaytarır. */
export const verifyAdminCredentials = async (
  email: string,
  password: string
): Promise<HydratedDocument<IAdmin> | null> => {
  const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");

  const isPasswordValid = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);

  return admin && isPasswordValid ? admin : null;
};

/** Admin hesabı yalnız bu funksiya (CLI) ilə yaradılır; açıq HTTP endpoint yoxdur. */
export const createAdminAccount = async (
  email: string,
  password: string
): Promise<HydratedDocument<IAdmin>> => {
  if (!isEmail(email)) throw new Error("Valid email is required");

  const problem = passwordError(password);
  if (problem) throw new Error(problem);

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    return await Admin.create({ email: email.trim().toLowerCase(), passwordHash });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new Error("An admin with this email already exists");
    }
    throw error;
  }
};
