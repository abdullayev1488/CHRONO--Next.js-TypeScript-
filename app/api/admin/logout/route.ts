import { json, route } from "@/backend/http/route";
import { endSession } from "@/backend/http/session";

export const POST = route(async ({ request, cookies }) => {
  cookies.push(await endSession(request, "admin"));

  return json({ message: "Logged out" });
});
