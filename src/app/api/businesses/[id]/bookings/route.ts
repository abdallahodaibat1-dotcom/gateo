import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api-utils';

// GET /api/businesses/[id]/bookings - List bookings for a business (owner/admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const status = searchParams.get('status');
  const skip = (page - 1) * limit;

  try {
    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) return notFound('العمل غير موجود');

    const isOwner = business.userId === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return forbidden();
    }

    const where: any = { businessId: id };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
          },
        },
        Service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    const total = await prisma.booking.count({ where });

    return NextResponse.json({
      bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
