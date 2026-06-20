import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, notFound, serverError } from '@/lib/api-utils';

// GET /api/invoices/[id] - Get invoice details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        InvoiceLineItems: true,
        Payment: true,
        Business: { select: { id: true, name: true, logo: true } },
      },
    });

    if (!invoice || invoice.userId !== session.user.id) {
      return notFound('الفاتورة غير موجودة');
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    return serverError(error);
  }
}
