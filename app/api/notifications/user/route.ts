import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentProfile } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deliveries = await prisma.notificationDelivery.findMany({
    where: { userId: profile.id },
    include: {
      notification: {
        select: {
          id: true,
          title: true,
          body: true,
          data: true,
          sentAt: true,
        },
      },
    },
    orderBy: { sentAt: 'desc' },
    take: 50,
  });

  const notifications = deliveries.map((delivery) => ({
    id: delivery.notification.id,
    title: delivery.notification.title,
    body: delivery.notification.body,
    data: delivery.notification.data,
    sentAt: delivery.notification.sentAt,
    read: !!delivery.clickedAt,
    clickedAt: delivery.clickedAt,
  }));

  return NextResponse.json({ notifications });
}
