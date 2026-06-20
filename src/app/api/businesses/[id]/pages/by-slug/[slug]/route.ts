import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/businesses/[id]/pages/by-slug/[slug] - Public page by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> }
) {
  const { id, slug } = await params;

  try {
    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, status: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }

    if (business.status !== 'ACTIVE' && business.status !== 'PENDING') {
      return NextResponse.json({ error: 'العمل غير متاح حالياً' }, { status: 403 });
    }

    const page = await prisma.businessPage.findUnique({
      where: { businessId_slug: { businessId: business.id, slug } },
    });

    if (!page || !page.isVisible) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('GET /api/businesses/[id]/pages/by-slug/[slug] error:', error);
    return NextResponse.json({ error: 'فشل في جلب الصفحة' }, { status: 500 });
  }
}
