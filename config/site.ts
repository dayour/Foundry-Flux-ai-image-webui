export const siteConfig: any = {
  name: "Autogen Design",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  domain: "autogen.design",
  mail: "support@autogen.design",
  effectiveDate: "2024.8.9"
};

import { Pathnames, LocalePrefix } from "next-intl/routing";

export const defaultLocale = "en" as const;
export const languages = [
  { lang: "en", label: "English", hrefLang: "en-US" },
] as const;

export const locales = languages.map((lang) => lang.lang);

export const localePrefix = "as-needed" as const;//"always";
