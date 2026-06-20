import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { awardPoints } from '@/lib/points';
import { createNotification } from '@/lib/notifications';

// POST /api/users/[id]/follow - Toggle follow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id: targetUserId } = await params;

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: 'لا يمكن متابعة نفسك' }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      return NextResponse.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });

      // Create notification
      await createNotification({
        userId: targetUserId,
        type: 'FOLLOW',
        title: 'متابعة جديدة',
        body: 'بدأ أحد المستخدمين بمتابعتك',
        data: { actorId: session.user.id },
      });

      // Award points for following a user
      await awardPoints(session.user.id, 5, 'متابعة مستخدم', 'EARN', targetUserId).catch(() => {});

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error('POST /api/users/[id]/follow error:', error);
    return NextResponse.json({ error: 'فشل في تبديل المتابعة' }, { status: 500 });
  }
}
