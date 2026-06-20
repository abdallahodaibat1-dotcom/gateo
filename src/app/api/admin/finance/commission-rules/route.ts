import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const ruleSchema = z.object({
  name: z.string().min(1),
  appliesTo: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'TIERED']),
  value: z.number().min(0),
  minAmount: z.number().min(0).optional().nullable(),
  maxAmount: z.number().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/finance/commission-rules - List commission rules
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const rules = await prisma.commissionRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Category: { select: { id: true, name: true } },
        Subcategory: { select: { id: true, name: true } },
        _count: { select: { Commission: true } },
      },
    });
    return NextResponse.json({ rules });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/commission-rules - Create commission rule
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = ruleSchema.parse(body);

    const rule = await prisma.commissionRule.create({
      data: {
        name: data.name,
        appliesTo: data.appliesTo,
        categoryId: data.categoryId || undefined,
        subcategoryId: data.subcategoryId || undefined,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات قاعدة العمولة غير صالحة');
    }
    return serverError(error);
  }
}
