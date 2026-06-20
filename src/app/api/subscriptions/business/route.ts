import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-utils';
import { purchaseBusinessSubscription } from '@/lib/finance';
import { z } from 'zod';

const subscribeSchema = z.object({
  planId: z.string().min(1),
});

function serializeFeatures(features: unknown): string[] {
  if (!features) return [];
  if (Array.isArray(features)) {
    return features.map((f) => {
      if (typeof f === 'string') return f;
      if (f && typeof f === 'object') {
        const obj = f as Record<string, unknown>;
        if (typeof obj.feature === 'string') {
          return `${obj.feature}: ${obj.value ?? ''}`;
        }
        return JSON.stringify(f);
      }
      return String(f);
    });
  }
  return [];
}

function serializePlan(plan: any) {
  return {
    ...plan,
    price: Number(plan.price),
    features: serializeFeatures(plan.features),
  };
}

// GET /api/subscriptions/business - Current user's business subscription and available plans
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const [subscription, plans] = await Promise.all([
      prisma.businessSubscription.findFirst({
        where: { userId },
        include: { SubscriptionPlan: true, Business: { select: { id: true, name: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      }),
    ]);

    return NextResponse.json({
      subscription: subscription ? { ...subscription, plan: serializePlan(subscription.SubscriptionPlan) } : null,
      plans: plans.map(serializePlan),
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/subscriptions/business - Purchase/renew business subscription
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = subscribeSchema.parse(body);

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return notFound('النشاط التجاري غير موجود');

    const result = await purchaseBusinessSubscription(userId, business.id, data.planId);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الاشتراك غير صالحة');
    }
    if (error instanceof Error) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}
