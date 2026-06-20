import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const gatewaySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
  countries: z.string().optional(),
  currencies: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/admin/finance/gateways - List payment gateways
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const gateways = await prisma.paymentGateway.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ gateways });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/gateways - Create a payment gateway
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = gatewaySchema.parse(body);

    const existing = await prisma.paymentGateway.findUnique({ where: { code: data.code } });
    if (existing) return badRequest('رمز البوابة مستخدم مسبقاً');

    const gateway = await prisma.paymentGateway.create({
      data: {
        code: data.code,
        name: data.name,
        nameAr: data.nameAr,
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
        config: data.config ? JSON.stringify(data.config) : undefined,
        Countries: data.countries,
        currencies: data.currencies,
        sortOrder: data.sortOrder ?? 0,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ gateway }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات البوابة غير صالحة');
    }
    return serverError(error);
  }
}
