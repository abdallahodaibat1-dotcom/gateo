import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/professionals?category=...&sort=...&page=...&limit=...
// Public endpoint for listing professional profiles by category.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const categorySlug = searchParams.get('category') || undefined;
  const categoryType = searchParams.get('type') || undefined;
  const countryId = searchParams.get('country') || undefined;
  const city = searchParams.get('city') || undefined;
  const verified = searchParams.get('verified');
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '12')));

  try {
    const where: any = {
      status: 'ACTIVE',
      isPublicOnGateway: true,
    };

    const filterCategoryIds: string[] = [];

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (category) {
        filterCategoryIds.push(category.id);
      }
    }

    if (categoryType === 'PROFESSIONAL' || categoryType === 'BUSINESS' || categoryType === 'LADIES_GATE') {
      const matchingCategories = await prisma.category.findMany({
        where: { type: categoryType },
        select: { id: true },
      });
      const typeIds = matchingCategories.map((c) => c.id);
      if (filterCategoryIds.length > 0) {
        // Keep only ids that belong to both the requested slug and the requested type
        const slugId = filterCategoryIds[0];
        if (typeIds.includes(slugId)) {
          filterCategoryIds.length = 0;
          filterCategoryIds.push(slugId);
        } else {
          filterCategoryIds.length = 0;
        }
      } else {
        filterCategoryIds.push(...typeIds);
      }
    }

    if (filterCategoryIds.length > 0) {
      where.categoryId =
        filterCategoryIds.length === 1 ? filterCategoryIds[0] : { in: filterCategoryIds };
    }
    if (countryId) where.countryId = countryId;
    if (city) where.city = city;
    if (verified === 'true') where.isVerified = true;

    const orderBy: any =
      sort === 'rating'
        ? { experienceYears: 'desc' }
        : sort === 'projects'
        ? { completedProjectsCount: 'desc' }
        : sort === 'newest'
        ? { createdAt: 'desc' }
        : { createdAt: 'desc' };

    const [professionals, total] = await Promise.all([
      prisma.professionalProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          Category: { select: { id: true, name: true, slug: true } },
          Subcategory: { select: { id: true, name: true, slug: true } },
          Country: { select: { id: true, name: true, flagEmoji: true } },
          User: { select: { id: true, name: true, avatar: true, createdAt: true } },
        },
      }),
      prisma.professionalProfile.count({ where }),
    ]);

    const normalizedProfessionals = professionals.map((prof: any) => ({
      ...prof,
      user: prof.User,
      category: prof.Category,
      subcategory: prof.Subcategory,
      country: prof.Country,
    }));

    return NextResponse.json({
      professionals: normalizedProfessionals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/professionals error:', error);
    return NextResponse.json({ error: 'فشل في جلب المحترفين' }, { status: 500 });
  }
}
