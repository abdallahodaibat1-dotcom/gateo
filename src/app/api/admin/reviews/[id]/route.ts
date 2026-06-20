import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/reviews/[id] - Get review details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, avatar: true } },
        Business: { select: { id: true, name: true, logo: true } },
      },
    });

    if (!review) return notFound('Review not found');

    return NextResponse.json({ review });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) return notFound('Review not found');

    await prisma.review.delete({ where: { id } });

    // Recalculate business average rating
    const stats = await prisma.review.aggregate({
      where: { businessId: existing.businessId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await prisma.business.update({
      where: { id: existing.businessId },
      data: {
        avgRating: stats._avg.rating ? Number(stats._avg.rating) : 0,
        reviewCount: stats._count.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
