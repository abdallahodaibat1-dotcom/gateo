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

const createPostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  video: z.string().url().optional(),
}).refine((data) => data.content || data.images?.length || data.video, {
  message: 'يجب إدخال نص أو صور أو فيديو',
});

// GET /api/groups/[id]/posts - List group posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    // If group is private, check membership
    if (!group.isPublic) {
      if (!session?.user?.id) return unauthorized();
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: id,
            userId: session.user.id,
          },
        },
      });
      if (!membership) return forbidden();
    }

    const posts = await prisma.groupPosts.findMany({
      where: { groupId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Fetch users separately since GroupPost has no user relation
    const userIds = [...new Set(posts.map((p) => p.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true },
    });

    const postsWithUser = posts.map((post) => ({
      ...post,
      user: users.find((u) => u.id === post.userId) || null,
    }));

    const total = await prisma.groupPosts.count({ where: { groupId: id } });

    return NextResponse.json({
      posts: postsWithUser,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/groups/[id]/posts - Create group post
export async function POST(
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

    if (!membership) {
      return forbidden();
    }

    const body = await req.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.groupPosts.create({
      data: {
        content: data.content || '',
        images: data.images ? JSON.stringify(data.images) : undefined,
        video: data.video || undefined,
        groupId: id,
        userId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true },
    });

    return NextResponse.json({ post: { ...post, user } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}
