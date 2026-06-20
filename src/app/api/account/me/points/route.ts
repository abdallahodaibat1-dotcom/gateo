import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, serverError } from '@/lib/api-utils';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, xp: true, level: true },
    });

    const transactions = await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalEarned = await prisma.pointTransaction.aggregate({
      where: { userId, type: { in: ['EARN', 'BONUS', 'REFUND'] } },
      _sum: { amount: true },
    });

    const totalSpent = await prisma.pointTransaction.aggregate({
      where: { userId, type: 'SPEND' },
      _sum: { amount: true },
    });

    return NextResponse.json({
      points: user?.points ?? 0,
      xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      totalEarned: totalEarned._sum.amount ?? 0,
      totalSpent: totalSpent._sum.amount ?? 0,
      transactions,
    });
  } catch (error) {
    return serverError(error);
  }
}
