import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/businesses/applications - List pending business applications
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'PENDING';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          User: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          Category: { select: { id: true, name: true } },
          Subcategory: { select: { id: true, name: true } },
        },
      }),
      prisma.business.count({ where }),
    ]);

    return NextResponse.json({
      businesses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
