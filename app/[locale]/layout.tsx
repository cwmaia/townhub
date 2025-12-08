import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type AppLocale } from "../../lib/i18n";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as AppLocale)) {
    return {};
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  const title =
    (messages?.app?.title as string | undefined) ?? "TownApp Stykkishólmur";
  const description =
    (messages?.app?.description as string | undefined) ??
    "Discover Stykkishólmur in Iceland.";

  return {
    title,
    description,
  };
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale: localeStr } = await params;
  const locale = localeStr as AppLocale;

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </NextIntlClientProvider>
  );
};

export default LocaleLayout;
