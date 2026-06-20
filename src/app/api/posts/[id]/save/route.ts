import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// POST /api/posts/[id]/save - Toggle save
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

    const existingSave = await prisma.savedPosts.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    });

    if (existingSave) {
      await prisma.savedPosts.delete({ where: { id: existingSave.id } });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedPosts.create({
        data: {
          userId: session.user.id,
          postId: id,
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('POST /api/posts/[id]/save error:', error);
    return NextResponse.json({ error: 'فشل في حفظ المنشور' }, { status: 500 });
  }
}
