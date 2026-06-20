import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  duration: z.number().int().min(1),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

function parseFeatures(value: unknown): any {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value.split('\n').map((l) => l.trim()).filter(Boolean);
    }
  }
  return [];
}

// GET /api/admin/finance/subscriptions - List subscription plans
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
      include: { _count: { select: { BusinessSubscription: true } } },
    });

    return NextResponse.json({
      plans: plans.map((p) => ({
        ...p,
        price: Number(p.price),
        features: Array.isArray(p.features) ? p.features : [],
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/finance/subscriptions - Create a subscription plan
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = planSchema.parse(body);

    const existing = await prisma.subscriptionPlan.findUnique({ where: { name: data.name } });
    if (existing) return badRequest('اسم الخطة مستخدم مسبقاً');

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        price: data.price,
        duration: data.duration,
        features: JSON.stringify(parseFeatures(data.features)),
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الخطة غير صالحة');
    }
    return serverError(error);
  }
}
