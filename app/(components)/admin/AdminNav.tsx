'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../../lib/utils";

export type AdminNavItem = {
  label: string;
  href: string;
  disabled?: boolean;
  badge?: string;
};

type AdminNavProps = {
  items: AdminNavItem[];
};

export function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const className = cn(
          "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-[#003580]/10 text-[#003580] shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          item.disabled && !isActive ? "opacity-50 cursor-not-allowed" : ""
        );

        const content = (
          <>
            <span>{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] uppercase tracking-wide text-amber-700 font-semibold">
                {item.badge}
              </span>
            ) : null}
          </>
        );

        if (item.disabled) {
          return (
            <span key={item.label} className={className} aria-disabled="true">
              {content}
            </span>
          );
        }

        return (
          <Link key={item.label} href={item.href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
