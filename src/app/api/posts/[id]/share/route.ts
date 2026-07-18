import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/posts/[id]/share - Increment share count for a post
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.post.update({
      where: { id },
      data: { shares: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Failed to increment shares:', e);
    return NextResponse.json({ error: 'Failed to increment shares' }, { status: 500 });
  }
}
