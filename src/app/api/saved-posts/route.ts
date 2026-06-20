import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// GET /api/saved-posts - Get saved posts for current user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const savedPosts = await prisma.savedPosts.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        Post: {
          include: {
            User: { select: { id: true, name: true, avatar: true } },
            Business: { select: { id: true, name: true, logo: true } },
            _count: { select: { Like: true, Comment: true } },
            Like: { where: { userId: session.user.id }, select: { id: true } },
            SavedPosts: { where: { userId: session.user.id }, select: { id: true } },
          },
        },
      },
    });

    const total = await prisma.savedPosts.count({ where: { userId: session.user.id } });

    return NextResponse.json({
      posts: savedPosts.map((sp) => ({
        ...sp.Post,
        isLiked: sp.Post.Like.length > 0,
        isSaved: sp.Post.SavedPosts.length > 0,
        savedAt: sp.createdAt,
        Like: undefined,
        SavedPosts: undefined,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/saved-posts error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنشورات المحفوظة' }, { status: 500 });
  }
}
