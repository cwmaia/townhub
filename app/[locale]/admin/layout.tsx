import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { locales } from "../../../lib/i18n";
import { requireRole } from "../../../lib/auth/guards";
import { prisma } from "../../../lib/db";
import { AdminNav, type AdminNavItem } from "../../(components)/admin/AdminNav";
import { Badge } from "../../../components/ui/badge";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
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
  if (!locales.includes(locale as typeof locales[number])) {
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
          {/* TownApp Logo Header */}
          <div className="border-b border-slate-100 p-4">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="relative" style={{ width: 40, height: 50 }}>
                <Image
                  src="/pin-only-large.png"
                  alt=""
                  width={40}
                  height={50}
                  className="object-contain"
                  priority
                />
                <Image
                  src="/heart-only-large.png"
                  alt=""
                  width={23}
                  height={21}
                  className="absolute object-contain"
                  style={{
                    top: 12,
                    left: 8.5,
                  }}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900">Town</span>
                  <span className="text-lg font-extrabold tracking-tight text-blue-500">App</span>
                </div>
                <span className="text-[10px] text-slate-500 tracking-wide">Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="border-b border-slate-100 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Signed in as</p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              {profile.firstName ?? profile.email ?? "TownApp Team"}
            </h2>
            <p className="text-sm text-slate-500">{profile.email ?? "No email on file"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">{ROLE_LABELS[profile.role]}</Badge>
              {town ? (
                <Badge variant="outline" className="border-[#003580]/20 text-[#003580] text-[10px]">
                  {town.name}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Navigation */}
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
