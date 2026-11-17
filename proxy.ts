import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // api, admin, _next və uzantılı fayllar (şəkillər və s.) dil yönləndirməsindən kənardır
  matcher: "/((?!api|admin|_next|_vercel|.*\..*).*)",
};
