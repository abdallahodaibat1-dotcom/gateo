import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const payoutSchema = z.object({
  commissionId: z.string().min(1),
});

// GET /api/admin/finance/payouts - List commissions/payouts due to businesses
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const businessId = searchParams.get('businessId');
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (status) where.status = status;
    if (businessId) where.businessId = businessId;

    const commissions = await prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        CommissionRule: { select: { id: true, name: true } },
        Business: { select: { id: true, name: true, logo: true } },
        User: { select: { id: true, name: true, email: true } },
      },
    });

    const total = await prisma.commission.count({ where });

    const statusTotals = await prisma.commission.groupBy({
      by: ['status'],
      _sum: { amount: true },
    });

    return NextResponse.json({
      commissions,
      statusTotals: statusTotals.map((s) => ({ status: s.status, total: Number(s._sum.amount || 0) })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/payouts - Mark commission as paid
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = payoutSchema.parse(body);

    const commission = await prisma.commission.findUnique({
      where: { id: data.commissionId },
    });
    if (!commission) return badRequest('العمولة غير موجودة');
    if (commission.status === 'PAID') return badRequest('العمولة مدفوعة مسبقاً');

    const updated = await prisma.commission.update({
      where: { id: commission.id },
      data: { status: 'PAID', updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, commission: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الدفع غير صالحة');
    }
    return serverError(error);
  }
}
