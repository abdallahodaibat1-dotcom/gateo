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

const updateGroupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  image: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
  category: z.string().optional().nullable(),
});

// GET /api/groups/[id] - Get single group
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: { GroupMember: true, GroupPosts: true },
        },
        GroupMember: {
          take: 5,
          orderBy: { joinedAt: 'asc' },
          include: {
            User: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!group) return notFound('المجموعة غير موجودة');

    const membership = session?.user?.id
      ? await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: id,
              userId: session.user.id,
            },
          },
        })
      : null;

    return NextResponse.json({
      group: {
        ...group,
        isMember: !!membership,
        memberRole: membership?.role || null,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/groups/[id] - Update group
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return forbidden();
    }

    const body = await req.json();
    const data = updateGroupSchema.parse(body);

    const updated = await prisma.group.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return NextResponse.json({ group: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}

// DELETE /api/groups/[id] - Delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return forbidden();
    }

    await prisma.group.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
