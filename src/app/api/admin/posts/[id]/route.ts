import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/posts/[id] - Get post details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, avatar: true } },
        Business: { select: { id: true, name: true, logo: true } },
        Comment: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { User: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { Comment: true, Like: true, SavedPosts: true } },
      },
    });

    if (!post) return notFound('Post not found');

    return NextResponse.json({ post });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/posts/[id] - Delete post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return notFound('Post not found');

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
