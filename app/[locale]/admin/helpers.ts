import "server-only";

import { UserRole } from "@prisma/client";
import { requireRole, type AuthContext } from "../../../lib/auth/guards";

const ADMIN_ACTION_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.TOWN_ADMIN];

export async function resolveAdminTownContext(formData?: FormData): Promise<{
  auth: AuthContext;
  townId: string;
}> {
  const auth = await requireRole(ADMIN_ACTION_ROLES);
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const providedTownId = formData?.get("townId")?.toString() ?? null;
  const townId =
    auth.profile.role === UserRole.SUPER_ADMIN
      ? providedTownId ?? auth.profile.townId
      : auth.profile.townId;

  if (!townId) {
    throw new Error("Town context required");
  }

  return { auth, townId };
}
