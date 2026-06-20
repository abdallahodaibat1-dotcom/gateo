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
import { z } from 'zod';

const updateSchema = z.object({
  date: z.string().datetime().optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  notes: z.string().max(2000).optional(),
  totalPrice: z.number().min(0).optional(),
}).partial();

// GET /api/bookings/[id] - Get a single booking
export async function GET(
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
      include: {
        Business: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            phone: true,
            userId: true,
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
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) return notFound('الحجز غير موجود');

    const isOwner = booking.userId === userId;
    const isBusinessOwner = booking.Business.userId === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isBusinessOwner && !isAdmin) {
      return forbidden();
    }

    return NextResponse.json({ booking });
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/bookings/[id] - Update booking details (customer only, if pending)
export async function PUT(
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

    const isOwner = booking.userId === userId;
    const isBusinessOwner = booking.Business.userId === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isBusinessOwner && !isAdmin) {
      return forbidden();
    }

    // Customers can only update if pending; business owners/admins can update anytime
    if (isOwner && !isBusinessOwner && !isAdmin && booking.status !== 'PENDING') {
      return badRequest('لا يمكن تعديل الحجز إلا وهو قيد الانتظار');
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.time ? { time: data.time } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.totalPrice !== undefined ? { totalPrice: data.totalPrice } : {}),
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

    return NextResponse.json({ booking: updated });
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

// DELETE /api/bookings/[id] - Cancel a booking (by user)
export async function DELETE(
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

    const isOwner = booking.userId === userId;
    const isBusinessOwner = booking.Business.userId === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isBusinessOwner && !isAdmin) {
      return forbidden();
    }

    let newStatus: 'CANCELLED_BY_USER' | 'CANCELLED_BY_BUSINESS';
    if (isOwner && !isBusinessOwner) {
      newStatus = 'CANCELLED_BY_USER';
    } else {
      newStatus = 'CANCELLED_BY_BUSINESS';
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    return serverError(error);
  }
}
