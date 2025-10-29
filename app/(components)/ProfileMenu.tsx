'use client';

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import type { ProfileSummary } from "./types";
import type { AppLocale } from "../../lib/i18n";

type ProfileMenuProps = {
  profile: ProfileSummary | null;
  currentLocale: AppLocale;
};

const ProfileMenu = ({ profile, currentLocale }: ProfileMenuProps) => {
  const t = useTranslations("header.profileMenu");
  const authT = useTranslations("auth");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const initials = useMemo(() => {
    if (profile?.firstName) {
      return profile.firstName
        .split(" ")
        .map((name) => name[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
    }
    return "TH";
  }, [profile?.firstName]);

  const handleSignOut = async () => {
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
    });
  };

  const handleSignIn = async () => {
    setStatus("idle");
    setErrorMessage("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(authT("emailPlaceholder"));
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?redirect_to=${encodeURIComponent(
        `/${currentLocale}${window.location.pathname.replace(
          /^\/(en|is)/,
          ""
        )}${window.location.search}`
      )}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("sent");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  if (!profile) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow"
            disabled={isPending}
          >
            {t("signIn")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle>{authT("signInHeading")}</DialogTitle>
            <DialogDescription>
              {status === "sent"
                ? "We have sent you a magic link. Please check your inbox."
                : "Receive a secure sign-in link by email. No password required."}
            </DialogDescription>
          </DialogHeader>
          {status !== "sent" ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleSignIn();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">{authT("emailPlaceholder")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder={authT("emailPlaceholder")}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              {errorMessage ? (
                <p className="text-sm text-red-500">{errorMessage}</p>
              ) : null}
              <Button
                type="submit"
                className="w-full rounded-full bg-primary text-primary-foreground"
              >
                {authT("magicLink")}
              </Button>
            </form>
          ) : (
            <div className="mt-4 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
              {`Magic link sent to ${email}.`}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-primary/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          disabled={isPending}
        >
          <Avatar className="size-8 border border-primary/10 shadow-sm">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.firstName ?? "Profile"} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-flex">
            {profile.firstName ?? "Guest"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-400">
          {profile.firstName ?? "Guest"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile.role === "admin" ? (
          <DropdownMenuItem
            onClick={() => {
              const locale = currentLocale;
              startTransition(() => {
                router.push(`/${locale}/admin`);
              });
            }}
          >
            {t("admin")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={() => {
            startTransition(() => handleSignOut());
          }}
        >
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
