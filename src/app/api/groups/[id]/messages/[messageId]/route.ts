import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

async function isGroupAdmin(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return member?.role === 'ADMIN';
}

// DELETE /api/groups/[id]/messages/[messageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id: groupId, messageId } = await params;

  try {
    const message = await prisma.groupMessage.findFirst({
      where: { id: messageId, groupId },
    });
    if (!message) {
      return NextResponse.json({ error: 'الرسالة غير موجودة' }, { status: 404 });
    }

    const isAdmin = await isGroupAdmin(groupId, user.id);
    if (message.senderId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
    }

    await prisma.groupMessage.update({
      where: { id: messageId },
      data: { isDeleted: true, content: null, mediaUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
