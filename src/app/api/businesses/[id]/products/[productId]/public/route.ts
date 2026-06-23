import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/businesses/[id]/products/[productId]/public - Public product details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const { id, productId } = await params;

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

    const product = await prisma.product.findFirst({
      where: { id: productId, businessId: business.id, status: 'ACTIVE' },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        images = null;
      }
    }

    return NextResponse.json({ product: { ...product, images } });
  } catch (error) {
    console.error('GET /api/businesses/[id]/products/[productId]/public error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنتج' }, { status: 500 });
  }
}
