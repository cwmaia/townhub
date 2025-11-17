import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { prisma } from "../../../../../lib/db";
import { locales, type AppLocale } from "../../../../../lib/i18n";
import { requireRole } from "../../../../../lib/auth/guards";
import { resolveAdminTownContext } from "../helpers";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";

type NotificationsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const createNotificationDraftAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const title = formData.get("title")?.toString().trim() || "Untitled notification";

  const { auth, townId } = await resolveAdminTownContext(formData);

  await prisma.notification.create({
    data: {
      title,
      body: "",
      type: "TOWN_BROADCAST",
      senderId: auth.profile.id,
      townId,
      status: "draft",
    },
  });

  revalidatePath(`/${locale}/admin/notifications`);
};

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    redirect(`/${locales[0]}`);
  }

  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  const townId =
    auth.profile.role === UserRole.SUPER_ADMIN
      ? auth.profile.townId
      : auth.profile.townId;

  if (!townId) {
    redirect(`/${locale}`);
  }

  const notifications = await prisma.notification.findMany({
    where: { townId },
    include: {
      business: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const totalSent = await prisma.notification.count({
    where: {
      townId,
      status: { in: ["sent", "delivered"] },
    },
  });

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">Town communications</p>
        <h1 className="text-3xl font-semibold text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500">
          Draft and schedule push notifications for your residents and business subscribers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">This month</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalSent}</p>
          <p className="text-sm text-slate-500">Notifications sent</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Quota status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">Coming soon</p>
          <p className="text-sm text-slate-500">Track per-tier usage here.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Delivery rate</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">—</p>
          <p className="text-sm text-slate-500">Analytics dashboard arriving in Phase C.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create notification</h2>
            <p className="text-sm text-slate-500">
              Scheduling, segmentation, and content composer will be added next.
            </p>
          </div>
          <form action={createNotificationDraftAction} className="flex gap-2">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="townId" value={townId} />
            <input type="hidden" name="title" value="Untitled notification" />
            <Button type="submit" className="rounded-full">
              Start draft
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Recent notifications</h2>
          <Badge variant="outline">
            {notifications.length} shown
          </Badge>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="text-xs text-slate-500">
                  {notification.business?.name
                    ? `Sent by ${notification.business.name}`
                    : "Town broadcast"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge variant="secondary">{notification.status}</Badge>
                {notification.audienceCount ? (
                  <span>{notification.audienceCount} recipients</span>
                ) : null}
                <span>
                  Created {notification.createdAt.toLocaleDateString()}{" "}
                  {notification.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {!notifications.length ? (
            <p className="py-6 text-sm text-slate-500">
              No notifications yet. Create a draft to get started.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
