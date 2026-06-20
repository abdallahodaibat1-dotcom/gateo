import { prisma } from '@/lib/db';
import { ensureFinancialAccount, createInvoice, recordTransaction } from './engine';
import { calculateCommission, recordCommission } from './commission';

export async function processBookingPayment(
  userId: string,
  bookingId: string,
  gatewayCode = 'manual'
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { Business: true, Service: true },
  });
  if (!booking) throw new Error('الحجز غير موجود');
  if (booking.userId !== userId) throw new Error('غير مصرح');
  if (booking.paymentStatus === 'PAID') throw new Error('الحجز مدفوع بالفعل');

  const amount = Number(booking.totalPrice || booking.Service?.price || 0);
  if (amount <= 0) throw new Error('المبلغ غير صالح');

  const gateway = await prisma.paymentGateway.findUnique({ where: { code: gatewayCode } });
  const gatewayId = gateway?.id || 'manual';

  const invoice = await createInvoice(userId, {
    type: 'BOOKING',
    businessId: booking.businessId,
    currency: 'USD',
    lineItems: [
      {
        description: `حجز ${booking.Service?.name || 'خدمة'} - ${booking.Business.name}`,
        quantity: 1,
        unitPrice: amount,
      },
    ],
  });

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      userId,
      gatewayId,
      amount: invoice.total,
      currency: invoice.currency,
      status: 'PAID',
      paidAt: new Date(),
      gatewayRef: `booking_${Date.now()}`,
    },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: 'PAID', paidAt: new Date() },
  });

  // Record revenue in platform cash account
  const platformCash = await ensureFinancialAccount(userId, 'CASH', invoice.currency);
  await recordTransaction({
    accountId: platformCash.id,
    type: 'DEPOSIT',
    amount: Number(invoice.total),
    currency: invoice.currency,
    referenceType: 'BOOKING',
    referenceId: booking.id,
    description: `دفع حجز ${booking.Service?.name || ''}`,
  });

  // Calculate and record commission
  const commission = await calculateCommission(
    'bookings',
    Number(invoice.total),
    booking.Business.categoryId,
    booking.Business.subcategoryId
  );
  if (commission.amount > 0 && commission.ruleId) {
    await recordCommission(commission.ruleId, commission.amount, 'BOOKING', booking.id, {
      businessId: booking.businessId,
      description: `عمولة حجز ${booking.Service?.name || ''}`,
    });
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'PAID',
      paymentId: payment.id,
      status: 'CONFIRMED',
    },
    include: { Business: { select: { id: true, name: true, logo: true } }, Service: { select: { id: true, name: true, price: true } } },
  });

  return { booking: updatedBooking, invoice, payment, commission };
}
