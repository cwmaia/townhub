import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { SubscriptionTarget, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { locales, type AppLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";
import { requireRole } from "@/lib/auth/guards";
import { resolveAdminTownContext } from "../helpers";
import { ImageUploadInput } from "../../../(components)/admin/ImageUploadInput";
import { CopyButton } from "../../../(components)/admin/CopyButton";

type BusinessesPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const BUSINESS_STATUSES = ["pending", "active", "paused", "suspended"] as const;

const createBusinessAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const name = formData.get("name")?.toString().trim();
  const contactEmail = formData.get("contactEmail")?.toString().trim() || null;
  const contactPhone = formData.get("contactPhone")?.toString().trim() || null;
  const shortDescription = formData.get("shortDescription")?.toString() || null;
  const longDescription = formData.get("longDescription")?.toString() || null;
  const logoUrl = formData.get("logoUrl")?.toString() || null;
  const heroImageUrl = formData.get("heroImageUrl")?.toString() || null;
  const galleryInput = formData.get("galleryUrls")?.toString() || "";
  const galleryUrls = galleryInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const subscriptionId = formData.get("subscriptionId")?.toString() || null;
  const placeId = formData.get("placeId")?.toString() || null;
  const status = formData.get("status")?.toString() || "pending";

  if (!name || !subscriptionId) {
    throw new Error("Name and subscription tier are required.");
  }

  const { townId } = await resolveAdminTownContext(formData);

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId, target: SubscriptionTarget.BUSINESS },
  });

  if (!subscription) {
    throw new Error("Invalid subscription tier.");
  }

  const baseSlug = slugify(name);
  const slug = baseSlug || `business-${Date.now().toString(36)}`;

  await prisma.business.create({
    data: {
      name,
      slug,
      townId,
      subscriptionId,
      shortDescription,
      longDescription,
      logoUrl,
      heroImageUrl,
      galleryUrls,
      contactEmail,
      contactPhone,
      monthlyNotificationLimit: subscription.notificationLimit ?? null,
      monthlyEventLimit: subscription.eventLimit ?? null,
      notificationQuota: subscription.notificationLimit ?? 0,
      quotaResetAt: new Date(),
      status,
      placeId: placeId || null,
    },
  });

  revalidatePath(`/${locale}/admin/businesses`);
};

const updateBusinessAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Business id required.");

  const { townId } = await resolveAdminTownContext(formData);
  const subscriptionId = formData.get("subscriptionId")?.toString() || null;
  const status = formData.get("status")?.toString() || undefined;
  const contactEmail = formData.get("contactEmail")?.toString().trim() || null;
  const contactPhone = formData.get("contactPhone")?.toString().trim() || null;

  const updates: Record<string, unknown> = {
    contactEmail,
    contactPhone,
  };

  if (status && BUSINESS_STATUSES.includes(status as (typeof BUSINESS_STATUSES)[number])) {
    updates.status = status;
  }

  if (subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId, target: SubscriptionTarget.BUSINESS },
    });
    if (subscription) {
      updates.subscriptionId = subscriptionId;
      updates.monthlyNotificationLimit = subscription.notificationLimit ?? null;
      updates.monthlyEventLimit = subscription.eventLimit ?? null;
    }
  }

  await prisma.business.update({
    where: { id, townId },
    data: updates,
  });

  revalidatePath(`/${locale}/admin/businesses`);
};

const deleteBusinessAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  const { townId } = await resolveAdminTownContext(formData);

  await prisma.business.delete({
    where: { id, townId },
  });

  revalidatePath(`/${locale}/admin/businesses`);
};

const createClaimLinkAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const businessId = formData.get("businessId")?.toString();
  if (!businessId) return;

  const ownerEmail = formData.get("ownerEmail")?.toString().trim() || null;
  const { townId } = await resolveAdminTownContext(formData);

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.businessClaim.create({
    data: {
      businessId,
      email: ownerEmail,
      token,
      expiresAt,
    },
  });

  await prisma.business.update({
    where: { id: businessId, townId },
    data: {
      pendingOwnerEmail: ownerEmail,
    },
  });

  revalidatePath(`/${locale}/admin/businesses`);
};

