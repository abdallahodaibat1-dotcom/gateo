import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// PUT /api/stories/[id]/view - Mark story as viewed
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
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return NextResponse.json({ error: 'القصة غير موجودة' }, { status: 404 });
    }

    let viewedBy: string[] = [];
    if (story.viewedBy) {
      try {
        viewedBy = JSON.parse(story.viewedBy);
        if (!Array.isArray(viewedBy)) viewedBy = [];
      } catch {
        viewedBy = [];
      }
    }
    if (!viewedBy.includes(session.user.id)) {
      viewedBy.push(session.user.id);
      await prisma.story.update({
        where: { id },
        data: { viewedBy: JSON.stringify(viewedBy) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/stories/[id]/view error:', error);
    return NextResponse.json({ error: 'فشل في تحديث القصة' }, { status: 500 });
  }
}
