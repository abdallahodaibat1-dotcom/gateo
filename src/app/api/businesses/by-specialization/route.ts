import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSpecializationGroup } from '@/lib/specializations';
import { serializeBusiness } from '@/lib/business-serializer';

const VERIFIED_BONUS = 20;

interface BusinessWithCounts {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  cover: string | null;
  city: string | null;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: Date;
  category: { id: string; name: string } | null;
  subcategory: { id: string; name: string } | null;
  country: { id: string; name: string } | null;
  _count: { Booking: number };
}

function calculatePowerScore(business: BusinessWithCounts): number {
  const bookingCount = business._count?.Booking || 0;
  const reviewCount = business.reviewCount || 0;
  const avgRating = business.avgRating || 0;
  const verifiedBonus = business.isVerified ? VERIFIED_BONUS : 0;

  return bookingCount * 2 + reviewCount + avgRating * 10 + verifiedBonus;
}

// GET /api/businesses/by-specialization?group=medical&country=...&city=...&verified=...&sort=...&page=...&limit=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const groupKey = searchParams.get('group');
    if (!groupKey) {
      return NextResponse.json({ error: 'معامل التخصص مطلوب' }, { status: 400 });
    }

    const group = getSpecializationGroup(groupKey);
    if (!group) {
      return NextResponse.json({ error: 'تخصص غير صالح' }, { status: 400 });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const country = searchParams.get('country')?.trim();
    const city = searchParams.get('city')?.trim();
    const verified = searchParams.get('verified');
    const sortBy = searchParams.get('sort') || 'power';
    const skip = (page - 1) * limit;

    const categories = await prisma.category.findMany({
      where: { slug: { in: group.categorySlugs } },
      select: { id: true },
    });

    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) {
      return NextResponse.json({
        businesses: [],
        pagination: { page, limit, total: 0, pages: 0 },
      });
    }

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      isPublicOnGateway: true,
      categoryId: { in: categoryIds },
    };

    if (country) {
      where.country = {
        name: { contains: country },
      };
    }

    if (city) {
      where.city = { contains: city };
    }

    if (verified === 'true') {
      where.isVerified = true;
    } else if (verified === 'false') {
      where.isVerified = false;
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        include: {
          Category: { select: { id: true, name: true } },
          BusinessSubcategory: {
            include: {
              Subcategory: { select: { id: true, name: true, slug: true } },
            },
          },
          Country: { select: { id: true, name: true } },
          _count: {
            select: { Booking: true },
          },
        },
      }),
      prisma.business.count({ where }),
    ]);

    const typedBusinesses = businesses.map(serializeBusiness) as BusinessWithCounts[];

    const businessesWithScore = typedBusinesses.map((business) => ({
      ...business,
      powerScore: calculatePowerScore(business),
      bookingCount: business._count?.Booking || 0,
    }));

    let sortedBusinesses = businessesWithScore;
    switch (sortBy) {
      case 'rating':
        sortedBusinesses = businessesWithScore.sort(
          (a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount
        );
        break;
      case 'newest':
        sortedBusinesses = businessesWithScore.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'bookings':
        sortedBusinesses = businessesWithScore.sort(
          (a, b) => b.bookingCount - a.bookingCount
        );
        break;
      case 'power':
      default:
        sortedBusinesses = businessesWithScore.sort(
          (a, b) => b.powerScore - a.powerScore
        );
        break;
    }

    return NextResponse.json({
      businesses: sortedBusinesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/businesses/by-specialization error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الأعمال' },
      { status: 500 }
    );
  }
}
