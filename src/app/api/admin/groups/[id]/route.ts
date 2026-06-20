import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/groups/[id] - Get group details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        GroupMember: {
          include: {
            User: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { joinedAt: 'desc' },
          take: 50,
        },
        GroupPosts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { GroupMember: true, GroupPosts: true } },
      },
    });

    if (!group) return notFound('Group not found');

    return NextResponse.json({ group });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/groups/[id] - Delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.group.findUnique({ where: { id } });
    if (!existing) return notFound('Group not found');

    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
