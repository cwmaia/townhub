import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileMenu from "./ProfileMenu";
import type { ProfileSummary } from "./types";
import type { AppLocale } from "../../lib/i18n";

type HeaderProps = {
  townName: string;
  locale: AppLocale;
  profile: ProfileSummary | null;
};

const Header = ({ townName, locale, profile }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 text-xl font-semibold text-primary"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-md">
            TH
          </span>
          <span className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              TownHub
            </span>
            <span>{townName}</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <ProfileMenu profile={profile} currentLocale={locale} />
        </div>
      </div>
    </header>
  );
};

export default Header;
