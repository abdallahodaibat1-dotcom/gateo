import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getCurrentUser, badRequest, serverError, privateJson } from '@/lib/api-utils';

// GET /api/search/users - Search users (public, no auth required)
export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
  const city = searchParams.get('city');
  const country = searchParams.get('country');
  const skip = (page - 1) * limit;

  if (!q || q.length < 1) {
    return badRequest('يجب إدخال مصطلح البحث');
  }

  try {
    const parts = q.split(/\s+/).filter(Boolean);
    const orConditions: Prisma.UserWhereInput[] = [
      { name: { contains: q } },
      { username: { contains: q } },
    ];

    // Smart split: first name + last name
    if (parts.length >= 2) {
      const first = parts[0];
      const last = parts.slice(1).join(' ');
      orConditions.push(
        { AND: [{ name: { startsWith: first } }, { name: { endsWith: last } }] }
      );
    }

    const where: Prisma.UserWhereInput = {
      OR: orConditions,
    };

    if (city || country) {
      where.Profile = {
        ...(city ? { city: { contains: city } } : {}),
        ...(country ? { country: { contains: country } } : {}),
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [
          { name: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          createdAt: true,
          Profile: {
            select: { city: true, country: true, bio: true },
          },
          _count: { select: { follows_follows_followingIdTousers: true, follows_follows_followerIdTousers: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    let usersWithFollowStatus = users;
    if (currentUser?.id) {
      const followStatuses = await prisma.follow.findMany({
        where: {
          followerId: currentUser.id,
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

    return privateJson({
      users: usersWithFollowStatus,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
