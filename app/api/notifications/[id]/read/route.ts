import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentProfile } from '@/lib/auth/guards';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: notificationId } = await params;

  await prisma.notificationDelivery.updateMany({
    where: {
      notificationId,
      userId: profile.id,
    },
    data: {
      clickedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
