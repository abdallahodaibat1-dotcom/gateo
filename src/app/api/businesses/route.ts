import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBusiness } from '@/lib/business-serializer';

/**
 * Calculate business power score based on:
 * - Bookings count × 5 (most important)
 * - Review count × 3
 * - Average rating × 10
 * - Verified bonus × 20
 */
function calculatePowerScore(business: any): number {
  const bookingCount = business._count?.Booking || 0;
  const reviewCount = business.reviewCount || 0;
  const avgRating = business.avgRating || 0;
  const verifiedBonus = business.isVerified ? 20 : 0;

  return (bookingCount * 5) + (reviewCount * 3) + (avgRating * 10) + verifiedBonus;
}

// GET /api/businesses - List businesses with power score ranking
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const categoryId = searchParams.get('category');
  const countryId = searchParams.get('country');
  const city = searchParams.get('city');
  const query = searchParams.get('q');
  const featured = searchParams.get('featured') === 'true';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const sortBy = searchParams.get('sort') || 'power'; // power, rating, newest, bookings
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      status: 'ACTIVE',
    };

    // Only show verified businesses by default unless specifically searching/filtering
    const isFiltering = query || categoryId || city || countryId || verifiedOnly;
    if (!isFiltering) {
      where.isVerified = true;
    }

    if (verifiedOnly) where.isVerified = true;
    if (categoryId) where.categoryId = categoryId;
    if (countryId) where.countryId = countryId;
    if (city) where.city = { contains: city };
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    // For featured requests, get more data for ranking
    const takeLimit = featured ? Math.max(limit * 3, 50) : limit;

    const businesses = await prisma.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: featured ? 0 : skip,
      take: takeLimit,
      include: {
        Category: { select: { id: true, name: true } },
        Subcategory: { select: { id: true, name: true } },
        User: { select: { id: true, name: true, avatar: true } },
        _count: {
          select: {
            Review: true,
            Booking: true,
            Post: true,
          },
        },
      },
    });

    // Calculate power score for each business
    const businessesWithScore = businesses.map((business) => ({
      ...business,
      powerScore: calculatePowerScore(business),
      bookingCount: business._count?.Booking || 0,
    }));

    // Sort by the requested criteria
    let sortedBusinesses = businessesWithScore;
    
    switch (sortBy) {
      case 'rating':
        sortedBusinesses = businessesWithScore.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case 'newest':
        sortedBusinesses = businessesWithScore.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'bookings':
        sortedBusinesses = businessesWithScore.sort((a, b) => b.bookingCount - a.bookingCount);
        break;
      case 'power':
      default:
        sortedBusinesses = businessesWithScore.sort((a, b) => b.powerScore - a.powerScore);
        break;
    }

    // For featured requests, take top N after sorting
    const finalBusinesses = featured 
      ? sortedBusinesses.slice(0, limit)
      : sortedBusinesses;

    const total = await prisma.business.count({ where });

    return NextResponse.json({
      businesses: finalBusinesses.map(serializeBusiness),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/businesses error:', error);
    return NextResponse.json({ error: 'فشل في جلب الأعمال' }, { status: 500 });
  }
}
