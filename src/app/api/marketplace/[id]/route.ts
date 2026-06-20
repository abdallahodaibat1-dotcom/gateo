import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function transformListing(listing: any) {
  const product = listing.Product;
  let images = product?.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      images = null;
    }
  }
  const imageObjects = Array.isArray(images)
    ? images.map((img: any) => (typeof img === 'string' ? { url: img } : img))
    : null;

  return {
    ...listing,
    Product: undefined,
    product: {
      ...product,
      Business: undefined,
      images: imageObjects,
      business: product?.Business || null,
    },
  };
}

// GET /api/marketplace/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        Product: {
          include: {
            Business: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                city: true,
                logo: true,
                cover: true,
                phone: true,
                email: true,
                isVerified: true,
                avgRating: true,
                reviewCount: true,
              },
            },
          },
        },
      },
    });

    if (!listing || !listing.isActive || listing.Product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    // Increment views
    await prisma.marketplaceListing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ listing: transformListing(listing) });
  } catch (error) {
    console.error('GET /api/marketplace/[id] error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنتج' }, { status: 500 });
  }
}
