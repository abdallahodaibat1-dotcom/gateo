import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { awardPoints } from '@/lib/points';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  images: z.array(z.string().min(1)).max(10).optional(),
  video: z.string().min(1).optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  hashtags: z.string().optional(),
  postType: z.enum(['POST', 'REEL']).default('POST'),
  isPublic: z.boolean().default(true),
});

// GET /api/posts - Get feed posts
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const type = searchParams.get('type') as 'POST' | 'REEL' | null;
  const skip = (page - 1) * limit;

  try {
    // If user is logged in, show posts from followed users + public posts
    // If not, show only public posts
    let where: any = { isPublic: true };

    if (type) {
      where.postType = type;
    }

    if (session?.user?.id) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);

      where = {
        ...where,
        OR: [
          { isPublic: true },
          { userId: { in: followingIds } },
          { userId: session.user.id },
        ],
      };
    }

    const include: any = {
      User: { select: { id: true, name: true, avatar: true } },
      Business: { select: { id: true, name: true, logo: true } },
      _count: { select: { Like: true, Comment: true } },
    };
    if (session?.user?.id) {
      include.Like = { where: { userId: session.user.id }, select: { id: true } };
      include.SavedPosts = { where: { userId: session.user.id }, select: { id: true } };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include,
    });

    const total = await prisma.post.count({ where });

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
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنشورات' }, { status: 500 });
  }
}

// POST /api/posts - Create post
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createPostSchema.parse(body);

    const { images, ...restData } = data;
    const post = await prisma.post.create({
      data: {
        ...restData,
        userId: session.user.id,
        images: images ? JSON.stringify(images) : undefined,
        hashtags: data.hashtags || data.content
          ? (data.content || '').match(/#[\w\u0600-\u06FF]+/g)?.join(',') || data.hashtags
          : undefined,
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
        _count: { select: { Like: true, Comment: true } },
      },
    });

    // Award points for creating a post
    await awardPoints(session.user.id, 10, 'نشر منشور جديد', 'EARN', post.id).catch(() => {});

    return NextResponse.json({
      post: {
        ...post,
        user: post.User,
        _count: { likes: (post._count as any).Like, comments: (post._count as any).Comment, views: post.views, shares: post.shares },
        User: undefined,
        Like: undefined,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المنشور' }, { status: 500 });
  }
}
