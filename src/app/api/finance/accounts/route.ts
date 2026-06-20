import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, serverError } from '@/lib/api-utils';

// GET /api/finance/accounts - List current user's financial accounts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const accounts = await prisma.financialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: [{ type: 'asc' }, { currency: 'asc' }],
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    return serverError(error);
  }
}
