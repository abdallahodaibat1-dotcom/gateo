import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'FREE_ADS']),
  value: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/finance/coupons - List coupons
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { CouponUsage: true } } },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/coupons - Create coupon
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = couponSchema.parse(body);

    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) return badRequest('الكود مستخدم مسبقاً');

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        minOrderAmount: data.minOrderAmount,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الكوبون غير صالحة');
    }
    return serverError(error);
  }
}
