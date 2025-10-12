import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "@/config/site";

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  localePrefix: localePrefix,
  // pathnames: pathnames,
  // Used when no locale matches
  defaultLocale: defaultLocale,
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(en|de|es|fr|it|ja|ko|pt|ru|zh)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    // Exclude API routes, Next.js internals, and static files (images, fonts, etc.)
    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)).*)",
  ],
};
