import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { Prisma, bookings_status as BookingStatus } from '@prisma/client';
import {
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/api-utils';
import { awardPoints } from '@/lib/points';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const createSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().optional(),
  date: z.string().datetime(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  notes: z.string().max(2000).optional(),
  totalPrice: z.number().min(0).optional(),
});

// GET /api/bookings - List current user's bookings
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const status = searchParams.get('status');
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.BookingWhereInput = { userId };
    if (status) where.status = status as BookingStatus;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        Business: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            phone: true,
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

// POST /api/bookings - Create a new booking
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
    });
    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }

    if (data.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
      });
      if (!service || service.businessId !== data.businessId) {
        return badRequest('الخدمة غير موجودة أو لا تنتمي لهذا العمل');
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        businessId: data.businessId,
        serviceId: data.serviceId || null,
        date: new Date(data.date),
        time: data.time,
        notes: data.notes,
        totalPrice: data.totalPrice ?? null,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
      include: {
        Business: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            phone: true,
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

    // Award points for creating a booking
    await awardPoints(userId, 25, 'إنشاء حجز جديد', 'EARN', booking.id).catch(() => {});

    // Notify business owner
    if (business.userId !== userId) {
      await createNotification({
        userId: business.userId,
        type: 'BOOKING',
        title: 'حجز جديد',
        body: 'تم إنشاء حجز جديد لديك',
        data: { actorId: userId, bookingId: booking.id, businessId: business.id },
      });
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    return serverError(error);
  }
}
