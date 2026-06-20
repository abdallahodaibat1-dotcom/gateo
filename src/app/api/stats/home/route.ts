import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [posts, users, businesses] = await Promise.all([
      prisma.post.count(),
      prisma.user.count({ where: { accountType: { in: ['USER', 'PROFESSIONAL'] } } }),
      prisma.business.count(),
    ]);

    return NextResponse.json({ posts, users, businesses });
  } catch (error) {
    console.error('GET /api/stats/home error:', error);
    return NextResponse.json({ posts: 0, users: 0, businesses: 0 });
  }
}
