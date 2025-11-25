import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { prisma } from "@/lib/db";

const expo = new Expo();

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  tokens: string[];
}

export interface DeliveryResult {
  success: number;
  failed: number;
  tickets: ExpoPushTicketWithToken[];
}

type ExpoPushTicketWithToken = ExpoPushTicket & { token?: string };

export async function sendPushNotifications({
  title,
  body,
  data,
  tokens,
}: PushNotificationPayload): Promise<DeliveryResult> {
  const validTokens: string[] = [];
  const invalidTokens: string[] = [];

  for (const token of tokens) {
    if (Expo.isExpoPushToken(token)) {
      validTokens.push(token);
    } else {
      invalidTokens.push(token);
    }
  }

  if (invalidTokens.length) {
    console.warn("Ignored invalid Expo push tokens", invalidTokens);
    await markInvalidTokens(invalidTokens);
  }

  if (!validTokens.length) {
    return { success: 0, failed: tokens.length, tickets: [] };
  }

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let success = 0;
  let failed = 0;
  const tickets: ExpoPushTicketWithToken[] = [];

  for (const chunk of chunks) {
    try {
      const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
      chunkTickets.forEach((ticket, index) => {
        const token = chunk[index].to;
        const ticketWithToken = { ...(ticket as ExpoPushTicketWithToken), token };
        tickets.push(ticketWithToken);
        if (ticket.status === "ok") {
          success += 1;
        } else {
          failed += 1;
        }
      });
    } catch (error) {
      console.error("Failed to send Expo notification chunk", error);
      failed += chunk.length;
      chunk.forEach((message) => {
        tickets.push({
          status: "error",
          details: { error: error instanceof Error ? error.message : "Unknown error" },
          token: message.to,
        } as ExpoPushTicketWithToken);
      });
    }
  }

  return { success, failed, tickets };
}

export async function updateDeliveryStatus(
  notificationId: string,
  tickets: ExpoPushTicketWithToken[]
): Promise<void> {
  if (!tickets.length) return;
  const tokens = tickets.map((ticket) => ticket.token).filter(Boolean) as string[];
  const deviceTokens = await prisma.deviceToken.findMany({
    where: { token: { in: tokens } },
  });
  const tokenToDevice = new Map(deviceTokens.map((device) => [device.token, device]));

  for (const ticket of tickets) {
    const token = ticket.token;
    if (!token) continue;
    const device = tokenToDevice.get(token);
    if (!device) {
      console.warn("No device found for token while recording delivery", token);
      continue;
    }

    await prisma.notificationDelivery.create({
      data: {
        notificationId,
        userId: device.userId,
        deviceToken: token,
        status: ticket.status,
        sentAt: new Date(),
        error: ticket.status === "error" ? ticket.details?.error ?? null : null,
      },
    });
  }
}

export async function markInvalidTokens(tokens: string[]): Promise<void> {
  if (!tokens.length) return;
  await prisma.deviceToken.updateMany({
    where: { token: { in: tokens } },
    data: { isActive: false },
  });
}
