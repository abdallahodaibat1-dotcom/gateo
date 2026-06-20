import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  image: z.string().optional(),
  isPublic: z.boolean().default(true),
  category: z.string().optional(),
});

// GET /api/groups - List groups
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const groups = await prisma.group.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { GroupMember: true, GroupPosts: true },
        },
      },
    });

    const total = await prisma.group.count({ where });

    return NextResponse.json({
      groups,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/groups - Create group
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const body = await req.json();
    const data = createGroupSchema.parse(body);

    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        isPublic: data.isPublic,
        category: data.category,
      },
    });

    // Creator becomes admin
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'ADMIN',
      },
    });

    return NextResponse.json(
      {
        group: {
          ...group,
          _count: { members: 1, posts: 0 },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}
