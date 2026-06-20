import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

function toNumber(value: unknown) {
  return value == null ? 0 : Number(value);
}

// GET /api/admin/finance/revenue - Finance totals
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const [invoicesByType, paymentsTotal, pendingWithdrawals, commissionsTotal] = await Promise.all([
      prisma.invoice.groupBy({
        by: ['type'],
        _sum: { total: true },
        where: { status: { in: ['PAID', 'ISSUED'] } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' },
      }),
      prisma.commission.aggregate({
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      invoicesByType: invoicesByType.map((item) => ({
        type: item.type,
        total: toNumber(item._sum.total),
      })),
      paymentsTotal: toNumber(paymentsTotal._sum.amount),
      pendingWithdrawals: toNumber(pendingWithdrawals._sum.amount),
      commissionsTotal: toNumber(commissionsTotal._sum.amount),
    });
  } catch (error) {
    return serverError(error);
  }
}
