import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBusiness } from '@/lib/business-serializer';
import { notFound, serverError } from '@/lib/api-utils';

// GET /api/categories/[id]/businesses - List businesses in a category with filters
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const countryId = searchParams.get('country');
  const city = searchParams.get('city');
  const subcategoryId = searchParams.get('subcategory');
  const sort = searchParams.get('sort') || 'rating'; // rating, nearest, newest, bookings, reviews
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const verifiedOnly = searchParams.get('verified') === 'true';
  const skip = (page - 1) * limit;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!category) return notFound('Category not found');

    const where: any = {
      categoryId: id,
      status: 'ACTIVE',
    };

    if (countryId) where.countryId = countryId;
    if (city) where.city = { contains: city };
    if (subcategoryId) where.BusinessSubcategory = { some: { subcategoryId: { equals: subcategoryId } } };
    if (verifiedOnly) where.isVerified = true;

    let orderBy: any = { avgRating: 'desc' };
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'reviews':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'bookings':
        orderBy = { avgRating: 'desc' }; // fallback since we don't have booking count cached
        break;
      case 'nearest':
        orderBy = { createdAt: 'desc' }; // fallback, will reorder after
        break;
      default:
        orderBy = { avgRating: 'desc' };
    }

    const businesses = await prisma.business.findMany({
      where,
      orderBy,
      skip,
      take: limit * 2, // fetch more for nearest sorting
      include: {
        Category: { select: { id: true, name: true } },
        BusinessSubcategory: { include: { Subcategory: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { Review: true, Booking: true } },
      },
    });

    // Post-process: calculate distance and re-sort if needed
    let processed = businesses.map((b) => ({
      ...b,
      distance: lat && lng && b.latitude && b.longitude
        ? haversine(lat, lng, b.latitude, b.longitude)
        : null,
    }));

    if (sort === 'nearest' && lat && lng) {
      processed = processed
        .filter((b) => b.distance !== null)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Trim to limit after post-processing
    const finalBusinesses = processed.slice(0, limit);
    const total = await prisma.business.count({ where });

    return NextResponse.json({
      businesses: finalBusinesses.map(serializeBusiness),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/categories/[id]/businesses error:', error);
    return serverError(error);
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
