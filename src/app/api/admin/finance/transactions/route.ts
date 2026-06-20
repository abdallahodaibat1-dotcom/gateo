import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const transactionSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'HOLD', 'RELEASE', 'REFUND', 'COMMISSION', 'FEE', 'REWARD']),
  amount: z.number().positive(),
  currency: z.string().min(1).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  description: z.string().optional(),
});

// GET /api/admin/finance/transactions - List financial transactions
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (userId) {
      where.account = { userId };
    }

    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        FinancialAccount: { select: { id: true, type: true, currency: true, User: { select: { id: true, name: true, email: true } } } },
      },
    });

    const total = await prisma.financialTransaction.count({ where });

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/transactions - Create manual transaction
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = transactionSchema.parse(body);
    const currency = data.currency || 'USD';

    const account = await prisma.financialAccount.findFirst({
      where: { userId: data.userId, type: 'CASH', currency },
    });
    if (!account) return badRequest('لا يوجد حساب نقدي للمستخدم بالعملة المحددة');

    const { recordTransaction } = await import('@/lib/finance');
    const transaction = await recordTransaction({
      accountId: account.id,
      type: data.type,
      amount: data.amount,
      currency,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      description: data.description || 'معاملة يدوية من الإدارة',
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات المعاملة غير صالحة');
    }
    if (error instanceof Error) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}
