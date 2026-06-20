import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const claimSchema = z.object({
  referredId: z.string().optional(),
});

// POST /api/referrals/claim - Complete a pending referral for current user
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const data = claimSchema.parse(body);

    const referral = await prisma.referral.findFirst({
      where: {
        referredId: data.referredId || userId,
        status: 'PENDING',
      },
    });

    if (!referral) return badRequest('لا يوجد إحالة معلقة');
    if (referral.referredId !== userId) return unauthorized();

    const updated = await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'COMPLETED',
        rewardedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, referral: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}
