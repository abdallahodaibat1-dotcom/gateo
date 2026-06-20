import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { processBookingPayment } from '@/lib/finance';
import { z } from 'zod';

const createSchema = z.object({
  bookingId: z.string().min(1),
});

// GET /api/payments - List current user's payments
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const skip = (page - 1) * limit;

  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        Invoice: { include: { InvoiceLineItems: true } },
        PaymentGateway: { select: { id: true, code: true, name: true, nameAr: true } },
      },
    });

    const total = await prisma.payment.count({ where: { userId } });

    return NextResponse.json({
      payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/payments - Process payment for a booking
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const result = await processBookingPayment(userId, data.bookingId);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الدفع غير صالحة');
    }
    if (error instanceof Error) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}