export default async function BusinessesPage({ params }: BusinessesPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    redirect(`/${locales[0]}`);
  }

  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  const towns = await prisma.town.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const townId =
    auth.profile.role === UserRole.SUPER_ADMIN
      ? auth.profile.townId ?? towns[0]?.id ?? null
      : auth.profile.townId;
  if (!townId) {
    redirect(`/${locale}`);
  }

  const currentTown = towns.find((town) => town.id === townId) ?? towns[0];
  const now = new Date();

  const [subscriptions, places, businesses] = await Promise.all([
    prisma.subscription.findMany({
      where: { target: SubscriptionTarget.BUSINESS, isActive: true },
      orderBy: { priority: "asc" },
    }),
    prisma.place.findMany({
      where: { townId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.business.findMany({
      where: { townId },
      include: {
        subscription: true,
        claims: {
          where: {
            claimedAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">Town businesses</p>
        <h1 className="text-3xl font-semibold text-slate-900">Business Management</h1>
        <p className="text-sm text-slate-500">
          Register and control subscription tiers for businesses in {currentTown?.name ?? "your town"}.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Create a business profile</h2>
        <form action={createBusinessAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="townId" value={townId} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="business-name">
              Name
            </label>
            <Input id="business-name" name="name" placeholder="Business name" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Subscription tier</label>
            <Select name="subscriptionId" defaultValue={subscriptions[0]?.id}>
              <SelectTrigger>
                <SelectValue placeholder="Choose tier" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name} – ISK {tier.price.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="contact-email">
              Contact email
            </label>
            <Input id="contact-email" name="contactEmail" placeholder="owner@business.is" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="contact-phone">
              Contact phone
            </label>
            <Input id="contact-phone" name="contactPhone" placeholder="+354 ..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Linked place</label>
            <Select name="placeId">
              <SelectTrigger>
                <SelectValue placeholder="Optional place listing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No linked place</SelectItem>
                {places.map((place) => (
                  <SelectItem key={place.id} value={place.id}>
                    {place.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ImageUploadInput
            label="Logo"
            name="logoUrl"
            folder={`towns/${townId}/businesses/logos`}
            helperText="Square image, at least 256x256."
          />
          <ImageUploadInput
            label="Hero image"
            name="heroImageUrl"
            folder={`towns/${townId}/businesses/hero`}
            helperText="Wide image for feature spots."
          />
          <div className="md:col-span-2">
            <ImageUploadInput
              label="Gallery"
              name="galleryUrls"
              folder={`towns/${townId}/businesses/gallery`}
              multiple
              helperText="Upload multiple images to showcase the business."
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="short-description">
              Short description
            </label>
            <Textarea id="short-description" name="shortDescription" rows={2} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="long-description">
              Overview
            </label>
            <Textarea id="long-description" name="longDescription" rows={4} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="rounded-full bg-primary px-6 text-white">
              Create business
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Businesses</h2>
        <div className="mt-4 space-y-4">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="rounded-2xl border border-slate-100 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{business.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      {business.subscription?.name ?? "No tier"}
                    </Badge>
                    <Badge variant="secondary">{business.status}</Badge>
                  </div>
                  {business.shortDescription ? (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {business.shortDescription}
                    </p>
                  ) : null}
                </div>
                <form action={deleteBusinessAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="townId" value={townId} />
                  <input type="hidden" name="id" value={business.id} />
                  <Button variant="outline" className="rounded-full border-red-200 text-red-600">
                    Remove
                  </Button>
                </form>
              </div>

              <form action={updateBusinessAction} className="mt-4 grid gap-3 md:grid-cols-3">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="townId" value={townId} />
                <input type="hidden" name="id" value={business.id} />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Subscription</label>
                  <Select name="subscriptionId" defaultValue={business.subscriptionId ?? undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <Select name="status" defaultValue={business.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_STATUSES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Contact email</label>
                  <Input
                    name="contactEmail"
                    defaultValue={business.contactEmail ?? ""}
                    placeholder="owner@business.is"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Contact phone</label>
                  <Input
                    name="contactPhone"
                    defaultValue={business.contactPhone ?? ""}
                    placeholder="+354 ..."
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button variant="outline" className="rounded-full">
                    Save updates
                  </Button>
                </div>
              </form>

          <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
            <p>
              Notification quota:{" "}
              <span className="font-semibold text-slate-900">
                {business.notificationUsage}/{business.monthlyNotificationLimit ?? "—"}
                  </span>
                </p>
                <p>
                  Event quota:{" "}
                  <span className="font-semibold text-slate-900">
                    {business.eventUsage}/{business.monthlyEventLimit ?? "—"}
                  </span>
                </p>
                <p>
                  Linked place:{" "}
                  <span className="font-semibold text-slate-900">
                    {places.find((p) => p.id === business.placeId)?.name ?? "None"}
                  </span>
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Owner access</p>
            <p className="text-xs text-slate-500">
              Invite a business owner to claim their profile and manage notifications.
            </p>
            <form
              action={createClaimLinkAction}
              className="mt-3 flex flex-col gap-2 md:flex-row"
            >
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="townId" value={townId} />
              <input type="hidden" name="businessId" value={business.id} />
              <Input
                name="ownerEmail"
                placeholder="owner@business.is"
                defaultValue={business.pendingOwnerEmail ?? ""}
              />
              <Button type="submit" className="rounded-full">
                Generate claim link
              </Button>
            </form>
            {business.claims[0] ? (
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <span>
                  Latest invite (expires{" "}
                  {business.claims[0].expiresAt
                    ? business.claims[0].expiresAt.toLocaleDateString()
                    : "N/A"}
                  ):
                </span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const token = business.claims[0].token;
                    const baseUrl =
                      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
                    const relativeLink = `/${locale}/claim-business?token=${token}`;
                    const displayLink = baseUrl
                      ? `${baseUrl}${relativeLink}`
                      : relativeLink;

                    return (
                      <>
                        <code className="flex-1 break-all rounded bg-white px-2 py-1 text-[11px] text-slate-800">
                          {displayLink}
                        </code>
                        <CopyButton text={displayLink} />
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ))}
      {!businesses.length ? (
        <p className="text-sm text-slate-500">No businesses registered yet.</p>
      ) : null}
        </div>
      </section>
    </div>
  );
}
