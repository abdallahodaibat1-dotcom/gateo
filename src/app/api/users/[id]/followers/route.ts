import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/users/[id]/followers - List followers
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        users_follows_followerIdTousers: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const total = await prisma.follow.count({ where: { followingId: id } });

    return NextResponse.json({
      followers: followers.map((f) => f.users_follows_followerIdTousers),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/users/[id]/followers error:', error);
    return NextResponse.json({ error: 'فشل في جلب المتابعن' }, { status: 500 });
  }
}
