import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/subscription-plans - List all subscription plans
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
      include: {
        _count: { select: { BusinessSubscription: true } },
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/subscription-plans - Create subscription plan
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const { name, nameAr, description, price, duration, features, isActive } = body;

    if (!name || price === undefined || !duration) {
      return badRequest('Name, price, and duration are required');
    }

    const existing = await prisma.subscriptionPlan.findUnique({ where: { name } });
    if (existing) return badRequest('Plan name already exists');

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        nameAr,
        description,
        price,
        duration,
        features: features || [],
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
