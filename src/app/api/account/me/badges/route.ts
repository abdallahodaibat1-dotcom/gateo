import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, serverError } from '@/lib/api-utils';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const allBadges = await prisma.badge.findMany();
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { Badge: true },
    });

    const earnedIds = new Set(userBadges.map((ub) => ub.badgeId));

    const earned = userBadges.map((ub) => ({
      ...ub.Badge,
      earned: true,
      earnedAt: ub.createdAt.toISOString(),
    }));

    const available = allBadges
      .filter((b) => !earnedIds.has(b.id))
      .map((b) => ({ ...b, earned: false }));

    return NextResponse.json({ earned, available });
  } catch (error) {
    return serverError(error);
  }
}
