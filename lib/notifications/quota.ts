import { prisma } from "@/lib/db";

export interface QuotaStatus {
  allowed: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
}

export async function resetMonthlyQuotas(): Promise<{
  businessCount: number;
  townCount: number;
  resetAt: Date;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const businessResult = await prisma.business.updateMany({
    where: {
      OR: [{ usageResetsAt: null }, { usageResetsAt: { lt: startOfMonth } }],
    },
    data: {
      notificationUsage: 0,
      eventUsage: 0,
      usageResetsAt: now,
    },
  });

  const townResult = await prisma.town.updateMany({
    where: {
      OR: [{ usageResetsAt: null }, { usageResetsAt: { lt: startOfMonth } }],
    },
    data: {
      notificationUsage: 0,
      eventUsage: 0,
      usageResetsAt: now,
    },
  });

  return {
    businessCount: businessResult.count,
    townCount: townResult.count,
    resetAt: now,
  };
}

export async function checkBusinessQuota(
  businessId: string,
  quotaType: "notification" | "event"
): Promise<QuotaStatus> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      monthlyNotificationLimit: true,
      monthlyEventLimit: true,
      notificationUsage: true,
      eventUsage: true,
    },
  });

  if (!business) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  const limit =
    quotaType === "notification" ? business.monthlyNotificationLimit : business.monthlyEventLimit;
  const used = quotaType === "notification" ? business.notificationUsage : business.eventUsage;

  if (limit === null) {
    return { allowed: true, used, limit: null, remaining: null };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function checkTownQuota(
  townId: string,
  quotaType: "notification" | "event"
): Promise<QuotaStatus> {
  const town = await prisma.town.findUnique({
    where: { id: townId },
    select: {
      monthlyNotificationLimit: true,
      monthlyEventLimit: true,
      notificationUsage: true,
      eventUsage: true,
    },
  });

  if (!town) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  const limit =
    quotaType === "notification" ? town.monthlyNotificationLimit : town.monthlyEventLimit;
  const used = quotaType === "notification" ? town.notificationUsage : town.eventUsage;

  if (limit === null) {
    return { allowed: true, used, limit: null, remaining: null };
  }

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function incrementBusinessUsage(
  businessId: string,
  quotaType: "notification" | "event"
): Promise<void> {
  const field = quotaType === "notification" ? "notificationUsage" : "eventUsage";

  await prisma.business.update({
    where: { id: businessId },
    data: { [field]: { increment: 1 } },
  });
}

export async function incrementTownUsage(
  townId: string,
  quotaType: "notification" | "event"
): Promise<void> {
  const field = quotaType === "notification" ? "notificationUsage" : "eventUsage";

  await prisma.town.update({
    where: { id: townId },
    data: { [field]: { increment: 1 } },
  });
}
