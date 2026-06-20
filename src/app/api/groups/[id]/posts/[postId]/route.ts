import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api-utils';

// DELETE /api/groups/[id]/posts/[postId] - Delete group post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id, postId } = await params;

  try {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    const post = await prisma.groupPosts.findUnique({
      where: { id: postId },
    });

    if (!post || post.groupId !== id) {
      return notFound('المنشور غير موجود');
    }

    // Post owner or group admin can delete
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    const isAdmin = membership?.role === 'ADMIN';
    const isOwner = post.userId === userId;

    if (!isOwner && !isAdmin) {
      return forbidden();
    }

    await prisma.groupPosts.delete({ where: { id: postId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
