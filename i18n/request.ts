import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "@/config/site";

type SupportedLocale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as SupportedLocale)) {
    locale = defaultLocale;
  }

  const currentLocale = locale as SupportedLocale;

  return {
    locale: currentLocale,
    messages: (
      await (currentLocale === "en"
        ? import("../messages/en.json")
        : import(`../messages/${currentLocale}.json`))
    ).default,
  };
});
