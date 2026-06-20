import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { z } from 'zod';

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  name: z.string().min(1).optional(),
  nameAr: z.string().optional().nullable(),
  config: z.record(z.string(), z.any()).optional(),
  countries: z.string().optional().nullable(),
  currencies: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

// PATCH /api/admin/finance/gateways/[id] - Update a payment gateway
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = patchSchema.parse(body);

    const existing = await prisma.paymentGateway.findUnique({ where: { id } });
    if (!existing) return notFound('البوابة غير موجودة');

    if (data.isDefault) {
      await prisma.paymentGateway.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const gateway = await prisma.paymentGateway.update({
      where: { id },
      data: {
        isActive: data.isActive,
        isDefault: data.isDefault,
        name: data.name,
        nameAr: data.nameAr,
        config: data.config ? JSON.stringify(data.config) : undefined,
        Countries: data.countries,
        currencies: data.currencies,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ gateway });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات التحديث غير صالحة');
    }
    return serverError(error);
  }
}
