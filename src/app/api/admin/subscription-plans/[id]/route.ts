import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/subscription-plans/[id] - Get plan details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        BusinessSubscription: {
          take: 20,
          include: {
            Business: { select: { id: true, name: true } },
            User: { select: { id: true, name: true } },
          },
        },
        _count: { select: { BusinessSubscription: true } },
      },
    });

    if (!plan) return notFound('Subscription plan not found');

    return NextResponse.json({ plan });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/subscription-plans/[id] - Update plan
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, nameAr, description, price, duration, features, isActive } = body;

    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing) return notFound('Subscription plan not found');

    if (name && name !== existing.name) {
      const nameTaken = await prisma.subscriptionPlan.findUnique({ where: { name } });
      if (nameTaken) return badRequest('Plan name already exists');
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameAr !== undefined && { nameAr }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/subscription-plans/[id] - Delete plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing) return notFound('Subscription plan not found');

    const activeSubs = await prisma.businessSubscription.count({ where: { planId: id, isActive: true } });
    if (activeSubs > 0) {
      return badRequest('Cannot delete plan with active subscriptions');
    }

    await prisma.subscriptionPlan.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
