import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const withdrawSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).optional(),
  method: z.enum(['BANK', 'CLIQ', 'PAYPAL']),
  methodDetails: z.record(z.string(), z.any()).optional(),
});

// GET /api/finance/wallet/withdraw - Current user's withdrawals
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    const total = await prisma.withdrawal.count({ where: { userId } });
    return NextResponse.json({ withdrawals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/finance/wallet/withdraw - Request a withdrawal
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = withdrawSchema.parse(body);
    const currency = data.currency || 'USD';

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: data.amount,
        currency,
        method: data.method,
        methodDetails: data.methodDetails ? JSON.stringify(data.methodDetails) : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, withdrawal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات السحب غير صالحة');
    }
    return serverError(error);
  }
}
