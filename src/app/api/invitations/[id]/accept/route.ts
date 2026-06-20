import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

// POST /api/invitations/[id]/accept
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id } = await params;

  try {
    const invitation = await prisma.groupInvitation.findFirst({
      where: { id, userId: user.id, status: 'PENDING' },
    });
    if (!invitation) {
      return NextResponse.json({ error: 'الدعوة غير موجودة أو تم معالجتها' }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: invitation.groupId, userId: user.id } },
    });

    await prisma.$transaction(async (tx) => {
      await tx.groupInvitation.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      if (!existing) {
        await tx.groupMember.create({
          data: {
            groupId: invitation.groupId,
            userId: user.id,
            role: 'MEMBER',
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
