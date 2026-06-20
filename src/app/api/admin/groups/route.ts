import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/groups - List all groups with filters
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isPublic = searchParams.get('isPublic');
    const category = searchParams.get('category');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isPublic !== null) where.isPublic = isPublic === 'true';
    if (category) where.category = category;

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { GroupMember: true, GroupPosts: true } },
        },
      }),
      prisma.group.count({ where }),
    ]);

    return NextResponse.json({
      groups,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
