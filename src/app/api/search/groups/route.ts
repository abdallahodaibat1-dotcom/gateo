import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';

// GET /api/search/groups - Search groups
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
  const category = searchParams.get('category');
  const isPublicParam = searchParams.get('isPublic');
  const skip = (page - 1) * limit;

  if (!q || q.length < 1) {
    return badRequest('يجب إدخال مصطلح البحث');
  }

  try {
    const where: any = {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
      ],
    };

    if (category) {
      where.category = { contains: category };
    }

    if (isPublicParam === 'true') {
      where.isPublic = true;
    } else if (isPublicParam === 'false') {
      where.isPublic = false;
      // Private groups: only show if user is a member
      if (user?.id) {
        where.GroupMember = {
          some: { userId: user.id },
        };
      } else {
        return badRequest('يجب تسجيل الدخول للبحث في المجموعات الخاصة');
      }
    } else {
      // Default: show public groups + private groups the user is in
      if (user?.id) {
        where.OR = [
          { isPublic: true },
          {
            isPublic: false,
            GroupMember: { some: { userId: user.id } },
          },
        ];
      } else {
        where.isPublic = true;
      }
    }

    const include: any = {
      _count: { select: { GroupMember: true, GroupPosts: true } },
    };
    if (user?.id) {
      include.GroupMember = { where: { userId: user.id }, select: { id: true, role: true } };
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include,
      }),
      prisma.group.count({ where }),
    ]);

    return NextResponse.json({
      groups: groups.map((g: any) => ({
        ...g,
        isMember: g.GroupMember && g.GroupMember.length > 0,
        memberRole: g.GroupMember && g.GroupMember.length > 0 ? g.GroupMember[0].role : null,
        GroupMember: undefined,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
