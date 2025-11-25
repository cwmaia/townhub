import "server-only";

import { type Profile, UserRole } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import { prisma } from "../db";
import { createSupabaseServerClient } from "../supabase/server";
import { getMockAuthSession } from "./mock";

export type AuthContext = {
  user: User;
  profile: Profile;
};

export async function getCurrentProfile(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  const mockAuth = await getMockAuthSession();
  if (mockAuth) {
    return { user: mockAuth.user as User, profile: mockAuth.profile };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return { user, profile };
}

export function hasRole(
  profile: Pick<Profile, "role" | "townId"> | null,
  roles: UserRole | UserRole[]
) {
  if (!profile?.role) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(profile.role);
}

export async function requireRole(
  roles: UserRole | UserRole[],
  options?: { requireTownContext?: boolean }
): Promise<AuthContext | null> {
  const { user, profile } = await getCurrentProfile();
  if (!user || !profile) {
    return null;
  }

  if (!hasRole(profile, roles)) {
    return null;
  }

  if (
    options?.requireTownContext &&
    profile.role !== UserRole.SUPER_ADMIN &&
    !profile.townId
  ) {
    return null;
  }

  return { user, profile };
}

export function canManageTown(profile: Profile | null, townId?: string | null) {
  if (!profile) return false;
  if (profile.role === UserRole.SUPER_ADMIN) return true;
  if (!townId) return false;
  if (profile.role === UserRole.TOWN_ADMIN && profile.townId === townId) return true;
  if (profile.role === UserRole.CONTENT_MANAGER && profile.townId === townId) return true;
  return false;
}

export function scopeByTown<T extends { townId?: string | null }>(
  profile: Profile | null,
  baseWhere: T = {} as T
): T {
  if (!profile) {
    return baseWhere;
  }
  if (profile.role === UserRole.SUPER_ADMIN) {
    return baseWhere;
  }

  return {
    ...baseWhere,
    townId: profile.townId ?? undefined,
  };
}
