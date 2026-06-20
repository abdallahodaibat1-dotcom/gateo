import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, serverError } from '@/lib/api-utils';

// GET /api/groups/my - Get current user's groups
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const skip = (page - 1) * limit;

  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true, role: true },
    });

    const groupIds = memberships.map((m) => m.groupId);

    const groups = await prisma.group.findMany({
      where: { id: { in: groupIds } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { GroupMember: true, GroupPosts: true },
        },
      },
    });

    const groupsWithRole = groups.map((g) => ({
      ...g,
      memberRole: memberships.find((m) => m.groupId === g.id)?.role || 'MEMBER',
    }));

    const total = groupIds.length;

    return NextResponse.json({
      groups: groupsWithRole,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
