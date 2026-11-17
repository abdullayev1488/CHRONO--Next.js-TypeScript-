import bcrypt from "bcrypt";
import type { HydratedDocument } from "mongoose";
import { getEnv } from "../config/env";
import { ApiError } from "../http/errors";
import { cleanString, isEmail, passwordError } from "../lib/validation";
import { Customer, type ICustomer } from "../models/customer";

const BCRYPT_ROUNDS = 12;

// Müştəri tapılmayanda da bcrypt işləsin ki, cavab müddəti email-in mövcudluğunu açmasın
const DUMMY_HASH = bcrypt.hashSync("chrono-dummy-password", BCRYPT_ROUNDS);

type Raw = Record<string, unknown>;

export interface PublicCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
}

export const toPublicCustomer = (customer: HydratedDocument<ICustomer>): PublicCustomer => ({
  id: customer._id.toString(),
  firstName: customer.firstName,
  lastName: customer.lastName,
  email: customer.email,
  emailVerified: customer.emailVerified,
});

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;

/** Qeydiyyatdan keçirir; məlumat yanlışdırsa 400, email təkrardırsa 409 atır. */
export const registerCustomer = async (body: Raw): Promise<HydratedDocument<ICustomer>> => {
  // Email təsdiqi qurulmayana qədər production-da qeydiyyat bağlıdır
  if (!getEnv().publicRegistration) {
    throw ApiError.forbidden("Registration is currently unavailable");
  }

  const firstName = cleanString(body.firstName, 60);
  const lastName = cleanString(body.lastName, 60);

  if (!firstName || !lastName) throw ApiError.badRequest("First and last name are required");
  if (!isEmail(body.email)) throw ApiError.badRequest("Valid email is required");

  const problem = passwordError(body.password);
  if (problem) throw ApiError.badRequest(problem);

  const passwordHash = await bcrypt.hash(body.password as string, BCRYPT_ROUNDS);

  try {
    return await Customer.create({
      firstName,
      lastName,
      email: body.email.trim().toLowerCase(),
      passwordHash,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw ApiError.conflict("An account with this email already exists");
    }
    throw error;
  }
};

/** Email və şifrəni yoxlayır; yanlışdırsa 400/401 atır. */
export const authenticateCustomer = async (body: Raw): Promise<HydratedDocument<ICustomer>> => {
  const { email, password } = body;

  if (!isEmail(email) || typeof password !== "string" || !password || password.length > 128) {
    throw ApiError.badRequest("Valid email and password required");
  }

  const customer = await Customer.findOne({ email: email.trim().toLowerCase() }).select(
    "+passwordHash"
  );

  const isPasswordValid = await bcrypt.compare(
    password,
    customer ? customer.passwordHash : DUMMY_HASH
  );

  if (!customer || !isPasswordValid) throw ApiError.unauthorized("Invalid email or password");

  return customer;
};
