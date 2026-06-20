import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-utils';
import { createInvoice } from '@/lib/finance';
import { z } from 'zod';
import { invoices_type as InvoiceType } from '@prisma/client';

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

const createInvoiceSchema = z.object({
  type: z.enum(['SUBSCRIPTION', 'AD', 'MARKETPLACE', 'BOOKING', 'SERVICE', 'FEE']),
  lineItems: z.array(lineItemSchema).min(1),
  businessId: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
});

const intentSchema = z.union([
  z.object({ invoiceId: z.string().min(1) }),
  createInvoiceSchema,
]);

// POST /api/payments/intent - Create or retrieve an invoice
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = intentSchema.parse(body);

    if ('invoiceId' in data) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: data.invoiceId },
        include: { InvoiceLineItems: true },
      });
      if (!invoice || invoice.userId !== userId) return notFound('الفاتورة غير موجودة');
      return NextResponse.json({ invoice });
    }

    const invoice = await createInvoice(userId, {
      type: data.type as InvoiceType,
      businessId: data.businessId,
      lineItems: data.lineItems,
      taxRate: data.taxRate,
      discount: data.discount,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات الفاتورة غير صالحة');
    }
    return serverError(error);
  }
}
