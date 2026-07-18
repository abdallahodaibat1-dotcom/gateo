import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  video: z.string().url().optional().nullable(),
  location: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  hashtags: z.string().optional().nullable(),
  postType: z.enum(['POST', 'REEL']).optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/posts/[id] - Get single post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    const include: any = {
      User: { select: { id: true, name: true, avatar: true } },
      Business: { select: { id: true, name: true, logo: true } },
      _count: { select: { Like: true, Comment: true } },
    };
    if (session?.user?.id) {
      include.Like = { where: { userId: session.user.id }, select: { id: true } };
      include.SavedPosts = { where: { userId: session.user.id }, select: { id: true } };
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include,
    });

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    // Check if private post and not owner
    if (!post.isPublic && post.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    return NextResponse.json({
      post: {
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
      },
    });
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنشور' }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const data = updatePostSchema.parse(body);

    const { images, ...restData } = data;
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...restData,
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

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المنشور' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }
    if (existing.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error);
    return NextResponse.json({ error: 'فشل في حذف المنشور' }, { status: 500 });
  }
}
