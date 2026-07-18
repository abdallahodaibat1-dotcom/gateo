import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';

// GET /api/trending - Get trending/popular content (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // all | post | reel
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

    const postTypes = type === 'reel' ? ['REEL'] : type === 'post' ? ['POST'] : ['POST', 'REEL'];

    const posts = await prisma.post.findMany({
      where: {
        postType: { in: postTypes as any },
        isPublic: true,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
        Business: { select: { id: true, name: true, logo: true } },
        _count: { select: { Like: true, Comment: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Calculate engagement score
    const scored = posts.map((post) => {
      const likes = post._count.Like;
      const comments = post._count.Comment;
      const views = post.views || 0;
      const shares = post.shares || 0;
      const ageHours = Math.max(1, (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60));
      // Engagement score: likes*2 + comments*3 + views*0.1 + shares*2, decayed by age
      const score = (likes * 2 + comments * 3 + views * 0.1 + shares * 2) / Math.pow(ageHours, 0.3);
      return {
        ...post,
        score,
        stats: { likes, comments, views, shares },
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      posts: scored.slice(0, limit).map((post) => ({
        id: post.id,
        content: post.content,
        images: post.images,
        video: post.video,
        postType: post.postType,
        createdAt: post.createdAt,
        user: post.User,
        business: post.Business,
        stats: post.stats,
        score: Math.round(post.score * 10) / 10,
      })),
      meta: { type, period, limit },
    });
  } catch (error) {
    return serverError(error);
  }
}
