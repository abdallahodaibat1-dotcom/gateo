import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/ads/click - track ad click
export async function POST(req: Request) {
  try {
    const { adId } = await req.json();
    if (!adId) {
      return NextResponse.json({ error: 'معرف الإعلان مطلوب' }, { status: 400 });
    }

    await prisma.ad.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/ads/click error:', error);
    return NextResponse.json({ error: 'فشل في تسجيل النقرة' }, { status: 500 });
  }
}
