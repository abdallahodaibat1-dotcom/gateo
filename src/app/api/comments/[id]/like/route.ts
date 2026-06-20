import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// POST /api/comments/[id]/like - Like/unlike comment
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
    const existing = await prisma.like.findFirst({
      where: { userId: session.user.id, commentId: id },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      const count = await prisma.like.count({ where: { commentId: id } });
      return NextResponse.json({ liked: false, likesCount: count });
    } else {
      await prisma.like.create({
        data: { userId: session.user.id, commentId: id },
      });
      const count = await prisma.like.count({ where: { commentId: id } });
      return NextResponse.json({ liked: true, likesCount: count });
    }
  } catch (error) {
    console.error('POST /api/comments/[id]/like error:', error);
    return NextResponse.json({ error: 'فشل في معالجة الإعجاب' }, { status: 500 });
  }
}
