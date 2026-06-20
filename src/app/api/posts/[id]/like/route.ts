import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

// POST /api/posts/[id]/like - Toggle like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: id,
        },
      });

      // Create notification for post owner
      if (post.userId && post.userId !== session.user.id) {
        await createNotification({
          userId: post.userId,
          type: 'LIKE',
          title: 'إعجاب جديد',
          body: 'أعجب أحد المستخدمين بمنشورك',
          data: { actorId: session.user.id, postId: id },
        });
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('POST /api/posts/[id]/like error:', error);
    return NextResponse.json({ error: 'فشل في تبديل الإعجاب' }, { status: 500 });
  }
}
