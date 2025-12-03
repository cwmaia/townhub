import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { locales, type AppLocale } from "../../../lib/i18n";
import { requireRole } from "../../../lib/auth/guards";
import { prisma } from "../../../lib/db";
import { AdminNav, type AdminNavItem } from "../../(components)/admin/AdminNav";
import { Badge } from "../../../components/ui/badge";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: AppLocale }>;
};

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  TOWN_ADMIN: "Town Admin",
  BUSINESS_OWNER: "Business Owner",
  CONTENT_MANAGER: "Content Manager",
  USER: "Member",
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN, UserRole.CONTENT_MANAGER, UserRole.BUSINESS_OWNER]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  const { profile } = auth;

  // Business owners go to their dedicated dashboard
  if (profile.role === UserRole.BUSINESS_OWNER) {
    // Allow /admin/business route for business owners
    // The business page will handle its own data fetching
  } else if (profile.role !== UserRole.SUPER_ADMIN && !profile.townId) {
    redirect(`/${locale}`);
  }

  const town = profile.townId
    ? await prisma.town.findUnique({
        where: { id: profile.townId },
        select: { name: true },
      })
    : null;

  const basePath = `/${locale}/admin`;

  const navDefinitions: Array<
    AdminNavItem & {
      roles: UserRole[];
    }
  > = [
    {
      label: "Overview",
      href: basePath,
      roles: [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN, UserRole.CONTENT_MANAGER],
    },
    {
      label: "My Business",
      href: `${basePath}/business`,
      roles: [UserRole.BUSINESS_OWNER],
    },
    {
      label: "Places",
      href: `${basePath}/places`,
      roles: [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN, UserRole.CONTENT_MANAGER],
      disabled: true,
      badge: "soon",
    },
    {
      label: "Events",
      href: `${basePath}/events`,
      roles: [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN, UserRole.CONTENT_MANAGER],
      disabled: true,
      badge: "soon",
    },
    {
      label: "Businesses",
      href: `${basePath}/businesses`,
      roles: [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN],
    },
    {
      label: "Notifications",
      href: `${basePath}/notifications`,
      roles: [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN],
    },
    {
      label: "Billing",
      href: `${basePath}/billing`,
      roles: [UserRole.SUPER_ADMIN],
      disabled: true,
      badge: "soon",
    },
  ];

  const navItems = navDefinitions.filter((item) => item.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start">
        <aside className="w-full rounded-3xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur lg:w-64">
          <div className="border-b border-slate-100 p-6">
            <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {profile.firstName ?? profile.email ?? "TownApp Team"}
            </h2>
            <p className="text-sm text-slate-500">{profile.email ?? "No email on file"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
              {town ? (
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {town.name}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="p-4">
            <AdminNav items={navItems} />
          </div>
        </aside>
        <main className="flex-1 rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
