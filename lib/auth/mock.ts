import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "../db";
import { DEMO_USER_OPTIONS, MOCK_AUTH_COOKIE_NAME } from "./demo-users";

const MOCK_AUTH_ENABLED = process.env.MOCK_AUTH?.trim() === "true";
const DEFAULT_DEMO_USER = DEMO_USER_OPTIONS[0];

export type MockAuthContext = {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    userId: string;
    role: string;
    townId: string | null;
    firstName?: string | null;
  } | null;
};

export async function getMockAuthSession(): Promise<MockAuthContext | null> {
  if (!MOCK_AUTH_ENABLED) {
    return null;
  }

  const cookieStore = await cookies();
  const cookieUserId = cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value;
  const defaultUserId = process.env.MOCK_AUTH_USER_ID;
  const selectedUser =
    DEMO_USER_OPTIONS.find((user) => user.userId === cookieUserId) ??
    DEMO_USER_OPTIONS.find((user) => user.userId === defaultUserId) ??
    DEFAULT_DEMO_USER;

  // Upsert the profile to ensure it exists for demo users
  const profile = await prisma.profile.upsert({
    where: { userId: selectedUser.userId },
    create: {
      userId: selectedUser.userId,
      email: selectedUser.email,
      firstName: selectedUser.firstName,
      role: selectedUser.role as UserRole,
    },
    update: {}, // Don't update if exists
  });

  const email = profile.email ?? process.env.MOCK_AUTH_EMAIL ?? selectedUser.email;

  return {
    user: {
      id: selectedUser.userId,
      email,
    },
    profile,
  };
}
