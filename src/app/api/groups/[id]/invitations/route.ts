import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const inviteSchema = z.object({
  userId: z.string().min(1),
});

async function isGroupAdminOrMod(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return member && (member.role === 'ADMIN' || member.role === 'MODERATOR');
}

// GET /api/groups/[id]/invitations - List invitations for a group
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id: groupId } = await params;

  if (!(await isGroupAdminOrMod(groupId, user.id))) {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
  }

  try {
    const invitations = await prisma.groupInvitation.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      include: {
        users_group_invitations_userIdTousers: { select: { id: true, name: true, avatar: true, email: true } },
        users_group_invitations_invitedByIdTousers: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ invitations });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/groups/[id]/invitations - Send an invitation
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id: groupId } = await params;

  if (!(await isGroupAdminOrMod(groupId, user.id))) {
    return NextResponse.json({ error: 'ليس لديك صلاحية' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId: targetUserId } = inviteSchema.parse(body);

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (existingMember) {
      return badRequest('المستخدم عضو بالفعل في المجموعة');
    }

    // Check if invitation already exists
    const existing = await prisma.groupInvitation.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (existing) {
      if (existing.status === 'PENDING') {
        return badRequest('تم إرسال دعوة مسبقاً لهذا المستخدم');
      }
      // Update existing invitation to PENDING again
      const updated = await prisma.groupInvitation.update({
        where: { id: existing.id },
        data: { status: 'PENDING', invitedById: user.id },
        include: {
          users_group_invitations_userIdTousers: { select: { id: true, name: true, avatar: true } },
          users_group_invitations_invitedByIdTousers: { select: { id: true, name: true } },
        },
      });
      return NextResponse.json({ invitation: updated }, { status: 200 });
    }

    const invitation = await prisma.groupInvitation.create({
      data: {
        groupId,
        userId: targetUserId,
        invitedById: user.id,
        status: 'PENDING',
      },
      include: {
        users_group_invitations_userIdTousers: { select: { id: true, name: true, avatar: true } },
        users_group_invitations_invitedByIdTousers: { select: { id: true, name: true } },
      },
    });

    // Create notification
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (group) {
      await createNotification({
        userId: targetUserId,
        type: 'GROUP_INVITE',
        title: 'دعوة للانضمام إلى مجموعة',
        body: `${user.name || 'مستخدم'} قام بدعوتك للانضمام إلى "${group.name}"`,
        data: { actorId: user.id, groupId, invitationId: invitation.id },
      });
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}
