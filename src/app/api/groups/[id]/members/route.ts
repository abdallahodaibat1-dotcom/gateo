import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  unauthorized,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api-utils';

// GET /api/groups/[id]/members - List members
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
    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) return notFound('المجموعة غير موجودة');

    const members = await prisma.groupMember.findMany({
      where: { groupId: id },
      orderBy: { joinedAt: 'asc' },
      skip,
      take: limit,
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const total = await prisma.groupMember.count({ where: { groupId: id } });

    return NextResponse.json({
      members,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/groups/[id]/members - Join group
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

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId,
        },
      },
    });

    if (existing) {
      return badRequest('أنت عضو بالفعل في هذه المجموعة');
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: id,
        userId,
        role: 'MEMBER',
      },
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
