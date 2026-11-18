import { defineRouting } from "next-intl/routing";

/**
 * One URL for every language. The locale is negotiated from the browser's
 * Accept-Language header on first visit, then remembered in the NEXT_LOCALE
 * cookie when the visitor switches language. The path never changes.
 */
export const routing = defineRouting({
  locales: ["ja", "en"],
  defaultLocale: "ja",
  localePrefix: "never",
});

export type Locale = (typeof routing.locales)[number];
