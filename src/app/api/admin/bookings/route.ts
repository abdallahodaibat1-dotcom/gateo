import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/bookings - List all bookings with filters
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const businessId = searchParams.get('businessId');
    const userId = searchParams.get('userId');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (businessId) where.businessId = businessId;
    if (userId) where.userId = userId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          User: { select: { id: true, name: true, email: true, phone: true } },
          Business: { select: { id: true, name: true, logo: true } },
          Service: { select: { id: true, name: true, price: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
