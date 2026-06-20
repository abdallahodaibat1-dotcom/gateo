import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/marketplace/[id]/click
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.marketplaceListing.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/marketplace/[id]/click error:', error);
    return NextResponse.json({ error: 'فشل في تسجيل النقرة' }, { status: 500 });
  }
}
