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
    <nav className="mt-6 space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const className = cn(
          "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-slate-600 hover:bg-slate-100",
          item.disabled && !isActive ? "opacity-60 cursor-not-allowed" : ""
        );

        const content = (
          <>
            <span>{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
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
