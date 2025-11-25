import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentProfile } from '@/lib/auth/guards';

export async function POST(request: Request) {
  const { user, profile } = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const { token, platform } = payload;

  if (!token || !platform) {
    return NextResponse.json({ error: 'Missing token or platform' }, { status: 400 });
  }

  await prisma.deviceToken.upsert({
    where: { token },
    update: {
      isActive: true,
      lastUsedAt: new Date(),
    },
    create: {
      userId: profile.id,
      token,
      platform,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true });
}
