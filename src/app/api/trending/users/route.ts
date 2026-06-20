import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError, privateJson } from '@/lib/api-utils';

// GET /api/trending/users - Get top/popular users (celebrities)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '7d'; // 24h | 7d | 30d | all
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const now = new Date();
    let since: Date | undefined;
    switch (period) {
      case '24h':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = undefined;
    }

    const users = await prisma.user.findMany({
      where: {
        // Include both USER and BUSINESS accounts so business owners can appear as celebrities too
        accountType: { in: ['USER', 'BUSINESS', 'PROFESSIONAL', 'COMPANY'] },
      },
      include: {
        Profile: { select: { city: true, country: true, bio: true } },
        _count: {
          select: {
            follows_follows_followingIdTousers: true,
            follows_follows_followerIdTousers: true,
            Post: true,
          },
        },
        Post: {
          where: since ? { createdAt: { gte: since }, isPublic: true } : { isPublic: true },
          select: { id: true },
        },
      },
      take: 100,
    });

    // Score based on followers, posts count, and engagement
    const scored = users.map((user) => {
      const followers = user._count.follows_follows_followingIdTousers;
      const postsCount = user._count.Post;
      const recentPosts = user.Post.length;
      const score = followers * 3 + postsCount * 2 + recentPosts * 5;
      return {
        ...user,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return privateJson({
      users: scored.slice(0, limit).map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        profile: user.Profile,
        stats: {
          followers: user._count.follows_follows_followingIdTousers,
          following: user._count.follows_follows_followerIdTousers,
          posts: user._count.Post,
        },
        score: user.score,
      })),
      meta: { period, limit },
    });
  } catch (error) {
    return serverError(error);
  }
}
