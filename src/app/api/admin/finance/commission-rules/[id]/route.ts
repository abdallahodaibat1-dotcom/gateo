import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  appliesTo: z.string().min(1).optional(),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'TIERED']).optional(),
  value: z.number().min(0).optional(),
  minAmount: z.number().min(0).optional().nullable(),
  maxAmount: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/finance/commission-rules/[id] - Update commission rule
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const existing = await prisma.commissionRule.findUnique({ where: { id } });
    if (!existing) return notFound('قاعدة العمولة غير موجودة');

    const body = await req.json();
    const data = updateSchema.parse(body);

    const rule = await prisma.commissionRule.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.appliesTo !== undefined && { appliesTo: data.appliesTo }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.subcategoryId !== undefined && { subcategoryId: data.subcategoryId }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.minAmount !== undefined && { minAmount: data.minAmount }),
        ...(data.maxAmount !== undefined && { maxAmount: data.maxAmount }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ rule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات التحديث غير صالحة');
    }
    return serverError(error);
  }
}

// DELETE /api/admin/finance/commission-rules/[id] - Delete commission rule
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const existing = await prisma.commissionRule.findUnique({ where: { id } });
    if (!existing) return notFound('قاعدة العمولة غير موجودة');

    await prisma.commissionRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
