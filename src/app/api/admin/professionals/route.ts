import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/professionals - List all professional profiles with filters
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
        { title: { contains: query } },
        { bio: { contains: query } },
        { city: { contains: query } },
        { User: { name: { contains: query } } },
      ];
    }

    const [professionals, total] = await Promise.all([
      prisma.professionalProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          User: { select: { id: true, name: true, email: true, phone: true } },
          Category: { select: { id: true, name: true } },
          Subcategory: { select: { id: true, name: true } },
          Country: { select: { id: true, name: true } },
        },
      }),
      prisma.professionalProfile.count({ where }),
    ]);

    return NextResponse.json({
      professionals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
