import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBusiness } from '@/lib/business-serializer';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';

// GET /api/search/businesses - Search businesses with filters
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50);
  const categoryId = searchParams.get('categoryId');
  const subcategoryId = searchParams.get('subcategoryId');
  const city = searchParams.get('city');
  const isVerified = searchParams.get('isVerified');
  const ladiesGate = searchParams.get('ladiesGate');
  const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance | rating | newest | popular
  const skip = (page - 1) * limit;

  if (!q || q.length < 1) {
    return badRequest('يجب إدخال مصطلح البحث');
  }

  try {
    const where: any = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { city: { contains: q } },
        { address: { contains: q } },
        { phone: { contains: q } },
      ],
    };

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.BusinessSubcategory = { some: { subcategoryId } };
    if (city) where.city = { contains: city };
    if (isVerified === 'true') where.isVerified = true;
    if (ladiesGate === 'true') {
      where.Category = { isLadiesGate: true };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'rating') orderBy = { avgRating: 'desc' };
    if (sortBy === 'popular') orderBy = { reviewCount: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          Category: { select: { id: true, name: true, slug: true } },
          BusinessSubcategory: {
            include: {
              Subcategory: { select: { id: true, name: true, slug: true } },
            },
          },
          _count: { select: { Review: true, Booking: true } },
          Service: {
            where: { isActive: true },
            select: { id: true, name: true, price: true, duration: true },
            take: 3,
          },
        },
      }),
      prisma.business.count({ where }),
    ]);

    // Check if user has booked with any of these businesses
    let businessesWithBookedStatus = businesses;
    if (user?.id) {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: user.id,
          businessId: { in: businesses.map((b) => b.id) },
        },
        select: { businessId: true },
      });
      const bookedSet = new Set(bookings.map((b) => b.businessId));
      businessesWithBookedStatus = businesses.map((b) => ({
        ...b,
        hasBooked: bookedSet.has(b.id),
      }));
    }

    return NextResponse.json({
      businesses: businessesWithBookedStatus.map(serializeBusiness),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
