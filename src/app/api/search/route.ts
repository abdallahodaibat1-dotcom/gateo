import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';

// GET /api/search - Global search across users, businesses, posts, and groups
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const type = searchParams.get('type'); // users | businesses | posts | groups | all
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

  if (!q || q.length < 1) {
    return badRequest('يجب إدخال مصطلح البحث');
  }

  const searchTerm = q;
  const searchTypes = type && type !== 'all' ? [type] : ['users', 'businesses', 'posts', 'groups'];

  try {
    const results: Record<string, unknown> = {};

    if (searchTypes.includes('users')) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
          _count: { select: { follows_follows_followingIdTousers: true } },
        },
      });

      let usersWithFollowStatus = users;
      if (user?.id) {
        const followStatuses = await prisma.follow.findMany({
          where: {
            followerId: user.id,
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

      results.users = usersWithFollowStatus;
    }

    if (searchTypes.includes('businesses')) {
      const businesses = await prisma.business.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { city: { contains: searchTerm } },
            { address: { contains: searchTerm } },
          ],
        },
        orderBy: { avgRating: 'desc' },
        take: limit,
        include: {
          Category: { select: { id: true, name: true } },
          Subcategory: { select: { id: true, name: true } },
          _count: { select: { Review: true } },
        },
      });
      results.businesses = businesses;
    }

    if (searchTypes.includes('posts')) {
      const posts = await prisma.post.findMany({
        where: {
          isPublic: true,
          OR: [
            { content: { contains: searchTerm } },
            { location: { contains: searchTerm } },
            { hashtags: { contains: searchTerm } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          User: { select: { id: true, name: true, avatar: true } },
          Business: { select: { id: true, name: true, logo: true } },
          _count: { select: { Like: true, Comment: true } },
        },
      });

      let postsWithStatus = posts;
      if (user?.id) {
        const postIds = posts.map((p) => p.id);
        const [likedPosts, savedPosts] = await Promise.all([
          prisma.like.findMany({
            where: { userId: user.id, postId: { in: postIds } },
            select: { postId: true },
          }),
          prisma.savedPosts.findMany({
            where: { userId: user.id, postId: { in: postIds } },
            select: { postId: true },
          }),
        ]);
        const likedSet = new Set(likedPosts.map((l) => l.postId));
        const savedSet = new Set(savedPosts.map((s) => s.postId));
        postsWithStatus = posts.map((p) => ({
          ...p,
          isLiked: likedSet.has(p.id),
          isSaved: savedSet.has(p.id),
        }));
      }

      results.posts = postsWithStatus;
    }

    if (searchTypes.includes('groups')) {
      const groups = await prisma.group.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { category: { contains: searchTerm } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          _count: { select: { GroupMember: true, GroupPosts: true } },
        },
      });

      let groupsWithStatus = groups;
      if (user?.id) {
        const memberships = await prisma.groupMember.findMany({
          where: { userId: user.id, groupId: { in: groups.map((g) => g.id) } },
          select: { groupId: true, role: true },
        });
        const membershipMap = new Map(memberships.map((m) => [m.groupId, m.role]));
        groupsWithStatus = groups.map((g) => ({
          ...g,
          isMember: membershipMap.has(g.id),
          memberRole: membershipMap.get(g.id) || null,
        }));
      }

      results.groups = groupsWithStatus;
    }

    return NextResponse.json({ query: searchTerm, results });
  } catch (error) {
    return serverError(error);
  }
}
