import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import {
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
} from '@/lib/api-utils';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';
import { bookings_status as BookingStatus } from '@prisma/client';

const statusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED_BY_USER',
    'CANCELLED_BY_BUSINESS',
    'NO_SHOW',
  ]),
});

// PATCH /api/bookings/[id]/status - Update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { Business: { select: { userId: true } } },
    });

    if (!booking) return notFound('الحجز غير موجود');

    const isBusinessOwner = booking.Business.userId === userId;
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = booking.userId === userId;

    // Only business owners and admins can confirm/complete/no-show
    // Users can only cancel their own bookings
    const body = await req.json();
    const { status } = statusSchema.parse(body);

    if (status === 'CANCELLED_BY_USER') {
      if (!isOwner) {
        return forbidden();
      }
    } else if (status === 'CANCELLED_BY_BUSINESS') {
      if (!isBusinessOwner && !isAdmin) {
        return forbidden();
      }
    } else {
      // PENDING, CONFIRMED, COMPLETED, NO_SHOW
      if (!isBusinessOwner && !isAdmin) {
        return forbidden();
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: status as BookingStatus },
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

    // Notify booking user when status changes (except PENDING)
    if (status !== 'PENDING' && booking.userId !== userId) {
      const statusLabels: Record<string, string> = {
        CONFIRMED: 'تم تأكيد الحجز',
        COMPLETED: 'تم إنجاز الحجز',
        CANCELLED_BY_USER: 'تم إلغاء الحجز',
        CANCELLED_BY_BUSINESS: 'تم إلغاء الحجز من قبل العمل',
        NO_SHOW: 'لم يتم حضور الحجز',
      };
      await createNotification({
        userId: booking.userId,
        type: 'BOOKING_UPDATE',
        title: 'تحديث الحجز',
        body: statusLabels[status] || 'تم تحديث حالة الحجز',
        data: { actorId: userId, bookingId: id, status },
      });
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('حالة غير صالحة');
    }
    return serverError(error);
  }
}
