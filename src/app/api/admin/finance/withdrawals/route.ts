import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { ensureFinancialAccount, recordTransaction } from '@/lib/finance';
import { z } from 'zod';

const reviewSchema = z.object({
  withdrawalId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

// GET /api/admin/finance/withdrawals - List withdrawal requests
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const skip = (page - 1) * limit;

  try {
    const where = status ? { status: status as any } : {};
    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        User: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    const total = await prisma.withdrawal.count({ where });

    return NextResponse.json({
      withdrawals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/withdrawals - Review a withdrawal request
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;
  const adminId = adminCheck.user.id;

  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: data.withdrawalId },
    });
    if (!withdrawal) return notFound('طلب السحب غير موجود');
    if (withdrawal.status !== 'PENDING') return badRequest('تم معالجة طلب السحب مسبقاً');

    const now = new Date();

    if (data.status === 'APPROVED') {
      const cashAccount = await ensureFinancialAccount(withdrawal.userId, 'CASH', withdrawal.currency);
      await recordTransaction({
        accountId: cashAccount.id,
        type: 'WITHDRAWAL',
        amount: Number(withdrawal.amount),
        currency: withdrawal.currency,
        referenceType: 'WITHDRAWAL',
        referenceId: withdrawal.id,
        description: 'سحب معتمد',
      });
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: data.status,
        reviewedBy: adminId,
        reviewedAt: now,
        notes: data.notes,
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, withdrawal: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات المراجعة غير صالحة');
    }
    if (error instanceof Error) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}
