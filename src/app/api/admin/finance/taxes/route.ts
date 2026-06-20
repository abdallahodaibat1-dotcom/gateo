import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const taxSchema = z.object({
  countryCode: z.string().min(1).max(2),
  name: z.string().min(1),
  rate: z.number().min(0).max(100),
  type: z.enum(['VAT', 'SALES', 'LOCAL']).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/finance/taxes - List tax rates
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const taxes = await prisma.taxRate.findMany({
      orderBy: [{ countryCode: 'asc' }, { type: 'asc' }],
    });

    return NextResponse.json({
      taxes: taxes.map((t) => ({ ...t, rate: Number(t.rate) })),
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/taxes - Create or update a tax rate
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = taxSchema.parse(body);
    const type = data.type || 'VAT';

    const existing = await prisma.taxRate.findUnique({
      where: { countryCode_type: { countryCode: data.countryCode, type } },
    });

    if (existing) {
      const updated = await prisma.taxRate.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          rate: data.rate,
          isActive: data.isActive ?? true,
        },
      });
      return NextResponse.json({ tax: updated });
    }

    const tax = await prisma.taxRate.create({
      data: {
        countryCode: data.countryCode,
        name: data.name,
        rate: data.rate,
        type,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ tax }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الضريبة غير صالحة');
    }
    return serverError(error);
  }
}
