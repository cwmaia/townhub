import { prisma } from "../db";

const MOCK_USER_ID = process.env.MOCK_AUTH_USER_ID ?? "mock-admin-user";
const MOCK_EMAIL = process.env.MOCK_AUTH_EMAIL ?? "admin@townhub.local";
const MOCK_AUTH_ENABLED = process.env.MOCK_AUTH === "true";

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
  const profile = await prisma.profile.findUnique({
    where: { userId: MOCK_USER_ID },
  });
  return {
    user: {
      id: MOCK_USER_ID,
      email: MOCK_EMAIL,
    },
    profile,
  };
}
