import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

// GET /api/users - List all users (for invites, etc.)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);
  const query = searchParams.get('q')?.trim();

  try {
    const where: any = { accountType: { in: ['USER', 'PROFESSIONAL'] } };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true,
        Profile: { select: { city: true, country: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return serverError(error);
  }
}
