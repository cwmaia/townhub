import { getRequestConfig } from "next-intl/server";
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const locales = ["en", "is"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale =
  (process.env.NEXT_PUBLIC_DEFAULT_LANG as AppLocale) ?? "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export const i18nConfig = {
  locales,
  defaultLocale,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !locales.includes(locale as AppLocale)) {
    locale = defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`).catch(() =>
    import("../messages/en.json")
  )) as { default: Record<string, unknown> };

  return {
    locale,
    messages: messages.default,
  };
});
