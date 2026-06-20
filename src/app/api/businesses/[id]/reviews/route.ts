import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { awardPoints } from '@/lib/points';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

// GET /api/businesses/[id]/reviews - Get reviews
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const reviews = await prisma.review.findMany({
      where: { businessId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        User: { select: { id: true, name: true, avatar: true } },
      },
    });

    const total = await prisma.review.count({ where: { businessId: id } });

    return NextResponse.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/businesses/[id]/reviews error:', error);
    return NextResponse.json({ error: 'فشل في جلب التقييمات' }, { status: 500 });
  }
}

// POST /api/businesses/[id]/reviews - Add review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }

    // Check if user already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        businessId_userId: {
          businessId: id,
          userId: session.user.id,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'لقد قمت بتقييم هذا العمل من قبل' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = reviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        ...data,
        images: data.images ? JSON.stringify(data.images) : null,
        businessId: id,
        userId: session.user.id,
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Recalculate average rating
    const allReviews = await prisma.review.findMany({
      where: { businessId: id },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.business.update({
      where: { id },
      data: {
        avgRating,
        reviewCount: allReviews.length,
      },
    });

    // Award points for writing a review
    await awardPoints(session.user.id, 15, 'كتابة تقييم', 'EARN', review.id).catch(() => {});

    // Notify business owner
    if (business.userId !== session.user.id) {
      await createNotification({
        userId: business.userId,
        type: 'REVIEW',
        title: 'تقييم جديد',
        body: 'تم إضافة تقييم جديد لعملك',
        data: { actorId: session.user.id, reviewId: review.id, businessId: id },
      });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/businesses/[id]/reviews error:', error);
    return NextResponse.json({ error: 'فشل في إضافة التقييم' }, { status: 500 });
  }
}
