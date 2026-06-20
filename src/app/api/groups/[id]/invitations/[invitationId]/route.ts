import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

async function isGroupAdminOrMod(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return member && (member.role === 'ADMIN' || member.role === 'MODERATOR');
}

// DELETE /api/groups/[id]/invitations/[invitationId] - Cancel an invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id: groupId, invitationId } = await params;

  if (!(await isGroupAdminOrMod(groupId, user.id))) {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
  }

  try {
    await prisma.groupInvitation.deleteMany({
      where: { id: invitationId, groupId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
