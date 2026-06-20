import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';

// GET /api/leaderboard - Get top users by points
export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      where: { accountType: { in: ['USER', 'PROFESSIONAL'] }, role: { not: 'ADMIN' } },
      orderBy: [{ points: 'desc' }, { xp: 'desc' }],
      take: 50,
      select: {
        id: true,
        name: true,
        avatar: true,
        points: true,
        xp: true,
        level: true,
      },
    });

    return NextResponse.json({ leaderboard: topUsers });
  } catch (error) {
    return serverError(error);
  }
}
