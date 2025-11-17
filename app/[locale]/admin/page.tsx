import "server-only";

import { PlaceType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { locales, type AppLocale } from "../../../lib/i18n";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { requireRole } from "../../../lib/auth/guards";

const PLACE_TYPES = Object.values(PlaceType);

type AdminPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

const ADMIN_ACTION_ROLES = [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN] as const;

async function resolveTownContext(formData?: FormData) {
  const auth = await requireRole(ADMIN_ACTION_ROLES);
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const townIdFromForm = formData?.get("townId")?.toString() ?? null;
  const townId =
    auth.profile.role === UserRole.SUPER_ADMIN
      ? townIdFromForm
      : auth.profile.townId ?? townIdFromForm;

  if (!townId) {
    throw new Error("Missing town context");
  }

  return { auth, townId };
}

const createPlaceAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale") as string;
  const name = formData.get("name")?.toString().trim();
  const type = formData.get("type")?.toString() as PlaceType | undefined;
  const description = formData.get("description")?.toString() ?? "";
  const website = formData.get("website")?.toString() || undefined;
  const address = formData.get("address")?.toString() || undefined;
  const tags = formData
    .get("tags")
    ?.toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (!name || !type) return;

  const { townId } = await resolveTownContext(formData);

  await prisma.place.create({
    data: {
      name,
      type,
      description,
      website,
      address,
      tags: tags ?? [],
      townId,
    },
  });

  revalidatePath(`/${locale}/admin`);
};

const updatePlaceAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  const description = formData.get("description")?.toString() ?? "";
  const tags = formData
    .get("tags")
    ?.toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  await resolveTownContext(formData);

  await prisma.place.update({
    where: { id },
    data: {
      description,
      tags: tags ?? [],
    },
  });

  revalidatePath(`/${locale}/admin`);
};

const deletePlaceAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  await resolveTownContext(formData);

  await prisma.place.delete({
    where: { id },
  });

  revalidatePath(`/${locale}/admin`);
};

const createEventAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString() ?? "";
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;
  const location = formData.get("location")?.toString() || undefined;
  const startsAt = formData.get("startsAt")?.toString();
  const endsAt = formData.get("endsAt")?.toString();

  if (!title) return;

  const { townId } = await resolveTownContext(formData);

  await prisma.event.create({
    data: {
      title,
      description,
      imageUrl,
      location,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      townId,
    },
  });

  revalidatePath(`/${locale}/admin`);
};

const deleteEventAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const id = formData.get("id")?.toString();
  if (!id) return;

  await resolveTownContext(formData);

  await prisma.event.delete({ where: { id } });
  revalidatePath(`/${locale}/admin`);
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const auth = await requireRole([UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN]);
  if (!auth) {
    redirect(`/${locale}`);
  }

  if (auth.profile.role !== UserRole.SUPER_ADMIN && !auth.profile.townId) {
    redirect(`/${locale}`);
  }

  const whereScope = scopeByTown(auth.profile, {});

  const [places, events] = await Promise.all([
    prisma.place.findMany({
      where: whereScope,
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: whereScope,
      orderBy: { startsAt: { sort: "asc", nulls: "last" } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-400">Town overview</p>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage places and events for {managedTown?.name ?? "your town"}.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Create a place</h2>
        <form action={createPlaceAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="townId" value={managedTownId} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <Input id="name" name="name" required placeholder="Place name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select name="type" defaultValue={PlaceType.LODGING}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {PLACE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <Textarea id="description" name="description" placeholder="Short description" rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="website">
              Website
            </label>
            <Input id="website" name="website" placeholder="https://" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="address">
              Address
            </label>
            <Input id="address" name="address" placeholder="Address" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="tags">
              Tags (comma separated)
            </label>
            <Input id="tags" name="tags" placeholder="Hotel, Spa, $$" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="rounded-full bg-primary px-6 text-white">
              Create place
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Existing places</h2>
        <div className="mt-4 space-y-6">
          {places.map((place) => (
            <div
              key={place.id}
              className="rounded-2xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{place.name}</h3>
                  <p className="text-xs uppercase text-slate-500">{place.type}</p>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                    {place.description}
                  </p>
                  {place.tags?.length ? (
                    <p className="mt-2 text-xs text-slate-400">
                      Tags: {place.tags.join(", ")}
                    </p>
                  ) : null}
                </div>
                <form action={deletePlaceAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="townId" value={managedTownId} />
                  <input type="hidden" name="id" value={place.id} />
                  <Button variant="outline" className="rounded-full border-red-200 text-red-600">
                    Delete
                  </Button>
                </form>
              </div>
              <form action={updatePlaceAction} className="mt-4 grid gap-4 md:grid-cols-2">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="townId" value={managedTownId} />
                <input type="hidden" name="id" value={place.id} />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor={`desc-${place.id}`}>
                    Description
                  </label>
                  <Textarea
                    id={`desc-${place.id}`}
                    name="description"
                    rows={3}
                    defaultValue={place.description ?? ""}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor={`tags-${place.id}`}>
                    Tags
                  </label>
                  <Input
                    id={`tags-${place.id}`}
                    name="tags"
                    defaultValue={(place.tags ?? []).join(", ")}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="rounded-full bg-primary px-6 text-white">
                    Save changes
                  </Button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Manage events</h2>
        <form action={createEventAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="townId" value={managedTownId} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="event-title">
              Title
            </label>
            <Input id="event-title" name="title" required placeholder="Event title" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="event-location">
              Location
            </label>
            <Input id="event-location" name="location" placeholder="Harbor Square" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="event-description">
              Description
            </label>
            <Textarea id="event-description" name="description" rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="event-image">
              Image URL
            </label>
            <Input id="event-image" name="imageUrl" placeholder="https://" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="event-start">
              Starts at
            </label>
            <Input id="event-start" name="startsAt" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="event-end">
              Ends at
            </label>
            <Input id="event-end" name="endsAt" type="datetime-local" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="rounded-full bg-primary px-6 text-white">
              Create event
            </Button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
              </div>
              <form action={deleteEventAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="townId" value={managedTownId} />
                <input type="hidden" name="id" value={event.id} />
                <Button variant="outline" className="rounded-full border-red-200 text-red-600">
                  Delete
                </Button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
