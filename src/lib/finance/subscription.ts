import { prisma } from '@/lib/db';
import { ensureFinancialAccount, createInvoice, recordTransaction } from './engine';

export async function purchaseBusinessSubscription(
  userId: string,
  businessId: string,
  planId: string
) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    throw new Error('خطة الاشتراك غير موجودة أو غير نشطة');
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || business.userId !== userId) {
    throw new Error('النشاط التجاري غير موجود');
  }

  // Use platform cash account for revenue tracking
  const platformCash = await ensureFinancialAccount(userId, 'CASH', plan.price ? plan.price.toString() : 'USD');

  const invoice = await createInvoice(userId, {
    type: 'SUBSCRIPTION',
    businessId,
    currency: 'USD',
    lineItems: [
      {
        description: `اشتراك ${plan.nameAr || plan.name} - ${plan.duration} يوم`,
        quantity: 1,
        unitPrice: Number(plan.price),
      },
    ],
  });

  // Simulate payment success
  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      userId,
      gatewayId: 'manual',
      amount: invoice.total,
      currency: invoice.currency,
      status: 'PAID',
      paidAt: new Date(),
      gatewayRef: `sub_${Date.now()}`,
    },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: 'PAID', paidAt: new Date() },
  });

  await recordTransaction({
    accountId: platformCash.id,
    type: 'DEPOSIT',
    amount: Number(invoice.total),
    currency: invoice.currency,
    referenceType: 'SUBSCRIPTION',
    referenceId: invoice.id,
    description: `إيرادات اشتراك ${plan.name}`,
  });

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + plan.duration);

  const subscription = await prisma.businessSubscription.upsert({
    where: { businessId },
    update: {
      planId,
      userId,
      startsAt: now,
      expiresAt,
      isActive: true,
      autoRenew: false,
    },
    create: {
      businessId,
      planId,
      userId,
      startsAt: now,
      expiresAt,
      isActive: true,
      autoRenew: false,
    },
  });

  return { subscription, invoice, payment };
}
