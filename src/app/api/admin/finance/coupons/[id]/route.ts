import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { z } from 'zod';

const updateSchema = z.object({
  code: z.string().min(1).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'FREE_ADS']).optional(),
  value: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/finance/coupons/[id] - Update coupon
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return notFound('الكوبون غير موجود');

    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.code && data.code !== existing.code) {
      const codeTaken = await prisma.coupon.findUnique({ where: { code: data.code } });
      if (codeTaken) return badRequest('الكود مستخدم مسبقاً');
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
        ...(data.validFrom !== undefined && { validFrom: new Date(data.validFrom) }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil ? new Date(data.validUntil) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات التحديث غير صالحة');
    }
    return serverError(error);
  }
}

// DELETE /api/admin/finance/coupons/[id] - Delete coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return notFound('الكوبون غير موجود');

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
