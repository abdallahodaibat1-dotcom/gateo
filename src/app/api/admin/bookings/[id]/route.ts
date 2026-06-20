import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/bookings/[id] - Get booking details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        Business: {
          select: { id: true, name: true, logo: true, phone: true, email: true, address: true },
        },
        Service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });

    if (!booking) return notFound('Booking not found');

    return NextResponse.json({ booking });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/bookings/[id] - Update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus, notes, totalPrice } = body;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return notFound('Booking not found');

    if (status && !['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_BUSINESS', 'NO_SHOW'].includes(status)) {
      return badRequest('Invalid booking status');
    }

    if (paymentStatus && !['UNPAID', 'PAID', 'REFUNDED', 'FAILED'].includes(paymentStatus)) {
      return badRequest('Invalid payment status');
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(notes !== undefined && { notes }),
        ...(totalPrice !== undefined && { totalPrice }),
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Business: { select: { id: true, name: true } },
        Service: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/bookings/[id] - Delete booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return notFound('Booking not found');

    await prisma.booking.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
