import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().min(1),
});

// POST /api/coupons/validate - Validate a coupon code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = validateSchema.parse(body);

    const coupon = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return badRequest('الكوبون غير صالح');
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      return badRequest('الكوبون غير نشط بعد');
    }
    if (coupon.validUntil && coupon.validUntil < now) {
      return badRequest('انتهت صلاحية الكوبون');
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return badRequest('تم استنفاد الكوبون');
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('يرجى إدخال كود الكوبون');
    }
    return serverError(error);
  }
}
