import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = handleI18n(request);
  // The same URL serves different languages, so shared caches must key on these.
  response.headers.append("Vary", "Accept-Language, Cookie");
  return response;
}

export const config = {
  // Skip API routes, Next internals, files with an extension and metadata routes.
  matcher:
    "/((?!api|_next|_vercel|opengraph-image|twitter-image|apple-icon|icon|manifest|sitemap|robots|.*\\..*).*)",
};
