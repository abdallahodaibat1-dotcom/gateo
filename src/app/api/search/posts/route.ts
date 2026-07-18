import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';

// GET /api/search/posts - Search posts by content, hashtags, or location
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const hashtag = searchParams.get('hashtag')?.trim();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
  const userId = searchParams.get('userId');
  const skip = (page - 1) * limit;

  if (!q && !hashtag) {
    return badRequest('يجب إدخال مصطلح البحث أو هاشتاق');
  }

  try {
    const where: any = {};

    if (hashtag) {
      const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
      where.hashtags = { contains: tag };
    }

    if (q) {
      where.OR = [
        { content: { contains: q } },
        { location: { contains: q } },
        { hashtags: { contains: q } },
      ];
    }

    if (userId) {
      where.userId = userId;
    } else {
      // If no specific user, only show public posts
      // Logged-in users can also see posts from people they follow (handled below)
      where.isPublic = true;
    }

    // For non-public posts from followed users, we keep it simple:
    // either specific user's posts or public posts

    const include: any = {
      User: { select: { id: true, name: true, avatar: true } },
      Business: { select: { id: true, name: true, logo: true } },
      _count: { select: { Like: true, Comment: true } },
    };
    if (user?.id) {
      include.Like = { where: { userId: user.id }, select: { id: true } };
      include.SavedPosts = { where: { userId: user.id }, select: { id: true } };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        user: post.User,
        business: post.Business,
        _count: { likes: (post._count as any).Like, comments: (post._count as any).Comment, views: post.views, shares: post.shares },
        isLiked: post.Like && post.Like.length > 0,
        isSaved: post.SavedPosts && post.SavedPosts.length > 0,
        User: undefined,
        Business: undefined,
        Like: undefined,
        SavedPosts: undefined,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
