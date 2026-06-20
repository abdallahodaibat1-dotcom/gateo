import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { ensureFinancialAccount, recordTransaction } from '@/lib/finance';
import { z } from 'zod';

const webhookSchema = z.object({
  gatewayRef: z.string().min(1),
});

// POST /api/payments/webhook/[gateway] - Confirm an external payment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gateway: string }> }
) {
  try {
    const { gateway } = await params;
    const body = await req.json();
    const data = webhookSchema.parse(body);

    const payment = await prisma.payment.findFirst({
      where: {
        gatewayRef: data.gatewayRef,
        status: { not: 'PAID' },
      },
      include: { Invoice: true, User: true },
    });

    if (!payment) return notFound('عملية الدفع غير موجودة أو مدفوعة بالفعل');

    const now = new Date();
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', paidAt: now },
      }),
      ...(payment.Invoice
        ? [
            prisma.invoice.update({
              where: { id: payment.Invoice.id },
              data: { status: 'PAID', paidAt: now },
            }),
          ]
        : []),
    ]);

    const cashAccount = await ensureFinancialAccount(payment.User.id, 'CASH', payment.currency);
    await recordTransaction({
      accountId: cashAccount.id,
      type: 'DEPOSIT',
      amount: Number(payment.amount),
      currency: payment.currency,
      referenceType: 'PAYMENT',
      referenceId: payment.id,
      description: `إيداع عبر بوابة ${gateway}`,
    });

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات Webhook غير صالحة');
    }
    return serverError(error);
  }
}
