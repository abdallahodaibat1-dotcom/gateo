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

// GET /api/marketplace
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');

    const where: any = {
      isActive: true,
      Product: {
        status: 'ACTIVE',
        isInMarketplace: true,
      },
    };

    if (category) {
      where.OR = [
        { category },
        { Product: { category } },
      ];
    }

    if (city) {
      where.Product = { ...where.Product, Business: { city } };
    }

    if (search) {
      where.Product = { ...where.Product, name: { contains: search } };
    }

    if (minPrice || maxPrice) {
      where.Product = { ...where.Product, price: {} };
      if (minPrice) where.Product.price.gte = parseFloat(minPrice);
      if (maxPrice) where.Product.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any =
      sort === 'price_asc'
        ? { Product: { price: 'asc' } }
        : sort === 'price_desc'
        ? { Product: { price: 'desc' } }
        : sort === 'popular'
        ? { clicks: 'desc' }
        : { createdAt: 'desc' };

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          Product: {
            include: {
              Business: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  logo: true,
                  isVerified: true,
                },
              },
            },
          },
        },
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    return NextResponse.json({ listings: listings.map(transformListing), total, page, limit });
  } catch (error) {
    console.error('GET /api/marketplace error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنتجات' }, { status: 500 });
  }
}
