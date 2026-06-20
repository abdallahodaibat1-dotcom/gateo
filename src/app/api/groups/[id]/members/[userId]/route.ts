import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api-utils';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['MEMBER', 'ADMIN', 'MODERATOR']),
});

// PUT /api/groups/[id]/members/[userId] - Update member role
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const currentUserId = session.user.id;

  const { id, userId } = await params;

  try {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    const currentMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: currentUserId,
        },
      },
    });

    if (!currentMembership || currentMembership.role !== 'ADMIN') {
      return forbidden();
    }

    const targetMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!targetMembership) {
      return notFound('العضو غير موجود في المجموعة');
    }

    const body = await req.json();
    const data = updateRoleSchema.parse(body);

    const updated = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
      data: { role: data.role },
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ member: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}

// DELETE /api/groups/[id]/members/[userId] - Remove member or leave group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const currentUserId = session.user.id;

  const { id, userId } = await params;

  try {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    const isSelf = userId === currentUserId;

    if (!isSelf) {
      const currentMembership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: currentUserId,
          },
        },
      });

      if (!currentMembership || currentMembership.role !== 'ADMIN') {
        return forbidden();
      }
    }

    const targetMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!targetMembership) {
      return notFound('العضو غير موجود في المجموعة');
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
