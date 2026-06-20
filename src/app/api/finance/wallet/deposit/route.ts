import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { ensureFinancialAccount, recordTransaction } from '@/lib/finance';
import { z } from 'zod';

const depositSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).optional(),
});

// POST /api/finance/wallet/deposit - Deposit funds into user's cash account
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = depositSchema.parse(body);
    const currency = data.currency || 'USD';

    let account = await ensureFinancialAccount(userId, 'CASH', currency);
    const transaction = await recordTransaction({
      accountId: account.id,
      type: 'DEPOSIT',
      amount: data.amount,
      currency,
      description: 'إيداع في المحفظة',
    });

    // Refetch account so the returned balance reflects the new transaction
    account = await prisma.financialAccount.findUnique({ where: { id: account.id } });

    return NextResponse.json({ success: true, transaction, account }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('المبلغ غير صالح');
    }
    if (error instanceof Error) {
      return badRequest(error.message);
    }
    return serverError(error);
  }
}
