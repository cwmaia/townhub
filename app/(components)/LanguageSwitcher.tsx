'use client';

import { useTransition } from "react";
import { usePathname, useRouter } from "../../lib/i18n";
import { locales, type AppLocale } from "../../lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useTranslations } from "next-intl";

const languageLabels: Record<AppLocale, string> = {
  en: "English",
  is: "Íslenska",
};

type LanguageSwitcherProps = {
  currentLocale: AppLocale;
};

const LanguageSwitcher = ({ currentLocale }: LanguageSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("header.language");

  return (
    <Select
      defaultValue={currentLocale}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(() => {
          router.replace(pathname, { locale: value as AppLocale });
        });
      }}
    >
      <SelectTrigger className="h-9 w-[140px] border-slate-200 bg-white text-sm">
        <SelectValue placeholder={t("label")} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {t(locale) ?? languageLabels[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
