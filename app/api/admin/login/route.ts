import { ApiError } from "@/backend/http/errors";
import { adminLoginLimiter } from "@/backend/http/rateLimit";
import { json, readJson, route } from "@/backend/http/route";
import { startSession } from "@/backend/http/session";
import { isEmail } from "@/backend/lib/validation";
import { toPublicAdmin, verifyAdminCredentials } from "@/backend/services/adminService";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export const POST = route(async ({ request, cookies }) => {
  // Yalnız uğursuz giriş cəhdləri sayılır
  const attempt = adminLoginLimiter.begin(request);
  const { email, password } = await readJson<LoginBody>(request);

  if (!isEmail(email) || typeof password !== "string" || !password || password.length > 128) {
    throw ApiError.badRequest("Valid email and password required");
  }

  const admin = await verifyAdminCredentials(email, password);
  if (!admin) throw ApiError.unauthorized("Invalid email or password");

  attempt.succeed();
  cookies.push(await startSession("admin", admin._id.toString()));

  return json({ message: "Login successful", admin: toPublicAdmin(admin) });
});
