import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

function normalizeComment(comment: any) {
  return {
    ...comment,
    user: comment.User || null,
    User: undefined,
    replies: comment.other_comments ? comment.other_comments.map(normalizeComment) : undefined,
    other_comments: undefined,
    _count: comment._count
      ? {
          replies: comment._count.other_comments ?? 0,
          likes: comment._count.Like ?? 0,
        }
      : undefined,
  };
}

// GET /api/posts/[id]/comments - Get comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        User: { select: { id: true, name: true, avatar: true } },
        _count: { select: { other_comments: true, Like: true } },
        other_comments: {
          take: 2,
          orderBy: { createdAt: 'asc' },
          include: {
            User: { select: { id: true, name: true, avatar: true } },
            _count: { select: { Like: true } },
          },
        },
      },
    });

    const total = await prisma.comment.count({ where: { postId: id, parentId: null } });

    return NextResponse.json({
      comments: comments.map(normalizeComment),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/posts/[id]/comments error:', error);
    return NextResponse.json({ error: 'فشل في جلب التعليقات' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments - Add comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const data = createCommentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: id,
        userId: session.user.id,
        parentId: data.parentId || null,
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
        _count: { select: { other_comments: true, Like: true } },
      },
    });

    // Create notification for post owner
    if (post.userId && post.userId !== session.user.id) {
      await createNotification({
        userId: post.userId,
        type: 'COMMENT',
        title: 'تعليق جديد',
        body: 'علق أحد المستخدمين على منشورك',
        data: { actorId: session.user.id, postId: id, commentId: comment.id },
      });
    }

    // If reply, notify parent comment owner
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { userId: true },
      });
      if (parentComment?.userId && parentComment.userId !== session.user.id) {
        await createNotification({
          userId: parentComment.userId,
          type: 'COMMENT',
          title: 'رد جديد',
          body: 'رد أحد المستخدمين على تعليقك',
          data: { actorId: session.user.id, postId: id, commentId: comment.id },
        });
      }
    }

    return NextResponse.json({ comment: normalizeComment(comment) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/posts/[id]/comments error:', error);
    return NextResponse.json({ error: 'فشل في إضافة التعليق' }, { status: 500 });
  }
}
