import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';

function serializeFeatures(features: unknown): string[] {
  if (!features) return [];

  let parsed = features;
  if (typeof features === 'string') {
    try {
      parsed = JSON.parse(features);
    } catch {
      return [features];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((f) => {
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

// GET /api/subscriptions/plans - Public list of active subscription plans
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ plans: plans.map(serializePlan) });
  } catch (error) {
    return serverError(error);
  }
}
