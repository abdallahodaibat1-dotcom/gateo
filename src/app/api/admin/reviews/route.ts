import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/reviews - List all reviews with filters
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const businessId = searchParams.get('businessId');
    const userId = searchParams.get('userId');
    const minRating = searchParams.get('minRating');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (businessId) where.businessId = businessId;
    if (userId) where.userId = userId;
    if (minRating) where.rating = { gte: parseInt(minRating) };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          User: { select: { id: true, name: true, avatar: true } },
          Business: { select: { id: true, name: true, logo: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
