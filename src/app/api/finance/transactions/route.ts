import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, serverError } from '@/lib/api-utils';

// GET /api/finance/transactions - Paginated list of user's financial transactions
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const accounts = await prisma.financialAccount.findMany({
      where: { userId },
      select: { id: true },
    });
    const accountIds = accounts.map((a) => a.id);

    const transactions = await prisma.financialTransaction.findMany({
      where: { accountId: { in: accountIds } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { FinancialAccount: { select: { id: true, type: true, currency: true } } },
    });

    const total = await prisma.financialTransaction.count({
      where: { accountId: { in: accountIds } },
    });

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
