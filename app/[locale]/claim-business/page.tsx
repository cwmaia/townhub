import "server-only";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import type { AppLocale } from "../../../lib/i18n";
import { locales } from "../../../lib/i18n";
import { prisma } from "../../../lib/db";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

type ClaimBusinessPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ token?: string }>;
};

const claimBusinessAction = async (formData: FormData) => {
  "use server";
  const locale = formData.get("locale")?.toString() ?? "en";
  const token = formData.get("token")?.toString();
  if (!token) {
    throw new Error("Missing token");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to claim a business.");
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    const firstName =
      user.user_metadata?.full_name?.split(" ")[0] ??
      user.email?.split("@")[0] ??
      "TownApp";

    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        email: user.email,
      },
    });
  }

  const claim = await prisma.businessClaim.findUnique({
    where: { token },
    include: {
      business: true,
    },
  });

  if (!claim) {
    throw new Error("This claim link is invalid or has been revoked.");
  }

  if (claim.claimedAt) {
    throw new Error("This claim link has already been used.");
  }

  if (claim.expiresAt && claim.expiresAt < new Date()) {
    throw new Error("This claim link has expired.");
  }

  await prisma.business.update({
    where: { id: claim.businessId },
    data: {
      userId: profile.id,
      pendingOwnerEmail: null,
    },
  });

  await prisma.businessClaim.update({
    where: { id: claim.id },
    data: {
      claimedAt: new Date(),
    },
  });

  revalidatePath(`/${locale}/claim-business?token=${token}`);
};

export default async function ClaimBusinessPage({
  params,
  searchParams,
}: ClaimBusinessPageProps) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const { token } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
      })
    : null;

  const claim = token
    ? await prisma.businessClaim.findUnique({
        where: { token },
        include: {
          business: {
            include: {
              subscription: true,
            },
          },
        },
      })
    : null;

  const claimInvalid =
    !claim ||
    claim.claimedAt ||
    (claim.expiresAt && claim.expiresAt < new Date());

  const businessOwnerId = claim?.business.userId;
  const claimedByCurrentUser = !!businessOwnerId && businessOwnerId === profile?.id;
  const alreadyClaimed =
    !!businessOwnerId && businessOwnerId !== profile?.id;

  const claimable =
    !!claim && !claimInvalid && !alreadyClaimed && !!profile && !claimedByCurrentUser;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          TownApp Business Access
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Claim your business
        </h1>
        <p className="text-sm text-slate-500">
          Use the secure link sent by the TownApp admin team to connect your account and manage notifications.
        </p>
      </header>

      {!token ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Missing claim token. Please use the link provided in your invitation email or contact support for help.
          </p>
        </div>
      ) : null}

      {token && claimInvalid ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-900">
            This claim link is no longer valid.
          </p>
          {!claim ? (
            <p className="text-sm text-amber-800">
              We couldn’t find this token. Double-check the link or ask an admin for a new invitation.
            </p>
          ) : null}
          {claim?.claimedAt ? (
            <p className="text-sm text-amber-800">
              This business has already been claimed.
            </p>
          ) : null}
          {claim && claim.expiresAt && claim.expiresAt < new Date() ? (
            <p className="text-sm text-amber-800">
              This link expired on{" "}
              {claim.expiresAt.toLocaleDateString()}.
            </p>
          ) : null}
        </div>
      ) : null}

      {token && claim && (
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Business
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {claim.business.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Badge variant="outline" className="border-primary/20 text-primary">
                {claim.business.subscription?.name ?? "No tier"}
              </Badge>
              <Badge variant="secondary">
                {claim.business.status}
              </Badge>
            </div>
            {claim.business.shortDescription ? (
              <p className="mt-3 text-sm text-slate-600">
                {claim.business.shortDescription}
              </p>
            ) : null}
          </div>

          {!user ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Sign in to continue
              </p>
              <p className="text-sm text-slate-500">
                Please sign in from the home page and return to this link to complete the claim.
              </p>
              <Button asChild variant="outline" className="mt-3 rounded-full">
                <a href={`/${locale}`}>Go to home</a>
              </Button>
            </div>
          ) : null}

          {alreadyClaimed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                This business is already linked to another account.
              </p>
              <p className="text-sm text-amber-800">
                If you believe this is a mistake, contact TownApp support to revoke existing access.
              </p>
            </div>
          ) : null}

          {claimable ? (
            <form action={claimBusinessAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="token" value={token} />
              <p className="text-sm text-slate-600">
                Signed in as{" "}
                <span className="font-semibold text-slate-900">
                  {profile?.firstName ?? user?.email ?? "TownApp member"}
                </span>
                . Click below to link this business to your account.
              </p>
              <Button type="submit" className="rounded-full">
                Claim this business
              </Button>
            </form>
          ) : null}

          {claimedByCurrentUser ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                Business claimed successfully.
              </p>
              <p className="text-sm text-emerald-800">
                You can manage your business from the TownApp dashboard.
              </p>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
