import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET /api/users/suggestions - Suggested users to follow
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '5');

  try {
    let excludeIds: string[] = [];
    if (session?.user?.id) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      excludeIds = [...following.map((f) => f.followingId), session.user.id];
    }

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
        accountType: { in: ['USER', 'PROFESSIONAL'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: { select: { follows_follows_followingIdTousers: true } },
      },
    });

    // Check follow status for logged in user
    let usersWithFollowStatus = users;
    if (session?.user?.id) {
      const followStatuses = await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: users.map((u) => u.id) },
        },
        select: { followingId: true },
      });
      const followingSet = new Set(followStatuses.map((f) => f.followingId));
      usersWithFollowStatus = users.map((u) => ({
        ...u,
        isFollowing: followingSet.has(u.id),
      }));
    }

    return NextResponse.json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error('GET /api/users/suggestions error:', error);
    return NextResponse.json({ error: 'فشل في جلب الاقتراحات' }, { status: 500 });
  }
}
