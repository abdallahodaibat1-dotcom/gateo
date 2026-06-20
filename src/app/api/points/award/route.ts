import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const awardSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().min(1),
  type: z.enum(['EARN', 'BONUS', 'REFUND']).default('EARN'),
  referenceId: z.string().optional(),
});

// POST /api/points/award - Award points to a user (admin/system use)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  // Only admin or self can award points (self for testing; real app uses system triggers)
  try {
    const body = await req.json();
    const data = awardSchema.parse(body);

    const isAdmin = session.user.role === 'ADMIN';
    const isSelf = session.user.id === data.userId;

    if (!isAdmin && !isSelf) {
      return badRequest('غير مصرح بمنح النقاط');
    }

    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          reason: data.reason,
          type: data.type,
          referenceId: data.referenceId,
        },
      }),
      prisma.user.update({
        where: { id: data.userId },
        data: {
          points: { increment: data.amount },
          xp: { increment: data.amount },
        },
      }),
    ]);

    // Check level up: simple formula level = 1 + floor(xp / 500)
    const newLevel = 1 + Math.floor((updatedUser.xp) / 500);
    if (newLevel > updatedUser.level) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { level: newLevel },
      });
    }

    return NextResponse.json({
      transaction,
      user: {
        points: updatedUser.points + data.amount,
        xp: updatedUser.xp + data.amount,
        level: newLevel > updatedUser.level ? newLevel : updatedUser.level,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}
