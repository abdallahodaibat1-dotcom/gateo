import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/businesses - List all businesses with filters
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const query = searchParams.get('q');
    const isVerified = searchParams.get('isVerified');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (isVerified !== null) where.isVerified = isVerified === 'true';
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { city: { contains: query } },
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          User: { select: { id: true, name: true, email: true } },
          Category: { select: { id: true, name: true } },
          Subcategory: { select: { id: true, name: true } },
          _count: { select: { Service: true, Review: true, Booking: true, Post: true } },
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
